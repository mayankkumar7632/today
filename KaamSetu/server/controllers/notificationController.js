// KaamSetu - Notification Controller
// This file handles fetching and managing notifications

const Notification = require('../models/Notification');

// ===========================
// Get My Notifications
// ===========================
// GET /api/notifications

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      user: req.user.id,
      isRead: false
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

// ===========================
// Mark Single Notification as Read
// ===========================
// PUT /api/notifications/:id/read

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
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
      { user: req.user.id, isRead: false },
      { isRead: true }
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
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
