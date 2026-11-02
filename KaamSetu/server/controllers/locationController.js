// KaamSetu - Location Controller
// This file handles location-based job search

const Job = require('../models/Job');
const WorkerProfile = require('../models/WorkerProfile');
const { calculateDistance } = require('../services/locationService');
const { normalizeGeoLocation } = require('../utils/geoLocation');
const { geocodeAddress, reverseGeocode } = require('../services/geocodingService');
const { calculateMatch } = require('../services/matchScore');

// ===========================
// Find Jobs Near a Location
// ===========================
// GET /api/location/nearby-jobs?longitude=77.1&latitude=28.6&radius=10

const findNearbyJobs = async (req, res) => {
  try {
    const { longitude, latitude, radius } = req.query;

    const longitudeNumber = Number(longitude);
    const latitudeNumber = Number(latitude);
    const radiusKm = radius === undefined || radius === '' ? 10 : Number(radius);

    if (!Number.isFinite(longitudeNumber) || longitudeNumber < -180 || longitudeNumber > 180 ||
      !Number.isFinite(latitudeNumber) || latitudeNumber < -90 || latitudeNumber > 90) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude must be valid numbers.' });
    }
    if (!Number.isFinite(radiusKm) || radiusKm <= 0 || radiusKm > 100) {
      return res.status(400).json({ success: false, message: 'Radius must be between 1 and 100 km.' });
    }

    // Find jobs within radius using MongoDB geospatial query
    const jobs = await Job.find({
      status: 'open',
      'location.coordinates': { $ne: [0, 0] },
      location: {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitudeNumber, latitudeNumber]
          },
          $maxDistance: radiusKm * 1000 // Convert km to meters
        }
      }
    }).populate('employer', 'name email phone avgRating');

    // Add distance and, for workers, the job match score to each result
    const workerProfile = req.user && req.user.role === 'worker'
      ? await WorkerProfile.findOne({ user: req.user.id })
      : null;

    const jobsWithDistance = jobs.map(async (job) => {
      const jobData = {
        ...job.toObject(),
        distance: calculateDistance(
          [longitudeNumber, latitudeNumber],
          job.location.coordinates
        )
      };

      if (workerProfile) {
        const { score, breakdown, contributions } = await calculateMatch(workerProfile, job);
        jobData.matchScore = score;
        jobData.breakdown = breakdown;
        jobData.contributions = contributions;
      }

      return jobData;
    });
    const data = await Promise.all(jobsWithDistance);

    res.status(200).json({
      success: true,
      count: data.length,
      radius: radiusKm,
      data
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
    const longitudeNumber = Number(longitude);
    const latitudeNumber = Number(latitude);

    if (!Number.isFinite(longitudeNumber) || longitudeNumber < -180 || longitudeNumber > 180 ||
      !Number.isFinite(latitudeNumber) || latitudeNumber < -90 || latitudeNumber > 90) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid longitude and latitude values.'
      });
    }

    const profile = await WorkerProfile.findOneAndUpdate(
      { user: req.user.id },
      {
        location: normalizeGeoLocation({
          coordinates: [longitudeNumber, latitudeNumber],
          address,
          city
        })
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

const geocodeLocation = async (req, res) => {
  const coordinates = await geocodeAddress(req.query.address, req.query.city);
  res.json({ success: coordinates !== null, coordinates });
};

const reverseLocation = async (req, res) => {
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
    return res.status(400).json({ success: false, message: 'Latitude and longitude must be valid numbers.' });
  }

  const result = await reverseGeocode(lat, lng);
  res.json(result ? { success: true, city: result.city, address: result.address } : { success: false, city: '', address: '' });
};

module.exports = {
  findNearbyJobs,
  updateLocation,
  geocodeLocation,
  reverseLocation
};
