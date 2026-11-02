// KaamSetu - Notification Model
// This collection stores in-app notifications and email/SMS delivery logs.

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Legacy in-app notification recipient.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.channel;
      }
    },

    // Delivery-log recipient; channel distinguishes these records from in-app alerts.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return Boolean(this.channel);
      }
    },

    // In-app notification type.
    type: {
      type: String,
      required: function () {
        return !this.channel;
      }
    },

    // Event and delivery result are present on email/SMS log records.
    event: {
      type: String,
      enum: [
        'worker_applied',
        'application_accepted',
        'application_rejected',
        'job_reminder',
        'complaint_filed',
        'complaint_status_updated',
        'new_matching_job',
        'notification_test',
        'review_received',
        'job_completed',
        'account_suspended',
        'account_deleted'
      ],
      required: function () {
        return Boolean(this.channel);
      }
    },
    channel: {
      type: String,
      enum: ['email', 'sms']
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      required: function () {
        return Boolean(this.channel);
      }
    },
    error: {
      type: String,
      trim: true
    },

    // Short title for in-app notifications.
    title: {
      type: String,
      required: function () {
        return !this.channel;
      },
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
    read: {
      type: Boolean,
      default: false
    },
    link: {
      type: String,
      trim: true,
      default: ''
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

// Indexes support both in-app inbox queries and delivery-log lookups.
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, event: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
