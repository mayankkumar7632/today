// KaamSetu - Notification Controller
// This file handles fetching and managing notifications

const Notification = require('../models/Notification');
const { notifyUser } = require('../services/notificationService');

// GET /api/notifications/test sends both enabled channels for the logged-in user.
const testNotification = async (req, res) => {
  await notifyUser(req.user.id, 'notification_test', {
    title: 'KaamSetu notification test',
    message: 'This is a test notification.',
    link: '/notifications'
  });
  res.status(202).json({
    success: true,
    message: 'Test notification created.'
  });
};

// GET /api/notifications/logs shows the authenticated user's email/SMS outcomes.
const getDeliveryLogs = async (req, res) => {
  try {
    const logs = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs
    });
  } catch (error) {
    console.error('Get notification delivery logs error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification delivery logs.'
    });
  }
};

// ===========================
// Get My Notifications
// ===========================
// GET /api/notifications

const getNotifications = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      read: { $ne: true },
      isRead: { $ne: true }
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications
    });
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications.'
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user.id,
      read: { $ne: true },
      isRead: { $ne: true }
    });
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Get unread notification count error:', error.message);
    res.status(500).json({ success: false, message: 'Server error while counting notifications.' });
  }
};

// ===========================
// Mark Single Notification as Read
// ===========================
// PUT /api/notifications/:id/read

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true, read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notification.'
    });
  }
};

// ===========================
// Mark All Notifications as Read
// ===========================
// PUT /api/notifications/read-all

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, read: { $ne: true }, isRead: { $ne: true } },
      { isRead: true, read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while updating notifications.'
    });
  }
};

// ===========================
// Delete a Notification
// ===========================
// DELETE /api/notifications/:id

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting notification.'
    });
  }
};

module.exports = {
  testNotification,
  getDeliveryLogs,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
