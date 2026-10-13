// KaamSetu - Verification Model
// This model tracks the multi-level verification status of users

const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    // The user being verified
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    // Level 1: Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },

    // Level 1: Phone verification
    phoneVerified: {
      type: Boolean,
      default: false
    },

    // Level 2: Profile completeness verification
    profileVerified: {
      type: Boolean,
      default: false
    },

    // Level 3: Skill and work verification (based on completed jobs)
    skillVerified: {
      type: Boolean,
      default: false
    },

    // Level 4: Trusted worker/employer status
    trustedStatus: {
      type: Boolean,
      default: false
    },

    // Overall verification status
    status: {
      type: String,
      enum: ['pending', 'under_review', 'verified', 'rejected'],
      default: 'pending'
    },

    // Verification history log
    verificationHistory: [
      {
        action: String,       // e.g., "profile_verified", "skill_verified"
        performedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        date: {
          type: Date,
          default: Date.now
        },
        notes: String
      }
    ],

    // Admin who last reviewed
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // When verification was completed
    verifiedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Verification', verificationSchema);
