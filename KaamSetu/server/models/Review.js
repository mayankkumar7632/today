// KaamSetu - Review Model
// This model stores two-way ratings and reviews between workers and employers

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    // The job this review is for
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },

    // The person being reviewed
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // The person giving the review
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Type of review
    // "employer_to_worker" or "worker_to_employer"
    reviewType: {
      type: String,
      enum: ['employer_to_worker', 'worker_to_employer'],
      required: true
    },

    // Category ratings (1 to 5)
    ratings: {
      overall: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      // Employer rating categories for reviewing workers
      skill: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      workQuality: { type: Number, min: 1, max: 5 },
      // Worker rating categories for reviewing employers
      payment: { type: Number, min: 1, max: 5 },
      behaviour: { type: Number, min: 1, max: 5 }
    },

    // Written review text
    comment: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews - one review per reviewer per job
reviewSchema.index({ job: 1, reviewer: 1 }, { unique: true });

// Index for fetching reviews of a user
reviewSchema.index({ reviewee: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
