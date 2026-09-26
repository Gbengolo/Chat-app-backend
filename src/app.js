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

const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('user:join', (userId) => {
    onlineUsers.set(userId, socket.id);
    socket.userId = userId;
    io.emit('user:online', userId);
    console.log(`User ${userId} is online`);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('user:offline', socket.userId);
      console.log(`User ${socket.userId} is offline`);
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});