const Review = require('../models/Review');
const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { notifyUser } = require('../services/notificationService');

const allowedTags = ['On time', 'Good work', 'Paid fairly', 'Rude', 'No show', 'Unsafe'];

const recalculateUserRating = async (userId) => {
  const reviews = await Review.find({ reviewee: userId, adminHidden: { $ne: true } });
  const reviewCount = reviews.length;
  const avgRating = reviewCount
    ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10) / 10
    : 0;
  await User.findByIdAndUpdate(userId, { avgRating, reviewCount });
};

const createReview = async (req, res) => {
  try {
    const { jobId, rating, tags = [], comment = '' } = req.body;
    if (!jobId || !Number.isInteger(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({ success: false, message: 'A job and rating from 1 to 5 are required.' });
    }
    if (comment.length > 500) return res.status(400).json({ success: false, message: 'Comment cannot exceed 500 characters.' });
    if (!Array.isArray(tags) || tags.some(tag => !allowedTags.includes(tag))) {
      return res.status(400).json({ success: false, message: 'One or more review tags are invalid.' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found.' });
    if (job.status !== 'completed') return res.status(400).json({ success: false, message: 'You can review only a completed job.' });

    let reviewee;
    if (req.user.role === 'employer') {
      if (job.employer.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'You did not own this job.' });
      reviewee = req.body.revieweeId;
      if (!reviewee) return res.status(400).json({ success: false, message: 'A worker is required when an employer leaves a review.' });
      const participation = await Application.findOne({ job: jobId, worker: reviewee, status: { $in: ['accepted', 'completed'] } });
      if (!participation) return res.status(403).json({ success: false, message: 'This worker did not participate in the job.' });
    } else if (req.user.role === 'worker') {
      const participation = await Application.findOne({ job: jobId, worker: req.user.id, status: { $in: ['accepted', 'completed'] } });
      if (!participation) return res.status(403).json({ success: false, message: 'You did not participate in this job.' });
      reviewee = job.employer;
    } else {
      return res.status(403).json({ success: false, message: 'Admins cannot submit job reviews.' });
    }

    const existing = await Review.findOne({ job: jobId, reviewer: req.user.id });
    if (existing) return res.status(409).json({ success: false, message: 'You have already reviewed this job.' });

    const revieweeUser = await User.findById(reviewee);
    if (!revieweeUser || revieweeUser.role === 'admin') return res.status(404).json({ success: false, message: 'Reviewee not found.' });
    const reviewerRole = req.user.role;
    const revieweeRole = reviewerRole === 'employer' ? 'worker' : 'employer';
    if (revieweeUser.role !== revieweeRole) return res.status(400).json({ success: false, message: 'Reviewee role does not match the job participant.' });

    const review = await Review.create({
      job: jobId, reviewer: req.user.id, reviewerRole, reviewee, revieweeRole,
      rating: Number(rating), tags, comment, isNegative: Number(rating) <= 2
    });
    await recalculateUserRating(reviewee);
    void notifyUser(reviewee, 'review_received', { reviewerName: req.user.name, rating: review.rating, jobTitle: job.title, title: 'New review received', link: '/notifications' });

    res.status(201).json({ success: true, message: 'Review submitted successfully', data: review });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'You have already reviewed this job.' });
    console.error('Create review error:', error.stack || error.message);
    res.status(500).json({ success: false, message: `Server error while creating review: ${error.message}` });
  }
};

const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId, adminHidden: { $ne: true } })
      .populate('reviewer', 'name profilePhoto role').populate('job', 'title')
      .sort({ createdAt: -1 });
    const ratingTotal = reviews.reduce((sum, review) => sum + review.rating, 0);
    res.status(200).json({ success: true, averageRating: reviews.length ? Math.round((ratingTotal / reviews.length) * 10) / 10 : 0,
      totalReviews: reviews.length, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
  }
};

const getJobReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ job: req.params.jobId, adminHidden: { $ne: true } })
      .populate('reviewer reviewee', 'name profilePhoto role').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching job reviews.' });
  }
};

const reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    if (review.reviewee.toString() !== req.user.id) return res.status(403).json({ success: false, message: 'Only the reviewed person can report this review.' });
    review.reported = true;
    await review.save();
    res.status(200).json({ success: true, message: 'Review reported to admin.', data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while reporting review.' });
  }
};

const getMyReviews = async (req, res) => {
  const reviews = await Review.find({ reviewer: req.user.id })
    .populate('reviewee', 'name profilePhoto').populate('job', 'title').sort({ createdAt: -1 });
  res.status(200).json({ success: true, count: reviews.length, data: reviews });
};

module.exports = { createReview, getUserReviews, getJobReviews, reportReview, getMyReviews, recalculateUserRating };
