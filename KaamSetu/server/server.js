// KaamSetu Backend - Main Server File
// This file sets up the Express server, connects to MongoDB, and defines routes

// ===========================
// Load Environment Variables
// ===========================
// This must be done BEFORE importing any other modules
// that use process.env
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const workerRoutes = require('./routes/workerRoutes');
const employerRoutes = require('./routes/employerRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminReviewRoutes = require('./routes/adminReviewRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const locationRoutes = require('./routes/locationRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const { startJobReminderScheduler } = require('./services/reminderScheduler');
const { verifyEmailSetup } = require('./services/emailService');

// Create an Express application
const app = express();

// Define the port number
// Use environment variable if available, otherwise use 5000
const PORT = process.env.PORT || 5000;

// ===========================
// Middleware Setup
// ===========================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows the frontend to make requests to this server
app.use(cors());

// Parse JSON request bodies
// This allows the server to read JSON data from requests
app.use(express.json());

// Parse URL-encoded request bodies
// This allows the server to read form data
app.use(express.urlencoded({ extended: true }));

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('Invalid JSON request body:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Request body contains invalid JSON.'
    });
  }
  return next(error);
});

// Serve uploaded profile photos.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ===========================
// Basic Routes
// ===========================

// Root route - Welcome message
app.get('/', (req, res) => {
  const clientIndexPath = path.join(__dirname, '../client/build/index.html');
  if (process.env.NODE_ENV === 'production' && require('fs').existsSync(clientIndexPath)) {
    return res.sendFile(clientIndexPath);
  }

  res.json({
    message: 'Welcome to KaamSetu API',
    version: '1.0.0',
    status: 'Running'
  });
});

// Test route - GET /api/test
// This route is used to verify the backend is working
app.get('/api/test', (req, res) => {
  res.json({
    message: 'KaamSetu backend is working'
  });
});

// Health check route - GET /api/health
// This route shows the server and database status
app.get('/api/health', (req, res) => {
  // Get the MongoDB connection state from Mongoose
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const mongoState = require('mongoose').connection.readyState;

  let dbStatus = 'disconnected';

  if (mongoState === 1) {
    dbStatus = 'connected';
  } else if (mongoState === 2) {
    dbStatus = 'connecting';
  } else if (mongoState === 3) {
    dbStatus = 'disconnecting';
  }

  res.json({
    status: 'OK',
    database: dbStatus
  });
});

// ===========================
// API Routes
// ===========================

// Authentication routes - handles registration, login, logout
app.use('/api/auth', authRoutes);

// Worker routes - handles worker profile and search
app.use('/api/workers', workerRoutes);

// Employer routes - handles employer profile
app.use('/api/employers', employerRoutes);

// Job routes - handles job CRUD
app.use('/api/jobs', jobRoutes);

// Application routes - handles job applications
app.use('/api/applications', applicationRoutes);

// Verification routes
app.use('/api/verifications', verificationRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Complaint routes
app.use('/api/complaints', complaintRoutes);

// Admin review/moderation routes. Mount before the legacy admin routes so
// the new reason-required DELETE /api/admin/users/:id is used.
app.use('/api/admin', adminReviewRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Recommendation routes
app.use('/api/recommendations', recommendationRoutes);

// Location routes
app.use('/api/location', locationRoutes);

// Chatbot routes
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/assistant', chatbotRoutes);

// User routes - handles all /api/users requests
app.use('/api/users', userRoutes);

// In production, serve the React build from the same Render service.
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');
  if (require('fs').existsSync(path.join(clientBuildPath, 'index.html'))) {
    app.use(express.static(clientBuildPath));
  }
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }
    if (!require('fs').existsSync(path.join(clientBuildPath, 'index.html'))) {
      return res.status(503).json({
        status: 'Frontend build unavailable',
        api: '/api/test'
      });
    }
    return res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// ===========================
// Error Handling Middleware
// ===========================

// Handle 404 errors (route not found)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Handle server errors
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// ===========================
// Start the Server
// ===========================

// Function to start the server
const startServer = async () => {
  try {
    // First, connect to MongoDB
    await connectDB();
    startJobReminderScheduler();

    // Verify email settings without waiting for Gmail before startup continues.
    void verifyEmailSetup();

    // Then, start the Express server
    app.listen(PORT, () => {
      console.log(`KaamSetu server is running on port ${PORT}`);
      console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
      console.log(`Health endpoint: http://localhost:${PORT}/api/health`);
      console.log(`Root endpoint: http://localhost:${PORT}/`);
    });
  } catch (error) {
    // If something goes wrong during startup, print the error
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Call the function to start the server
startServer();
