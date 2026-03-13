import { Router } from 'express';
import { publicLimiter } from '../middleware/rateLimiter';
import * as medicationController from '../controllers/medication.controller';

const router = Router();

// /autocomplete MUST come before /:id
router.get('/autocomplete', publicLimiter, medicationController.autocomplete);
router.get('/', publicLimiter, medicationController.list);
router.get('/:id', publicLimiter, medicationController.getById);

export default router;
