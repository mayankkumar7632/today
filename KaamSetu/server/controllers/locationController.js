// KaamSetu - Location Controller
// This file handles location-based job search

const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const { calculateDistance } = require('../services/locationService');

// ===========================
// Find Jobs Near a Location
// ===========================
// GET /api/location/nearby-jobs?longitude=77.1&latitude=28.6&radius=10

const findNearbyJobs = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude.'
      });
    }

    const radiusKm = Number(radius) || 10; // Default 10 km

    // Find jobs within radius using MongoDB geospatial query
    const jobs = await Job.find({
      status: 'open',
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(longitude), Number(latitude)]
          },
          $maxDistance: radiusKm * 1000 // Convert km to meters
        }
      }
    }).populate('employer', 'name email phone');

    // Add distance to each job result
    const jobsWithDistance = jobs.map(job => ({
      ...job.toObject(),
      distance: calculateDistance(
        [Number(longitude), Number(latitude)],
        job.location.coordinates
      )
    }));

    res.status(200).json({
      success: true,
      count: jobsWithDistance.length,
      radius: radiusKm,
      data: jobsWithDistance
    });
  } catch (error) {
    console.error('Find nearby jobs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while finding nearby jobs.'
    });
  }
};

// ===========================
// Update Worker Location
// ===========================
// PUT /api/location/update

const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude, address, city } = req.body;

    if (!longitude || !latitude) {
      return res.status(400).json({
        success: false,
        message: 'Please provide longitude and latitude.'
      });
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        location: {
          type: 'Point',
          coordinates: [Number(longitude), Number(latitude)],
          address: address || '',
          city: city || ''
        }
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Worker profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Location updated',
      data: profile.location
    });
  } catch (error) {
    console.error('Update location error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating location.'
    });
  }
};

module.exports = {
  findNearbyJobs,
  updateLocation
};
