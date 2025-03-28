const mongoose = require("mongoose")

const notificationSchema = new mongoose.Schema(
  {
    mess_id: { type: String, required: true },
    type: { type: String, required: true, enum: ["token", "transaction"] },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    student_username: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false }, 
    delivered: { type: Boolean, default: false },
    notificationType: { type: String, required: true, enum: ["in-app", "push", "both"], default: "both" },
    pushSent: { type: Boolean, default: false },
    pushResponse: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now }, 
  },
  { timestamps: true }
)

module.exports = mongoose.model("Notification", notificationSchema)
