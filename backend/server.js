// =============================================================
// server.js – TransitIQ Backend Entry Point
// =============================================================

const app    = require('./src/app');
const prisma = require('./src/config/db');
const { PORT } = require('./src/config/env');

const startServer = async () => {
  try {
    // Test database connectivity before accepting traffic
    await prisma.$connect();
    console.log('✅  Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚌  TransitIQ API running on http://localhost:${PORT}`);
      console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📖  Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌  Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();
