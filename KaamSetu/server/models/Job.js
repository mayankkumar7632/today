// KaamSetu - Job Model
// This model stores job postings created by employers

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // Reference to the employer who posted this job
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Job title
    // Example: "House Painting Required", "Construction Helper Needed"
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 200
    },

    // Detailed job description
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      maxlength: 2000
    },

    // Skills required for this job
    requiredSkills: [
      {
        type: String,
        trim: true
      }
    ],

    // Minimum experience required (in years)
    requiredExperience: {
      type: Number,
      min: 0,
      default: 0
    },

    // Daily wage offered in Indian Rupees
    dailyWage: {
      type: Number,
      required: [true, 'Daily wage is required'],
      min: 0
    },

    // GeoJSON location of the job
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      },
      address: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
      }
    },

    // Date when the job needs to be done
    jobDate: {
      type: Date,
      required: [true, 'Job date is required']
    },

    // Working hours
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '18:00' }
    },

    // Number of workers needed for this job
    workersRequired: {
      type: Number,
      min: 1,
      default: 1
    },

    // Number of workers already accepted
    workersAccepted: {
      type: Number,
      default: 0
    },

    // Job status
    status: {
      type: String,
      enum: ['open', 'closed', 'in-progress', 'completed', 'cancelled'],
      default: 'open'
    }
  },
  {
    timestamps: true
  }
);

// Create indexes for efficient queries
jobSchema.index({ status: 1, createdAt: -1 });       // For listing open jobs
jobSchema.index({ location: '2dsphere' });            // For location-based queries
jobSchema.index({ employer: 1 });                     // For employer's job listing
jobSchema.index({ requiredSkills: 1 });               // For skill-based search

module.exports = mongoose.model('Job', jobSchema);
