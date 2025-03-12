const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    username: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true, enum: ['owner', 'student'] },
    isActive: { type: Boolean, default: true }, 
    mess_id: { type: String, required: true },
    fullName: { type: String },
    bio: { type: String },
    profileImage: { type: String },
    phone: { type: String },
    address: { type: String },
    profession: { type: String },
    age: { type: Number, default: null },
    dateOfBirth: { type: Date, default: null },

  },
  { timestamps: true }
);

const UserProfile = mongoose.model('UserProfile', userProfileSchema)

module.exports = UserProfile;
