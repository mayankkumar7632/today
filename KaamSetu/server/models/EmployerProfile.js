// KaamSetu - Employer Profile Model
// This model stores detailed information about an employer and their business

const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema(
  {
    // Reference to the User model
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One profile per user
    },

    // Business/company name
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 200
    },

    // Owner's name
    ownerName: {
      type: String,
      trim: true,
      maxlength: 200
    },

    // Type of business
    // Example: "Construction", "Event Management", "Household", "Factory"
    businessType: {
      type: String,
      trim: true,
      maxlength: 100
    },

    // Business phone number
    phone: {
      type: String,
      trim: true
    },

    // GeoJSON location for finding nearby workers
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

    // Business description
    description: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    // Profile image URL
    profileImage: {
      type: String,
      default: null
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

    // Number of jobs posted
    totalJobsPosted: {
      type: Number,
      default: 0
    },

    // Number of jobs completed
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
employerProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema);
