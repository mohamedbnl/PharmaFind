'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';

interface Props {
  medicationId: string;
  medicationName: string;
  city?: string;
  lat?: number | null;
  lng?: number | null;
  onSuccess?: () => void;
}

export function AlertSignupForm({ medicationId, medicationName, city = 'Tanger', lat, lng, onSuccess }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [contactType, setContactType] = useState<'email' | 'phone'>('email');
  const [contactValue, setContactValue] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactValue.trim()) return;
    setStatus('loading');
    try {
      await api.post('/alerts', {
        medicationId,
        city,
        lat,
        lng,
        contactType,
        contactValue: contactValue.trim(),
      });
      setStatus('success');
      onSuccess?.();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="card text-center py-6">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-semibold text-green-700">
          {isAr ? 'تم تسجيل التنبيه!' : 'Alerte enregistrée !'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {isAr
            ? `سنخبرك عند توفر ${medicationName}`
            : `Nous vous notifierons dès que ${medicationName} sera disponible`}
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-gray-900 mb-1">
        {isAr ? 'أعلمني عند التوفر' : 'Me notifier quand disponible'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {isAr
          ? `سنرسل لك إشعاراً عند توفر ${medicationName} في صيدلية قريبة`
          : `Recevez une notification dès que ${medicationName} est disponible près de vous`}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Contact type toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setContactType('email')}
            className={`flex-1 py-2 rounded-lg text-sm border transition ${
              contactType === 'email'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
            }`}
          >
            {isAr ? 'بريد إلكتروني' : 'Email'}
          </button>
          <button
            type="button"
            onClick={() => setContactType('phone')}
            className={`flex-1 py-2 rounded-lg text-sm border transition ${
              contactType === 'phone'
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
            }`}
          >
            {isAr ? 'رقم الهاتف' : 'Téléphone'}
          </button>
        </div>

        <input
          type={contactType === 'email' ? 'email' : 'tel'}
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          placeholder={contactType === 'email'
            ? (isAr ? 'بريدك الإلكتروني' : 'Votre email')
            : (isAr ? 'رقم هاتفك' : 'Votre numéro')}
          className="input-field w-full"
          required
        />

        {status === 'error' && (
          <p className="text-xs text-red-500">
            {isAr ? 'حدث خطأ، حاول مجدداً' : 'Une erreur est survenue, réessayez'}
          </p>
        )}

        <button
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary w-full py-2"
        >
          {status === 'loading'
            ? (isAr ? 'جارٍ التسجيل…' : 'Enregistrement…')
            : (isAr ? 'أعلمني' : 'Me notifier')}
        </button>
      </form>
    </div>
  );
}
