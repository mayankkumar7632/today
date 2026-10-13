// KaamSetu - Location Routes

const express = require('express');
const router = express.Router();
const { findNearbyJobs, updateLocation } = require('../controllers/locationController');
const { protect, authorize } = require('../middleware/auth');

// Find jobs near a location (anyone can use)
router.get('/nearby-jobs', findNearbyJobs);

// Update worker location
router.put('/update', protect, authorize('worker'), updateLocation);

module.exports = router;
