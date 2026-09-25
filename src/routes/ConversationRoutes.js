const express = require('express');

const {
    createConversation,
    getConversations
} = require('../controllers/ConversationController');

const router = express.Router();

// Create a conversation
router.post('/', createConversation);

// Get all conversations for logged-in user
router.get('/', getConversations);

module.exports = router;