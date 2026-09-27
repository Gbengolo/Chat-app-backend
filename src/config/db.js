const mongoose = require("mongoose");

const dns = require("dns");

// Added: force Node to use Google's DNS resolver for lookups.
// Fixes "querySrv ECONNREFUSED" when connecting to MongoDB Atlas on some
// Windows networks where Node's built-in resolver doesn't pick up the
// system's configured DNS servers.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;