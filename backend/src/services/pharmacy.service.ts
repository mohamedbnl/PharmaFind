import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

interface CreatePharmacyInput {
  userId: string;
  nameFr: string;
  nameAr: string;
  addressFr: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  phone: string;
  whatsapp?: string;
  operatingHours: Record<string, unknown>;
  is24h?: boolean;
  licenseNumber: string;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 6);
}

function parseHours(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch { return {}; }
}

export async function createPharmacy(input: CreatePharmacyInput) {
  const existing = await prisma.pharmacy.findFirst({ where: { userId: input.userId, deletedAt: null } });
  if (existing) throw new AppError('PHARMACY_EXISTS', 409, 'You already have a registered pharmacy');

  return prisma.pharmacy.create({
    data: {
      userId: input.userId,
      nameFr: input.nameFr,
      nameAr: input.nameAr,
      slug: toSlug(input.nameFr),
      addressFr: input.addressFr,
      city: input.city,
      region: input.region,
      latitude: input.latitude,
      longitude: input.longitude,
      phone: input.phone,
      whatsapp: input.whatsapp,
      operatingHours: JSON.stringify(input.operatingHours),
      is24h: input.is24h ?? false,
      licenseNumber: input.licenseNumber,
    },
  });
}

export async function getPharmacy(id: string) {
  const pharmacy = await prisma.pharmacy.findFirst({
    where: { id, isActive: true, deletedAt: null },
    include: {
      stock: {
        include: { medication: true },
        orderBy: { lastConfirmedAt: 'desc' },
      },
      onDutySchedules: {
        where: { dutyDate: { gte: new Date(Date.now() - 86400000) } },
        orderBy: { dutyDate: 'asc' },
        take: 3,
      },
    },
  });
  if (!pharmacy) throw new AppError('PHARMACY_NOT_FOUND', 404, 'Pharmacy not found');
  return { ...pharmacy, operatingHours: parseHours(pharmacy.operatingHours) };
}

export async function getPharmacyAnalytics(pharmacyId: string, userId: string) {
  const pharmacy = await prisma.pharmacy.findFirst({ where: { id: pharmacyId, userId, deletedAt: null } });
  if (!pharmacy) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy');

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const [totalSearches, recentSearches, stockCount, topQueries] = await Promise.all([
    prisma.searchLog.count({ where: { selectedPharmacyId: pharmacyId } }),
    prisma.searchLog.count({ where: { selectedPharmacyId: pharmacyId, createdAt: { gte: sevenDaysAgo } } }),
    prisma.pharmacyStock.count({ where: { pharmacyId } }),
    prisma.searchLog.groupBy({
      by: ['query'],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { query: true },
      orderBy: { _count: { query: 'desc' } },
      take: 5,
    }),
  ]);

  return { totalSearches, recentSearches, stockCount, topQueries: topQueries.map((q) => ({ query: q.query, count: q._count.query })) };
}

export async function updatePharmacy(id: string, userId: string, input: Partial<{
  nameFr: string; nameAr: string; addressFr: string; city: string; region: string;
  phone: string; whatsapp: string; email: string; is24h: boolean;
  operatingHours: Record<string, unknown>; photoUrl: string;
}>) {
  const pharmacy = await prisma.pharmacy.findFirst({ where: { id, userId, deletedAt: null } });
  if (!pharmacy) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy or not found');

  const data = {
    ...input,
    ...(input.operatingHours ? { operatingHours: JSON.stringify(input.operatingHours) } : {}),
  };
  return prisma.pharmacy.update({ where: { id }, data });
}

export async function getMyPharmacy(userId: string) {
  const pharmacy = await prisma.pharmacy.findFirst({
    where: { userId, deletedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!pharmacy) return null;
  return { ...pharmacy, operatingHours: parseHours(pharmacy.operatingHours) };
}

export async function listPharmacies(params: {
  city?: string;
  page?: number;
  limit?: number;
}) {
  const { city, page = 1, limit = 20 } = params;
  const where = {
    isActive: true,
    deletedAt: null,
    ...(city ? { city: { contains: city } } : {}),
  };
  const [pharmacies, total] = await Promise.all([
    prisma.pharmacy.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { nameFr: 'asc' },
      select: {
        id: true, nameFr: true, nameAr: true, slug: true, city: true,
        addressFr: true, phone: true, whatsapp: true, is24h: true,
        latitude: true, longitude: true, photoUrl: true,
      },
    }),
    prisma.pharmacy.count({ where }),
  ]);
  return { pharmacies, total };
}
