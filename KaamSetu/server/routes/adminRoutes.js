// KaamSetu - Admin Routes

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  toggleUserActive,
  deleteUserAccount,
  getAllJobs,
  getAllApplications,
  deleteReview
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require login + admin role
router.use(protect, authorize('admin'));

// Dashboard statistics
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUserAccount);

// Job management
router.get('/jobs', getAllJobs);

// Application management
router.get('/applications', getAllApplications);

// Review management
router.delete('/reviews/:id', deleteReview);

module.exports = router;
