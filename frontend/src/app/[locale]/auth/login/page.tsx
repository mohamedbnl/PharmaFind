'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const locale = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push(`/${locale}/dashboard`);
    } catch {
      setError(isAr ? 'البريد أو كلمة المرور غير صحيحة' : 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {isAr ? 'تسجيل الدخول' : 'Connexion'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isAr ? 'مرحباً بعودتك' : 'Bon retour sur PharmaFind'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isAr ? 'البريد الإلكتروني' : 'Email'}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isAr ? 'كلمة المرور' : 'Mot de passe'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
              required
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? '…' : (isAr ? 'دخول' : 'Se connecter')}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          {isAr ? 'ليس لديك حساب؟ ' : 'Pas encore de compte ? '}
          <Link href={`/${locale}/auth/register`} className="text-brand-600 hover:underline">
            {isAr ? 'سجّل هنا' : 'Inscrivez-vous'}
          </Link>
        </p>
      </div>
    </div>
  );
}
