import { Router } from 'express';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { writeLimiter } from '../middleware/rateLimiter';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator';
import * as authController from '../controllers/auth.controller';

const router = Router();

router.post('/register', writeLimiter, validate(registerSchema), authController.register);
router.post('/login', writeLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshSchema), authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

export default router;
