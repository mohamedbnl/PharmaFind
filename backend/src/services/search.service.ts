import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

const FRESHNESS = { VERIFIED: 6, RECENT: 24, POSSIBLY_OUTDATED: 72 };

interface SearchParams {
  q: string;
  lat?: number;
  lng?: number;
  radius?: number;
  status?: string;
  page?: number;
  limit?: number;
}

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function freshnessScore(lastConfirmedAt: Date): number {
  const h = (Date.now() - new Date(lastConfirmedAt).getTime()) / 3600000;
  if (h < FRESHNESS.VERIFIED) return 1;
  if (h < FRESHNESS.RECENT) return 2;
  if (h < FRESHNESS.POSSIBLY_OUTDATED) return 3;
  return 4;
}

export async function searchMedications(params: SearchParams) {
  const { q, lat, lng, radius = 5, status, page = 1, limit = 20 } = params;

  if (!q?.trim()) throw new AppError('MISSING_QUERY', 400, 'Search query is required');

  const term = normalize(q.trim());
  const hasLocation = lat != null && lng != null;
  const offset = (page - 1) * limit;

  // Step 1: find matching medications via LIKE
  const medications = await prisma.medication.findMany({
    where: {
      OR: [
        { nameFr: { contains: term } },
        { nameAr: { contains: term } },
        { dci: { contains: term } },
        { genericNameFr: { contains: term } },
      ],
    },
    select: {
      id: true, nameFr: true, nameAr: true, dci: true,
      form: true, dosage: true, requiresPrescription: true,
    },
    take: 10,
  });

  if (medications.length === 0) return [];

  const medIds = medications.map((m) => m.id);

  // Step 2: fetch stock for matched medications
  const stocks = await prisma.pharmacyStock.findMany({
    where: {
      medicationId: { in: medIds },
      ...(status ? { status } : {}),
      pharmacy: { isActive: true, deletedAt: null },
    },
    include: {
      pharmacy: {
        select: {
          id: true, nameFr: true, nameAr: true, slug: true, addressFr: true,
          city: true, latitude: true, longitude: true, phone: true, whatsapp: true,
          is24h: true, operatingHours: true, photoUrl: true,
        },
      },
      medication: {
        select: {
          id: true, nameFr: true, nameAr: true, dci: true,
          form: true, dosage: true, requiresPrescription: true,
        },
      },
    },
  });

  // Step 3: compute distance + filter by radius
  let results = stocks.map((s) => {
    const distanceKm = hasLocation
      ? haversineKm(lat!, lng!, s.pharmacy.latitude, s.pharmacy.longitude)
      : null;
    return { ...s, distanceKm };
  });

  if (hasLocation) {
    results = results.filter((r) => r.distanceKm! <= radius);
  }

  // Step 4: sort by distance then freshness
  results.sort((a, b) => {
    if (hasLocation) {
      const dd = a.distanceKm! - b.distanceKm!;
      if (Math.abs(dd) > 0.2) return dd;
    }
    return freshnessScore(a.lastConfirmedAt) - freshnessScore(b.lastConfirmedAt);
  });

  // Paginate
  const page_results = results.slice(offset, offset + limit);

  return page_results.map((r) => ({
    pharmacy: {
      id: r.pharmacy.id,
      nameFr: r.pharmacy.nameFr,
      nameAr: r.pharmacy.nameAr,
      slug: r.pharmacy.slug,
      addressFr: r.pharmacy.addressFr,
      city: r.pharmacy.city,
      latitude: r.pharmacy.latitude,
      longitude: r.pharmacy.longitude,
      phone: r.pharmacy.phone,
      whatsapp: r.pharmacy.whatsapp,
      is24h: r.pharmacy.is24h,
      operatingHours: typeof r.pharmacy.operatingHours === 'string' ? JSON.parse(r.pharmacy.operatingHours) : r.pharmacy.operatingHours,
      photoUrl: r.pharmacy.photoUrl,
    },
    stock: {
      id: r.id,
      status: r.status,
      quantite: r.quantite,
      estimatedRestockHours: r.estimatedRestockHours,
      lastConfirmedAt: r.lastConfirmedAt,
      notes: r.notes,
    },
    medication: {
      id: r.medication.id,
      nameFr: r.medication.nameFr,
      nameAr: r.medication.nameAr,
      dci: r.medication.dci,
      form: r.medication.form,
      dosage: r.medication.dosage,
      requiresPrescription: r.medication.requiresPrescription,
    },
    distanceKm: r.distanceKm,
    trgmScore: 1,
  }));
}

export async function getSearchSuggestions(q: string): Promise<string[]> {
  if (!q || q.trim().length < 2) return [];
  const logs = await prisma.searchLog.findMany({
    where: { query: { contains: q } },
    select: { query: true },
    distinct: ['query'],
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  return logs.map((l) => l.query);
}
