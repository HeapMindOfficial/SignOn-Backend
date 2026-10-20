import { logger } from '../config/logger.js';
import { findActiveOrigins } from '../repositories/corsRule.repository.js';

let allowedOrigins = new Set<string>();
let pollTimer: NodeJS.Timeout | undefined;

export async function refreshAllowedOrigins(): Promise<void> {
  const origins = await findActiveOrigins();
  allowedOrigins = new Set(origins);
  logger.debug({ count: allowedOrigins.size }, 'Refreshed allowed CORS origins');
}

export function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.has(origin);
}

export function startCorsPolling(intervalMs: number): void {
  stopCorsPolling();
  pollTimer = setInterval(() => {
    refreshAllowedOrigins().catch((error: unknown) => {
      logger.error({ err: error }, 'Failed to refresh CORS rules');
    });
  }, intervalMs);
}

export function stopCorsPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
}
