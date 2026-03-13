import type { RequestHandler } from 'express';
import { createHash } from 'crypto';
import { asyncHandler, AppError } from '../utils/errors';
import * as reportService from '../services/report.service';

const VALID_REPORT_TYPES = ['accuracy_confirm', 'accuracy_deny', 'pharmacy_closed', 'wrong_info'];

export const create: RequestHandler = asyncHandler(async (req, res) => {
  const { pharmacyId, medicationId, stockId, reportType, comment } = req.body;
  if (!pharmacyId || !reportType) {
    throw new AppError('VALIDATION_ERROR', 400, 'pharmacyId and reportType are required');
  }
  if (!VALID_REPORT_TYPES.includes(reportType)) {
    throw new AppError('VALIDATION_ERROR', 400, `Invalid reportType. Must be one of: ${VALID_REPORT_TYPES.join(', ')}`);
  }
  // Hash IP for privacy before storing
  const rawIp = (req.ip ?? '').split(':').pop() ?? '';
  const reporterIp = rawIp ? createHash('sha256').update(rawIp).digest('hex').slice(0, 45) : undefined;
  const data = await reportService.createReport({ pharmacyId, medicationId, stockId, reportType, comment, reporterIp });
  res.status(201).json({ success: true, data });
});
