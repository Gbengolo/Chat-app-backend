const express = require('express');

const {
  sendMessage,
  deliverMessage,
  readMessage,
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/conversations/:conversationId/messages',
  protect,
  sendMessage
);

router.patch(
  '/messages/:messageId/delivered',
  protect,
  deliverMessage
);

router.patch(
  '/messages/:messageId/read',
  protect,
  readMessage
);

module.exports = router;