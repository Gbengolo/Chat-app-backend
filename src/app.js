require('dotenv').config();

const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');

const { verifyToken } = require('./utils/token');

const initializeSocket = require('./socket/socketHandler');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', messageRoutes);

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});


  // Socket.IO online users

const onlineUsers = new Map();


 // The Socket.IO authentication you implemented
 
io.use((socket, next) => {
  const token =
    socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(
      new Error('Authentication error: no token provided')
    );
  }

  try {
    const decoded = verifyToken(token);

    socket.userId = decoded.id;

    next();
  } catch (err) {
    next(
      new Error(
        'Authentication error: invalid or expired token'
      )
    );
  }
});


  // The Presence system

io.on('connection', (socket) => {
  console.log(
    'A user connected:',
    socket.id,
    '| userId:',
    socket.userId
  );

  onlineUsers.set(socket.userId, socket.id);

  io.emit('user:online', socket.userId);

  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('typing:start', (conversationId) => {
    socket.to(conversationId).emit('typing:start', {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on('typing:stop', (conversationId) => {
    socket.to(conversationId).emit('typing:stop', {
      userId: socket.userId,
      conversationId,
    });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);

    io.emit('user:offline', socket.userId);

    console.log(
      `User ${socket.userId} is offline`
    );
  });
});


 // The Read receipts & message status from my socketHandler
initializeSocket(io, onlineUsers);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();