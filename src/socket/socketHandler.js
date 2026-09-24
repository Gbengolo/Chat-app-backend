const {
  markAsDelivered,
  markAsRead,
} = require('../services/messageService');

const connectedUsers = new Map();

const addUserSocket = (userId, socketId) => {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set());
  }

  connectedUsers.get(userId).add(socketId);
};

const removeUserSocket = (userId, socketId) => {
  const userSockets = connectedUsers.get(userId);

  if (!userSockets) {
    return;
  }

  userSockets.delete(socketId);

  if (userSockets.size === 0) {
    connectedUsers.delete(userId);
  }
};

const emitToUser = (io, userId, event, data) => {
  const userSockets = connectedUsers.get(userId);

  if (!userSockets) {
    return;
  }

  userSockets.forEach((socketId) => {
    io.to(socketId).emit(event, data);
  });
};

const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('user:online', (userId) => {
      if (!userId) {
        return;
      }

      socket.userId = userId.toString();

      addUserSocket(socket.userId, socket.id);

      console.log(`User ${socket.userId} is online`);
    });

    socket.on('message:delivered', async (data = {}) => {
      try {
        const { messageId } = data;

        if (!messageId || !socket.userId) {
          return socket.emit('message:status:error', {
            message: 'messageId and authenticated user are required',
          });
        }

        const result = await markAsDelivered(
          messageId,
          socket.userId
        );

        const senderId = result.message.senderId.toString();

        emitToUser(
          io,
          senderId,
          'message:status',
          {
            messageId: result.message._id.toString(),
            userId: socket.userId,
            status: result.recipient.status,
            deliveredAt: result.recipient.deliveredAt,
            readAt: result.recipient.readAt,
          }
        );
      } catch (error) {
        socket.emit('message:status:error', {
          message: error.message,
        });
      }
    });

    socket.on('message:read', async (data = {}) => {
      try {
        const { messageId } = data;

        if (!messageId || !socket.userId) {
          return socket.emit('message:status:error', {
            message: 'messageId and authenticated user are required',
          });
        }

        const result = await markAsRead(
          messageId,
          socket.userId
        );

        const senderId = result.message.senderId.toString();

        emitToUser(
          io,
          senderId,
          'message:status',
          {
            messageId: result.message._id.toString(),
            userId: socket.userId,
            status: result.recipient.status,
            deliveredAt: result.recipient.deliveredAt,
            readAt: result.recipient.readAt,
          }
        );
      } catch (error) {
        socket.emit('message:status:error', {
          message: error.message,
        });
      }
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        removeUserSocket(
          socket.userId,
          socket.id
        );

        console.log(
          `User ${socket.userId} disconnected`
        );
      }
    });
  });
};

module.exports = initializeSocket;