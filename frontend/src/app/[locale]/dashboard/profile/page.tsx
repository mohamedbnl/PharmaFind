'use client';
import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePharmacy } from '@/hooks/usePharmacies';
import { usePharmacyId } from '@/hooks/usePharmacyId';
import { api } from '@/lib/api';

const DAYS = [
  { key: 'monday',    fr: 'Lundi',    ar: 'الاثنين' },
  { key: 'tuesday',   fr: 'Mardi',    ar: 'الثلاثاء' },
  { key: 'wednesday', fr: 'Mercredi', ar: 'الأربعاء' },
  { key: 'thursday',  fr: 'Jeudi',    ar: 'الخميس' },
  { key: 'friday',    fr: 'Vendredi', ar: 'الجمعة' },
  { key: 'saturday',  fr: 'Samedi',   ar: 'السبت' },
  { key: 'sunday',    fr: 'Dimanche', ar: 'الأحد' },
] as const;

export default function ProfilePage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const pharmacyId = usePharmacyId();
  const { data: pharmacy, isLoading } = usePharmacy(pharmacyId);

  const [form, setForm] = useState({ nameFr: '', nameAr: '', addressFr: '', city: '', phone: '', whatsapp: '', email: '', is24h: false });
  const [hours, setHours] = useState<Record<string, { open: string; close: string } | null>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!pharmacy) return;
    setForm({
      nameFr: pharmacy.nameFr, nameAr: pharmacy.nameAr,
      addressFr: pharmacy.addressFr, city: pharmacy.city,
      phone: pharmacy.phone, whatsapp: pharmacy.whatsapp ?? '',
      email: pharmacy.email ?? '', is24h: pharmacy.is24h,
    });
    const h: Record<string, { open: string; close: string } | null> = {};
    for (const { key } of DAYS) {
      const s = pharmacy.operatingHours[key];
      h[key] = s ? { open: s.open, close: s.close, ...(s.open2 ? { open2: s.open2, close2: s.close2 } : {}) } : null;
    }
    setHours(h);
  }, [pharmacy]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(''); setSaved(false);
    try {
      await api.put(`/pharmacies/${pharmacyId}`, { ...form, operatingHours: form.is24h ? {} : hours });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError(isAr ? 'حدث خطأ' : 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse space-y-3">{[1,2,3].map(i=><div key={i} className="h-10 bg-gray-200 rounded"/>)}</div>;
  if (!pharmacyId || !pharmacy) return <div className="max-w-2xl mx-auto px-4 py-8 text-gray-400 text-center">{isAr ? 'لا توجد صيدلية' : 'Aucune pharmacie'}</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isAr ? 'الملف الشخصي' : 'Profil de la pharmacie'}</h1>
      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic info */}
        <div className="card space-y-4">
          <h2 className="font-semibold">{isAr ? 'المعلومات الأساسية' : 'Informations générales'}</h2>
          {[
            { key: 'nameFr', lf: 'Nom (français)', la: 'الاسم (فرنسي)' },
            { key: 'nameAr', lf: 'Nom (arabe)', la: 'الاسم (عربي)' },
            { key: 'addressFr', lf: 'Adresse', la: 'العنوان' },
            { key: 'city', lf: 'Ville', la: 'المدينة' },
            { key: 'phone', lf: 'Téléphone', la: 'الهاتف' },
            { key: 'whatsapp', lf: 'WhatsApp', la: 'واتساب' },
            { key: 'email', lf: 'Email', la: 'البريد الإلكتروني' },
          ].map(({ key, lf, la }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? la : lf}</label>
              <input
                type="text"
                value={form[key as keyof typeof form] as string}
                onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))}
                className="input-field w-full"
              />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.is24h} onChange={(e) => setForm(f => ({ ...f, is24h: e.target.checked }))} />
            <span className="text-sm">{isAr ? 'مفتوح 24/24' : 'Ouvert 24h/24'}</span>
          </label>
        </div>

        {/* Hours */}
        {!form.is24h && (
          <div className="card space-y-3">
            <h2 className="font-semibold">{isAr ? 'ساعات العمل' : "Horaires d'ouverture"}</h2>
            {DAYS.map(({ key, fr, ar }) => {
              const s = hours[key];
              return (
                <div key={key} className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={!!s} onChange={(e) => setHours(h => ({ ...h, [key]: e.target.checked ? { open: '08:30', close: '20:00' } : null }))} />
                  <span className="w-24 text-gray-700">{isAr ? ar : fr}</span>
                  {s && (
                    <>
                      <input type="time" value={s.open} onChange={(e) => setHours(h => ({ ...h, [key]: { ...h[key]!, open: e.target.value } }))} className="input-field py-1 px-2 text-xs w-28" />
                      <span>–</span>
                      <input type="time" value={s.close} onChange={(e) => setHours(h => ({ ...h, [key]: { ...h[key]!, close: e.target.value } }))} className="input-field py-1 px-2 text-xs w-28" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
        {saved && <p className="text-sm text-green-600">{isAr ? 'تم الحفظ ✓' : 'Enregistré ✓'}</p>}

        <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">
          {saving ? '…' : (isAr ? 'حفظ التغييرات' : 'Enregistrer les modifications')}
        </button>
      </form>
    </div>
  );
}
