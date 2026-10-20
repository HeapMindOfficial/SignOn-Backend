import type { Server } from 'node:http';

import { createApp } from './app.js';
import { connectDb, disconnectDb } from './config/db.js';
import { env } from './config/env.js';
import {
  refreshAllowedOrigins,
  startCorsPolling,
  stopCorsPolling,
} from './services/cors.service.js';

let server: Server | undefined;
let shuttingDown = false;

async function main(): Promise<void> {
  await connectDb();
  await refreshAllowedOrigins();
  startCorsPolling(env.corsRefreshIntervalMs);

  const app = createApp();
  server = app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}, shutting down gracefully...`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out, forcing exit');
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
    console.log('Shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    clearTimeout(forceExit);
    process.exit(1);
  }
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

process.on('uncaughtException', (error: unknown) => {
  console.error('Uncaught exception:', error);
  void shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Unhandled rejection:', reason);
  void shutdown('unhandledRejection');
});

main().catch((error: unknown) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
