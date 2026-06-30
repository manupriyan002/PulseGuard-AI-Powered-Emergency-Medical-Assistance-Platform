const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { decrypt } = require('../../utils/encryption');
const MedicalProfile = require('../medical/medical.model');
const User = require('../auth/auth.model');
const mongoose = require('mongoose');
const QRCode = require('qrcode');

// QR Access Log Schema (inline for module isolation)
const qrAccessLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  accessorIP: { type: String, default: '' },
  accessorDevice: { type: String, default: '' },
  status: { type: String, enum: ['success', 'failed'], required: true },
  timestamp: { type: Date, default: Date.now },
});
const QRAccessLog = mongoose.model('QRAccessLog', qrAccessLogSchema);

// POST /api/qr/generate — Generate QR code containing user profile URL (authenticated)
router.post('/generate', authenticate, asyncHandler(async (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const profileUrl = `${frontendUrl}/qr/${req.userId}`;
  
  // Generate QR code as DataURL (base64 image)
  const qrCode = await QRCode.toDataURL(profileUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    color: { dark: '#00652c', light: '#ffffff' }
  });

  res.status(200).json({ success: true, qrCode, profileUrl });
}));

// GET /api/qr/:userId — Public access page (no auth)
router.get('/:userId', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('name');
  if (!user) throw new ApiError(404, 'Profile not found.');

  res.status(200).json({
    success: true,
    profileExists: true,
    name: user.name,
    message: 'PIN verification required to access medical data.',
  });
}));

// POST /api/qr/:userId/verify — PIN verification
router.post('/:userId/verify', asyncHandler(async (req, res) => {
  const { pin } = req.body;
  if (!pin) throw new ApiError(400, 'PIN is required.');

  const user = await User.findById(req.params.userId);
  if (!user) throw new ApiError(404, 'Profile not found.');

  const isValid = await user.verifyPIN(pin);

  // Log access attempt
  await QRAccessLog.create({
    userId: user._id,
    accessorIP: req.ip || req.connection.remoteAddress,
    accessorDevice: req.headers['user-agent'] || '',
    status: isValid ? 'success' : 'failed',
  });

  if (!isValid) {
    throw new ApiError(401, 'Invalid PIN.');
  }

  // Fetch and decrypt medical profile
  const profile = await MedicalProfile.findOne({ userId: user._id });
  if (!profile) {
    return res.status(200).json({
      success: true,
      medicalProfile: { bloodGroup: '', allergies: [], conditions: [], medications: [], surgeries: [] },
      userName: user.name,
    });
  }

  res.status(200).json({
    success: true,
    userName: user.name,
    medicalProfile: {
      bloodGroup: profile.bloodGroup,
      allergies: decrypt(profile.allergies) || [],
      conditions: decrypt(profile.conditions) || [],
      medications: decrypt(profile.medications) || [],
      surgeries: decrypt(profile.surgeries) || [],
    },
  });
}));

// GET /api/qr/access-logs — Get access history (authenticated)
router.get('/access-logs/list', authenticate, asyncHandler(async (req, res) => {
  const logs = await QRAccessLog.find({ userId: req.userId }).sort({ timestamp: -1 }).limit(50);
  res.status(200).json({ success: true, logs });
}));

// POST /api/qr/set-pin — Set/update QR PIN (authenticated)
router.post('/set-pin', authenticate, asyncHandler(async (req, res) => {
  const { pin } = req.body;
  if (!pin || pin.length < 4) throw new ApiError(400, 'PIN must be at least 4 characters.');

  const user = await User.findById(req.userId);
  await user.setPIN(pin);
  await user.save();

  res.status(200).json({ success: true, message: 'PIN set successfully.' });
}));

module.exports = router;
