require('dotenv').config();

const http = require('http');  // (sirmoel) added this
const express = require('express');
const { Server } = require('socket.io');  // (sirmoel) added this

const connectDB = require('./config/db');
const messageRoutes = require('./routes/messageRoutes');  // (sirmoel) added this
const initializeSocket = require('./socket/socketHandler');  // (sirmoel) added this

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
  });
});

app.use('/api', messageRoutes); // (sirmoel) added this


// (sirmoel) added this ---------start
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

initializeSocket(io);
// (sirmoel) added this ---------stop


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

// (sirmoel) added this ---------start
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// (sirmoel) added this ---------stop


//   app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//   });
};

startServer();




// Below is the Initial app.js code

// require('dotenv').config();
// const express = require('express');
// const app = express();

// app.use(express.json());
// app.get('/', (req, res) => {
//   res.json({success: true, message: "Server is running"});
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });