'use strict';

/**
 * src/server.js
 *
 * HTTP server bootstrap.
 * Starts the Express app, connects to the database, handles graceful shutdown.
 */

const app    = require('./app');
const env    = require('./config/env');
const prisma = require('./config/database');
const logger = require('./utils/logger');

const PORT = env.PORT;

async function start() {
  try {
    // Verify database connectivity before accepting traffic
    await prisma.$connect();
    logger.info('Database connected');

    const server = app.listen(PORT, () => {
      logger.info(`QuickKart backend running`, {
        port: PORT,
        environment: env.NODE_ENV,
      });
    });

    // ── Graceful shutdown ─────────────────────────────────────
    async function shutdown(signal) {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Database disconnected. Server closed.');
        process.exit(0);
      });
    }

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('Failed to start server', { error: err.message });
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

start();
