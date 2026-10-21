import type { HydratedDocument, Types } from 'mongoose';

import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { MS_PER_DAY } from '../constants/time.constants.js';
import type { UserDocument } from '../models/user.model.js';
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByIdentifier,
  findUserByUsername,
  recordFailedLogin,
  recordSuccessfulLogin,
  updateUserById,
} from '../repositories/auth.repository.js';
import {
  createSession,
  findActiveSessionByRefreshTokenHash,
  revokeSession,
} from '../repositories/session.repository.js';
import type { AuthResult, TokenPair } from '../types/auth.types.js';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken } from '../utils/jwt.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateRefreshToken, hashRefreshToken } from '../utils/refreshToken.js';
import type {
  UserRegisterInfoInput,
  UserRegisterInitialInput,
} from '../validators/auth.validator.js';
import {
  mightEmailExist,
  mightUsernameExist,
  registerEmail,
  registerUsername,
} from './uniqueness.service.js';

export interface SessionContext {
  userAgent?: string;
  ipAddress?: string;
}

async function issueSession(userId: Types.ObjectId, context: SessionContext): Promise<TokenPair> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + env.refreshTokenTtlDays * MS_PER_DAY);

  await createSession({
    userId,
    refreshTokenHash: hashRefreshToken(refreshToken),
    expiresAt,
    ...(context.userAgent !== undefined ? { userAgent: context.userAgent } : {}),
    ...(context.ipAddress !== undefined ? { ipAddress: context.ipAddress } : {}),
  });

  const accessToken = await signAccessToken(userId.toString());
  return { accessToken, refreshToken };
}

export async function registerUser(
  input: UserRegisterInitialInput,
  context: SessionContext,
): Promise<AuthResult> {
  const { email, username, password } = input;

  const conflicts: Array<{ path: string; message: string }> = [];

  if (mightEmailExist(email) && (await findUserByEmail(email))) {
    conflicts.push({ path: 'email', message: 'Email is already in use' });
  }
  if (mightUsernameExist(username) && (await findUserByUsername(username))) {
    conflicts.push({ path: 'username', message: 'Username is already taken' });
  }
  if (conflicts.length > 0) {
    throw ApiError.conflict('Email or username already exists', conflicts);
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, username, passwordHash });

  registerEmail(user.email);
  registerUsername(user.username);

  logger.info({ userId: user._id.toString(), email: user.email }, 'User registered');

  const { accessToken, refreshToken } = await issueSession(user._id, context);

  return { user, accessToken, refreshToken };
}

export async function loginUser(
  identifier: string,
  password: string,
  context: SessionContext,
): Promise<AuthResult> {
  const invalidCredentialsError = ApiError.unauthorized('Invalid email/username or password');

  const user = await findUserByIdentifier(identifier);
  if (!user) {
    throw invalidCredentialsError;
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw ApiError.forbidden('Account temporarily locked due to too many failed login attempts');
  }

  const passwordValid = await verifyPassword(user.passwordHash, password);
  if (!passwordValid) {
    await recordFailedLogin(user._id.toString());
    throw invalidCredentialsError;
  }

  if (user.status === 'suspended') {
    throw ApiError.forbidden('Account is suspended');
  }
  if (user.status === 'deactivated') {
    throw ApiError.forbidden('Account is deactivated');
  }

  await recordSuccessfulLogin(user._id.toString());
  logger.info({ userId: user._id.toString() }, 'User logged in');

  const { accessToken, refreshToken } = await issueSession(user._id, context);

  return { user, accessToken, refreshToken };
}

export async function completeUserProfile(
  userId: string,
  input: UserRegisterInfoInput,
): Promise<HydratedDocument<UserDocument>> {
  const existing = await findUserById(userId);
  if (!existing) {
    throw ApiError.notFound('User not found');
  }

  const shouldActivate = existing.status === 'pending_profile';
  const user = await updateUserById(userId, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.givenName !== undefined ? { givenName: input.givenName } : {}),
    ...(input.familyName !== undefined ? { familyName: input.familyName } : {}),
    ...(input.picture !== undefined ? { picture: input.picture } : {}),
    ...(shouldActivate ? { status: 'pending_verification' as const } : {}),
  });
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  if (shouldActivate) {
    logger.info({ userId }, 'User profile completed, status -> pending_verification');
  }

  return user;
}

export async function logoutUser(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) return;

  const session = await findActiveSessionByRefreshTokenHash(hashRefreshToken(refreshToken));
  if (session) {
    await revokeSession(session._id.toString());
    logger.info({ userId: session.userId.toString() }, 'User logged out');
  }
}

export async function refreshSession(
  refreshToken: string | undefined,
  context: SessionContext,
): Promise<TokenPair> {
  const invalidSessionError = ApiError.unauthorized('Invalid or expired session');

  if (!refreshToken) {
    throw invalidSessionError;
  }

  const session = await findActiveSessionByRefreshTokenHash(hashRefreshToken(refreshToken));
  if (!session) {
    throw invalidSessionError;
  }

  const user = await findUserById(session.userId.toString());
  if (!user || user.status === 'suspended' || user.status === 'deactivated') {
    await revokeSession(session._id.toString());
    throw invalidSessionError;
  }

  await revokeSession(session._id.toString());
  logger.info({ userId: user._id.toString() }, 'Session refreshed');

  return issueSession(user._id, context);
}
