import type { SessionDocument } from '../models/session.model.js';

export type CreateSessionDTO = Pick<SessionDocument, 'userId' | 'refreshTokenHash' | 'expiresAt'> &
  Partial<SessionDocument>;
