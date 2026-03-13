import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

export async function getPharmacyStock(pharmacyId: string) {
  return prisma.pharmacyStock.findMany({
    where: { pharmacyId },
    include: { medication: { select: { id: true, nameFr: true, nameAr: true, dci: true, form: true, dosage: true, requiresPrescription: true } } },
    orderBy: { lastConfirmedAt: 'desc' },
  });
}

export async function addStock(data: {
  pharmacyId: string;
  medicationId: string;
  status: string;
  quantite?: number;
  notes?: string;
}) {
  const med = await prisma.medication.findUnique({ where: { id: data.medicationId } });
  if (!med) throw new AppError('MEDICATION_NOT_FOUND', 404, 'Medication not found');

  return prisma.pharmacyStock.upsert({
    where: { pharmacyId_medicationId: { pharmacyId: data.pharmacyId, medicationId: data.medicationId } },
    update: { status: data.status, quantite: data.quantite ?? 0, notes: data.notes, lastConfirmedAt: new Date() },
    create: {
      pharmacyId: data.pharmacyId,
      medicationId: data.medicationId,
      status: data.status,
      quantite: data.quantite ?? 0,
      notes: data.notes,
      lastConfirmedAt: new Date(),
    },
  });
}

export async function updateStock(id: string, userId: string, data: {
  status?: string;
  quantite?: number;
  notes?: string;
  estimatedRestockHours?: number;
}) {
  const stock = await prisma.pharmacyStock.findUnique({
    where: { id },
    include: { pharmacy: { select: { userId: true } } },
  });
  if (!stock) throw new AppError('STOCK_NOT_FOUND', 404, 'Stock entry not found');
  if (stock.pharmacy.userId !== userId) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy');

  return prisma.pharmacyStock.update({
    where: { id },
    data: { ...data, lastConfirmedAt: new Date() },
  });
}

const VALID_STATUSES = new Set(['AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK', 'ARRIVING_SOON']);

export async function bulkUpdateStock(pharmacyId: string, userId: string, updates: Array<{ id: string; status: string }>) {
  const pharmacy = await prisma.pharmacy.findFirst({ where: { id: pharmacyId, userId } });
  if (!pharmacy) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy');

  // Validate all items belong to this pharmacy before updating any
  const ids = updates.map((u) => u.id);
  const existing = await prisma.pharmacyStock.findMany({ where: { id: { in: ids }, pharmacyId }, select: { id: true } });
  if (existing.length !== ids.length) throw new AppError('FORBIDDEN', 403, 'Some stock items do not belong to your pharmacy');

  // Validate statuses
  const invalidStatus = updates.find((u) => !VALID_STATUSES.has(u.status));
  if (invalidStatus) throw new AppError('VALIDATION_ERROR', 400, `Invalid status: ${invalidStatus.status}`);

  const now = new Date();
  await prisma.$transaction(
    updates.map((u) =>
      prisma.pharmacyStock.update({
        where: { id: u.id },
        data: { status: u.status, lastConfirmedAt: now },
      })
    )
  );
  return { updated: updates.length };
}

export async function confirmAllStock(pharmacyId: string, userId: string) {
  const pharmacy = await prisma.pharmacy.findFirst({ where: { id: pharmacyId, userId } });
  if (!pharmacy) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy');

  const result = await prisma.pharmacyStock.updateMany({
    where: { pharmacyId },
    data: { lastConfirmedAt: new Date() },
  });
  return { confirmed: result.count };
}

export async function removeStock(id: string, userId: string) {
  const stock = await prisma.pharmacyStock.findUnique({
    where: { id },
    include: { pharmacy: { select: { userId: true } } },
  });
  if (!stock) throw new AppError('STOCK_NOT_FOUND', 404, 'Stock entry not found');
  if (stock.pharmacy.userId !== userId) throw new AppError('FORBIDDEN', 403, 'Not your pharmacy');

  return prisma.pharmacyStock.delete({ where: { id } });
}
