// KaamSetu - Employer Profile Controller
// This file handles employer profile creation, retrieval, and updates

const EmployerProfile = require('../models/EmployerProfile');
const User = require('../models/User');
const { normalizeGeoLocation } = require('../utils/geoLocation');
const { geocodeAddress } = require('../services/geocodingService');

// ===========================
// Create or Update Employer Profile
// ===========================
// POST /api/employers/profile

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
    if (req.body.businessPhone !== undefined && typeof req.body.businessPhone !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Business phone number must be text.'
      });
    }

    // GeoJSON uses [longitude, latitude]. Fill placeholder coordinates from the address when possible.
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
      businessName: req.body.businessName,
      ownerName: req.body.ownerName,
      businessType: req.body.businessType,
      phone: req.body.businessPhone !== undefined ? req.body.businessPhone : phone,
      description: req.body.description,
      profileImage: req.body.profileImage,
      location: normalizeGeoLocation(location)
    };

    // Find existing profile and update, or create new one
    const profile = await EmployerProfile.findOneAndUpdate(
      { user: userId },
      profileData,
      {
        new: true,
        upsert: true,
        runValidators: true
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
      message: 'Employer profile saved successfully',
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
    console.error('Employer profile error:', error.message);
    const isValidationError = error.name === 'ValidationError' || error.name === 'CastError';
    res.status(isValidationError ? 400 : 500).json({
      success: false,
      message: isValidationError
        ? error.message
        : 'Server error while saving employer profile.'
    });
  }
};

// ===========================
// Get Employer Profile
// ===========================
// GET /api/employers/profile

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find profile and populate user basic info
    const profile = await EmployerProfile.findOne({ user: userId })
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
    console.error('Get employer profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employer profile.'
    });
  }
};

// ===========================
// Get Any Employer's Profile (Public)
// ===========================
// GET /api/employers/profile/:userId

const getEmployerProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await EmployerProfile.findOne({ user: userId })
      .populate('user', 'name email phone profilePhoto');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get employer profile by ID error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching employer profile.'
    });
  }
};

module.exports = {
  createOrUpdateProfile,
  getProfile,
  getEmployerProfile
};
