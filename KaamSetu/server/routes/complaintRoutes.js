// KaamSetu - Complaint Routes

const express = require('express');
const router = express.Router();
const {
  fileComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// File a complaint
router.post('/', protect, fileComplaint);

// Get my complaints
router.get('/my', protect, getMyComplaints);

// Admin: get all complaints
router.get('/all', protect, authorize('admin'), getAllComplaints);

// Admin: update complaint status
router.put('/:id', protect, authorize('admin'), updateComplaint);

module.exports = router;
