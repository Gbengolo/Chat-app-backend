const express = require('express');

const {
  sendMessage,
  deliverMessage,
  readMessage,
} = require('../controllers/messageController');

const router = express.Router();

router.post(
  '/conversations/:conversationId/messages',
  sendMessage
);

router.patch(
  '/messages/:messageId/delivered',
  deliverMessage
);

router.patch(
  '/messages/:messageId/read',
  readMessage
);

module.exports = router;