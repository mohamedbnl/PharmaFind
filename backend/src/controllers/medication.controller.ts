import type { RequestHandler } from 'express';
import { asyncHandler } from '../utils/errors';
import * as medicationService from '../services/medication.service';

export const autocomplete: RequestHandler = asyncHandler(async (req, res) => {
  const q = String(req.query.q ?? '');
  const data = await medicationService.autocompleteMedications(q);
  res.json({ success: true, data });
});

export const list: RequestHandler = asyncHandler(async (req, res) => {
  const result = await medicationService.listMedications(req.query as Record<string, unknown>);
  res.json({ success: true, ...result });
});

export const getById: RequestHandler = asyncHandler(async (req, res) => {
  const med = await medicationService.getMedication(req.params.id);
  res.json({ success: true, data: med });
});
