import type { Response } from 'express';

import { env } from '../config/env.js';
import { REFRESH_TOKEN_COOKIE } from '../constants/auth.constants.js';
import { MS_PER_DAY } from '../constants/time.constants.js';

export function setRefreshTokenCookie(res: Response, refreshToken: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: env.refreshTokenTtlDays * MS_PER_DAY,
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}
