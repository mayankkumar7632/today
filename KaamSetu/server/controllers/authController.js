// KaamSetu - Authentication Controller
// This file handles user registration, login, and logout

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const profilePhotoDirectory = path.join(__dirname, '..', 'uploads', 'profile-photos');

// Delete only files stored in our profile photo folder.
const deleteProfilePhotoFile = async (photoPath) => {
  if (typeof photoPath !== 'string' || !photoPath.startsWith('/uploads/profile-photos/')) {
    return;
  }

  try {
    await fs.promises.unlink(path.join(profilePhotoDirectory, path.basename(photoPath)));
  } catch (error) {
    // A missing old file should not prevent updating the profile photo.
  }
};

// ===========================
// Helper: Generate JWT Token
// ===========================
// Creates a signed token containing user ID and role
// Token expires in 7 days

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ===========================
// Register New User
// ===========================
// POST /api/auth/register
// Allows workers and employers to register
// Admin accounts are NOT created through this route

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, and password.'
      });
    }

    // Check if role is valid for public registration
    // Worker, employer, and admin roles can be created through the public signup flow
    if (role && !['worker', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Please choose a valid account type.'
      });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // Hash the password using bcrypt
    // Salt rounds of 10 is a good balance of security and performance
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in database
    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || 'worker' // Default role is worker
    });

    // Generate JWT token for the new user
    const token = generateToken(newUser._id, newUser.role);

    // Send response with token and user data
    // Password is not included because of the select('-password') in toJSON
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.'
    });
  }
};

// ===========================
// Login User
// ===========================
// POST /api/auth/login
// Authenticates user with email and password

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.'
      });
    }

    // Find user by email (include password field since it's excluded by default)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // If user not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Check if account is active
    const accountStatus = user.status || (user.isActive ? 'active' : 'suspended');
    if (!user.isActive || accountStatus !== 'active') {
      return res.status(401).json({
        success: false,
        message: accountStatus === 'deleted'
          ? 'This account has been deleted. Please contact admin.'
          : 'This account is suspended. Please contact admin.'
      });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    // If password doesn't match
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = generateToken(user._id, user.role);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
};

// ===========================
// Logout User
// ===========================
// POST /api/auth/logout
// Since JWT is stateless, logout is handled on the client side
// This endpoint simply confirms logout

const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully. Please remove the token from client storage.'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error during logout.'
    });
  }
};

// ===========================
// Get Current User Profile
// ===========================
// GET /api/auth/me
// Returns the currently logged-in user's data

const getMe = async (req, res) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePhoto: user.profilePhoto,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile.'
    });
  }
};

// Save the uploaded profile photo for the signed-in user.
const uploadProfilePhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please choose a profile photo to upload.'
    });
  }

  try {
    const profilePhoto = `/uploads/profile-photos/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto },
      { new: true }
    );

    if (!user) {
      await deleteProfilePhotoFile(profilePhoto);
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await deleteProfilePhotoFile(req.user.profilePhoto);
    return res.status(200).json({
      success: true,
      message: 'Profile photo uploaded successfully.',
      data: { profilePhoto }
    });
  } catch (error) {
    console.error('Upload profile photo error:', error.message);
    await deleteProfilePhotoFile(`/uploads/profile-photos/${req.file.filename}`);
    return res.status(500).json({
      success: false,
      message: 'Server error while uploading profile photo.'
    });
  }
};

// Remove the signed-in user's profile photo.
const removeProfilePhoto = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePhoto: null },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    await deleteProfilePhotoFile(req.user.profilePhoto);
    return res.status(200).json({
      success: true,
      message: 'Profile photo removed successfully.',
      data: { profilePhoto: null }
    });
  } catch (error) {
    console.error('Remove profile photo error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error while removing profile photo.'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  uploadProfilePhoto,
  removeProfilePhoto
};
