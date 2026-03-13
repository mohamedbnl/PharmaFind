import { normalizeLanguage, SupportedLanguage } from './language';

export function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('No JSON object found in AI response');
    return JSON.parse(match[0]);
  }
}

export function buildSummary(params: {
  language?: string | null;
  total: number;
  found: number;
  unavailable: number;
  scenarioType?: 'single_pharmacy' | 'multi_pharmacy' | 'partial';
}) {
  const lang = normalizeLanguage(params.language);
  const { total, found, unavailable, scenarioType } = params;

  if (lang === 'ar') {
    const base = `لقينا ${found} من أصل ${total} أدوية.`;
    if (unavailable > 0) return `${base} كاين ${unavailable} ما لقيناهش.`;
    if (scenarioType === 'single_pharmacy') return `${base} أحسن حل تمشي لصيدلية وحدة.`;
    return `${base} غادي تحتاج تزور أكثر من صيدلية.`;
  }

  const base = `Nous avons trouvé ${found} médicaments sur ${total}.`;
  if (unavailable > 0) return `${base} ${unavailable} sont indisponibles à proximité.`;
  if (scenarioType === 'single_pharmacy') return `${base} Meilleure option: une seule pharmacie.`;
  return `${base} Il faudra probablement plusieurs pharmacies.`;
}

export function buildRequestDraft(params: { language?: string | null; items: string[] }) {
  const lang = normalizeLanguage(params.language);
  const list = params.items.join(', ');

  if (lang === 'ar') {
    return {
      language: lang,
      message: `سلام، بغيت هاد الأدوية وما لقيناهش: ${list}. واش ممكن تعاونوني؟`,
    };
  }
  return {
    language: lang,
    message: `Bonjour, je cherche ces médicaments mais je ne les ai pas trouvés: ${list}. Pouvez-vous m'aider ?`,
  };
}

export function pickPharmacyName(
  lang: SupportedLanguage,
  nameFr: string,
  nameAr: string | null,
) {
  return (lang === 'ar' || lang === 'darija') && nameAr ? nameAr : nameFr;
}
