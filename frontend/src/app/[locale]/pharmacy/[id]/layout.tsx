import type { Metadata } from 'next';
import { API_URL } from '@/lib/constants';

interface Props {
  params: { id: string; locale: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${API_URL}/pharmacies/${params.id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const { data } = await res.json();
    return {
      title: data.nameFr,
      description: `${data.nameFr} — ${data.addressFr}, ${data.city}. Consultez les médicaments disponibles.`,
      openGraph: {
        title: `${data.nameFr} | PharmaFind`,
        description: `Pharmacie ${data.nameFr} à ${data.city}. Médicaments disponibles en temps réel.`,
        type: 'website',
      },
    };
  } catch {
    return {};
  }
}

export default function PharmacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
