// KaamSetu - Authentication Middleware
// This middleware verifies JWT tokens and protects routes

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ===========================
// Protect Routes Middleware
// ===========================
// This middleware checks if the user is logged in
// by verifying the JWT token in the Authorization header

const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Extract the token from "Bearer <token>"
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token found, user is not authenticated
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login to continue.'
    });
  }

  try {
    // Verify the token using our JWT secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID from the token payload
    // Attach the user object to req.user so downstream routes can use it
    req.user = await User.findById(decoded.id).select('-password');

    // If user not found in database
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    // Check if user account is active
    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact admin.'
      });
    }

    // Token is valid and user exists - proceed to the next middleware/route
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.'
    });
  }
};

// ===========================
// Role-Based Authorization Middleware
// ===========================
// This middleware restricts access based on user role
// Usage: protect, authorize('admin') or authorize('worker', 'employer')

const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user role is in the allowed roles list
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
