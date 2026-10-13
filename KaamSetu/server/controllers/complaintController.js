// KaamSetu - Complaint Controller
// This file handles filing and managing complaints/reports

const Complaint = require('../models/Complaint');

// ===========================
// File a Complaint
// ===========================
// POST /api/complaints

const fileComplaint = async (req, res) => {
  try {
    const { reportedUserId, jobId, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for the complaint.'
      });
    }

    const complaint = await Complaint.create({
      reportedBy: req.user.id,
      reportedUser: reportedUserId || null,
      job: jobId || null,
      reason,
      description: description || ''
    });

    res.status(201).json({
      success: true,
      message: 'Complaint filed successfully. Admin will review it.',
      data: complaint
    });
  } catch (error) {
    console.error('File complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while filing complaint.'
    });
  }
};

// ===========================
// Get My Complaints
// ===========================
// GET /api/complaints/my

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ reportedBy: req.user.id })
      .populate('reportedUser', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get my complaints error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints.'
    });
  }
};

// ===========================
// Admin: Get All Complaints
// ===========================
// GET /api/complaints/all

const getAllComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const complaints = await Complaint.find(filter)
      .populate('reportedBy', 'name email')
      .populate('reportedUser', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints
    });
  } catch (error) {
    console.error('Get all complaints error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching complaints.'
    });
  }
};

// ===========================
// Admin: Update Complaint Status
// ===========================
// PUT /api/complaints/:id

const updateComplaint = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['pending', 'reviewed', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status.'
      });
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNotes: adminNotes || '',
        reviewedBy: req.user.id
      },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint updated',
      data: complaint
    });
  } catch (error) {
    console.error('Update complaint error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating complaint.'
    });
  }
};

module.exports = {
  fileComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaint
};
