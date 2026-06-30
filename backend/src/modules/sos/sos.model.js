const mongoose = require('mongoose');

const emergencySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'cancelled'],
    default: 'active',
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  batteryLevel: { type: Number, default: null },
  trackingSessionId: { type: String, default: '' },
  notificationsSent: { type: Boolean, default: false },
  resolvedAt: { type: Date, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('EmergencySession', emergencySessionSchema);
