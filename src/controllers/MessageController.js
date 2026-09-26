const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const { createMessage } = require('../services/messageService');

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { conversationId, content } = req.body;

        if (!conversationId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Conversation ID and message content are required'
            });
        }

        const currentUserId = req.user._id;

        const message = await createMessage(
            conversationId,
            currentUserId,
            content
        );

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get message history
const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        const skip = (page - 1) * limit;

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const currentUserId = req.user._id;

        const isParticipant = conversation.participants.some(
            participant =>
                participant.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }

        const messages = await Message.find({
            conversationId: conversationId
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalMessages = await Message.countDocuments({
            conversationId: conversationId
        });

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            data: messages
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch messages',
            error: error.message
        });
    }
};

module.exports = {
    sendMessage,
    getMessages
};