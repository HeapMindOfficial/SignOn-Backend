import type { Server } from 'node:http';

import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import {
  refreshAllowedOrigins,
  startCorsPolling,
  stopCorsPolling,
} from './services/cors.service.js';
import { seedUniquenessFilters } from './services/uniqueness.service.js';

let server: Server | undefined;
let shuttingDown = false;

async function main(): Promise<void> {
  await connectDb();
  logger.info('Connected to MongoDB');

  await seedUniquenessFilters();

  await refreshAllowedOrigins();
  startCorsPolling(env.corsRefreshIntervalMs);
  logger.info({ intervalMs: env.corsRefreshIntervalMs }, 'CORS rule polling started');

  const app = createApp();
  server = app.listen(env.port, () => {
    logger.info(`Server listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info(`Received ${signal}, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    logger.error('Graceful shutdown timed out, forcing exit');
    process.exit(1);
  }, env.shutdownTimeoutMs);

  try {
    stopCorsPolling();
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => (err ? reject(err) : resolve()));
      });
    }
    await disconnectDb();
    clearTimeout(forceExit);
    logger.info('Shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    clearTimeout(forceExit);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('uncaughtException', (error: unknown) => {
  logger.error({ err: error }, 'Uncaught exception');
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error({ err: reason }, 'Unhandled rejection');
  void shutdown('unhandledRejection');
});

main().catch((error: unknown) => {
  logger.error({ err: error }, 'Failed to start server');
  process.exit(1);
});
