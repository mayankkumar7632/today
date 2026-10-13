// KaamSetu - Database Connection File
// This file handles the MongoDB connection using Mongoose

const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Try to connect to MongoDB using the URI from .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // If connection is successful, print the host name
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, print the error and exit the process
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
