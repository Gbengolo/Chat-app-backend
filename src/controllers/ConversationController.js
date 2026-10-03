const Conversation = require('../models/conversation');

const createConversation = async (req, res) => {
    try {
        const { participantId, participantIds, name } = req.body;
        let ids = Array.isArray(participantIds) ? participantIds : (participantId ? [participantId] : []);
        ids = [...new Set(ids.map(String))];

        if (ids.length === 0) {
            return res.status(400).json({ success: false, message: 'At least one participant is required' });
        }

        const currentUserId = req.user._id.toString();
        const allParticipants = [...new Set([currentUserId, ...ids])];
        const isGroup = allParticipants.length > 2;

        if (!isGroup) {
            const existingConversation = await Conversation.findOne({
                type: 'direct',
                participants: { $all: allParticipants, $size: 2 }
            });
            if (existingConversation) {
                return res.status(200).json({ success: true, message: 'Conversation already exists', data: existingConversation });
            }
        }

        const conversation = await Conversation.create({
            participants: allParticipants,
            type: isGroup ? 'group' : 'direct',
            name: isGroup ? (name || null) : null
        });

        return res.status(201).json({ success: true, message: 'Conversation created successfully', data: conversation });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to create conversation', error: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
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