import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from '../utils/errors';

export function validate(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(
        new AppError('VALIDATION_ERROR', 400, 'Validation failed', result.error.errors),
      );
    }
    req.body = result.data;
    next();
  };
}
