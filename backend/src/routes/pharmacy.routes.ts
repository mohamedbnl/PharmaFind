import { Router } from 'express';
import { publicLimiter, writeLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import * as pharmacyController from '../controllers/pharmacy.controller';

const router = Router();

router.get('/', publicLimiter, pharmacyController.list);
router.post('/', writeLimiter, authenticate, pharmacyController.create);
router.get('/:id/analytics', publicLimiter, authenticate, pharmacyController.analytics);
router.put('/:id', writeLimiter, authenticate, pharmacyController.update);
router.get('/:id', publicLimiter, pharmacyController.getById);

export default router;
