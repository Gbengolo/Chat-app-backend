const express = require('express');

const {
    createConversation,
    getConversations
} = require('../controllers/ConversationController');

const { protect } = require('../middleware/auth.js');
const { conversationSchema } = require('../validations/conversationValidation');

const router = express.Router();

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