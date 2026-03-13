'use client';
import { useState, Component } from 'react';
import type { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { analyzeMedications } from '@/lib/ai';
import type { AiResponse } from '@/types/ai';
import { PrescriptionUpload } from './PrescriptionUpload';
import { AISummaryCard } from './AISummaryCard';
import { ScenarioCard } from './ScenarioCard';
import { UnavailableDraftEditor } from './UnavailableDraftEditor';
import { SearchResults } from '@/components/search/SearchResults';

const PharmacyMap = dynamic(
  () => import('@/components/map/PharmacyMap').then((m) => m.PharmacyMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
        Chargement de la carte…
      </div>
    ),
  },
);

class MapErrorBoundary extends Component<{ children: ReactNode }, { crashed: boolean }> {
  state = { crashed: false };
  static getDerivedStateFromError() { return { crashed: true }; }
  render() {
    if (this.state.crashed) {
      return (
        <div className="h-full flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm">
          Carte indisponible
        </div>
      );
    }
    return this.props.children;
  }
}

type Props = {
  userLocation?: { latitude: number; longitude: number };
};

const labelsByLocale: Record<string, {
  title: string;
  description: string;
  textLabel: string;
  textPlaceholder: string;
  uploadLabel: string;
  submit: string;
  loading: string;
  empty: string;
  extracted: string;
  draftLabel: string;
  missingInput: string;
  failed: string;
  summaryTitle: string;
  scenarioTitle: string;
  scenarioType: string;
  scenarioDistance: string;
  scenarioPharmacies: string;
  draftNote: string;
}> = {
  ar: {
    title: 'المساعد الذكي',
    description: 'أدخل نصاً أو ارفع صورة الوصفة لاستخراج الأدوية.',
    textLabel: 'الطلب',
    textPlaceholder: 'مثال: بغيت دوليبران 1000 و أوجمنتين 1غ',
    uploadLabel: 'صورة الوصفة',
    submit: 'حلل الطلب',
    loading: 'جاري التحليل...',
    empty: 'لم يتم العثور على نتائج بعد.',
    extracted: 'الأدوية المستخرجة',
    draftLabel: 'طلب غير متوفر',
    missingInput: 'من فضلك أدخل نصاً أو صورة.',
    failed: 'حدث خطأ أثناء التحليل.',
    summaryTitle: 'الملخص',
    scenarioTitle: 'أفضل سيناريو',
    scenarioType: 'النوع',
    scenarioDistance: 'المسافة الإجمالية',
    scenarioPharmacies: 'عدد الصيدليات',
    draftNote: 'يمكنك تعديل هذا النص قبل مشاركته.',
  },
  en: {
    title: 'AI Assistant',
    description: 'Enter text or upload a prescription to extract medications.',
    textLabel: 'Request',
    textPlaceholder: 'Example: I need Doliprane 1000 and Augmentin 1g',
    uploadLabel: 'Prescription image',
    submit: 'Analyze',
    loading: 'Analyzing...',
    empty: 'No AI results yet.',
    extracted: 'Extracted medications',
    draftLabel: 'Unavailable request draft',
    missingInput: 'Please provide text or an image.',
    failed: 'Analysis failed.',
    summaryTitle: 'Summary',
    scenarioTitle: 'Recommended scenario',
    scenarioType: 'Type',
    scenarioDistance: 'Total distance',
    scenarioPharmacies: 'Pharmacies',
    draftNote: 'You can edit this message before sharing.',
  },
  fr: {
    title: 'Assistant IA',
    description: 'Entrez un texte ou une photo d’ordonnance pour extraire les médicaments.',
    textLabel: 'Demande',
    textPlaceholder: 'Ex: Je cherche Doliprane 1000 et Augmentin 1g',
    uploadLabel: 'Image de l’ordonnance',
    submit: 'Analyser',
    loading: 'Analyse en cours...',
    empty: 'Aucun résultat IA pour le moment.',
    extracted: 'Médicaments détectés',
    draftLabel: 'Brouillon de demande',
    missingInput: 'Veuillez saisir un texte ou une image.',
    failed: 'Erreur lors de l’analyse.',
    summaryTitle: 'Résumé',
    scenarioTitle: 'Scénario recommandé',
    scenarioType: 'Type',
    scenarioDistance: 'Distance totale',
    scenarioPharmacies: 'Pharmacies',
    draftNote: 'Vous pouvez modifier ce message avant de le partager.',
  },
};

export function AIAssistantPanel({ userLocation }: Props) {
  const locale = useLocale();
  const labels = labelsByLocale[locale] ?? labelsByLocale.fr;
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AiResponse | null>(null);
  const [draft, setDraft] = useState('');

  const handleSubmit = async () => {
    if (!text.trim() && !file) {
      setError(labels.missingInput);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeMedications({
        text,
        image: file,
        userLocation,
        language: locale as 'fr' | 'ar' | 'en' | 'darija',
      });
      setResponse(data);
      setDraft(data.generatedRequestDraft?.message ?? '');
    } catch (err) {
      setError((err as Error).message ?? labels.failed);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <div className="card space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{labels.title}</h2>
          <p className="text-sm text-gray-500 mt-1">{labels.description}</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">{labels.textLabel}</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={labels.textPlaceholder}
            className="w-full min-h-[96px] border border-gray-200 rounded-md p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>

        <PrescriptionUpload file={file} onChange={setFile} label={labels.uploadLabel} />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary px-4 py-2 text-sm"
          >
            {loading ? labels.loading : labels.submit}
          </button>
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
      </div>

      {response ? (
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-900">{labels.extracted}</h3>
            <div className="flex flex-wrap gap-2 mt-3">
              {response.medications.map((m) => (
                <span key={m.cleanedName + m.rawText} className={`text-xs px-2 py-1 rounded-full ${m.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {m.cleanedName || m.rawText}
                </span>
              ))}
            </div>
          </div>

          <AISummaryCard summary={response.summary} title={labels.summaryTitle} />
          <ScenarioCard
            scenario={response.recommendedScenario}
            title={labels.scenarioTitle}
            typeLabel={labels.scenarioType}
            distanceLabel={labels.scenarioDistance}
            pharmacyLabel={labels.scenarioPharmacies}
          />

          {response.generatedRequestDraft && (
            <UnavailableDraftEditor
              value={draft}
              onChange={setDraft}
              label={labels.draftLabel}
              note={labels.draftNote}
            />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SearchResults
              results={response.combinedResults}
              isLoading={false}
              error={null}
              query={text.trim() || response.medications.map((m) => m.cleanedName || m.rawText).join(', ')}
              userLocation={userLocation}
            />
            <div className="hidden lg:block h-[420px] rounded-xl overflow-hidden">
              {response.combinedResults.length > 0 && (
                <MapErrorBoundary>
                  <PharmacyMap
                    results={response.combinedResults}
                    userLat={userLocation?.latitude}
                    userLng={userLocation?.longitude}
                  />
                </MapErrorBoundary>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card text-center py-6 text-gray-400 text-sm">{labels.empty}</div>
      )}
    </div>
  );
}
