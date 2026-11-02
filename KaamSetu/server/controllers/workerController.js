// KaamSetu - Worker Profile Controller
// This file handles worker profile creation, retrieval, and updates

const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');
const { normalizeGeoLocation } = require('../utils/geoLocation');
const { geocodeAddress } = require('../services/geocodingService');

// ===========================
// Create or Update Worker Profile
// ===========================
// POST /api/workers/profile

const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const name = req.body.name;
    const phone = req.body.phone;

    if (name !== undefined &&
      (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 2 and 100 characters.'
      });
    }

    if (phone !== undefined && (typeof phone !== 'string' || !phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Phone number cannot be empty.'
      });
    }

    if (req.body.skills !== undefined &&
      (!Array.isArray(req.body.skills) || !req.body.skills.every((skill) => typeof skill === 'string'))) {
      return res.status(400).json({
        success: false,
        message: 'Skills must be a list of text values.'
      });
    }

    const workingHours = req.body.workingHours || {};
    if (typeof workingHours !== 'object' || Array.isArray(workingHours) ||
      (workingHours.start !== undefined && typeof workingHours.start !== 'string') ||
      (workingHours.end !== undefined && typeof workingHours.end !== 'string')) {
      return res.status(400).json({
        success: false,
        message: 'Working hours must contain text start and end times.'
      });
    }

    // GeoJSON uses [longitude, latitude]. Geocode only when coordinates are missing/placeholders.
    let location = req.body.location && typeof req.body.location === 'object' && !Array.isArray(req.body.location)
      ? { ...req.body.location }
      : {};
    const coordinates = location.coordinates;
    const needsCoordinates = !Array.isArray(coordinates) || coordinates.length !== 2 ||
      (Number(coordinates[0]) === 0 && Number(coordinates[1]) === 0);
    if (needsCoordinates && (location.address || location.city)) {
      location.coordinates = await geocodeAddress(location.address, location.city) || [0, 0];
    }

    // Build profile data from request body
    const profileData = {
      user: userId,
      skills: (req.body.skills || []).map((skill) => skill.trim()).filter(Boolean),
      experience: req.body.experience,
      yearsOfExperience: req.body.yearsOfExperience,
      expectedWage: req.body.expectedWage,
      availability: req.body.availability,
      workingHours: {
        start: workingHours.start,
        end: workingHours.end
      },
      bio: req.body.bio,
      location: normalizeGeoLocation(location)
    };

    // Find existing profile and update, or create new one
    const profile = await WorkerProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      {
        new: true,           // Return the updated document
        upsert: true,        // Create if doesn't exist
        runValidators: true  // Run schema validations
      }
    );

    const userUpdates = {};
    if (name !== undefined) userUpdates.name = name.trim();
    if (phone !== undefined) userUpdates.phone = phone.trim();
    const user = Object.keys(userUpdates).length
      ? await User.findOneAndUpdate(
        { _id: userId },
        { $set: userUpdates },
        { new: true, runValidators: true }
      ).select('name email phone role profilePhoto')
      : req.user;

    res.status(200).json({
      success: true,
      message: 'Worker profile saved successfully',
      data: profile,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Worker profile error:', error.message);
    const isValidationError = error.name === 'ValidationError' || error.name === 'CastError';
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: isValidationError
        ? error.message
        : 'Server error while saving worker profile.'
    });
  }
};

// ===========================
// Get Worker Profile
// ===========================
// GET /api/workers/profile

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find profile and populate user basic info
    const profile = await WorkerProfile.findOne({ user: userId })
      .populate('user', 'name email phone role profilePhoto');

    const profileUser = profile && profile.user ? profile.user : req.user;

    res.status(200).json({
      success: true,
      data: profile,
      user: {
        name: profileUser.name,
        email: profileUser.email,
        phone: profileUser.phone,
        role: profileUser.role,
        profilePhoto: profileUser.profilePhoto
      }
    });
  } catch (error) {
    console.error('Get worker profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching worker profile.'
    });
  }
};

// ===========================
// Get Any Worker's Profile (Public)
// ===========================
// GET /api/workers/profile/:userId

const getWorkerProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await WorkerProfile.findOne({ user: userId })
      .populate('user', 'name email phone profilePhoto');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get worker profile by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching worker profile.'
    });
  }
};

// ===========================
// Search Workers by Skills
// ===========================
// GET /api/workers/search?skills=painting,plumbing

const searchWorkers = async (req, res) => {
  try {
    const { skills, city, minWage, maxWage } = req.query;

    // Build search filter
    const filter = {};

    if (skills) {
      const skillArray = skills.split(',').map(s => s.trim());
      filter.skills = { $in: skillArray };
    }

    if (city) {
      filter['location.city'] = new RegExp(city, 'i');
    }

    if (minWage || maxWage) {
      filter.expectedWage = {};
      if (minWage) filter.expectedWage.$gte = Number(minWage);
      if (maxWage) filter.expectedWage.$lte = Number(maxWage);
    }

    const activeUserIds = await User.find({
      role: 'worker',
      isActive: { $ne: false },
      $or: [{ status: 'active' }, { status: { $exists: false } }, { status: null }]
    }).distinct('_id');
    filter.user = { $in: activeUserIds };
    const workers = await WorkerProfile.find(filter)
      .populate('user', 'name email phone profilePhoto status')
      .limit(20);

    res.status(200).json({
      success: true,
      count: workers.length,
      data: workers
    });
  } catch (error) {
    console.error('Search workers error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while searching workers.'
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  getWorkerProfile,
  searchWorkers
};
