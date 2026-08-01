import { asyncHandler } from '../utils/asyncHandler.js';
import { findSessionById, findUserSessionsList, revokeSessionRecord } from '../models/sessionModel.js';

export const getActiveSessions = asyncHandler(async (req, res) => {
  const sessions = await findUserSessionsList(req.user.id);
  res.json({
    status: 'success',
    data: { sessions },
  });
});

export const revokeSession = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const session = await findSessionById(id);

  if (!session) {
    return res.status(404).json({
      status: 'fail',
      message: `Session #${id} not found`,
    });
  }

  // Users can only revoke their own sessions unless they are ADMIN
  if (session.userId !== req.user.id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      status: 'fail',
      message: 'You do not have permission to revoke this session',
    });
  }

  const revoked = await revokeSessionRecord(id);

  res.json({
    status: 'success',
    data: {
      session: revoked,
      message: `Session #${id} revoked successfully.`,
    },
  });
});
