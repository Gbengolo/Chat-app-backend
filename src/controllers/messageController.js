const {
  createMessage,
  markAsDelivered,
  markAsRead,
} = require('../services/messageService');

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

module.exports = {
  sendMessage,
  deliverMessage,
  readMessage,
};