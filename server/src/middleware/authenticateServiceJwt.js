import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/appError.js';

export const authenticateServiceJwt = (req, _res, next) => {
  const header = req.get('authorization');

  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Service JWT identity token is required', 'UNAUTHORIZED', 401));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    if (payload.type !== 'SERVICE_IDENTITY') {
      return next(new AppError('Token must be a valid Service Identity credential', 'UNAUTHORIZED', 401));
    }

    req.service = {
      id: Number(payload.serviceId),
      name: payload.serviceName,
      identityId: payload.identityId,
      scope: payload.scope,
    };

    return next();
  } catch (_error) {
    return next(new AppError('Service JWT identity is invalid or expired', 'UNAUTHORIZED', 401));
  }
};
