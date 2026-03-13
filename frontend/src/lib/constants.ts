export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';
export const DEFAULT_LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'fr';
export const MAP_TILE_URL =
  process.env.NEXT_PUBLIC_MAP_TILE_URL ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const SEARCH_DEFAULT_RADIUS_KM = 5;
export const SEARCH_MAX_RADIUS_KM = 50;
export const LOCALES = ['fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
