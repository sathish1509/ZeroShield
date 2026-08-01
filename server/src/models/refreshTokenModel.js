import { prisma } from '../config/prisma.js';

export const createRefreshTokenRecord = (data) =>
  prisma.refreshToken.create({
    data,
  });

export const findRefreshTokenRecordByHash = (tokenHash) =>
  prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

export const revokeRefreshTokenRecord = (tokenHash) =>
  prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });

export const revokeAllRefreshTokensForUser = (userId) =>
  prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });