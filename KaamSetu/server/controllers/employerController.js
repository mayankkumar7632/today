// KaamSetu - Employer Profile Controller
// This file handles employer profile creation, retrieval, and updates

const EmployerProfile = require('../models/EmployerProfile');

// ===========================
// Create or Update Employer Profile
// ===========================
// POST /api/employers/profile

const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Build profile data from request body
    const profileData = {
      user: userId,
      businessName: req.body.businessName,
      ownerName: req.body.ownerName,
      businessType: req.body.businessType,
      phone: req.body.phone,
      description: req.body.description,
      profileImage: req.body.profileImage,
      location: req.body.location || {
        type: 'Point',
        coordinates: [0, 0],
        address: '',
        city: ''
      }
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

    res.status(200).json({
      success: true,
      message: 'Employer profile saved successfully',
      data: profile
    });
  } catch (error) {
    console.error('Employer profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while saving employer profile.'
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

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Employer profile not found. Please create a profile first.'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
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
