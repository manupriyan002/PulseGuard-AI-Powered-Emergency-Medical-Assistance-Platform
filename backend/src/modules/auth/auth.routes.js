const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

// GET /api/auth/me
const { authenticate } = require('../../middleware/auth.middleware');
router.get('/me', authenticate, authController.getMe);

module.exports = router;
