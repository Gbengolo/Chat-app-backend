const { messageSchema } = require('../validations/messageValidation');
const express = require('express');

const {
  sendMessage,
  deliverMessage,
  readMessage,
  getMessages,
} = require('../controllers/messageController');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/conversations/:conversationId/messages',
  protect,
  (req, res, next) => {
    const { error } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }
    next();
  },
  sendMessage
);

router.get(
  '/conversations/:conversationId/messages',
  protect,
  getMessages
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