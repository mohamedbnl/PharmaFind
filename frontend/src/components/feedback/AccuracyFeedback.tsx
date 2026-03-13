'use client';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { api } from '@/lib/api';

interface Props {
  pharmacyId: string;
  stockId?: string;
  medicationId?: string;
}

export function AccuracyFeedback({ pharmacyId, stockId, medicationId }: Props) {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const [choice, setChoice] = useState<'accuracy_confirm' | 'accuracy_deny' | null>(null);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  async function submit(reportType: 'accuracy_confirm' | 'accuracy_deny') {
    setChoice(reportType);
    setStatus('loading');
    try {
      await api.post('/reports', { pharmacyId, stockId, medicationId, reportType, comment: comment || undefined });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'error') {
    return (
      <div className="card text-center py-4 text-sm text-red-500">
        {isAr ? 'حدث خطأ، حاول مجدداً' : 'Une erreur est survenue, réessayez'}
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="card text-center py-4 text-sm text-gray-500">
        {isAr ? 'شكراً على ملاحظتك ✓' : 'Merci pour votre retour ✓'}
      </div>
    );
  }

  return (
    <div className="card">
      <p className="text-sm font-medium text-gray-700 mb-3">
        {isAr ? 'هل كانت هذه المعلومات دقيقة؟' : 'Ces informations étaient-elles exactes ?'}
      </p>
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => submit('accuracy_confirm')}
          disabled={status === 'loading'}
          className={`flex-1 py-2 rounded-lg text-sm border transition ${
            choice === 'accuracy_confirm'
              ? 'bg-green-500 text-white border-green-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
          }`}
        >
          👍 {isAr ? 'نعم، دقيقة' : 'Oui, exact'}
        </button>
        <button
          onClick={() => submit('accuracy_deny')}
          disabled={status === 'loading'}
          className={`flex-1 py-2 rounded-lg text-sm border transition ${
            choice === 'accuracy_deny'
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'
          }`}
        >
          👎 {isAr ? 'لا، غير دقيقة' : 'Non, inexact'}
        </button>
      </div>
      {choice === 'accuracy_deny' && status === 'idle' && (
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={isAr ? 'ملاحظة اختيارية…' : 'Commentaire optionnel…'}
          className="input-field w-full text-sm resize-none h-16"
        />
      )}
    </div>
  );
}
