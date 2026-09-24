require('dotenv').config();

const mongoose = require('mongoose');

const Message = require('../src/models/message');
const Conversation = require('../src/models/conversation');
const {
  createMessage,
  markAsDelivered,
  markAsRead,
} = require('../src/services/messageService');

const runTest = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('Connected to MongoDB');

    // Temporary IDs for testing.
    const aliceId = new mongoose.Types.ObjectId();
    const bobId = new mongoose.Types.ObjectId();
    const charlieId = new mongoose.Types.ObjectId();

    // Create a test conversation.
    const conversation = await Conversation.create({
      participants: [
        aliceId,
        bobId,
        charlieId,
      ],
    });

    console.log('\nConversation created:');
    console.log(conversation._id);

    // Alice sends a message.
    const message = await createMessage(
      conversation._id,
      aliceId,
      'Hello everyone!'
    );

    console.log('\nMessage created:');
    console.log(message);

    // Bob receives the message.
    const delivered = await markAsDelivered(
      message._id,
      bobId
    );

    console.log('\nBob marked message as delivered:');
    console.log(delivered.recipient);

    // Charlie reads the message.
    const read = await markAsRead(
      message._id,
      charlieId
    );

    console.log('\nCharlie marked message as read:');
    console.log(read.recipient);

    // Fetch final message from MongoDB.
    const finalMessage = await Message.findById(
      message._id
    );

    console.log('\nFinal message in MongoDB:');
    console.log(
      JSON.stringify(finalMessage, null, 2)
    );

    // Clean up test data.
    await Message.findByIdAndDelete(message._id);
    await Conversation.findByIdAndDelete(
      conversation._id
    );

    console.log('\nTest data cleaned up.');

    await mongoose.disconnect();

    console.log('Test completed successfully.');
  } catch (error) {
    console.error('\nTest failed:');
    console.error(error);

    await mongoose.disconnect();
    process.exit(1);
  }
};

runTest();