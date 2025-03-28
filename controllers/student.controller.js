const { verifyToken }= require('../services/jwtToken.js')
const secret= process.env.Secret
const { redisClient }= require('../services/redisConnection.js')
const mongoose= require('mongoose')
const User= require('../models/signUpSchema.js')
const Token= require('../models/tokenSchema.js')
const { hashPassword, verifyPassword}= require('../services/passwordHashing.js')
const Transaction= require('../models/transactionSchema.js')
const Notification= require('../models/notificationForOwner.js')



exports.handleHelloStudent= async(req,res)=>{
    try{
        console.log(req.user.role)
        console.log(req.user.mess_id)
        return res.status(200).json({ success: true, message: `All The Best ${req.user.role}`})

    }catch(err){
        console.error("Error in Hello Student API "+ err.message)
        return res.status(500).json({ success: false, message: "Internal Server Error" })
    }
}


exports.handlePostTokenSubmission= async (req,res)=>{
    const session= await mongoose.startSession()
    try{ 
        let { tokenIds, securityCode }= req.body                     
            if (tokenIds.length === 0 || !securityCode ) {
                return res.status(400).json({ success: false, message: "All fields are required." })
            }

            if( !Array.isArray(tokenIds) ){
                return res.status(400).json({ success: false, message: "Token(s) are not in an Array.Server expect tokens in array." })
            }
       
        const userId= req.user.id
        const username= req.user.username
        const role= req.user.role
        const mess_id= req.user.mess_id

        const user= await User.findOne( {username: username, mess_id : mess_id, isActive: true, role: role})
             if( !user){
                const dummyHash= "$argon2d$v=19$m=12,t=3,p=1$ajUydGFhaWw4ZTAwMDAwMA$MRhztKGcPpp8tyzeH9LvDQ"
                await verifyPassword( dummyHash, securityCode)
                return res.status(400).json({ success: false, message: "Incorrect Password."})
             }

        let match
        try{
            match= await verifyPassword(user.password, securityCode)
        }catch(err){
            console.error(err.message)
            throw err
        }

        if(!match){
            return res.status(400).json({ success: false, message: "Incorrect Password."})
        }

        session.startTransaction()

        const tokensToUpdate = await Token.find({
            _id: { $in: tokenIds },
            user: userId,
            mess_id: mess_id,
            redeemed: false 
         }).session(session)

         if (tokensToUpdate.length !== tokenIds.length) {
            await session.abortTransaction()
            console.log("Invalid Token submission")
            const validTokenIds = tokensToUpdate.map(token => token._id.toString())
            const invalidTokenIds = tokenIds.filter(id => !validTokenIds.includes(id))
            return res.status(400).json({ success: false, message: "Provided tokens are invalid or already redeemed.", validTokens: validTokenIds, invalidTokens: invalidTokenIds })
        }
        
        await Token.updateMany(
            { _id: { $in: tokenIds }, user: userId, mess_id: mess_id, redeemed: false },
            { $set: { redeemed: true } },
            { session }
        )

        await Notification.create([{
            mess_id: mess_id,
            student: userId,
            student_username: username,
            type: "token",
            title: "Token Submitted",
            message: `${username} has submitted ${tokenIds.length} tokens.`,
            data: { tokenCount: tokenIds.length, tokenIds },
            notificationType: "both",
            pushSent: false,
            pushResponse: null
        }], { session })
        
        await session.commitTransaction()

        console.log(`${tokenIds.length} Token Removed Successfully.`)
        return res.status(200).json({ success: true, message: `${tokenIds.length} Token Removed Successfully.` })
        
    }catch(err){
        if (session.inTransaction()) {
            await session.abortTransaction()
        }
        console.error("Error deleting tokens:", err.message)
        return res.status(500).json({ success: true, message: "Unable to Remove Tokens", error: "Internal Server Error"})

    } finally {
        session.endSession()
    }
}


exports.handleGetFunctionalTokens= async(req, res)=>{
    try{
        const userId = req.user.id
        const mess_id= req.user.mess_id

        if (!userId) {
            return res.status(400).json({ success: false,  message: 'User ID is missing or invalid.' })
        }

        const user = await User.findById(userId).populate({
            path: 'tokens',
            match: { redeemed: false },
            select: 'redeemed',
        })

        if (!user) {
            console.log("User not found")
            return res.status(404).json({ success: false, message: 'User not found.'})
        }

        if(!user.tokens){
            console.log('No tokens for the user.')
            return res.status(404).json({ success: false, message: 'No tokens for the user.'})
        }

        console.log("Token sent for User")
        return res.status(200).json({ success: true, message: "Token Number attached in the response", totalTokens: user.tokens.length})
    
    }catch(err){
        console.error("Error in Token Fetching API :", err.message)
        return res.status(200).json({ success: true, error: "Internal Server Error", message: "Error at the server." })

    }
}



exports.handleGetTokenData= async(req, res)=>{
    try{
        const userId = req.user.id

        if (!userId) {
            return res.status(400).json({ success: false,  message: 'User ID is missing or invalid.' })
        }

        const user = await User.findById(userId).populate({
            path: 'tokens',
            match: { redeemed: false },
            options: { sort: { expiryDate: 1 } },
            select: 'redeemed expiryDate',
        })

        if (!user) {
            console.log("User not found")
            return res.status(404).json({ success: false, message: 'User not found.'})
        }

        if(!user.tokens){
            console.log('No tokens for the user.')
            return res.status(404).json({ success: false, message: 'No tokens for the user.'})
        }

        console.log("Token Data sent for User")
        return res.status(200).json({ success: true, message: "Token Data attached in the response", tokens: user.tokens})
    
    }catch(err){
        console.error("Error in Token Data Sending API :", err.message)
        return res.status(200).json({ success: true, error: "Internal Server Error", message: "Error at the server." })

    }
}



exports.handleGetTokenHistory= async(req, res)=>{
    try{
        const  userId  = req.user.id
        const mess_id= req.user.mess_id
            if (!userId || !userId.match(/^[0-9a-fA-F]{24}$/) || !mess_id ) {
                return res.status(400).json({ success: false, message: 'Invalid user ID' })
            }

        const tokens = await Token.find({ user: userId, mess_id : mess_id }).sort({ createdAt: -1 })
            if (!tokens.length) {
                return res.status(404).json({ success: false, message: 'No tokens found for this user' })
            }
        console.log("Token history sent successfully.")
        return res.status(200).json({ success: true, count: tokens.length, tokens })

    }catch(err){
        console.error('Error fetching tokens history:', err)
        return res.status(500).json({ success: false, message: 'Internal Server Error ' })
    }
}



exports.handleGetPaymentHistory= async(req, res)=>{
    try{
        const userId = req.user.id
        const mess_id= req.user.mess_id
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return res.status(400).json({ success: false, message: "Invalid user ID" })
            }

            if (!mess_id) {
                return res.status(400).json({ success: false, message: "Invalid Mess-ID." })
            }

        const transactions = await Transaction.find({ user_id: userId,  mess_id : mess_id }).sort({ createdAt: -1 })
            if (!transactions.length) {
                return res.status(404).json({ success: false, message: "No transactions found for this user" })
            }

        console.log("Transaction history sent successfully.")
        return res.status(200).json({ success: true, count: transactions.length, transactions })

    }catch(err){
        console.error('Error fetching transaction history:', err)
        return res.status(500).json({ success: false, message: 'Internal Server Error ' })
    }
}


exports.handlePostStudentLogout= async (req,res)=>{
    try{
        const authHeader= req.headers['authorization']
        let token

        if( authHeader && authHeader.startsWith('Bearer ') && authHeader.length > 7){
            token= authHeader.slice(7).trim()
        }

        if(!token){
            return res.status(401).json({ success: false, message: 'Authentication token is missing.' })
        }

        let user
        try{
            user= await verifyToken(token, secret)
        }catch(err){
            console.error("Token verification failed:", err.message)
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ success: false, message: 'Token has already expired.' })
            }
            return res.status(401).json({ success: false, message: 'Invalid token.' })
        }

        try {
            const expirationTime = user.exp - Math.floor(Date.now() / 1000)
            if (expirationTime > 0) {
                await redisClient.set(token, 'blacklisted', 'EX', expirationTime)
            }
        } catch (err) {
            console.error("Error storing token in Redis blacklist:", err.message);
            return res.status(500).json({ success: false, message: "Internal Server Error." })
        }

        console.log("Logged out successfully")
        return res.status(200).json({ success: true, message: `${req.user.role} Logged out successfully.` })

    }catch(err){
        console.error("Error in student logout function:", err.message);
        return res.status(500).json({ success: false, message: "Internal Server Error." })
    }
}
