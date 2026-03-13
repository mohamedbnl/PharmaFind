import { prisma } from '../config/database';
import { AppError } from '../utils/errors';

const ALERT_TTL_DAYS = 7;

export async function createAlert(data: {
  medicationId: string;
  city: string;
  lat?: number;
  lng?: number;
  contactType: 'email' | 'phone';
  contactValue: string;
}) {
  const med = await prisma.medication.findUnique({ where: { id: data.medicationId } });
  if (!med) throw new AppError('MEDICATION_NOT_FOUND', 404, 'Medication not found');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ALERT_TTL_DAYS);

  return prisma.alert.create({
    data: {
      medicationId: data.medicationId,
      city: data.city,
      latitude: data.lat,
      longitude: data.lng,
      contactType: data.contactType,
      contactValue: data.contactValue,
      expiresAt,
    },
  });
}

export async function getAlert(id: string) {
  const alert = await prisma.alert.findUnique({
    where: { id },
    include: { medication: { select: { id: true, nameFr: true, nameAr: true } } },
  });
  if (!alert) throw new AppError('ALERT_NOT_FOUND', 404, 'Alert not found');
  return alert;
}

export async function cancelAlert(id: string) {
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) throw new AppError('ALERT_NOT_FOUND', 404, 'Alert not found');
  return prisma.alert.update({ where: { id }, data: { isActive: false } });
}
