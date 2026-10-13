// KaamSetu - Application Model
// This model stores job applications from workers

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    // The job being applied to
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },

    // The worker applying
    worker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // The employer who posted the job
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Application status
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
      default: 'pending'
    },

    // Optional message from worker
    message: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // When the employer responded
    respondedAt: {
      type: Date
    },

    // When the job was marked as completed
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate applications - one application per worker per job
applicationSchema.index({ job: 1, worker: 1 }, { unique: true });

// Index for efficient queries
applicationSchema.index({ worker: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
