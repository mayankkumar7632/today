// KaamSetu - Review Controller
// This file handles creating and fetching reviews and ratings

const Review = require('../models/Review');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const EmployerProfile = require('../models/EmployerProfile');
const Notification = require('../models/Notification');

// ===========================
// Create a Review
// ===========================
// POST /api/reviews

const createReview = async (req, res) => {
  try {
    const { jobId, revieweeId, reviewType, ratings, comment } = req.body;

    // Validate required fields
    if (!jobId || !revieweeId || !reviewType || !ratings || !ratings.overall) {
      return res.status(400).json({
        success: false,
        message: 'Please provide jobId, revieweeId, reviewType, and ratings.'
      });
    }

    // Validate review type
    if (!['employer_to_worker', 'worker_to_employer'].includes(reviewType)) {
      return res.status(400).json({
        success: false,
        message: 'reviewType must be employer_to_worker or worker_to_employer.'
      });
    }

    // Verify the reviewer was involved in this completed job
    const application = await Application.findOne({
      job: jobId,
      status: 'completed',
      $or: [
        { worker: req.user.id },
        { employer: req.user.id }
      ]
    });

    if (!application) {
      return res.status(403).json({
        success: false,
        message: 'You can only review after a completed job you were involved in.'
      });
    }

    // Check for duplicate review
    const existingReview = await Review.findOne({
      job: jobId,
      reviewer: req.user.id
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed for this job.'
      });
    }

    // Create the review
    const review = await Review.create({
      job: jobId,
      reviewee: revieweeId,
      reviewer: req.user.id,
      reviewType,
      ratings: {
        overall: ratings.overall,
        skill: ratings.skill,
        punctuality: ratings.punctuality,
        workQuality: ratings.workQuality,
        payment: ratings.payment,
        behaviour: ratings.behaviour
      },
      comment
    });

    // Update average rating for the reviewee
    const allReviews = await Review.find({ reviewee: revieweeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.ratings.overall, 0);
    const avgRating = totalRating / allReviews.length;

    // Update worker or employer profile rating
    if (reviewType === 'employer_to_worker') {
      await WorkerProfile.findOneAndUpdate(
        { user: revieweeId },
        { averageRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length }
      );
    } else {
      await EmployerProfile.findOneAndUpdate(
        { user: revieweeId },
        { averageRating: Math.round(avgRating * 10) / 10, totalReviews: allReviews.length }
      );
    }

    // Send notification to reviewee
    await Notification.create({
      user: revieweeId,
      type: 'new_review',
      title: 'New Review Received',
      message: `You received a new review with rating ${ratings.overall}/5`,
      relatedJob: jobId,
      relatedUser: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review
    });
  } catch (error) {
    console.error('Create review error:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed for this job.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while creating review.'
    });
  }
};

// ===========================
// Get Reviews for a User
// ===========================
// GET /api/reviews/user/:userId

const getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;

    const reviews = await Review.find({ reviewee: userId })
      .populate('reviewer', 'name email')
      .populate('job', 'title dailyWage')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews.'
    });
  }
};

// ===========================
// Get Reviews I Gave
// ===========================
// GET /api/reviews/my-reviews

const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate('reviewee', 'name email')
      .populate('job', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get my reviews error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your reviews.'
    });
  }
};

module.exports = { createReview, getUserReviews, getMyReviews };
