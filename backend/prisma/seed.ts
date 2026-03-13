import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { CSV_STATUS_TO_ENUM } from '../../shared/src/constants';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

const CSV_DIR = path.resolve(__dirname, '../..');

// ── CSV parser (handles quoted fields) ──────────────────────────────────────
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; continue; }
    if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue; }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

async function readCsv(filePath: string): Promise<Record<string, string>[]> {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath), crlfDelay: Infinity });
  const rows: Record<string, string>[] = [];
  let headers: string[] = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    if (headers.length === 0) { headers = parseCsvLine(line); continue; }
    const vals = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] ?? ''; });
    rows.push(row);
  }
  return rows;
}

// ── Split bilingual pharmacy name ─────────────────────────────────────────
function splitBilingualName(combined: string): { nameFr: string; nameAr: string } {
  // Arabic Unicode range: \u0600-\u06FF
  const arabicStart = combined.search(/[\u0600-\u06FF]/);
  if (arabicStart === -1) return { nameFr: combined.trim(), nameAr: combined.trim() };
  const nameFr = combined.slice(0, arabicStart).trim();
  const nameAr = combined.slice(arabicStart).trim();
  return { nameFr: nameFr || nameAr, nameAr };
}

// ── Expand flat open/close times to JSONB operating_hours ────────────────
function expandOperatingHours(openTime: string, closeTime: string, typeGarde: string) {
  if (typeGarde === 'garde_24h') {
    return {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' },
    };
  }
  const schedule = { open: openTime || '08:30', close: closeTime || '20:00' };
  return {
    monday: schedule,
    tuesday: schedule,
    wednesday: schedule,
    thursday: schedule,
    friday: schedule,
    saturday: { open: openTime || '09:00', close: '13:00' },
    sunday: null,
  };
}

function slugify(text: string, id: number): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60) +
    '-' +
    id
  );
}

// ── Main seed ────────────────────────────────────────────────────────────
async function main() {
  console.warn('🌱 Starting seed...');

  // ── 1. Seed system admin user ──────────────────────────────────────────
  const adminEmail = 'admin@pharmafind.ma';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  let systemUserId: string;

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword('AdminPharma2026!'),
        fullName: 'PharmaFind Admin',
        phone: '+212600000000',
        licenseNumber: 'ADMIN-001',
        role: 'admin',
        isVerified: true,
      },
    });
    systemUserId = admin.id;
    console.warn(`✅ Admin user created: ${adminEmail}`);
  } else {
    systemUserId = existingAdmin.id;
    console.warn(`⏭️  Admin user already exists`);
  }

  // ── 2. Seed medications from dim_medicament.csv ────────────────────────
  console.warn('📦 Seeding medications...');
  const medRows = await readCsv(path.join(CSV_DIR, 'dim_medicament.csv'));
  console.warn(`   Found ${medRows.length} medications`);

  // Build lookup: CSV integer id (row index+1) → UUID
  const medIdToUuid = new Map<string, string>();

  let medCreated = 0;
  let medSkipped = 0;

  for (let i = 0; i < medRows.length; i++) {
    const row = medRows[i];
    const csvId = String(i + 1);
    const barcode = row.code?.trim() || null;
    const nameFr = row.nom?.trim() || 'Inconnu';
    const dci = row.dci?.trim() || null;
    const form = row.forme?.trim() || 'COMPRIME';
    const dosage = row.dosage?.trim() || null;

    // Check if already seeded by barcode
    let med = barcode
      ? await prisma.medication.findUnique({ where: { barcode } })
      : null;

    if (!med) {
      // Try by name+form+dosage to avoid duplicates
      med = await prisma.medication.findFirst({
        where: { nameFr, form, dosage: dosage ?? undefined },
      });
    }

    if (!med) {
      med = await prisma.medication.create({
        data: {
          nameFr,
          dci,
          form,
          dosage,
          barcode: barcode || undefined,
        },
      });
      medCreated++;
    } else {
      medSkipped++;
    }

    medIdToUuid.set(csvId, med.id);
  }

  console.warn(`   ✅ Created: ${medCreated}, Skipped: ${medSkipped}`);

  // ── 3. Seed pharmacies from dim_pharmacie.csv ──────────────────────────
  console.warn('🏪 Seeding pharmacies...');
  const pharmaRows = await readCsv(path.join(CSV_DIR, 'dim_pharmacie.csv'));
  console.warn(`   Found ${pharmaRows.length} pharmacies`);

  const pharmaIdToUuid = new Map<string, string>();
  let pharmaCreated = 0;
  let pharmaSkipped = 0;

  for (const row of pharmaRows) {
    const csvId = row.pharmacie_id?.trim();
    const osmId = row.osm_id?.trim() || null;
    const { nameFr, nameAr } = splitBilingualName(row.name || '');
    const addressFr = row.address?.trim() || '';
    const postcode = row.postcode?.replace('.0', '').trim() || null;
    const lat = parseFloat(row.lat);
    const lon = parseFloat(row.lon);
    const typeGarde = row.type_garde?.trim() || 'normal';
    const openTime = row.open_time?.trim() || '08:30';
    const closeTime = row.close_time?.trim() || '20:00';
    const is24h = typeGarde === 'garde_24h';

    if (!csvId || isNaN(lat) || isNaN(lon)) continue;

    let pharmacy = osmId
      ? await prisma.pharmacy.findFirst({ where: { osmId } })
      : null;

    if (!pharmacy) {
      const slug = slugify(nameFr || nameAr, parseInt(csvId));
      try {
        pharmacy = await prisma.pharmacy.create({
          data: {
            userId: systemUserId,
            osmId,
            nameFr: nameFr || nameAr,
            nameAr,
            slug,
            addressFr,
            city: 'Tanger',
            region: 'Tanger-Tetouan-Al Hoceima',
            postcode,
            latitude: lat,
            longitude: lon,
            phone: '+212000000000',
            is24h,
            licenseNumber: `OSM-${csvId}`,
            operatingHours: JSON.stringify(expandOperatingHours(openTime, closeTime, typeGarde)),
            isActive: true,
          },
        });
        pharmaCreated++;
      } catch (e) {
        // Slug collision — skip
        console.warn(`   ⚠️  Skipping pharmacy ${csvId}: ${String(e).slice(0, 80)}`);
        continue;
      }
    } else {
      pharmaSkipped++;
    }

    pharmaIdToUuid.set(csvId, pharmacy.id);

    // Create on_duty_schedule for garde_nuit pharmacies
    if (typeGarde === 'garde_nuit') {
      await prisma.onDutySchedule.upsert({
        where: { pharmacyId_dutyDate: { pharmacyId: pharmacy.id, dutyDate: new Date('2026-03-12') } },
        create: {
          pharmacyId: pharmacy.id,
          dutyDate: new Date('2026-03-12'),
          startTime: '20:00',
          endTime: '08:00',
          isOvernight: true,
          city: 'Tanger',
          source: 'csv_import',
        },
        update: {},
      });
    }
  }

  console.warn(`   ✅ Created: ${pharmaCreated}, Skipped: ${pharmaSkipped}`);

  // ── 4. Seed stock from bridge_stock_pharmacie_rebuilt.csv ──────────────
  console.warn('📊 Seeding stock records...');
  const stockRows = await readCsv(path.join(CSV_DIR, 'bridge_stock_pharmacie_rebuilt.csv'));
  console.warn(`   Found ${stockRows.length} stock records`);

  let stockCreated = 0;
  let stockSkipped = 0;
  const BATCH = 500;

  for (let i = 0; i < stockRows.length; i += BATCH) {
    const batch = stockRows.slice(i, i + BATCH);
    const toCreate = [];

    for (const row of batch) {
      const pharmaUuid = pharmaIdToUuid.get(row.pharmacie_id?.trim());
      const medUuid = medIdToUuid.get(row.medicament_id?.trim());

      if (!pharmaUuid || !medUuid) { stockSkipped++; continue; }

      const status = CSV_STATUS_TO_ENUM[row.stock_status?.trim()] ?? 'AVAILABLE';
      const quantite = parseInt(row.quantite) || 0;
      const estimatedRestockHours = parseInt(row.estimated_restock_hours) || 0;
      const lastUpdate = row.last_update ? new Date(row.last_update) : new Date();

      // Check if exists
      const existing = await prisma.pharmacyStock.findUnique({
        where: { pharmacyId_medicationId: { pharmacyId: pharmaUuid, medicationId: medUuid } },
      });

      if (existing) { stockSkipped++; continue; }

      toCreate.push({
        pharmacyId: pharmaUuid,
        medicationId: medUuid,
        status,
        quantite,
        estimatedRestockHours,
        lastConfirmedAt: lastUpdate,
      });
    }

    if (toCreate.length > 0) {
      await prisma.pharmacyStock.createMany({ data: toCreate });
      stockCreated += toCreate.length;
    }

    if ((i / BATCH) % 5 === 0) {
      console.warn(`   Progress: ${Math.min(i + BATCH, stockRows.length)}/${stockRows.length}`);
    }
  }

  console.warn(`   ✅ Created: ${stockCreated}, Skipped: ${stockSkipped}`);
  console.warn('🎉 Seed complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
