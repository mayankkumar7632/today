
// KaamSetu - Database Connection File
// Handles MongoDB Atlas connection using Mongoose

const mongoose = require('mongoose');
const dns = require('node:dns');

// Fix DNS resolution for local development
// Render will use its default DNS configuration
if (process.env.NODE_ENV !== 'production') {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is missing from environment variables');
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 15000
    });

    console.log(
      `MongoDB connected successfully: ${conn.connection.host}`
    );

  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
