// KaamSetu - Verification Routes

const express = require('express');
const router = express.Router();
const {
  getVerificationStatus,
  requestVerification,
  reviewVerification,
  getPendingVerifications
} = require('../controllers/verificationController');
const { protect, authorize } = require('../middleware/auth');

// Get own verification status
router.get('/status', protect, getVerificationStatus);

// Request verification
router.post('/request', protect, requestVerification);

// Admin: get pending verifications
router.get('/pending', protect, authorize('admin'), getPendingVerifications);

// Admin: review a verification
router.put('/:userId/review', protect, authorize('admin'), reviewVerification);

module.exports = router;
