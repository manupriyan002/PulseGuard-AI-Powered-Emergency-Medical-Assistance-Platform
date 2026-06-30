const express = require('express');
const router = express.Router();
const { authenticate } = require('../../middleware/auth.middleware');
const { asyncHandler, ApiError } = require('../../middleware/errorHandler');
const TrackingLog = require('./tracking.model');

// POST /api/tracking/update
router.post('/update', authenticate, asyncHandler(async (req, res) => {
  const { sessionId, lat, lng } = req.body;
  if (!sessionId || !lat || !lng) {
    throw new ApiError(400, 'sessionId, lat, and lng are required.');
  }

  const log = await TrackingLog.create({
    sessionId,
    userId: req.userId,
    lat,
    lng,
  });

  res.status(201).json({ success: true, log });
}));

// GET /api/tracking/session/:sessionId
router.get('/session/:sessionId', asyncHandler(async (req, res) => {
  const logs = await TrackingLog.find({ sessionId: req.params.sessionId })
    .sort({ timestamp: -1 })
    .limit(100);
  res.status(200).json({ success: true, logs });
}));

// GET /api/tracking/live/:sessionId (public — no auth)
router.get('/live/:sessionId', asyncHandler(async (req, res) => {
  const latest = await TrackingLog.findOne({ sessionId: req.params.sessionId })
    .sort({ timestamp: -1 });
  if (!latest) throw new ApiError(404, 'No tracking data found.');
  res.status(200).json({ success: true, location: latest });
}));

module.exports = router;
