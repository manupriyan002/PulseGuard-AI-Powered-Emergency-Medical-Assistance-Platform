const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 1,
    max: 150,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
  },
  profileImage: {
    type: String,
    default: '',
  },
  pinHash: {
    type: String,
    default: '',
  },
  emergencyContacts: [{
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    relationship: { type: String, required: true },
  }],
}, {
  timestamps: true,
});

// Hash PIN before saving
userSchema.methods.setPIN = async function (pin) {
  this.pinHash = await bcrypt.hash(pin, 12);
};

// Verify PIN
userSchema.methods.verifyPIN = async function (pin) {
  if (!this.pinHash) return false;
  return bcrypt.compare(pin, this.pinHash);
};

module.exports = mongoose.model('User', userSchema);
