const mongoose = require('mongoose');


const TokenSubmissionSchema = new mongoose.Schema({
    submissionId: { type: String, unique: true, required: true }, 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  
    username: { type: String, required: true},
    mess_id: { type: String, required: true },  
    tokenCount: { type: Number, required: true },  
    tokenIds: { type: [mongoose.Schema.Types.ObjectId], ref: 'Token', required: true },  
    submittedAt: { type: Date, default: Date.now },  
    status: { type: String, enum: ['submitted', 'processed', 'failed'], default: 'submitted' }  
})

module.exports = mongoose.model('TokenSubmission', TokenSubmissionSchema);
