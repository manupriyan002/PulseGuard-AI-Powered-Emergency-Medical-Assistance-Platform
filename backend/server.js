require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/database');
const { initializeFirebase } = require('./src/config/firebase');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Initialize Firebase Admin
    initializeFirebase();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 PulseGuard Backend running on http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
