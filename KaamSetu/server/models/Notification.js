// KaamSetu - Notification Model
// This model stores in-app notifications for users

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // The user receiving this notification
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Notification type
    type: {
      type: String,
      enum: [
        'new_application',
        'application_accepted',
        'application_rejected',
        'job_completed',
        'new_review',
        'verification_approved',
        'verification_rejected'
      ],
      required: true
    },

    // Short title
    title: {
      type: String,
      required: true,
      trim: true
    },

    // Detailed message
    message: {
      type: String,
      required: true,
      trim: true
    },

    // Whether the user has read this notification
    isRead: {
      type: Boolean,
      default: false
    },

    // Optional reference to related entity
    relatedJob: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
