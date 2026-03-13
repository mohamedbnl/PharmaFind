import { Router } from 'express';
import multer from 'multer';
import { analyzeText, analyzeImage } from '../controllers/ai.controller';

const router = Router();

// Configure multer to store uploaded files in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

router.post('/text', analyzeText);
router.post('/image', upload.single('image'), analyzeImage);

export default router;
