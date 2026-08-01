import { AppError } from '../utils/appError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 'NOT_FOUND', 404));
};