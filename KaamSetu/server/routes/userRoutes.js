// KaamSetu - User Routes
// This file defines all routes related to users
// For now, it only has a test route

const express = require('express');
const router = express.Router();

// Import controller functions
const { getUserModelTest } = require('../controllers/userController');

// ===========================
// User Routes
// ===========================

// Test route - GET /api/users/test
// This route verifies that the User model is working
router.get('/test', getUserModelTest);

module.exports = router;
