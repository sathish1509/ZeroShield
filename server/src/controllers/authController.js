import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { findUserByEmail } from '../models/userModel.js';
import {
  createRefreshTokenRecord,
  findRefreshTokenRecordByHash,
  revokeRefreshTokenRecord,
} from '../models/refreshTokenModel.js';
import { comparePassword } from '../utils/password.js';
import {
  createAccessToken,
  createRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/token.js';
import { AppError } from '../utils/appError.js';

const refreshCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.COOKIE_SECURE,
  path: '/api/auth',
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const passwordMatches = await comparePassword(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
  }

  const accessToken = createAccessToken({ id: user.id, role: user.role, email: user.email, name: user.name });
  const refreshToken = createRefreshToken({ id: user.id, role: user.role, email: user.email });

  await createRefreshTokenRecord({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    data: {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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
  const tokenHash = hashToken(token);
  const record = await findRefreshTokenRecordByHash(tokenHash);

  if (!record || record.revokedAt || record.expiresAt.getTime() < Date.now()) {
    throw new AppError('Refresh token is invalid or expired', 'UNAUTHORIZED', 401);
  }

  const accessToken = createAccessToken({
    id: Number(payload.sub),
    role: payload.role,
    email: payload.email,
  });

  res.json({
    data: {
      accessToken,
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
    data: {
      message: 'Logged out successfully',
      requestId: crypto.randomUUID(),
    },
  });
};