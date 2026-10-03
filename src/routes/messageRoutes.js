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

/**
 * @swagger
 * /api/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *   get:
 *     summary: Get paginated message history
 *     tags:
 *       - Messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paginated messages
 */


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