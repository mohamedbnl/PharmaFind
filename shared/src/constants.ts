export enum StockStatus {
  AVAILABLE = 'AVAILABLE',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  ARRIVING_SOON = 'ARRIVING_SOON',
}

export const STOCK_STATUS_DISPLAY: Record<
  StockStatus,
  { fr: string; ar: string; color: string; csvValue: string }
> = {
  [StockStatus.AVAILABLE]: { fr: 'Disponible', ar: 'متوفر', color: 'green', csvValue: 'Disponible' },
  [StockStatus.LOW_STOCK]: { fr: 'Stock faible', ar: 'مخزون منخفض', color: 'yellow', csvValue: 'Stock faible' },
  [StockStatus.OUT_OF_STOCK]: { fr: 'Indisponible', ar: 'غير متوفر', color: 'red', csvValue: 'Indisponible' },
  [StockStatus.ARRIVING_SOON]: { fr: 'Sur commande', ar: 'قيد الطلب', color: 'blue', csvValue: 'Sur commande' },
};

export const CSV_STATUS_TO_ENUM: Record<string, StockStatus> = {
  Disponible: StockStatus.AVAILABLE,
  'Stock faible': StockStatus.LOW_STOCK,
  Indisponible: StockStatus.OUT_OF_STOCK,
  'Sur commande': StockStatus.ARRIVING_SOON,
};

export enum UserRole {
  PHARMACIST = 'pharmacist',
  ADMIN = 'admin',
}

export const LOCALES = ['fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const FRESHNESS_THRESHOLDS = {
  VERIFIED_HOURS: 6,
  RECENT_HOURS: 24,
  POSSIBLY_OUTDATED_HOURS: 72,
} as const;
