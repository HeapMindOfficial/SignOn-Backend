import { SessionModel } from '../models/session.model.js';
import type { CreateSessionDTO } from '../types/session.types.js';

export async function createSession(data: CreateSessionDTO) {
  return SessionModel.create(data);
}

export async function findActiveSessionByRefreshTokenHash(refreshTokenHash: string) {
  return SessionModel.findOne({
    refreshTokenHash,
    revokedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
}

export async function revokeSession(sessionId: string): Promise<void> {
  await SessionModel.findByIdAndUpdate(sessionId, { revokedAt: new Date() });
}
