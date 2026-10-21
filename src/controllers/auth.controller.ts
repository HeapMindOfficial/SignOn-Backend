import type { Request } from 'express';

import { REFRESH_TOKEN_COOKIE } from '../constants/auth.constants.js';
import {
  completeUserProfile,
  loginUser as loginUserService,
  logoutUser,
  refreshSession,
  registerUser as registerUserService,
  type SessionContext,
} from '../services/auth.service.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearRefreshTokenCookie, setRefreshTokenCookie } from '../utils/cookies.js';
import type {
  UserLoginInput,
  UserRegisterInfoInput,
  UserRegisterInitialInput,
} from '../validators/auth.validator.js';

function getSessionContext(req: Request): SessionContext {
  const userAgent = req.headers['user-agent'];
  return {
    ...(userAgent !== undefined ? { userAgent } : {}),
    ...(req.ip !== undefined ? { ipAddress: req.ip } : {}),
  };
}

function getRefreshTokenCookie(req: Request): string | undefined {
  const cookies = req.cookies as Record<string, string> | undefined;
  return cookies?.[REFRESH_TOKEN_COOKIE];
}

export const registerUser = asyncHandler(async (req, res) => {
  const input = req.body as UserRegisterInitialInput;
  const { user, accessToken, refreshToken } = await registerUserService(
    input,
    getSessionContext(req),
  );
  setRefreshTokenCookie(res, refreshToken);
  res.success({ user, accessToken }, 'User registered successfully', 201);
});

export const registerUserInfo = asyncHandler(async (req, res) => {
  const input = req.body as UserRegisterInfoInput;
  const userId = req.userId;
  if (!userId) {
    throw ApiError.unauthorized('Missing or invalid Authorization header');
  }

  const user = await completeUserProfile(userId, input);
  res.success(user, 'User Info registered successfully', 200);
});

export const loginUser = asyncHandler(async (req, res) => {
  const input = req.body as UserLoginInput;
  const identifier = input.email ?? input.username;
  if (!identifier) {
    throw ApiError.badRequest('Either email or username must be provided');
  }

  const { user, accessToken, refreshToken } = await loginUserService(
    identifier,
    input.password,
    getSessionContext(req),
  );
  setRefreshTokenCookie(res, refreshToken);
  res.success({ user, accessToken }, 'User logged in successfully', 200);
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(getRefreshTokenCookie(req));
  clearRefreshTokenCookie(res);
  res.success(null, 'User logged out successfully', 200);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken: newRefreshToken } = await refreshSession(
    getRefreshTokenCookie(req),
    getSessionContext(req),
  );
  setRefreshTokenCookie(res, newRefreshToken);
  res.success({ accessToken }, 'User refresh token generated successfully', 200);
});

export const verifyEmail = asyncHandler(async (req, res) => {
  // Implement user email verification logic here
  res.success(null, 'User email verified successfully', 200);
});

export const resendVerificationEmail = asyncHandler(async (req, res) => {
  // Implement user logout logic here
  res.success(null, 'Verification email resent successfully', 200);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  // Implement user forgot password logic here
  res.success(null, 'Password reset email sent successfully', 200);
});

export const resetPassword = asyncHandler(async (req, res) => {
  // Implement user reset password logic here
  res.success(null, 'Password reset successfully', 200);
});

export const changePassword = asyncHandler(async (req, res) => {
  // Implement user logout logic here
  res.success(null, 'User logged out successfully', 200);
});
