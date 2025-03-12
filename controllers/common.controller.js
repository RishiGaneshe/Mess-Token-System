const { createRazorpayInstance }= require('../services/rezorpayIntegration')
const { getPaymentDetails, handleGetPaymentInfo }= require('../services/miscellaneousServices')
const Token= require('../models/tokenSchema')
const crypto= require('crypto')
const User= require('../models/signUpSchema')
const mongoose= require('mongoose')
const Transaction= require('../models/transactionSchema')



let RazorpayInstance
const RzInstance= async()=>{
    try{
        RazorpayInstance= await createRazorpayInstance()
    }catch(err){
        console.error("Error in creating Rz Instance"+ err.message)
    }   
}
RzInstance()



exports.handleRazorpayCreateOrder= async (req,res)=>{
    try{
        let { tokenCount }= req.body
        console.log("Tokens: ", tokenCount)

        tokenCount= tokenCount* 50;
        console.log("Amount: "+ tokenCount)

        const options= {
                amount: tokenCount*100,
                currency: "INR"
        }

        let order
        try{
            order= await RazorpayInstance.orders.create(options)
            if(!order){
                return res.status(500).json({ success: false, message: "Unable to create order. Try again later.", error: "Internal Server Error"})
            }
        }catch(err){
            console.error("Unable to create order."+ err.message)
            return res.status(500).json({ success: false, message: "Unable to create order. Try again later.", error: "Internal Server Error"})
        }

        console.log("Order Created Successfully.")
        return res.status(200).json({success: true, order:order, message: "Order Sent Successfully" })

    }catch(err){
        console.error("error in Payment order creation API", err.message)
        return res.status(500).json({ success: false, message: "Unable to create order.Try again later.", error: "Internal Server Error"})
    }
}


exports.handleVerifyPayments= async (req,res)=>{
    const session= await mongoose.startSession()
    try{
        session.startTransaction()

        const secret= process.env.RazorPay_Secret
        const { order_id, payment_id, signature }= req.body

            if ( !order_id || !payment_id || !signature ) {
                await session.abortTransaction()
                return res.status(400).json({ success: false, message: "Missing required parameters." })
            }

        const hmac= crypto.createHmac("sha256", secret)
        hmac.update(order_id+ '|' + payment_id)
        const generatedSignature= hmac.digest("hex")

            if(generatedSignature !== signature){
                await session.abortTransaction()
                return res.status(400).json({success: false, message: "Payment failed. Signature Does not matched."})
            }

        const user= await User.findById(req.user.id).session(session)
            if(!user){
                await session.abortTransaction()
                return res.status(401).json({ success: false, message: 'Invalid Request.User Id not Found.' })
            }

        let paymentData
        try{
            paymentData= await handleGetPaymentInfo(payment_id, process.env.RazorPay_key , process.env.RazorPay_Secret )
        }catch(err){
            console.log("Error in the Paymant data info function: ", err.message)
            throw err
        }

        const amount= paymentData.amount / 100
            if (!amount || amount <= 0) {
                await session.abortTransaction()
                return res.status(400).json({ success: false, message: "Invalid payment amount." })
            }
    
        const tokenCount = Math.floor(amount / 50)
            if (tokenCount <= 0) {
                await session.abortTransaction()
                return res.status(400).json({ success: false, message: "Insufficient amount for token purchase." })
            }
        
        const tokens= []

        for(let i=0; i<tokenCount; i++){
            tokens.push ({
                tokenCode: crypto.randomBytes(8).toString('hex'),
                user: req.user.id,
                mess_id: req.user.mess_id,
                issued_by: req.user.username,
                issuer_role: req.user.role,
                expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                redeemed: false,
                amount: 50,
                transactionId: payment_id
            })
        }
        
        try{        
            const transaction = new Transaction({
                transaction_id: paymentData.id,
                order_id: paymentData.order_id,
                user_id: user._id,
                mess_id: req.user.mess_id,
                username: user.username,
                amount: amount,
                currency: paymentData.currency,
                status: paymentData.status,
                payment_method: paymentData.method,
                tokens_purchased: tokenCount,
                token_validity: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
                razorpay_signature: signature
            })
            await transaction.save()

        }catch(err){
             await session.abortTransaction()
             console.error("Error in Token Issue API", err.message)
             return res.status(500).json({ success: false, error: "Internal Server Error", message: "Error in issueing tokens.Try again later."})
        }

        let insertedMany
        try{
            insertedMany= await Token.insertMany(tokens, { session })
            user.tokens.push(...insertedMany.map(token => token._id))
            await user.save({ session })

        }catch(err){
             await session.abortTransaction()
             console.error("Error in Token Issue API", err.message)
             return res.status(500).json({ success: false, error: "Internal Server Error", message: "Error in issueing tokens.Try again later."})
        }
        
        await session.commitTransaction()
        console.log("Token Issued Successfully.")
        return res.status(200).json({ success: true, message: ` ${tokenCount} Token Purchased.` })

    }catch(err){
        await session.abortTransaction()
        console.error("Error in payment varification API.",err.message)
        return res.status(500).json({ success: false, error: "Internal Server Error", message: "Internal Server Error.Try again later."})

    } finally {
        await session.endSession()
    }
}

