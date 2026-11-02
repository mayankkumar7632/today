// KaamSetu - Review Model
// This model stores two-way ratings and reviews between workers and employers

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviewerRole: { type: String, enum: ['worker', 'employer'], required: true },
    reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    revieweeRole: { type: String, enum: ['worker', 'employer'], required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    tags: [{ type: String, trim: true }],
    comment: { type: String, trim: true, maxlength: 500, default: '' },
    isNegative: { type: Boolean, default: false },
    reported: { type: Boolean, default: false },
    adminHidden: { type: Boolean, default: false }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate reviews - one review per reviewer per job
reviewSchema.index({ job: 1, reviewer: 1 }, { unique: true });

// Index for fetching reviews of a user
reviewSchema.index({ reviewee: 1, createdAt: -1 });

// Automatically compute this moderation flag for every create/update.
reviewSchema.pre('validate', function setNegativeFlag() {
  this.isNegative = Number(this.rating) <= 2;
});

module.exports = mongoose.model('Review', reviewSchema);
