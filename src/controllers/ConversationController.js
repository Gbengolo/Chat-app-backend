const Conversation = require('../models/conversation');

// Create a new conversation
const createConversation = async (req, res) => {
    try {
        const { participantId } = req.body;

        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: 'Participant ID is required'
            });
        }

        // The logged-in user's ID will come from authentication middleware
        const currentUserId = req.user._id;

        // Check if a conversation already exists
        const existingConversation = await Conversation.findOne({
            participants: {
                $all: [currentUserId, participantId]
            }
        });

        if (existingConversation) {
            return res.status(200).json({
                success: true,
                message: 'Conversation already exists',
                data: existingConversation
            });
        }

        // Create a new conversation
        const conversation = await Conversation.create({
            participants: [currentUserId, participantId]
        });

        return res.status(201).json({
            success: true,
            message: 'Conversation created successfully',
            data: conversation
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to create conversation',
            error: error.message
        });
    }
};


// Get all conversations for the logged-in user
const getConversations = async (req, res) => {
    try {
        // The logged-in user's ID will come from authentication middleware
        const currentUserId = req.user._id;

        const conversations = await Conversation.find({
            participants: currentUserId
        })
            .populate('participants', 'username email')
            .sort({ updatedAt: -1 });

        return res.status(200).json({
            success: true,
            count: conversations.length,
            data: conversations
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch conversations',
            error: error.message
        });
    }
};


module.exports = {
    createConversation,
    getConversations
};