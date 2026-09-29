const express = require('express');

const {
    createConversation,
    getConversations
} = require('../controllers/ConversationController');

const { protect } = require('../middleware/auth.js');

const router = express.Router();

router.post('/', protect, createConversation);
router.get('/', protect, getConversations);

module.exports = router;