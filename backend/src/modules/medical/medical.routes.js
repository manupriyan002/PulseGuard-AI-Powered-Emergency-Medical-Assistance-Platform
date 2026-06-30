const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const { encrypt, decrypt } = require('../../utils/encryption');
const MedicalProfile = require('./medical.model');

// GET /api/medical
router.get('/', authenticate, asyncHandler(async (req, res) => {
  let profile = await MedicalProfile.findOne({ userId: req.userId });
  if (!profile) {
    profile = await MedicalProfile.create({ userId: req.userId });
  }

  // Decrypt fields for response
  const decrypted = {
    bloodGroup: profile.bloodGroup,
    allergies: decrypt(profile.allergies) || [],
    conditions: decrypt(profile.conditions) || [],
    medications: decrypt(profile.medications) || [],
    surgeries: decrypt(profile.surgeries) || [],
  };

  res.status(200).json({ success: true, medicalProfile: decrypted });
}));

// PUT /api/medical
router.put('/', authenticate, asyncHandler(async (req, res) => {
  const { bloodGroup, allergies, conditions, medications, surgeries } = req.body;

  let profile = await MedicalProfile.findOne({ userId: req.userId });
  if (!profile) {
    profile = new MedicalProfile({ userId: req.userId });
  }

  // Encrypt sensitive fields
  if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
  if (allergies !== undefined) profile.allergies = encrypt(allergies);
  if (conditions !== undefined) profile.conditions = encrypt(conditions);
  if (medications !== undefined) profile.medications = encrypt(medications);
  if (surgeries !== undefined) profile.surgeries = encrypt(surgeries);

  await profile.save();

  res.status(200).json({ success: true, message: 'Medical profile updated.' });
}));

module.exports = router;
