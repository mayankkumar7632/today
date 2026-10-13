// KaamSetu - Worker Profile Model
// This model stores detailed information about a worker's skills and experience

const mongoose = require('mongoose');

const workerProfileSchema = new mongoose.Schema(
  {
    // Reference to the User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One profile per user
    },

    // Worker's skills (array of strings)
    // Examples: ["Plumbing", "Electrician", "Construction", "Painting"]
    skills: [
      {
        type: String,
        trim: true
      }
    ],

    // Work experience description
    // Example: "5 years of experience in house painting"
    experience: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    // Number of years of experience
    yearsOfExperience: {
      type: Number,
      min: 0,
      default: 0
    },

    // Expected daily wage in Indian Rupees
    expectedWage: {
      type: Number,
      min: 0,
      default: 0
    },

    // Availability schedule
    // Example: "Monday to Saturday, 8 AM to 6 PM"
    availability: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Working hours preference
    workingHours: {
      start: { type: String, default: '08:00' },
      end: { type: String, default: '18:00' }
    },

    // GeoJSON location for finding nearby jobs
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
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

    // Short bio about the worker
    bio: {
      type: String,
      trim: true,
      maxlength: 500
    },

    // Average rating (calculated from reviews)
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },

    // Total number of reviews
    totalReviews: {
      type: Number,
      default: 0
    },

    // Number of jobs completed through KaamSetu
    completedJobs: {
      type: Number,
      default: 0
    }
  },
  {
    // Auto-add createdAt and updatedAt timestamps
    timestamps: true
  }
);

// Create 2dsphere index for location-based queries
workerProfileSchema.index({ location: '2dsphere' });

// Create index for skill-based searches
workerProfileSchema.index({ skills: 1 });

module.exports = mongoose.model('WorkerProfile', workerProfileSchema);
