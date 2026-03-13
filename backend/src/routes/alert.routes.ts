import { Router } from 'express';
import { publicLimiter, writeLimiter } from '../middleware/rateLimiter';
import * as alertController from '../controllers/alert.controller';

const router = Router();

router.post('/', writeLimiter, alertController.create);
router.get('/:id', publicLimiter, alertController.getById);
router.delete('/:id', publicLimiter, alertController.cancel);

export default router;
