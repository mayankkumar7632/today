// KaamSetu - Worker Routes
// This file defines all routes related to worker profiles

const express = require('express');
const router = express.Router();

// Import controllers
const {
  createOrUpdateProfile,
  getProfile,
  getWorkerProfile,
  searchWorkers
} = require('../controllers/workerController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================
// Worker Profile Routes
// ===========================

// POST /api/workers/profile - Create or update own profile (worker only)
router.post('/profile', protect, authorize('worker'), createOrUpdateProfile);

// GET /api/workers/profile - Get own profile (worker only)
router.get('/profile', protect, authorize('worker'), getProfile);

// PUT /api/workers/profile - Update own profile (worker only)
// We use POST above with upsert, so PUT does the same thing
router.put('/profile', protect, authorize('worker'), createOrUpdateProfile);

// GET /api/workers/profile/:userId - Get any worker's public profile
router.get('/profile/:userId', protect, getWorkerProfile);

// GET /api/workers/search - Search workers by skills and location
router.get('/search', protect, searchWorkers);

// GET /api/workers/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Worker routes are working'
  });
});

module.exports = router;
