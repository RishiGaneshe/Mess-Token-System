const mongoose = require('mongoose')


const adminCreationOTPSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    mess_id: { type: String, required: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now, expires: 120 }, 
  },
  {
    timestamps: true, 
  }
)

const AdminCreationOTP = mongoose.model('AdminCreationOTP', adminCreationOTPSchema)

module.exports = AdminCreationOTP
