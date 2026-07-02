// =============================================================
// src/config/db.js
// Prisma Client singleton – single instance shared across the app
// =============================================================

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
});

// Graceful shutdown – disconnect Prisma on process exit
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;
