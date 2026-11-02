// KaamSetu - User Model
// This file defines the User schema and model for MongoDB
// The User model represents all three types of users: Worker, Employer, and Admin

const mongoose = require('mongoose');

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    // User's full name
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    // User's email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },

    // User's phone number
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },

    // Users can opt out of either channel without disabling the other.
    notifyEmail: {
      type: Boolean,
      default: true
    },
    notifySms: {
      type: Boolean,
      default: true
    },

    // User's password
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },

    // User role
    role: {
      type: String,
      enum: {
        values: ['worker', 'employer', 'admin'],
        message: 'Role must be either worker, employer, or admin'
      },
      default: 'worker'
    },

    // Profile photo URL
    profilePhoto: {
      type: String,
      default: null
    },

    // User's location for future geo-based job matching
    // Location is optional during registration.
    // If provided, it must be valid GeoJSON Point data.
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: {
        type: [Number]
      }
    },

    // Whether the user account is active
    isActive: {
      type: Boolean,
      default: true
    },

    // Account moderation state. Kept separate from isActive for a clear audit-friendly lifecycle.
    status: {
      type: String,
      enum: ['active', 'suspended', 'deleted'],
      default: 'active'
    },
    suspendedAt: Date,
    suspensionReason: String,
    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deleteReason: String,

    // Public review statistics maintained by the review service.
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    // Whether the user's email is verified
    emailVerified: {
      type: Boolean,
      default: false
    },

    // Whether the user's phone is verified
    phoneVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Create a 2dsphere index on the location field
userSchema.index({ location: '2dsphere' });

// Create and export the User model
const User = mongoose.model('User', userSchema);

module.exports = User;