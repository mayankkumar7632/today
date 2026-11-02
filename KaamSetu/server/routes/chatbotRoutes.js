// KaamSetu - Chatbot Routes

const express = require('express');
const router = express.Router();
const { chat, command } = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

router.post('/', protect, chat);
router.post('/command', protect, command);

module.exports = router;
