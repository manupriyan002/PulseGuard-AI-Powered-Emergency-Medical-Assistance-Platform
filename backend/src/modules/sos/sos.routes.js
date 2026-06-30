const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const EmergencySession = require('./sos.model');
const User = require('../auth/auth.model');
const { sendEmail, generateSOSEmailHTML } = require('../../utils/email');
const crypto = require('crypto');

// POST /api/sos/activate
router.post('/activate', authenticate, asyncHandler(async (req, res) => {
  const { lat, lng, batteryLevel } = req.body;

  if (!lat || !lng) {
    throw new ApiError(400, 'Location coordinates are required.');
  }

  // Create emergency session
  const trackingSessionId = crypto.randomUUID();
  const session = await EmergencySession.create({
    userId: req.userId,
    location: { lat, lng },
    batteryLevel: batteryLevel || null,
    trackingSessionId,
  });

  // Notify emergency contacts
  const user = await User.findById(req.userId);
  const trackingUrl = `${process.env.FRONTEND_URL}/tracking/live/${trackingSessionId}`;

  const emailPromises = user.emergencyContacts
    .filter(contact => contact.email)
    .map(contact =>
      sendEmail({
        to: contact.email,
        subject: `🚨 EMERGENCY SOS - ${user.name} needs help!`,
        html: generateSOSEmailHTML({
          userName: user.name,
          location: { lat, lng },
          trackingUrl,
          timestamp: session.createdAt,
        }),
      }).catch(err => console.error(`Failed to notify ${contact.email}:`, err.message))
    );

  await Promise.allSettled(emailPromises);

  session.notificationsSent = true;
  await session.save();

  res.status(201).json({
    success: true,
    message: 'SOS activated. Contacts notified.',
    session: {
      id: session._id,
      trackingSessionId,
      trackingUrl,
      status: session.status,
      createdAt: session.createdAt,
    },
  });
}));

// POST /api/sos/deactivate
router.post('/deactivate', authenticate, asyncHandler(async (req, res) => {
  const { sessionId } = req.body;
  const session = await EmergencySession.findOne({ _id: sessionId, userId: req.userId });
  if (!session) throw new ApiError(404, 'Session not found.');

  session.status = 'resolved';
  session.resolvedAt = new Date();
  await session.save();

  res.status(200).json({ success: true, message: 'SOS deactivated.' });
}));

// GET /api/sos/history
router.get('/history', authenticate, asyncHandler(async (req, res) => {
  const sessions = await EmergencySession.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, sessions });
}));

// GET /api/sos/session/:id
router.get('/session/:id', authenticate, asyncHandler(async (req, res) => {
  const session = await EmergencySession.findOne({ _id: req.params.id, userId: req.userId });
  if (!session) throw new ApiError(404, 'Session not found.');
  res.status(200).json({ success: true, session });
}));

module.exports = router;
