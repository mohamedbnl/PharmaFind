import { prisma } from '../config/database';
import { AppError } from '../utils/errors';
import { parsePagination, buildMeta } from '../utils/pagination';

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function autocompleteMedications(q: string, limit = 10) {
  if (!q || q.trim().length < 2) return [];

  const term = normalize(q.trim());

  const results = await prisma.medication.findMany({
    where: {
      OR: [
        { nameFr: { contains: term } },
        { nameAr: { contains: term } },
        { dci: { contains: term } },
        { genericNameFr: { contains: term } },
      ],
    },
    select: { id: true, nameFr: true, nameAr: true, dci: true, form: true, dosage: true },
    take: limit,
    orderBy: { nameFr: 'asc' },
  });

  return results;
}

export async function listMedications(query: Record<string, unknown>) {
  const { page, limit } = parsePagination(query);
  const q = String(query.q ?? '');
  const skip = (page - 1) * limit;

  const where = q
    ? {
        OR: [
          { nameFr: { contains: q } },
          { dci: { contains: q } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.medication.findMany({ where, skip, take: limit, orderBy: { nameFr: 'asc' } }),
    prisma.medication.count({ where }),
  ]);

  return { data, meta: buildMeta(total, { page, limit }) };
}

export async function getMedication(id: string) {
  const med = await prisma.medication.findUnique({ where: { id } });
  if (!med) throw new AppError('MEDICATION_NOT_FOUND', 404, `Medication ${id} not found`);
  return med;
}
