// KaamSetu - Worker Profile Controller
// This file handles worker profile creation, retrieval, and updates

const WorkerProfile = require('../models/WorkerProfile');

// ===========================
// Create or Update Worker Profile
// ===========================
// POST /api/workers/profile

const createOrUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    // Build profile data from request body
    const profileData = {
      user: userId,
      skills: req.body.skills || [],
      experience: req.body.experience,
      yearsOfExperience: req.body.yearsOfExperience,
      expectedWage: req.body.expectedWage,
      availability: req.body.availability,
      workingHours: req.body.workingHours,
      bio: req.body.bio,
      location: req.body.location || {
        type: 'Point',
        coordinates: [0, 0],
        address: '',
        city: ''
      }
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

    res.status(200).json({
      success: true,
      message: 'Worker profile saved successfully',
      data: profile
    });
  } catch (error) {
    console.error('Worker profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while saving worker profile.'
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

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found. Please create a profile first.'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
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

    const workers = await WorkerProfile.find(filter)
      .populate('user', 'name email phone profilePhoto')
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
