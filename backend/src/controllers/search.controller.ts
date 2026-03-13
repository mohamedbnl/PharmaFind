import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/errors';
import * as searchService from '../services/search.service';
import { prisma } from '../config/database';

export const search: RequestHandler = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '');
  const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
  const lng = req.query.lng ? parseFloat(String(req.query.lng)) : undefined;
  const radius = req.query.radius ? parseFloat(String(req.query.radius)) : 5;
  const status = req.query.status ? String(req.query.status) : undefined;
  const page = req.query.page ? parseInt(String(req.query.page)) : 1;
  const limit = req.query.limit ? parseInt(String(req.query.limit)) : 20;
  const language = String(req.query.lang ?? 'fr');

  const results = await searchService.searchMedications({ q, lat, lng, radius, status, page, limit });

  // Log search asynchronously (don't await — non-blocking)
  prisma.searchLog.create({
    data: {
      query: q,
      latitude: lat,
      longitude: lng,
      city: req.query.city ? String(req.query.city) : undefined,
      resultsCount: results.length,
      language,
    },
  }).catch(() => { /* non-critical */ });

  res.json({ success: true, data: results });
});

export const suggestions: RequestHandler = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '');
  const data = await searchService.getSearchSuggestions(q);
  res.json({ success: true, data });
});
