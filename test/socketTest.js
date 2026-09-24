require('dotenv').config();

const mongoose = require('mongoose');
const { io } = require('socket.io-client');

const Message = require('../src/models/message');
const Conversation = require('../src/models/conversation');

const {
  createMessage,
} = require('../src/services/messageService');

const SERVER_URL = 'http://localhost:5000';

const waitForStatus = (
  socket,
  expectedStatus,
  timeout = 5000
) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(
        new Error(
          `Timed out waiting for ${expectedStatus} status`
        )
      );
    }, timeout);

    const handler = (data) => {
      if (data.status !== expectedStatus) {
        return;
      }

      clearTimeout(timer);
      socket.off('message:status', handler);

      resolve(data);
    };

    socket.on('message:status', handler);
  });
};

const connectSocket = (socket) => {
  return new Promise((resolve, reject) => {
    socket.on('connect', resolve);
    socket.on('connect_error', reject);
  });
};

const runTest = async () => {
  let aliceSocket;
  let bobSocket;
  let message;
  let conversation;

  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');

    const aliceId = new mongoose.Types.ObjectId();
    const bobId = new mongoose.Types.ObjectId();

    conversation = await Conversation.create({
      participants: [
        aliceId,
        bobId,
      ],
    });

    console.log('\nConversation created');

    message = await createMessage(
      conversation._id,
      aliceId,
      'Hello Bob!'
    );

    console.log('\nMessage created:');
    console.log(message._id.toString());

    aliceSocket = io(SERVER_URL);
    bobSocket = io(SERVER_URL);

    await Promise.all([
      connectSocket(aliceSocket),
      connectSocket(bobSocket),
    ]);

    console.log('\nBoth sockets connected');

    aliceSocket.emit(
      'user:online',
      aliceId.toString()
    );

    bobSocket.emit(
      'user:online',
      bobId.toString()
    );

    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    console.log('Users registered with Socket.IO');

    // --------------------------------------------------
    // TEST 1: DELIVERED
    // --------------------------------------------------

    console.log(
      '\nBob marking message as delivered...'
    );

    const deliveredPromise = waitForStatus(
      aliceSocket,
      'delivered'
    );

    bobSocket.emit('message:delivered', {
      messageId: message._id.toString(),
    });

    const deliveredStatus =
      await deliveredPromise;

    console.log(
      'Alice received delivered status:'
    );

    console.log(deliveredStatus);

    // Verify DB
    let dbMessage = await Message.findById(
      message._id
    );

    let bobStatus =
      dbMessage.recipientStatuses.find(
        (recipient) =>
          recipient.userId.toString() ===
          bobId.toString()
      );

    if (bobStatus.status !== 'delivered') {
      throw new Error(
        'Database did not update status to delivered'
      );
    }

    if (!bobStatus.deliveredAt) {
      throw new Error(
        'Database did not store deliveredAt'
      );
    }

    console.log(
      'Database delivery status verified'
    );

    // --------------------------------------------------
    // TEST 2: READ
    // --------------------------------------------------

    console.log(
      '\nBob marking message as read...'
    );

    const readPromise = waitForStatus(
      aliceSocket,
      'read'
    );

    bobSocket.emit('message:read', {
      messageId: message._id.toString(),
    });

    const readStatus =
      await readPromise;

    console.log(
      'Alice received read status:'
    );

    console.log(readStatus);

    // Verify DB
    dbMessage = await Message.findById(
      message._id
    );

    bobStatus =
      dbMessage.recipientStatuses.find(
        (recipient) =>
          recipient.userId.toString() ===
          bobId.toString()
      );

    if (bobStatus.status !== 'read') {
      throw new Error(
        'Database did not update status to read'
      );
    }

    if (!bobStatus.deliveredAt) {
      throw new Error(
        'deliveredAt is missing'
      );
    }

    if (!bobStatus.readAt) {
      throw new Error(
        'readAt is missing'
      );
    }

    console.log(
      'Database read status verified'
    );

    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    aliceSocket.disconnect();
    bobSocket.disconnect();

    await Message.findByIdAndDelete(
      message._id
    );

    await Conversation.findByIdAndDelete(
      conversation._id
    );

    await mongoose.disconnect();

    console.log(
      '\nSocket read-receipt test completed successfully.'
    );
  } catch (error) {
    console.error(
      '\nSocket test failed:'
    );

    console.error(error);

    if (aliceSocket) {
      aliceSocket.disconnect();
    }

    if (bobSocket) {
      bobSocket.disconnect();
    }

    if (message) {
      await Message.findByIdAndDelete(
        message._id
      );
    }

    if (conversation) {
      await Conversation.findByIdAndDelete(
        conversation._id
      );
    }

    await mongoose.disconnect();

    process.exit(1);
  }
};

runTest();