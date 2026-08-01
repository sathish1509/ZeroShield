import { AppError } from '../utils/appError.js';

export const authorize = (...allowedRoles) => (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 'UNAUTHORIZED', 401));
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
    return next(new AppError('You are not allowed to access this resource', 'FORBIDDEN', 403));
  }

  return next();
};