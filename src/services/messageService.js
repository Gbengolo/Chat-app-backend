const Message = require('../models/message');
const Conversation = require('../models/conversation');

const createMessage = async (conversationId, senderId, content) => {
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new Error('Conversation not found');
  }

  const isParticipant = conversation.participants.some(
    (participantId) =>
      participantId.toString() === senderId.toString()
  );

  if (!isParticipant) {
    throw new Error('User is not a participant in this conversation');
  }

  const recipientStatuses = conversation.participants
    .filter(
      (participantId) =>
        participantId.toString() !== senderId.toString()
    )
    .map((participantId) => ({
      userId: participantId,
      status: 'sent',
      deliveredAt: null,
      readAt: null,
    }));

  if (recipientStatuses.length === 0) {
    throw new Error(
      'A message must have at least one recipient'
    );
  }

  const message = await Message.create({
    conversationId,
    senderId,
    content,
    recipientStatuses,
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  return message;
};

const markAsDelivered = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  const recipient = message.recipientStatuses.find(
    (recipient) =>
      recipient.userId.toString() === userId.toString()
  );

  if (!recipient) {
    throw new Error('User is not a recipient of this message');
  }

  // A read message is already delivered.
  if (recipient.status === 'read') {
    return {
      message,
      recipient,
    };
  }

  if (recipient.status === 'sent') {
    recipient.status = 'delivered';
    recipient.deliveredAt = new Date();

    await message.save();
  }

  return {
    message,
    recipient,
  };
};

const markAsRead = async (messageId, userId) => {
  const message = await Message.findById(messageId);

  if (!message) {
    throw new Error('Message not found');
  }

  const recipient = message.recipientStatuses.find(
    (recipient) =>
      recipient.userId.toString() === userId.toString()
  );

  if (!recipient) {
    throw new Error('User is not a recipient of this message');
  }

  if (recipient.status !== 'read') {
    const now = new Date();

    recipient.status = 'read';

    // Reading implies delivery.
    if (!recipient.deliveredAt) {
      recipient.deliveredAt = now;
    }

    recipient.readAt = now;

    await message.save();
  }

  return {
    message,
    recipient,
  };
};

module.exports = {
  createMessage,
  markAsDelivered,
  markAsRead,
};