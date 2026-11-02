const Review = require('../models/Review');
const User = require('../models/User');
const AdminActionLog = require('../models/AdminActionLog');
const { notifyUser } = require('../services/notificationService');
const { recalculateUserRating } = require('./reviewController');

const requireReason = (req, res) => {
  const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : '';
  if (!reason) {
    res.status(400).json({ success: false, message: 'A reason is required for this moderation action.' });
    return null;
  }
  return reason;
};

const getReviews = async (req, res) => {
  try {
    const filter = {};
    if (req.query.negative === 'true') filter.isNegative = true;
    if (req.query.reported === 'true') filter.reported = true;
    const reviews = await Review.find(filter)
      .populate('reviewer', 'name email role status')
      .populate('reviewee', 'name email role status avgRating reviewCount')
      .populate('job', 'title')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching reviews.' });
  }
};

const getFlaggedUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['worker', 'employer'] }, status: { $ne: 'deleted' } });
    const userIds = users.map(user => user._id);
    const stats = await Review.aggregate([
      { $match: { reviewee: { $in: userIds }, adminHidden: { $ne: true } } },
      { $group: { _id: '$reviewee', averageRating: { $avg: '$rating' }, reviewCount: { $sum: 1 },
        negativeCount: { $sum: { $cond: [{ $eq: ['$isNegative', true] }, 1, 0] } } } }
    ]);
    const flagged = stats.filter(item => item.negativeCount >= 3 || (item.reviewCount >= 3 && item.averageRating < 2))
      .map(item => {
        const user = users.find(candidate => candidate._id.toString() === item._id.toString());
        return { user, averageRating: Math.round(item.averageRating * 10) / 10, reviewCount: item.reviewCount, negativeCount: item.negativeCount };
      });
    res.status(200).json({ success: true, count: flagged.length, data: flagged });
  } catch (error) {
    console.error('Flagged users error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while finding flagged users.' });
  }
};

const hideReview = async (req, res) => {
  const reason = requireReason(req, res);
  if (!reason) return;
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
  review.adminHidden = true;
  await review.save();
  await recalculateUserRating(review.reviewee);
  await AdminActionLog.create({ admin: req.user.id, action: 'hide_review', targetUser: review.reviewee, reason });
  res.status(200).json({ success: true, message: 'Review hidden and user rating recalculated.', data: review });
};

const suspendUser = async (req, res) => {
  const reason = requireReason(req, res);
  if (!reason) return;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Admin accounts cannot be suspended this way.' });
  if (user._id.toString() === req.user.id) return res.status(400).json({ success: false, message: 'You cannot suspend your own account.' });
  user.status = 'suspended'; user.suspendedAt = new Date(); user.suspensionReason = reason; user.isActive = false;
  await user.save();
  await AdminActionLog.create({ admin: req.user.id, action: 'suspend_user', targetUser: user._id, reason });
  void notifyUser(user._id, 'account_suspended', { reason, title: 'Account suspended', link: '/notifications' });
  res.status(200).json({ success: true, message: 'User suspended.', data: user });
};

const softDeleteUser = async (req, res) => {
  const reason = requireReason(req, res);
  if (!reason) return;
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Admin accounts cannot be deleted this way.' });
  if (user._id.toString() === req.user.id) return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  user.status = 'deleted'; user.deletedAt = new Date(); user.deletedBy = req.user.id; user.deleteReason = reason; user.isActive = false;
  await user.save();
  await AdminActionLog.create({ admin: req.user.id, action: 'delete_user', targetUser: user._id, reason });
  void notifyUser(user._id, 'account_deleted', { reason, title: 'Account deleted', link: '/notifications' });
  res.status(200).json({ success: true, message: 'User soft-deleted.', data: user });
};

module.exports = { getReviews, getFlaggedUsers, hideReview, suspendUser, softDeleteUser };
