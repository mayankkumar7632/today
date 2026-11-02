// KaamSetu - Notification Routes

const express = require('express');
const router = express.Router();
const {
  testNotification,
  getDeliveryLogs,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { sendEmail, emailTemplate } = require('../services/emailService');

// Development-only email test. This endpoint is not registered in production.
if (process.env.NODE_ENV !== 'production') {
  router.post('/test-email', protect, async (req, res) => {
    const text = 'Your KaamSetu email notifications are working.';
    const html = emailTemplate('Test email', '<p>Your KaamSetu email notifications are working.</p>');
    const sent = await sendEmail(req.user.email, 'KaamSetu email test', text, html);

    res.status(sent ? 200 : 500).json({
      success: sent,
      message: sent ? 'Test email sent successfully.' : 'Test email could not be sent.'
    });
  });
}

// Get my notifications
router.get('/test', protect, testNotification);
router.get('/logs', protect, getDeliveryLogs);
router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getNotifications);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);
router.patch('/read-all', protect, markAllAsRead);

// Mark single notification as read
router.put('/:id/read', protect, markAsRead);
router.patch('/:id/read', protect, markAsRead);

// Delete a notification
router.delete('/:id', protect, deleteNotification);

module.exports = router;
