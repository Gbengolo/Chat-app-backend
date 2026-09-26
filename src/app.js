require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// Added: connect to MongoDB on server startup
connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Added: mount authentication routes (register, login, protected /me)
app.use('/api/auth', authRoutes);

const { verifyToken } = require('./utils/token');

const onlineUsers = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token) {
    return next(new Error('Authentication error: no token provided'));
  }

  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id, '| userId:', socket.userId);

  onlineUsers.set(socket.userId, socket.id);
  io.emit('user:online', socket.userId);

  socket.on('disconnect', () => {
    onlineUsers.delete(socket.userId);
    io.emit('user:offline', socket.userId);
    console.log(`User ${socket.userId} is offline`);
  });
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});