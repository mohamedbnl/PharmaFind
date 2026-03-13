import { Router } from 'express';
import { publicLimiter } from '../middleware/rateLimiter';
import * as onDutyController from '../controllers/onDuty.controller';

const router = Router();

router.get('/now', publicLimiter, onDutyController.getOnDutyNow);
router.get('/', publicLimiter, onDutyController.getOnDuty);

export default router;
