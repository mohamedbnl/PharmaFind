import { Router } from 'express';
import { publicLimiter, writeLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import * as stockController from '../controllers/stock.controller';

const router = Router();

router.get('/:pharmacyId', publicLimiter, stockController.getByPharmacy);
router.post('/', writeLimiter, authenticate, stockController.add);
router.put('/bulk-update', writeLimiter, authenticate, stockController.bulkUpdate);
router.post('/confirm-all', writeLimiter, authenticate, stockController.confirmAll);
router.put('/:id', writeLimiter, authenticate, stockController.update);
router.delete('/:id', writeLimiter, authenticate, stockController.remove);

export default router;
