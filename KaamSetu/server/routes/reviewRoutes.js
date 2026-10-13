// KaamSetu - Review Routes

const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Create a review
router.post('/', protect, createReview);

// Get reviews for a specific user
router.get('/user/:userId', protect, getUserReviews);

// Get reviews I gave
router.get('/my-reviews', protect, getMyReviews);

module.exports = router;
