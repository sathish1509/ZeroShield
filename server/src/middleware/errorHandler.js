import { AppError } from '../utils/appError.js';
import { env } from '../config/env.js';

export const errorHandler = (error, _req, res, _next) => {
  const isKnown = error instanceof AppError;
  const statusCode = isKnown ? error.statusCode : 500;
  const code = isKnown ? error.code : 'INTERNAL_SERVER_ERROR';

  const isProd = env.NODE_ENV === 'production';
  const message = isKnown || !isProd ? error.message : 'Internal Server Error';

  const responsePayload = {
    status: 'error',
    error: {
      message,
      code,
    },
  };

  if (!isProd && error.stack) {
    responsePayload.error.stack = error.stack;
  }

  res.status(statusCode).json(responsePayload);
};