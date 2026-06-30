const jwt = require('jsonwebtoken');
const User = require('./auth.model');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { admin } = require('../../config/firebase');

/**
 * Generate JWT token
 */
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

/**
 * POST /api/auth/register
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, phone, firebaseUid } = req.body;

  if (!name || !email) {
    throw new ApiError(400, 'Name and email are required.');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists.');
  }

  // Create user in MongoDB
  const user = await User.create({
    name,
    email,
    phone: phone || '',
    firebaseUid: firebaseUid || undefined,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});

/**
 * POST /api/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, firebaseUid } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required.');
  }

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, 'User not found. Please register first.');
  }

  // Update Firebase UID if provided
  if (firebaseUid && !user.firebaseUid) {
    user.firebaseUid = firebaseUid;
    await user.save();
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    },
  });
});

/**
 * POST /api/auth/forgot-password
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required.');
  }

  // Firebase handles password reset email
  res.status(200).json({
    success: true,
    message: 'Password reset handled via Firebase Auth.',
  });
});

/**
 * GET /api/auth/me
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

module.exports = { register, login, forgotPassword, getMe };
