import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/errors';
import * as onDutyService from '../services/onDuty.service';

export const getOnDuty: RequestHandler = asyncHandler(async (req, res) => {
  const city = req.query.city ? String(req.query.city) : undefined;
  const date = req.query.date ? String(req.query.date) : undefined;
  const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
  const lng = req.query.lng ? parseFloat(String(req.query.lng)) : undefined;
  const data = await onDutyService.getOnDutyPharmacies({ city, date, lat, lng });
  res.json({ success: true, data });
});

export const getOnDutyNow: RequestHandler = asyncHandler(async (req, res) => {
  const lat = req.query.lat ? parseFloat(String(req.query.lat)) : undefined;
  const lng = req.query.lng ? parseFloat(String(req.query.lng)) : undefined;
  const city = req.query.city ? String(req.query.city) : undefined;
  const data = await onDutyService.getOnDutyPharmacies({ city, lat, lng });
  res.json({ success: true, data });
});
