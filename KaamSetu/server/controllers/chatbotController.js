// KaamSetu - Chatbot Controller
// Validates chatbot messages and returns a helpful reply.

const { getReply } = require('../services/chatbotService');
const assistantCommandService = require('../services/assistantCommandService');

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
const userRequestCounts = new Map();

const chat = async (req, res) => {
  const body = req.body || {};
  const { message, history } = body;

  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 300) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a message of 1 to 300 characters.'
    });
  }

  if (
    history !== undefined &&
    (!Array.isArray(history) ||
      history.length > 10 ||
      history.some((item) =>
        !item ||
        !['user', 'assistant'].includes(item.role) ||
        typeof item.content !== 'string'
      ))
  ) {
    return res.status(400).json({
      success: false,
      message: 'Chat history must contain up to 10 user or assistant messages.'
    });
  }

  const userId = String(req.user && (req.user._id || req.user.id));
  const now = Date.now();
  const requestWindow = userRequestCounts.get(userId);
  if (requestWindow && now - requestWindow.startedAt < RATE_LIMIT_WINDOW_MS) {
    if (requestWindow.count >= MAX_REQUESTS_PER_WINDOW) {
      return res.status(429).json({
        success: false,
        message: 'You have sent too many messages. Please wait a minute and try again.'
      });
    }
    requestWindow.count += 1;
  } else {
    userRequestCounts.set(userId, { startedAt: now, count: 1 });
  }

  // Remove expired users from the in-memory limiter.
  for (const [id, window] of userRequestCounts) {
    if (now - window.startedAt >= RATE_LIMIT_WINDOW_MS) {
      userRequestCounts.delete(id);
    }
  }

  try {
    const reply = await getReply(message.trim(), req.user, (history || []).slice(-6));
    return res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error('Chatbot error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while getting a chatbot reply.'
    });
  }
};

const command = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'worker') {
      return res.status(403).json({ success: false, message: 'This assistant command is available to workers only.' });
    }
    const text = typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!text || text.length > 300) {
      return res.status(400).json({ success: false, message: 'Please enter a command of 1 to 300 characters.' });
    }
    let state = req.body.state || {};
    if (!state || typeof state !== 'object' || Array.isArray(state)) state = {};
    const result = await assistantCommandService.command(text, state, req.user);
    if (!result) {
      const reply = await getReply(text, req.user, []);
      return res.status(200).json({ success: true, reply, options: ['Show jobs', 'My applications'], state: {}, expectText: true });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    console.error('Assistant command error:', error.message);
    return res.status(500).json({ success: false, reply: 'Sorry, something went wrong. Please try again.', options: [], state: {}, expectText: true });
  }
};

module.exports = { chat, command };
