const express = require('express');

const {
    sendMessage,
    getMessages
} = require('../controllers/MessageController');

const router = express.Router();

// Send a message
router.post('/', sendMessage);

// Get message history
router.get('/:conversationId', getMessages);

module.exports = router;