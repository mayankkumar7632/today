// KaamSetu - Application Routes
// This file defines all routes related to job applications

const express = require('express');
const router = express.Router();

// Import controllers
const {
  applyForJob,
  getWorkerApplications,
  getEmployerApplications,
  acceptApplication,
  rejectApplication,
  completeApplication,
  cancelApplication
} = require('../controllers/applicationController');

// Import middleware
const { protect, authorize } = require('../middleware/auth');

// ===========================
// Application Routes
// ===========================

// POST /api/applications - Apply for a job (worker only)
router.post('/', protect, authorize('worker'), applyForJob);

// GET /api/applications/worker - Get worker's own applications
router.get('/worker', protect, authorize('worker'), getWorkerApplications);

// GET /api/applications/employer - Get applications for employer's jobs
router.get('/employer', protect, authorize('employer'), getEmployerApplications);

// PUT /api/applications/:id/accept - Accept an application (employer only)
router.put('/:id/accept', protect, authorize('employer'), acceptApplication);

// PUT /api/applications/:id/reject - Reject an application (employer only)
router.put('/:id/reject', protect, authorize('employer'), rejectApplication);

// PUT /api/applications/:id/complete - Mark as completed (employer only)
router.put('/:id/complete', protect, authorize('employer'), completeApplication);

// PUT /api/applications/:id/cancel - Cancel application (worker only)
router.put('/:id/cancel', protect, authorize('worker'), cancelApplication);

module.exports = router;
