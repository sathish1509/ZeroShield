import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { findUserByEmail } from '../models/userModel.js';
import {
  createRefreshTokenRecord,
  findRefreshTokenRecordByHash,
  revokeRefreshTokenRecord,
} from '../models/refreshTokenModel.js';
import { createSessionRecord } from '../models/sessionModel.js';
import { comparePassword } from '../utils/password.js';
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';
import { verifyTotpCode } from './mfaController.js';
import { AppError } from '../utils/appError.js';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: env.COOKIE_SECURE,
  path: '/api/auth',
};

export const login = async (req, res) => {
  const { email, password, mfaCode } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  // TOTP MFA Check if enabled
  if (user.isMfaEnabled) {
    if (!mfaCode) {
      return res.status(200).json({
        status: 'mfa_required',
        message: 'MFA 6-digit authentication code required to complete login.',
        mfaRequired: true,
      });
    }
    const isMfaValid = verifyTotpCode(user.mfaSecret, mfaCode);
    if (!isMfaValid) {
      throw new AppError('Invalid 6-digit MFA authentication code', 'INVALID_MFA_CODE', 401);
    }
  }

  const accessToken = createAccessToken({ id: user.id, role: user.role, email: user.email, name: user.name });
  const refreshToken = createRefreshToken({ id: user.id, role: user.role, email: user.email });

  const tokenRecord = await createRefreshTokenRecord({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Track Active Session
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  await createSessionRecord({
    userId: user.id,
    refreshTokenId: tokenRecord.id,
    ipAddress,
    userAgent,
  });

  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 'success',
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isMfaEnabled: user.isMfaEnabled || false,
      },
    },
  });
};

export const refresh = async (req, res) => {
  const token = req.cookies.refreshToken || req.body.refreshToken;
  if (!token) {
    throw new AppError('Refresh token is required', 'UNAUTHORIZED', 401);
  }

  const payload = verifyRefreshToken(token);
  const oldTokenHash = hashToken(token);
  const record = await findRefreshTokenRecordByHash(oldTokenHash);

  if (!record || record.revokedAt || record.expiresAt.getTime() < Date.now()) {
    throw new AppError('Refresh token is invalid or expired', 'UNAUTHORIZED', 401);
  }

  // Refresh Token Rotation: Revoke old token and issue new token pair
  await revokeRefreshTokenRecord(oldTokenHash);

  const newAccessToken = createAccessToken({
    id: Number(payload.sub),
    role: payload.role,
    email: payload.email,
  });

  const newRefreshToken = createRefreshToken({
    id: Number(payload.sub),
    role: payload.role,
    email: payload.email,
  });

  const newTokenRecord = await createRefreshTokenRecord({
    userId: Number(payload.sub),
    tokenHash: hashToken(newRefreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Track session rotation
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'Unknown Browser';
  await createSessionRecord({
    userId: Number(payload.sub),
    refreshTokenId: newTokenRecord.id,
    ipAddress,
    userAgent,
  });

  res.cookie('refreshToken', newRefreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    status: 'success',
    data: {
      accessToken: newAccessToken,
    },
  });
};

export const logout = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    const tokenHash = hashToken(token);
    await revokeRefreshTokenRecord(tokenHash);
  }

  res.clearCookie('refreshToken', refreshCookieOptions);
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Logged out successfully',
      requestId: crypto.randomUUID(),
    },
  });
};