import type { RequestHandler } from 'express';
import { asyncHandler, AppError } from '../utils/errors';
import * as alertService from '../services/alert.service';

export const create: RequestHandler = asyncHandler(async (req, res) => {
  const { medicationId, city, lat, lng, contactType, contactValue } = req.body;
  if (!medicationId || !city || !contactType || !contactValue) {
    throw new AppError('VALIDATION_ERROR', 400, 'Missing required fields');
  }
  if (!['email', 'phone'].includes(contactType)) {
    throw new AppError('VALIDATION_ERROR', 400, 'contactType must be email or phone');
  }
  const alert = await alertService.createAlert({
    medicationId, city,
    lat: lat ? parseFloat(lat) : undefined,
    lng: lng ? parseFloat(lng) : undefined,
    contactType,
    contactValue,
  });
  res.status(201).json({ success: true, data: alert });
});

export const getById: RequestHandler = asyncHandler(async (req, res) => {
  const alert = await alertService.getAlert(req.params.id);
  res.json({ success: true, data: alert });
});

export const cancel: RequestHandler = asyncHandler(async (req, res) => {
  await alertService.cancelAlert(req.params.id);
  res.json({ success: true, data: null });
});
