const express = require('express');
const router = express.Router();
const { createReview, getUserReviews, getJobReviews, reportReview, getMyReviews } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.post('/', createReview);
router.get('/user/:userId', getUserReviews);
router.get('/job/:jobId', getJobReviews);
router.post('/:id/report', reportReview);
router.get('/my-reviews', getMyReviews);

module.exports = router;
