import { prisma } from '../config/prisma.js';

export const createSessionRecord = async ({ userId, refreshTokenId, ipAddress, userAgent }) => {
  return prisma.userSession.create({
    data: {
      userId: Number(userId),
      refreshTokenId: refreshTokenId ? Number(refreshTokenId) : null,
      ipAddress: ipAddress || '127.0.0.1',
      userAgent: userAgent || 'Unknown Device',
      lastActiveAt: new Date(),
    },
  });
};

export const findUserSessionsList = async (userId) => {
  return prisma.userSession.findMany({
    where: {
      userId: Number(userId),
      isRevoked: false,
    },
    orderBy: { lastActiveAt: 'desc' },
  });
};

export const findSessionById = async (id) => {
  return prisma.userSession.findUnique({
    where: { id: Number(id) },
  });
};

export const revokeSessionRecord = async (id) => {
  const session = await prisma.userSession.update({
    where: { id: Number(id) },
    data: {
      isRevoked: true,
      updatedAt: new Date(),
    },
  });

  // If tied to a refresh token, revoke the refresh token in database as well
  if (session.refreshTokenId) {
    await prisma.refreshToken.update({
      where: { id: session.refreshTokenId },
      data: { revokedAt: new Date() },
    }).catch(() => {});
  }

  return session;
};

export const updateSessionActivity = async (id) => {
  return prisma.userSession.update({
    where: { id: Number(id) },
    data: { lastActiveAt: new Date() },
  }).catch(() => {});
};
