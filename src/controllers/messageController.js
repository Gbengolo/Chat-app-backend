const {
  createMessage,
  markAsDelivered,
  markAsRead,
} = require('../services/messageService');

const Message = require('../models/message');
const Conversation = require('../models/conversation');

const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;

    // authentication middleware now implemented (gotten from your main branch).
    const senderId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const message = await createMessage(
      conversationId,
      senderId,
      content
    );

    return res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const deliverMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await markAsDelivered(
      messageId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Message marked as delivered',
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const readMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const result = await markAsRead(
      messageId,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found',
      });
    }

    if (!conversation.participants.some(
      (participant) => participant.toString() === req.user.id.toString()
    )) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this conversation',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversationId })
      .populate('senderId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    return res.status(200).json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  sendMessage,
  deliverMessage,
  readMessage,
  getMessages,
};