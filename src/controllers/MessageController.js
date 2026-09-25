const Message = require('../models/message');
const Conversation = require('../models/Conversation');

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

        // Check if the conversation exists
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        // Check if the logged-in user belongs to the conversation
        const isParticipant = conversation.participants.some(
            participant => participant.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }

        // Create the message
        const message = await Message.create({
            conversation: conversationId,
            sender: currentUserId,
            content
        });

        // Update conversation's updatedAt time
        conversation.updatedAt = new Date();
        await conversation.save();

        return res.status(201).json({
            success: true,
            message: 'Message sent successfully',
            data: message
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to send message',
            error: error.message
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

        // Check if conversation exists
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            });
        }

        const currentUserId = req.user._id;

        // Check if user belongs to the conversation
        const isParticipant = conversation.participants.some(
            participant => participant.toString() === currentUserId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: 'You are not a participant in this conversation'
            });
        }

        // Get messages
        const messages = await Message.find({
            conversation: conversationId
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email');

        // Get total number of messages
        const totalMessages = await Message.countDocuments({
            conversation: conversationId
        });

        return res.status(200).json({
            success: true,
            page,
            limit,
            totalMessages,
            totalPages: Math.ceil(totalMessages / limit),
            messages
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