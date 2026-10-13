// KaamSetu - Admin Controller
// This file handles admin dashboard and management functions

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Review = require('../models/Review');
const Verification = require('../models/Verification');
const Complaint = require('../models/Complaint');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');

// ===========================
// Get Dashboard Statistics
// ===========================
// GET /api/admin/stats

const getDashboardStats = async (req, res) => {
  try {
    // Count all entities
    const totalWorkers = await User.countDocuments({ role: 'worker' });
    const totalEmployers = await User.countDocuments({ role: 'employer' });
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'open' });
    const completedJobs = await Job.countDocuments({ status: 'completed' });
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const pendingVerifications = await Verification.countDocuments({ status: 'under_review' });
    const totalReviews = await Review.countDocuments();
    const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
    const totalUsers = await User.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalWorkers,
        totalEmployers,
        totalJobs,
        activeJobs,
        completedJobs,
        pendingApplications,
        pendingVerifications,
        totalReviews,
        pendingComplaints
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats.'
    });
  }
};

// ===========================
// Get All Users
// ===========================
// GET /api/admin/users

const getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get all users error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users.'
    });
  }
};

// ===========================
// Block/Unblock User
// ===========================
// PUT /api/admin/users/:id/toggle-active

const toggleUserActive = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Prevent admin from blocking themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot block your own account.'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        id: user._id,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Toggle user active error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status.'
    });
  }
};

// ===========================
// Delete User Account (Admin)
// ===========================
// DELETE /api/admin/users/:id

const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.'
      });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Admin accounts cannot be deleted from this panel.'
      });
    }

    const userId = user._id;

    await WorkerProfile.deleteOne({ user: userId });
    await EmployerProfile.deleteOne({ user: userId });
    await Verification.deleteMany({ user: userId });
    await Complaint.deleteMany({ user: userId });

    if (user.role === 'worker') {
      await Application.deleteMany({ worker: userId });
    }

    if (user.role === 'employer') {
      const employerJobs = await Job.find({ employer: userId }).select('_id');
      const employerJobIds = employerJobs.map(job => job._id);

      await Job.deleteMany({ employer: userId });
      await Application.deleteMany({ $or: [{ employer: userId }, { job: { $in: employerJobIds } }] });
    }

    await Review.deleteMany({
      $or: [
        { reviewer: userId },
        { reviewee: userId }
      ]
    });

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} account deleted successfully.`
    });
  } catch (error) {
    console.error('Delete user account error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user account.'
    });
  }
};

// ===========================
// Get All Jobs (Admin)
// ===========================
// GET /api/admin/jobs

const getAllJobs = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate('employer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    console.error('Get all jobs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobs.'
    });
  }
};

// ===========================
// Get All Applications (Admin)
// ===========================
// GET /api/admin/applications

const getAllApplications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    const applications = await Application.find(filter)
      .populate('job', 'title')
      .populate('worker', 'name email')
      .populate('employer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });
  } catch (error) {
    console.error('Get all applications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching applications.'
    });
  }
};

// ===========================
// Delete a Review (Admin - for inappropriate content)
// ===========================
// DELETE /api/admin/reviews/:id

const deleteReview = async (req, res) => {
  try {
    const Review = require('../models/Review');
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Review deleted by admin'
    });
  } catch (error) {
    console.error('Delete review error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review.'
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserActive,
  deleteUserAccount,
  getAllJobs,
  getAllApplications,
  deleteReview
};
