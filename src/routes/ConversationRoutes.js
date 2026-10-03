const express = require('express');

const {
    createConversation,
    getConversations
} = require('../controllers/ConversationController');

const { protect } = require('../middleware/auth.js');
const { conversationSchema } = require('../validations/conversationValidation');

const router = express.Router();

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create or fetch a conversation
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               participantId:
 *                 type: string
 *                 description: For a direct (1:1) conversation
 *               participantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: For a group conversation (3+ people)
 *               name:
 *                 type: string
 *                 description: Optional group name
 *     responses:
 *       201:
 *         description: Conversation created
 *       200:
 *         description: Existing conversation returned
 *       400:
 *         description: Validation error
 *   get:
 *     summary: List the logged-in user's conversations
 *     tags:
 *       - Conversations
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 */


router.post('/', protect, (req, res, next) => {
    const { error } = conversationSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    next();
}, createConversation);
router.get('/', protect, getConversations);

module.exports = router;