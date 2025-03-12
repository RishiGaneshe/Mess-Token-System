const mongoose = require('mongoose')


const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, enum: ['owner', 'student'] },
    isActive: { type: Boolean, default: false }, 
    mess_id: { type: String, required: true },
    tokens: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Token' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema)

module.exports = User
