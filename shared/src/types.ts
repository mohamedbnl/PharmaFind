import type { StockStatus } from './constants';

export interface OperatingHours {
  monday?: DaySchedule | null;
  tuesday?: DaySchedule | null;
  wednesday?: DaySchedule | null;
  thursday?: DaySchedule | null;
  friday?: DaySchedule | null;
  saturday?: DaySchedule | null;
  sunday?: DaySchedule | null;
}

export interface DaySchedule {
  open: string;   // HH:mm
  close: string;  // HH:mm
  open2?: string;
  close2?: string;
}

export interface Pharmacy {
  id: string;
  osmId?: string;
  nameFr: string;
  nameAr: string;
  slug: string;
  addressFr: string;
  addressAr?: string;
  city: string;
  region: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp?: string;
  email?: string;
  operatingHours: OperatingHours;
  is24h: boolean;
  licenseNumber: string;
  isActive: boolean;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  nameFr: string;
  nameAr?: string;
  genericNameFr?: string;
  genericNameAr?: string;
  dci?: string;
  category?: string;
  form: string;
  dosage?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  barcode?: string;
}

export interface PharmacyStock {
  id: string;
  pharmacyId: string;
  medicationId: string;
  status: StockStatus;
  quantite: number;
  estimatedRestockHours: number;
  notes?: string;
  lastConfirmedAt: string;
  medication?: Medication;
  pharmacy?: Pharmacy;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  role: string;
  isVerified: boolean;
}

export interface FreshnessLevel {
  level: 'verified' | 'recent' | 'possibly_outdated' | 'unverified';
  color: 'green' | 'yellow' | 'orange' | 'red';
  labelFr: string;
  labelAr: string;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface SearchResult {
  pharmacy: Pharmacy;
  stock: PharmacyStock;
  distanceKm: number;
  isOpen: boolean;
  freshnessLevel: FreshnessLevel;
}
