export type SupportedLanguage = 'fr' | 'ar';

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  const v = (value ?? '').toLowerCase();
  if (v.startsWith('ar')) return 'ar';
  // Any non-Arabic input falls back to French by default
  return 'fr';
}

export function isRtl(lang: string) {
  return lang === 'ar';
}
