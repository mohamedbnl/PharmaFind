import type { RequestHandler } from 'express';
import { asyncHandler, AppError } from '../utils/errors';
import * as pharmacyService from '../services/pharmacy.service';
import { buildMeta, parsePagination } from '../utils/pagination';

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const { page, limit } = parsePagination(req.query);
  const city = req.query.city ? String(req.query.city) : undefined;
  const { pharmacies, total } = await pharmacyService.listPharmacies({ city, page, limit });
  res.json({ success: true, data: pharmacies, meta: buildMeta(total, { page, limit }) });
});

export const getById: RequestHandler = asyncHandler(async (req, res) => {
  const pharmacy = await pharmacyService.getPharmacy(req.params.id);
  res.json({ success: true, data: pharmacy });
});

export const analytics: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const data = await pharmacyService.getPharmacyAnalytics(req.params.id, req.userId);
  res.json({ success: true, data });
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const pharmacy = await pharmacyService.updatePharmacy(req.params.id, req.userId, req.body);
  res.json({ success: true, data: pharmacy });
});

export const getMine: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const pharmacy = await pharmacyService.getMyPharmacy(req.userId);
  res.json({ success: true, data: pharmacy });
});

export const create: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const { nameFr, nameAr, addressFr, city, region, latitude, longitude, phone, whatsapp, operatingHours, is24h, licenseNumber } = req.body;
  if (!nameFr || !addressFr || !city || !latitude || !longitude || !phone || !licenseNumber) {
    throw new AppError('VALIDATION_ERROR', 400, 'Missing required fields');
  }
  const pharmacy = await pharmacyService.createPharmacy({
    userId: req.userId, nameFr, nameAr: nameAr ?? nameFr, addressFr, city,
    region: region ?? city, latitude: parseFloat(latitude), longitude: parseFloat(longitude),
    phone, whatsapp, operatingHours: operatingHours ?? {}, is24h, licenseNumber,
  });
  res.status(201).json({ success: true, data: pharmacy });
});
