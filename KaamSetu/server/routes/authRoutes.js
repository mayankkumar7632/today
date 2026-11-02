// KaamSetu - Authentication Routes
// This file defines routes for registration, login, logout, and profile

const express = require('express');
const router = express.Router();

// Import controller functions
const {
  register,
  login,
  logout,
  getMe,
  uploadProfilePhoto,
  removeProfilePhoto
} = require('../controllers/authController');

// Import authentication middleware
const { protect } = require('../middleware/auth');
const { uploadProfilePhoto: uploadPhoto } = require('../middleware/upload');

// ===========================
// Public Routes (No login required)
// ===========================

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login to existing account
router.post('/login', login);

// POST /api/auth/logout - Logout (client removes token)
router.post('/logout', logout);

// ===========================
// Protected Routes (Login required)
// ===========================

// GET /api/auth/me - Get current logged-in user profile
router.get('/me', protect, getMe);
router.post('/profile-photo', protect, uploadPhoto, uploadProfilePhoto);
router.delete('/profile-photo', protect, removeProfilePhoto);

module.exports = router;
