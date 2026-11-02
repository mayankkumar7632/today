// KaamSetu - Location Routes

const express = require('express');
const router = express.Router();
const { findNearbyJobs, updateLocation, geocodeLocation, reverseLocation } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

// Find jobs near a location (anyone can use)
router.get('/nearby-jobs', findNearbyJobs);

// Forward and reverse geocoding previews
router.get('/geocode', protect, geocodeLocation);
router.get('/reverse', protect, reverseLocation);

// Update worker location
router.put('/update', protect, authorize('worker'), updateLocation);

module.exports = router;
