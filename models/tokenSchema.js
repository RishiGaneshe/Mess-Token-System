const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    tokenCode: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mess_id: { type: String, required: true },
    issued_by: { type: String, required: true },
    issuer_role: { type: String, required: true, enum: ['owner', 'student']}, 
    purchaseDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, required: true },
    redeemed: { type: Boolean, default: false },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true },
}, { timestamps: true })


const Token = mongoose.model('Token', tokenSchema)


module.exports = Token
