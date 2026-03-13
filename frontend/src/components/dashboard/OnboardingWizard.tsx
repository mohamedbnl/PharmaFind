'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

const DEFAULT_HOURS = {
  monday:    { open: '08:30', close: '20:00' },
  tuesday:   { open: '08:30', close: '20:00' },
  wednesday: { open: '08:30', close: '20:00' },
  thursday:  { open: '08:30', close: '20:00' },
  friday:    { open: '08:30', close: '12:30', open2: '14:30', close2: '20:00' },
  saturday:  { open: '09:00', close: '13:00' },
  sunday:    null,
} as const;

const DAYS = [
  { key: 'monday',    fr: 'Lundi',    ar: 'الاثنين' },
  { key: 'tuesday',   fr: 'Mardi',    ar: 'الثلاثاء' },
  { key: 'wednesday', fr: 'Mercredi', ar: 'الأربعاء' },
  { key: 'thursday',  fr: 'Jeudi',    ar: 'الخميس' },
  { key: 'friday',    fr: 'Vendredi', ar: 'الجمعة' },
  { key: 'saturday',  fr: 'Samedi',   ar: 'السبت' },
  { key: 'sunday',    fr: 'Dimanche', ar: 'الأحد' },
] as const;

export function OnboardingWizard() {
  const locale = useLocale();
  const router = useRouter();
  const isAr = locale === 'ar';
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    nameFr: '', nameAr: '', addressFr: '', city: 'Tanger',
    latitude: '', longitude: '', phone: '', whatsapp: '',
    licenseNumber: '', is24h: false,
  });

  const [hours, setHours] = useState<Record<string, { open: string; close: string } | null>>(
    Object.fromEntries(
      DAYS.map(({ key }) => [key, DEFAULT_HOURS[key] ? { open: (DEFAULT_HOURS[key] as { open: string; close: string }).open, close: (DEFAULT_HOURS[key] as { open: string; close: string }).close } : null])
    )
  );

  function setField(field: keyof typeof profile) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setProfile((p) => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  }

  async function handleCreate() {
    setLoading(true);
    setError('');
    try {
      await api.post('/pharmacies', {
        ...profile,
        latitude: parseFloat(profile.latitude),
        longitude: parseFloat(profile.longitude),
        operatingHours: profile.is24h ? {} : hours,
        region: profile.city,
      });
      router.push(`/${locale}/dashboard/stock`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message;
      setError(msg ?? (isAr ? 'حدث خطأ' : 'Une erreur est survenue'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              s === step ? 'bg-brand-600 text-white' : s < step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}>{s < step ? '✓' : s}</div>
            {s < 3 && <div className={`flex-1 h-0.5 w-8 ${s < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
        <span className="text-sm text-gray-500 ms-2">
          {step === 1 ? (isAr ? 'المعلومات الأساسية' : 'Informations de base')
            : step === 2 ? (isAr ? 'ساعات العمل' : 'Horaires')
            : (isAr ? 'التأكيد' : 'Confirmation')}
        </span>
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-lg">{isAr ? 'معلومات الصيدلية' : 'Informations de la pharmacie'}</h2>
          {[
            { key: 'nameFr', label_fr: 'Nom en français', label_ar: 'الاسم بالفرنسية', type: 'text', required: true },
            { key: 'nameAr', label_fr: 'Nom en arabe', label_ar: 'الاسم بالعربية', type: 'text', required: false },
            { key: 'addressFr', label_fr: 'Adresse complète', label_ar: 'العنوان الكامل', type: 'text', required: true },
            { key: 'city', label_fr: 'Ville', label_ar: 'المدينة', type: 'text', required: true },
            { key: 'latitude', label_fr: 'Latitude GPS', label_ar: 'خط العرض', type: 'number', required: true },
            { key: 'longitude', label_fr: 'Longitude GPS', label_ar: 'خط الطول', type: 'number', required: true },
            { key: 'phone', label_fr: 'Téléphone', label_ar: 'الهاتف', type: 'tel', required: true },
            { key: 'whatsapp', label_fr: 'WhatsApp (optionnel)', label_ar: 'واتساب (اختياري)', type: 'tel', required: false },
            { key: 'licenseNumber', label_fr: 'Numéro de licence CNOP', label_ar: 'رقم ترخيص CNOP', type: 'text', required: true },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? f.label_ar : f.label_fr}
              </label>
              <input
                type={f.type}
                value={profile[f.key as keyof typeof profile] as string}
                onChange={setField(f.key as keyof typeof profile)}
                className="input-field w-full"
                required={f.required}
                step={f.type === 'number' ? 'any' : undefined}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={profile.is24h} onChange={setField('is24h')} />
            <span className="text-sm">{isAr ? 'مفتوح 24/24' : 'Ouvert 24h/24'}</span>
          </label>
          <button onClick={() => setStep(2)} className="btn-primary w-full py-2.5">
            {isAr ? 'التالي' : 'Suivant'}
          </button>
        </div>
      )}

      {/* Step 2: Hours */}
      {step === 2 && (
        <div className="card space-y-3">
          <h2 className="font-bold text-lg">{isAr ? 'ساعات العمل' : "Horaires d'ouverture"}</h2>
          {profile.is24h ? (
            <p className="text-green-600">{isAr ? 'مفتوح 24 ساعة' : 'Ouvert 24h/24 — aucune configuration nécessaire'}</p>
          ) : (
            DAYS.map(({ key, fr, ar }) => {
              const schedule = hours[key];
              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={!!schedule}
                    onChange={(e) => setHours((h) => ({ ...h, [key]: e.target.checked ? { open: '08:30', close: '20:00' } : null }))}
                  />
                  <span className="w-24 text-gray-700">{isAr ? ar : fr}</span>
                  {schedule && (
                    <>
                      <input type="time" value={schedule.open} onChange={(e) => setHours((h) => ({ ...h, [key]: { ...h[key]!, open: e.target.value } }))} className="input-field py-1 px-2 text-xs w-28" />
                      <span>–</span>
                      <input type="time" value={schedule.close} onChange={(e) => setHours((h) => ({ ...h, [key]: { ...h[key]!, close: e.target.value } }))} className="input-field py-1 px-2 text-xs w-28" />
                    </>
                  )}
                </div>
              );
            })
          )}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-2">
              {isAr ? 'رجوع' : 'Retour'}
            </button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1 py-2">
              {isAr ? 'التالي' : 'Suivant'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <div className="card space-y-4">
          <h2 className="font-bold text-lg">{isAr ? 'تأكيد التسجيل' : 'Confirmation'}</h2>
          <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-2">
            <p><span className="font-medium">{isAr ? 'الاسم:' : 'Nom:'}</span> {profile.nameFr}</p>
            <p><span className="font-medium">{isAr ? 'العنوان:' : 'Adresse:'}</span> {profile.addressFr}</p>
            <p><span className="font-medium">{isAr ? 'المدينة:' : 'Ville:'}</span> {profile.city}</p>
            <p><span className="font-medium">{isAr ? 'الهاتف:' : 'Téléphone:'}</span> {profile.phone}</p>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-2">
              {isAr ? 'رجوع' : 'Retour'}
            </button>
            <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 py-2">
              {loading ? '…' : (isAr ? 'تسجيل الصيدلية' : 'Créer la pharmacie')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
