import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-gray-200 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        Page introuvable · الصفحة غير موجودة
      </h1>
      <p className="text-gray-500 mb-6">
        Cette page n&apos;existe pas ou a été déplacée.
        <br />
        هذه الصفحة غير موجودة أو تم نقلها.
      </p>
      <div className="flex gap-3">
        <Link href="/fr" className="btn-primary px-6 py-2">Accueil FR</Link>
        <Link href="/ar" className="btn-secondary px-6 py-2">الرئيسية AR</Link>
      </div>
    </div>
  );
}
