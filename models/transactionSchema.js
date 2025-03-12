const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    transaction_id: { type: String, required: true, unique: true },  
    order_id: { type: String, required: true, unique: true }, 
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mess_id: { type: String, required: true },
    username: { type: String, required: true},
    amount: { type: Number, required: true }, 
    currency: { type: String, default: "INR" },
    status: { 
        type: String,
        enum: ["created", "authorized", "captured", "failed", "refunded"], 
        required: true 
    },
    payment_method: { type: String, required: true },
    tokens_purchased: { type: Number, required: true }, 
    token_validity: { type: Date, required: true },  
    razorpay_signature: { type: String, required: true }, 
   
}, { timestamps: true })



module.exports = mongoose.model("Transaction", transactionSchema)
