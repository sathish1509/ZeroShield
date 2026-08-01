import { verifyAccessToken } from '../utils/token.js';
import { AppError } from '../utils/appError.js';

export const authenticate = (req, _res, next) => {
  const header = req.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication token is required', 'UNAUTHORIZED', 401));
  }

  const token = header.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: Number(payload.sub),
      role: payload.role,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch (_error) {
    return next(new AppError('Authentication token is invalid or expired', 'UNAUTHORIZED', 401));
  }
};