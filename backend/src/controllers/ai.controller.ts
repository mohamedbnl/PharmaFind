import { Request, Response, NextFunction } from 'express';
import { processAITextRequest, processAIImageRequest } from '../services/ai.service';
import { AppError } from '../utils/errors';

export async function analyzeText(req: Request, res: Response, next: NextFunction) {
  try {
    const { text, lat, lng, radius } = req.body;

    if (!text) {
      throw new AppError('MISSING_TEXT', 400, 'Text content is required for text analysis.');
    }

    const result = await processAITextRequest(text, Number(lat), Number(lng), Number(radius) || undefined);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function analyzeImage(req: Request, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    const { lat, lng, radius } = req.body;

    if (!file) {
      throw new AppError('MISSING_IMAGE', 400, 'An image file is required for image analysis.');
    }

    const mimeType = file.mimetype;
    if (!mimeType.startsWith('image/')) {
      throw new AppError('INVALID_FILE_TYPE', 400, 'Uploaded file must be an image.');
    }

    const result = await processAIImageRequest(file.buffer, mimeType, Number(lat), Number(lng), Number(radius) || undefined);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
