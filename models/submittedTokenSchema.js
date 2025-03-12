const mongoose = require("mongoose");

const tokenSubmissionSchema = new mongoose.Schema(
  {
    token: {  type: mongoose.Schema.Types.ObjectId, ref: "Token", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mess_id: { type: String, required: true },
    createdAt: { type: Date, required: true },
    expiryDate: { type: Date, required: true }, 
    submittedAt: { type: Date, default: Date.now }, 
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true } 
  },
  { timestamps: true }
);

module.exports = mongoose.model("TokenSubmission", tokenSubmissionSchema);
