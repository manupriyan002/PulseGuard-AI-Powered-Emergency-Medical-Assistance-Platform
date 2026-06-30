const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const profileRoutes = require('./modules/profile/profile.routes');
const medicalRoutes = require('./modules/medical/medical.routes');
const contactRoutes = require('./modules/emergency/emergency.routes');
const sosRoutes = require('./modules/sos/sos.routes');
const trackingRoutes = require('./modules/tracking/tracking.routes');
const triageRoutes = require('./modules/triage/triage.routes');
const qrRoutes = require('./modules/qr/qr.routes');
const hospitalRoutes = require('./modules/hospital/hospital.routes');

const app = express();

// ─── CORS & Security Middleware ───────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[CORS DEBUG] Received ${req.method} request to ${req.originalUrl} from Origin: ${req.headers.origin}`);
  // Always allow localhost:3000 (and dynamically others if needed, but hardcoding for now)
  const allowedOrigins = ['http://localhost:3000', 'http://192.168.0.107:3000', 'http://127.0.0.1:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    // Default to localhost:3000 if no origin matches, just to ensure it's present
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  }

  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('[CORS DEBUG] Returning 200 OK for OPTIONS preflight');
    return res.status(200).end();
  }
  next();
});

// app.use(helmet({
//   crossOriginResourcePolicy: false,
//   crossOriginOpenerPolicy: false,
// }));

// ─── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Body Parsing ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Root Route ────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'PulseGuard API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      profile: '/api/profile',
      medical: '/api/medical',
      contacts: '/api/contacts',
      sos: '/api/sos',
      tracking: '/api/tracking',
      triage: '/api/triage',
      qr: '/api/qr',
      hospitals: '/api/hospitals',
    },
  });
});

// ─── Health Check ──────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/medical', medicalRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/hospitals', hospitalRoutes);

// ─── 404 Handler ───────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
