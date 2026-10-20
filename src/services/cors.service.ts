import { findActiveOrigins } from '../repositories/corsRule.repository.js';

let allowedOrigins = new Set<string>();
let pollTimer: NodeJS.Timeout | undefined;

export async function refreshAllowedOrigins(): Promise<void> {
  const origins = await findActiveOrigins();
  allowedOrigins = new Set(origins);
}

export function isOriginAllowed(origin: string): boolean {
  return allowedOrigins.has(origin);
}

export function startCorsPolling(intervalMs: number): void {
  stopCorsPolling();
  pollTimer = setInterval(() => {
    refreshAllowedOrigins().catch((error: unknown) => {
      console.error('Failed to refresh CORS rules:', error);
    });
  }, intervalMs);
}

export function stopCorsPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = undefined;
  }
}
