// KaamSetu - Recommendation Routes

const express = require('express');
const router = express.Router();
const {
  getJobRecommendations,
  getWorkerRecommendations
} = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/auth');

// Get job recommendations for logged-in worker
router.get('/jobs', protect, authorize('worker'), getJobRecommendations);

// Get worker recommendations for a specific job (employer only)
router.get('/workers/:jobId', protect, authorize('employer'), getWorkerRecommendations);

module.exports = router;
