import { prisma } from '../config/database';

export async function createReport(data: {
  pharmacyId: string;
  medicationId?: string;
  stockId?: string;
  reportType: string;
  comment?: string;
  reporterIp?: string;
}) {
  return prisma.citizenReport.create({ data });
}
