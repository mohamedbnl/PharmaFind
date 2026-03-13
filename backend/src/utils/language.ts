export type SupportedLanguage = 'fr' | 'ar' | 'en' | 'darija';

export function normalizeLanguage(value?: string | null): SupportedLanguage {
  const v = (value ?? '').toLowerCase();
  if (v.startsWith('ar')) return 'ar';
  if (v.startsWith('fr')) return 'fr';
  if (v.startsWith('en')) return 'en';
  if (v.includes('darija') || v.includes('ma')) return 'darija';
  return 'fr';
}

export function isRtl(lang: string) {
  return lang === 'ar' || lang === 'darija';
}
