const mongoose = require('mongoose');

const medicalProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bloodGroup: { type: String, default: '' },
  allergies: { type: String, default: '' },       // Encrypted
  conditions: { type: String, default: '' },      // Encrypted
  medications: { type: String, default: '' },     // Encrypted
  surgeries: { type: String, default: '' },       // Encrypted
}, {
  timestamps: true,
});

module.exports = mongoose.model('MedicalProfile', medicalProfileSchema);
