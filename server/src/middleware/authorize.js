import { AppError } from '../utils/appError.js';
import { hasPermission } from '../models/permissionModel.js';

export const authorize = (resource, action = 'view') => async (req, _res, next) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 'UNAUTHORIZED', 401));
  }

  try {
    const isAllowed = await hasPermission(req.user.role, resource, action);
    if (!isAllowed) {
      return next(new AppError('You are not allowed to access this resource', 'FORBIDDEN', 403));
    }
    return next();
  } catch (error) {
    return next(error);
  }
};