require('dotenv').config();
const express = require('express');

const app = express();

const ConversationRoutes = require('./routes/ConversationRoutes');
const MessageRoutes = require('./routes/MessageRoutes');

app.use(express.json());

app.use('/api/Conversations',ConversationRoutes);
app.use('/api/messages', MessageRoutes);


app.get('/', (req, res) => {
  res.json({success: true, message: "Server is running"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});