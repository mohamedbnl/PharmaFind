import { z } from 'zod';
import { StockStatus } from './constants';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2).max(100),
  phone: z.string().regex(/^\+212[0-9]{9}$/, 'Phone must be +212XXXXXXXXX'),
  licenseNumber: z.string().min(3).max(50),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createPharmacySchema = z.object({
  nameFr: z.string().min(2).max(255),
  nameAr: z.string().min(2).max(255),
  addressFr: z.string().min(5),
  city: z.string().min(2).max(100),
  region: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  phone: z.string().regex(/^\+212[0-9]{9}$/),
  whatsapp: z.string().optional(),
  licenseNumber: z.string().min(3),
  operatingHours: z.record(z.unknown()),
  is24h: z.boolean().default(false),
});

export const updateStockSchema = z.object({
  status: z.nativeEnum(StockStatus),
  quantite: z.number().int().min(0).optional(),
  estimatedRestockHours: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().min(1).max(50).default(5),
  status: z.nativeEnum(StockStatus).optional(),
});

export const reportSchema = z.object({
  pharmacyId: z.string().uuid(),
  medicationId: z.string().uuid().optional(),
  stockId: z.string().uuid().optional(),
  reportType: z.enum(['accuracy_confirm', 'accuracy_deny', 'pharmacy_closed', 'wrong_info']),
  comment: z.string().max(500).optional(),
});

export const alertSchema = z.object({
  medicationId: z.string().uuid(),
  city: z.string().min(2),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  contactType: z.enum(['email', 'phone']),
  contactValue: z.string().min(5).max(255),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreatePharmacyInput = z.infer<typeof createPharmacySchema>;
export type UpdateStockInput = z.infer<typeof updateStockSchema>;
export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type AlertInput = z.infer<typeof alertSchema>;
