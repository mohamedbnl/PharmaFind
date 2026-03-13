import { Router } from 'express';
import { writeLimiter } from '../middleware/rateLimiter';
import * as reportController from '../controllers/report.controller';

const router = Router();

router.post('/', writeLimiter, reportController.create);

export default router;
