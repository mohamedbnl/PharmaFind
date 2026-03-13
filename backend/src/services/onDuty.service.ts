import { prisma } from '../config/database';

export async function getOnDutyPharmacies(params: {
  city?: string;
  date?: string;
  lat?: number;
  lng?: number;
}) {
  const { city, date, lat, lng } = params;

  // Target date/time in Morocco timezone
  const targetDate = date ? new Date(date) : new Date();
  // Normalize to date-only for duty_date comparison
  const dateStart = new Date(targetDate);
  dateStart.setHours(0, 0, 0, 0);
  const dateEnd = new Date(dateStart);
  dateEnd.setDate(dateEnd.getDate() + 1);

  const schedules = await prisma.onDutySchedule.findMany({
    where: {
      dutyDate: { gte: dateStart, lt: dateEnd },
      ...(city ? { city: { contains: city } } : {}),
    },
    include: {
      pharmacy: {
        select: {
          id: true, nameFr: true, nameAr: true, slug: true,
          addressFr: true, city: true, phone: true, whatsapp: true,
          latitude: true, longitude: true, is24h: true,
        },
      },
    },
    orderBy: { dutyDate: 'asc' },
  });

  // Optionally sort by distance if lat/lng provided
  if (lat != null && lng != null) {
    schedules.sort((a, b) => {
      const dA = Math.hypot(Number(a.pharmacy.latitude) - lat, Number(a.pharmacy.longitude) - lng);
      const dB = Math.hypot(Number(b.pharmacy.latitude) - lat, Number(b.pharmacy.longitude) - lng);
      return dA - dB;
    });
  }

  return schedules.map((s) => ({
    scheduleId: s.id,
    dutyDate: s.dutyDate,
    startTime: s.startTime,
    endTime: s.endTime,
    isOvernight: s.isOvernight,
    pharmacy: s.pharmacy,
    distanceKm: lat != null && lng != null
      ? Math.hypot(Number(s.pharmacy.latitude) - lat, Number(s.pharmacy.longitude) - lng) * 111
      : null,
  }));
}
