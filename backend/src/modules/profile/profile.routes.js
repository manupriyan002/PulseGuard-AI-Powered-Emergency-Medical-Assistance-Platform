const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler } = require('../../middleware/errorHandler');
const User = require('../auth/auth.model');

// GET /api/profile
router.get('/', authenticate, asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
}));

// PUT /api/profile
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const { name, phone, age, gender, profileImage } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (age) updates.age = age;
  if (gender) updates.gender = gender;
  if (profileImage) updates.profileImage = profileImage;

  const user = await User.findByIdAndUpdate(req.userId, updates, { new: true });
  res.status(200).json({ success: true, user });
}));

module.exports = router;
