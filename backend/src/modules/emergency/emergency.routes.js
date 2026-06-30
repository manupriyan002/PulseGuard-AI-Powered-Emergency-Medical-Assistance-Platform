const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const User = require('../auth/auth.model');

// GET /api/contacts
router.get('/', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  res.status(200).json({ success: true, contacts: user.emergencyContacts || [] });
}));

// POST /api/contacts
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const { name, phone, email, relationship } = req.body;
  if (!name || !phone || !relationship) {
    throw new ApiError(400, 'Name, phone, and relationship are required.');
  }

  const user = await User.findById(req.userId);
  if (user.emergencyContacts.length >= 5) {
    throw new ApiError(400, 'Maximum 5 emergency contacts allowed.');
  }

  user.emergencyContacts.push({ name, phone, email, relationship });
  await user.save();

  res.status(201).json({ success: true, contacts: user.emergencyContacts });
}));

// PUT /api/contacts/:id
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  const contact = user.emergencyContacts.id(req.params.id);
  if (!contact) throw new ApiError(404, 'Contact not found.');

  const { name, phone, email, relationship } = req.body;
  if (name) contact.name = name;
  if (phone) contact.phone = phone;
  if (email) contact.email = email;
  if (relationship) contact.relationship = relationship;

  await user.save();
  res.status(200).json({ success: true, contacts: user.emergencyContacts });
}));

// DELETE /api/contacts/:id
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  user.emergencyContacts.pull({ _id: req.params.id });
  await user.save();
  res.status(200).json({ success: true, contacts: user.emergencyContacts });
}));

module.exports = router;
