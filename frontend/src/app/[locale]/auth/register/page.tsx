'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

export default function RegisterPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    licenseNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push(`/${locale}/dashboard`);
    } catch {
      setError(isAr ? 'حدث خطأ أثناء التسجيل' : "Une erreur est survenue lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  const fields: { key: keyof typeof form; label_fr: string; label_ar: string; type: string; placeholder?: string }[] = [
    { key: 'fullName', label_fr: 'Nom complet', label_ar: 'الاسم الكامل', type: 'text' },
    { key: 'email', label_fr: 'Email professionnel', label_ar: 'البريد المهني', type: 'email' },
    { key: 'password', label_fr: 'Mot de passe (min. 8 caractères)', label_ar: 'كلمة المرور (8 أحرف على الأقل)', type: 'password' },
    { key: 'phone', label_fr: 'Téléphone (+212…)', label_ar: 'الهاتف (+212…)', type: 'tel', placeholder: '+212600000000' },
    { key: 'licenseNumber', label_fr: 'Numéro de licence CNOP', label_ar: 'رقم ترخيص CNOP', type: 'text' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAr ? 'تسجيل صيدلية جديدة' : 'Inscrire ma pharmacie'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAr ? 'مجاني تماماً، ويستغرق أقل من 5 دقائق' : 'Gratuit · Moins de 5 minutes'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isAr ? f.label_ar : f.label_fr}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="input-field w-full"
                required
                minLength={f.key === 'password' ? 8 : undefined}
              />
            </div>
          ))}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? '…' : (isAr ? 'إنشاء حساب' : 'Créer mon compte')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isAr ? 'لديك حساب؟ ' : 'Déjà un compte ? '}
          <Link href={`/${locale}/auth/login`} className="text-brand-600 hover:underline">
            {isAr ? 'تسجيل الدخول' : 'Connectez-vous'}
          </Link>
        </p>
      </div>
    </div>
  );
}
