// KaamSetu - Complaint/Report Model
// This model stores user complaints and reports

const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    // Who filed the complaint
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Who is being reported (optional - can report a job or review)
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    // Related job (optional)
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },

    // Reason for complaint
    reason: {
      type: String,
      required: [true, 'Please provide a reason'],
      trim: true
    },

    // Detailed description
    description: {
      type: String,
      trim: true,
      maxlength: 2000
    },

    // Complaint status
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending'
    },

    // Admin notes
    adminNotes: {
      type: String,
      trim: true
    },

    // Admin who reviewed
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
