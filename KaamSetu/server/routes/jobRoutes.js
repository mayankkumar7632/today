// KaamSetu - Job Routes
// This file defines all routes related to job management

const express = require('express');
const router = express.Router();

// Import controllers
const {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getMyJobs
} = require('../controllers/jobController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================
// Job Routes
// ===========================

// GET /api/jobs - Get all open jobs (anyone can view)
router.get('/', getAllJobs);

// GET /api/jobs/employer/my-jobs - Get employer's own jobs
// This route must come before /:id to avoid conflicts
router.get('/employer/my-jobs', protect, authorize('employer'), getMyJobs);

// POST /api/jobs - Create a new job (employer only)
router.post('/', protect, authorize('employer'), createJob);

// GET /api/jobs/:id - Get single job by ID
router.get('/:id', getJobById);

// PUT /api/jobs/:id - Update a job (owner only)
router.put('/:id', protect, authorize('employer'), updateJob);

// DELETE /api/jobs/:id - Delete a job (owner only)
router.delete('/:id', protect, authorize('employer'), deleteJob);

module.exports = router;
