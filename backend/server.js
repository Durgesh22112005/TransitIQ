const http   = require('http');
const app    = require('./src/app');
const prisma = require('./src/config/db');
const { PORT } = require('./src/config/env');
const setupSocket = require('./src/socket');
const simulator = require('./src/services/simulator');

const server = http.createServer(app);

const io = setupSocket(server);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully.');

    server.listen(PORT, () => {
      console.log(`TransitIQ API running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      simulator.start(io);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
};

startServer();

process.on('SIGINT', () => {
  simulator.stop();
  prisma.$disconnect().finally(() => process.exit(0));
});
