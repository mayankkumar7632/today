const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['hide_review', 'suspend_user', 'delete_user'], required: true },
  targetUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true, trim: true }
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('AdminActionLog', adminActionLogSchema);
