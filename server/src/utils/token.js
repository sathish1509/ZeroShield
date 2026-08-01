import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const createAccessToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      email: user.email,
      name: user.name,
    },
    env.JWT_ACCESS_SECRET,
    {
      subject: String(user.id),
      expiresIn: env.ACCESS_TOKEN_TTL,
    },
  );

export const createRefreshToken = (user) =>
  jwt.sign(
    {
      role: user.role,
      email: user.email,
      jti: crypto.randomUUID(),
    },
    env.JWT_REFRESH_SECRET,
    {
      subject: String(user.id),
      expiresIn: env.REFRESH_TOKEN_TTL,
    },
  );

export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');