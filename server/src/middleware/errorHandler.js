import { AppError } from '../utils/appError.js';

export const errorHandler = (error, _req, res, _next) => {
  const isKnown = error instanceof AppError;
  const statusCode = isKnown ? error.statusCode : 500;
  const code = isKnown ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = isKnown ? error.message : 'An unexpected error occurred';

  res.status(statusCode).json({
    error: {
      message,
      code,
    },
  });
};