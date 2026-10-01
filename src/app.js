require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./utils/swagger');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const ConversationRoutes = require('./routes/ConversationRoutes');
const messageRoutes = require('./routes/messageRoutes');

const { verifyToken } = require('./utils/token');
const initializeSocket = require('./socket/socketHandler');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

// Added: connect to MongoDB on server startup
// connectDB();

app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Conversation routes
app.use('/api/conversations', ConversationRoutes);

// Message and read-receipt routes
app.use('/api', messageRoutes);

// Shared online users map
const onlineUsers = new Map();

// Socket authentication
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

// Presence / connection handling
io.on('connection', (socket) => {
  console.log(
    'A user connected:',
    socket.id,
    '| userId:',
    socket.userId
  );

  onlineUsers.set(socket.userId, socket.id);

  io.emit('user:online', socket.userId);

  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(conversationId);
  });

  // Typing indicators
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

  // User disconnects
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);

    io.emit('user:offline', socket.userId);

    console.log(
      `User ${socket.userId} is offline`
    );
  });
});

//Intialize read-receipt/message-status socket handlers
app.use(errorHandler);
initializeSocket(io, onlineUsers);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;