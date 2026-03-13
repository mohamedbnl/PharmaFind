import type { RequestHandler } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/errors';
import { analyzeMedications } from '../services/ai.service';

const LocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const AiRequestSchema = z.object({
  text: z.string().optional(),
  language: z.enum(['fr', 'ar']).optional(),
  userLocation: LocationSchema.optional(),
});

function parseUserLocation(value: unknown) {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }
  return value;
}

export const analyze: RequestHandler = asyncHandler(async (req, res) => {
  const rawUserLocation = parseUserLocation(req.body.userLocation);
  const payload = {
    text: req.body.text ? String(req.body.text) : undefined,
    language: req.body.language ? String(req.body.language) : undefined,
    userLocation: rawUserLocation,
  };

  const parsed = AiRequestSchema.safeParse(payload);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid AI request payload',
        details: parsed.error.errors,
      },
    });
    return;
  }

  const file = req.file;
  const result = await analyzeMedications({
    ...parsed.data,
    image: file ? { buffer: file.buffer, mimeType: file.mimetype } : undefined,
  });

  res.json(result);
});
