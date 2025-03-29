const crypto = require('crypto')
const validator = require('validator')
const adminData = require('../models/signUpSchema.js')
const OTP= require('../models/otpSchema.js') 
const { sendSignUpOTP, sendForgetPassOTP } = require('../services/emailServices.js')
const { hashPassword, verifyPassword}= require('../services/passwordHashing.js')
const { createJwtToken, verifyToken, decodeToken }= require('../services/jwtToken.js')
const secret= process.env.Secret
const mongoose= require('mongoose')
const Profile= require('../models/studentProfile.js')




exports.handleSendEmailForSignUp = async (req, res) => {
    const session= await mongoose.startSession()
    try {
        session.startTransaction()
        const { username, password, confirmPassword, email, role, mess_id } = req.body

        if (!username || !password || !confirmPassword || !email || !role || !mess_id) {
            await session.abortTransaction()
            return res.status(400).json({ success: false, message: "All fields are required." })
        }

        if (!validator.isEmail(email)) {
            await session.abortTransaction()
            return res.status(400).json({ success: false, message: "Invalid email format." })
        }

        if (password !== confirmPassword) {
            await session.abortTransaction()
            return res.status(400).json({ success: false, message: "Passwords do not match." })
        }

        const existingUser = await adminData.findOne({ 
            $or: [{ email, mess_id }, { username, mess_id }]
        }).session(session)
         
        if (existingUser) {
            await session.abortTransaction()
            return res.status(400).json({ success: false, message: "This email or username is already registered in this mess." })
        }

        const hashedPassword = await hashPassword(password)

        try{
            await adminData.create([{
                username: username,
                email: email,
                password: hashedPassword,
                role: role,
                isActive: false,
                mess_id : mess_id
            }], { session })
            
        }catch(err){
            console.error("Error in user data submission: "+ err.message)
            throw err
        }
        
        const otp = crypto.randomInt(100000, 999999).toString()

        try{
             await OTP.create([{
                email: email,
                mess_id: mess_id,
                otp: otp,
                createdAt: new Date(), 
            }], { session })
            
        }catch(err){
            console.error("Error in OTP Storing: "+ err.message)
            throw err
        }

        await sendSignUpOTP(email, otp)
        console.log(`OTP sent successfully for User Sign-Up.`);
        
        await session.commitTransaction()

        return res.status(200).json({ success: true, message: `OTP sent successfully to ${email}`, email: email, mess_id: mess_id })

    } catch (err) {
        if (session && session.inTransaction()) {
            await session.abortTransaction()
        }
        console.error("Error in sending Email for sign-up: " + err.message)
        return res.status(500).json({ success: false, message: "Internal server error." })

    } finally{
        await session.endSession()
    }
}


exports.handlePostVerifyOTP = async (req, res) => {
    const session= await mongoose.startSession()
    let { email, mess_id, otp } = req.body
    otp= Number(otp)

    try {
        session.startTransaction()

        if ( !email || !otp || !mess_id ) {
            await session.abortTransaction()
            return res.status(400).json({ success: false, message: "All fields are required." })
        }
        
        if (!validator.isEmail(email)) {
            await session.abortTransaction()
            return res.status(400).json({ success: false, message: "Invalid email format" })
        }

        const otpDoc = await OTP.findOne({ email, mess_id })

        if (!otpDoc) {
            const inactiveUser = await adminData.findOne({ email, mess_id, isActive: false })
            if (inactiveUser) {
                await adminData.deleteOne({ email, mess_id, isActive: false })
            }
            await session.abortTransaction()
            return res.status(400).json({ message: 'OTP Expired.Sign-up again.' })
        }

        if (otpDoc.otp !== otp) {
            await session.abortTransaction()
            return res.status(400).json({ message: `Invalid OTP.` })
        }

        try{
            const updatedAdmin = await adminData.findOneAndUpdate(
                { email, mess_id },
                { $set: { isActive: true } },
                { new: true, session }
              )
              
            await OTP.deleteOne({ email, mess_id }).session(session)

            await Profile.create([{
                user: updatedAdmin._id, 
                username: updatedAdmin.username,
                email: email,
                role: updatedAdmin.role,
                isActive: true, 
                mess_id: mess_id,
            }], {session})
        }catch(err){
            throw err
        }

        console.info("OTP verified. Registration complete")

        await session.commitTransaction()

        return res.status(200).json({ message: 'OTP verified. Registration complete.' })

    } catch (error) {
        await session.abortTransaction()
        console.error('Error verifying OTP.'+ err.message)
        return res.status(500).json({ success: false, message: 'Error verifying OTP.' })
        
    } finally {
        await session.endSession()
    }
}



exports.handlePostUserLogin= async (req, res)=>{
    try{
        const {username, password }= req.body
    
        let { role, mess_id }= req.body
              if( !username || !password || !role || !mess_id)  { 
                 return res.status(400).json({ success: false, message: "All Fields are required."})
              }

        const user= await adminData.findOne( {username: username, mess_id: mess_id, isActive: true, role: role})
             if( !user){
                const dummyHash= "$argon2d$v=19$m=12,t=3,p=1$ajUydGFhaWw4ZTAwMDAwMA$MRhztKGcPpp8tyzeH9LvDQ"
                await verifyPassword( dummyHash, password)
                return res.status(400).json({ success: false, message: "Incorrect username or password"})
             }
     
        let match
        try{
            match= await verifyPassword(user.password, password)
        }catch(err){
            console.error(err.message)
            throw err
        }

        if(!match){
            return res.status(400).json({ success: false, message: "Incorrect username or password"})
        }

        const id= user._id
        role= user.role
        mess_id= user.mess_id
        const session_id= await createJwtToken( username, id, role, mess_id, secret)
        
        console.log(`${role} logged in.`)
        
        return res.status(200).json({ success: true, message:"log in successfull", token: session_id})
        
    }catch(err){
        console.error("Error in user login API: ", err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error."})
    }
}


exports.handlePostSendPasswordResetOTP= async(req, res)=>{
    try{
        const { email, username, mess_id, role }= req.body
        if (!username || !email || !mess_id || !role ) {
            return res.status(400).json({ success: false, message: "Username, email, mess id and role are required." });
        }

        const user= await User.findOne({ email, username, mess_id, role})
        if (!user) {
            return res.status(400).json({ success: false, message: "No user found with the provided data." });
        }

        const otp = crypto.randomInt(100000, 999999).toString()

        await OTP.create([{
            email: email,
            mess_id: mess_id,
            otp: otp,
            createdAt: new Date(), 
        }])

        await sendForgetPassOTP(email, otp)
        console.log("OTP Sent for Password reset.")
        return res.status(200).json({ success: true, message: "OTP sent successfully for password reset.", email: user.email })

    }catch(err){
        console.error("Error in sending email for pass. reset API: ", err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error."})
    }
}

    

