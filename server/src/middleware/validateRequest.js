import { AppError } from '../utils/appError.js';

export const validateRequest = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.issues.map((issue) => issue.message).join(', ');
    return next(new AppError(message, 'VALIDATION_ERROR', 400));
  }

  req.body = result.data;
  return next();
};