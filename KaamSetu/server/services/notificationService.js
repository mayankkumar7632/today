// Sends email/SMS notifications and records each channel outcome in MongoDB.

const nodemailer = require('nodemailer');
const Notification = require('../models/Notification');
const User = require('../models/User');
const templates = require('./templates');

const mockMode = () => process.env.NOTIFY_MODE === 'mock';

const smtpIsConfigured = () => Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS
);

// Provider adapter point: add a Twilio, Fast2SMS, or other API call here.
// Keeping this function separate means the notification flow is provider-agnostic.
const sendSms = async (phone, message) => {
  if (mockMode() || !process.env.SMS_API_KEY) {
    console.log(`[SMS skipped] To ${phone}: ${message}`);
    return { status: 'skipped', error: mockMode() ? 'Mock mode enabled' : 'SMS_API_KEY is not configured' };
  }

  throw new Error('SMS provider adapter is not configured; implement sendSms for your provider.');
};

const saveDeliveryLog = async ({ userId, event, channel, message, status, error }) => {
  try {
    await Notification.create({
      userId,
      event,
      channel,
      message,
      status,
      error
    });
  } catch (logError) {
    // Logging failures must not turn a notification failure into an API failure.
    console.error(`Could not save ${channel} notification log:`, logError.message);
  }
};

const sendEmail = async (user, content) => {
  if (mockMode() || !smtpIsConfigured()) {
    const reason = mockMode() ? 'Mock mode enabled' : 'SMTP settings are incomplete';
    console.log(`[Email skipped] To ${user.email}: ${content.emailText}`);
    return { status: 'skipped', error: reason };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: content.subject,
    text: content.emailText
  });
  return { status: 'sent' };
};

const deliverChannel = async ({ user, event, channel, content, enabled }) => {
  const message = channel === 'email' ? content.emailText : content.smsText;

  if (!enabled) {
    await saveDeliveryLog({
      userId: user._id,
      event,
      channel,
      message,
      status: 'skipped',
      error: `${channel} notifications are disabled in user preferences`
    });
    return;
  }

  try {
    const result = channel === 'email'
      ? await sendEmail(user, content)
      : await sendSms(user.phone, content.smsText);
    await saveDeliveryLog({
      userId: user._id,
      event,
      channel,
      message,
      status: result.status,
      error: result.error
    });
  } catch (error) {
    console.error(`${channel} notification failed for user ${user._id}:`, error.message);
    await saveDeliveryLog({
      userId: user._id,
      event,
      channel,
      message,
      status: 'failed',
      error: error.message
    });
  }
};

// Public entry point. All errors are contained so notification delivery never
// changes the success or failure of the API operation that triggered it.
const notifyUser = async (userId, event, data = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error(`Cannot notify missing user ${userId} for event ${event}`);
      return;
    }

    const template = templates[event];
    if (!template) {
      console.error(`No notification template registered for event ${event}`);
      return;
    }
    const content = template(data);

    await Notification.create({
      user: user._id,
      title: data.title || content.subject,
      message: data.message || content.emailText,
      link: data.link || '',
      type: event,
      relatedJob: data.jobId || undefined,
      relatedUser: data.relatedUserId || undefined,
      read: false,
      isRead: false
    }).catch((inAppError) => {
      console.error(`Could not save in-app notification for event ${event}:`, inAppError.message);
    });

    await Promise.all([
      deliverChannel({ user, event, channel: 'email', content, enabled: user.notifyEmail }),
      deliverChannel({ user, event, channel: 'sms', content, enabled: user.notifySms })
    ]);
  } catch (error) {
    console.error(`Notification processing failed for event ${event}:`, error.message);
  }
};

module.exports = { notifyUser, sendSms };
