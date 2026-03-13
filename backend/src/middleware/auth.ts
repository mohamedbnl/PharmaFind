import type { RequestHandler } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../utils/errors';

export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('UNAUTHORIZED', 401, 'Missing or invalid Authorization header'));
  }
  const token = header.slice(7);
  const payload = verifyAccessToken(token);
  if (!payload) {
    return next(new AppError('UNAUTHORIZED', 401, 'Invalid or expired token'));
  }
  req.userId = payload.userId;
  req.userRole = payload.role;
  next();
};
