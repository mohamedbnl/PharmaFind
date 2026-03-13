import type { RequestHandler } from 'express';
import { asyncHandler, AppError } from '../utils/errors';
import * as stockService from '../services/stock.service';

export const getByPharmacy: RequestHandler = asyncHandler(async (req, res) => {
  const data = await stockService.getPharmacyStock(req.params.pharmacyId);
  res.json({ success: true, data });
});

const VALID_STATUSES = ['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARRIVING_SOON'];

export const add: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const { pharmacyId, medicationId, status, quantite, notes } = req.body;
  if (!pharmacyId || !medicationId || !status) {
    throw new AppError('VALIDATION_ERROR', 400, 'pharmacyId, medicationId, status required');
  }
  if (!VALID_STATUSES.includes(status)) {
    throw new AppError('VALIDATION_ERROR', 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  // Verify ownership
  const { prisma } = await import('../config/database');
  const pharmacy = await prisma.pharmacy.findFirst({ where: { id: pharmacyId, userId: req.userId, deletedAt: null } });
  if (!pharmacy) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy');

  const data = await stockService.addStock({ pharmacyId, medicationId, status, quantite, notes });
  res.status(201).json({ success: true, data });
});

export const update: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  if (req.body.status && !VALID_STATUSES.includes(req.body.status)) {
    throw new AppError('VALIDATION_ERROR', 400, `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }
  const data = await stockService.updateStock(req.params.id, req.userId, req.body);
  res.json({ success: true, data });
});

export const bulkUpdate: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const { pharmacyId, updates } = req.body;
  if (!pharmacyId || !Array.isArray(updates)) {
    throw new AppError('VALIDATION_ERROR', 400, 'pharmacyId and updates array required');
  }
  const data = await stockService.bulkUpdateStock(pharmacyId, req.userId, updates);
  res.json({ success: true, data });
});

export const confirmAll: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  const { pharmacyId } = req.body;
  if (!pharmacyId) throw new AppError('VALIDATION_ERROR', 400, 'pharmacyId required');
  const data = await stockService.confirmAllStock(pharmacyId, req.userId);
  res.json({ success: true, data });
});

export const remove: RequestHandler = asyncHandler(async (req, res) => {
  if (!req.userId) throw new AppError('UNAUTHORIZED', 401, 'Not authenticated');
  await stockService.removeStock(req.params.id, req.userId);
  res.json({ success: true, data: null });
});
