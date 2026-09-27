const {
  markAsDelivered,
  markAsRead,
} = require('../services/messageService');

const initializeSocket = (io, onlineUsers) => {
  io.on('connection', (socket) => {
    console.log(
      `Socket connected: ${socket.id} | userId: ${socket.userId}`
    );

    // so I have removed the duplicate authentication/online tracking.
    // so this socketHandler doesn't track who's online, since the app.js already owns Presence.

    socket.on('message:delivered', async (data = {}) => {
      try {
        const { messageId } = data;

        if (!messageId) {
          return socket.emit('message:status:error', {
            message: 'messageId is required',
          });
        }

        const result = await markAsDelivered(
          messageId,
          socket.userId
        );

        const senderId = result.message.senderId.toString();

        const senderSocketId = onlineUsers.get(senderId);

        if (senderSocketId) {
          io.to(senderSocketId).emit('message:status', {
            messageId: result.message._id.toString(),
            userId: socket.userId,
            status: result.recipient.status,
            deliveredAt: result.recipient.deliveredAt,
            readAt: result.recipient.readAt,
          });
        }
      } catch (error) {
        socket.emit('message:status:error', {
          message: error.message,
        });
      }
    });

    socket.on('message:read', async (data = {}) => {
      try {
        const { messageId } = data;

        if (!messageId) {
          return socket.emit('message:status:error', {
            message: 'messageId is required',
          });
        }

        const result = await markAsRead(
          messageId,
          socket.userId
        );

        const senderId = result.message.senderId.toString();

        const senderSocketId = onlineUsers.get(senderId);

        if (senderSocketId) {
          io.to(senderSocketId).emit('message:status', {
            messageId: result.message._id.toString(),
            userId: socket.userId,
            status: result.recipient.status,
            deliveredAt: result.recipient.deliveredAt,
            readAt: result.recipient.readAt,
          });
        }
      } catch (error) {
        socket.emit('message:status:error', {
          message: error.message,
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(
        `Socket disconnected: ${socket.id} | userId: ${socket.userId}`
      );
    });
  });
};

module.exports = initializeSocket;