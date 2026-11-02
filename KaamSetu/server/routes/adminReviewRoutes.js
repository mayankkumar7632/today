const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getReviews, getFlaggedUsers, hideReview, suspendUser, softDeleteUser } = require('../controllers/adminReviewController');

router.use(protect, authorize('admin'));
router.get('/reviews', getReviews);
router.get('/reviews/flagged-users', getFlaggedUsers);
router.patch('/reviews/:id/hide', hideReview);
router.patch('/users/:id/suspend', suspendUser);
router.delete('/users/:id', softDeleteUser);

module.exports = router;
