import { Router } from 'express';
import { publicLimiter } from '../middleware/rateLimiter';
import * as searchController from '../controllers/search.controller';

const router = Router();

router.get('/', publicLimiter, searchController.search);
router.get('/suggestions', publicLimiter, searchController.suggestions);

export default router;
