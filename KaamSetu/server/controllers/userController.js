// KaamSetu - User Controller
// This file contains controller functions related to the User model
// For now, it only has a test function to verify the model works

const User = require('../models/User');

// @desc    Test the User model
// @route   GET /api/users/test
// @access  Public
const getUserModelTest = (req, res) => {
  res.json({
    message: 'User model is working',
    note: 'This is a test endpoint. Registration and login will be added in a later phase.',
    availableRoles: ['worker', 'employer', 'admin'],
    defaultRole: 'worker'
  });
};

module.exports = {
  getUserModelTest
};
