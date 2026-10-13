// KaamSetu - Verification Controller
// This file handles verification requests and status management

const Verification = require('../models/Verification');

// ===========================
// Get Verification Status
// ===========================
// GET /api/verifications/status

const getVerificationStatus = async (req, res) => {
  try {
    let verification = await Verification.findOne({ user: req.user.id });

    // Auto-create if doesn't exist
    if (!verification) {
      verification = await Verification.create({ user: req.user.id });
    }

    res.status(200).json({
      success: true,
      data: verification
    });
  } catch (error) {
    console.error('Get verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching verification status.'
    });
  }
};

// ===========================
// Request Verification
// ===========================
// POST /api/verifications/request

const requestVerification = async (req, res) => {
  try {
    let verification = await Verification.findOne({ user: req.user.id });

    if (!verification) {
      verification = await Verification.create({ user: req.user.id });
    }

    // Update status to under_review
    verification.status = 'under_review';
    verification.verificationHistory.push({
      action: 'verification_requested',
      performedBy: req.user.id,
      date: new Date(),
      notes: req.body.reason || 'User requested verification'
    });

    await verification.save();

    res.status(200).json({
      success: true,
      message: 'Verification request submitted',
      data: verification
    });
  } catch (error) {
    console.error('Request verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while requesting verification.'
    });
  }
};

// ===========================
// Admin: Review Verification
// ===========================
// PUT /api/verifications/:userId/review

const reviewVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, notes } = req.body;

    if (!['verified', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: verified, rejected, or pending.'
      });
    }

    let verification = await Verification.findOne({ user: userId });

    if (!verification) {
      return res.status(404).json({
        success: false,
        message: 'Verification record not found.'
      });
    }

    verification.status = status;
    verification.reviewedBy = req.user.id;

    if (status === 'verified') {
      verification.verifiedAt = new Date();
      // If admin verifies, mark profile as verified
      verification.profileVerified = true;
    }

    verification.verificationHistory.push({
      action: `verification_${status}`,
      performedBy: req.user.id,
      date: new Date(),
      notes: notes || ''
    });

    await verification.save();

    res.status(200).json({
      success: true,
      message: `Verification ${status}`,
      data: verification
    });
  } catch (error) {
    console.error('Review verification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while reviewing verification.'
    });
  }
};

// ===========================
// Admin: Get All Pending Verifications
// ===========================
// GET /api/verifications/pending

const getPendingVerifications = async (req, res) => {
  try {
    const verifications = await Verification.find({ status: 'under_review' })
      .populate('user', 'name email phone role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: verifications.length,
      data: verifications
    });
  } catch (error) {
    console.error('Get pending verifications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending verifications.'
    });
  }
};

module.exports = {
  getVerificationStatus,
  requestVerification,
  reviewVerification,
  getPendingVerifications
};
