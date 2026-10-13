// KaamSetu - Employer Routes
// This file defines all routes related to employer profiles

const express = require('express');
const router = express.Router();

// Import controllers
const {
  createOrUpdateProfile,
  getProfile,
  getEmployerProfile
} = require('../controllers/employerController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================
// Employer Profile Routes
// ===========================

// POST /api/employers/profile - Create or update own profile (employer only)
router.post('/profile', protect, authorize('employer'), createOrUpdateProfile);

// GET /api/employers/profile - Get own profile (employer only)
router.get('/profile', protect, authorize('employer'), getProfile);

// PUT /api/employers/profile - Update own profile (employer only)
router.put('/profile', protect, authorize('employer'), createOrUpdateProfile);

// GET /api/employers/profile/:userId - Get any employer's public profile
router.get('/profile/:userId', protect, getEmployerProfile);

// GET /api/employers/test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Employer routes are working'
  });
});

module.exports = router;
