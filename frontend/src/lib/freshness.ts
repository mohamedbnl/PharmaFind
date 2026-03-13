export type FreshnessLevel = 'verified' | 'recent' | 'possibly_outdated' | 'unverified';

export function getFreshnessLevel(lastConfirmedAt: string | Date): FreshnessLevel {
  const hoursElapsed = (Date.now() - new Date(lastConfirmedAt).getTime()) / (1000 * 60 * 60);
  if (hoursElapsed < 6) return 'verified';
  if (hoursElapsed < 24) return 'recent';
  if (hoursElapsed < 72) return 'possibly_outdated';
  return 'unverified';
}

type DaySchedule = { open: string; close: string; open2?: string; close2?: string } | null;
export type OperatingHours = Record<string, DaySchedule>;

export function isPharmacyOpen(operatingHours: OperatingHours, is24h: boolean): boolean {
  if (is24h) return true;
  const moroccoNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Casablanca' }));
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const schedule = operatingHours[days[moroccoNow.getDay()]];
  if (!schedule) return false;
  const current = `${String(moroccoNow.getHours()).padStart(2, '0')}:${String(moroccoNow.getMinutes()).padStart(2, '0')}`;
  if (current >= schedule.open && current < schedule.close) return true;
  if (schedule.open2 && schedule.close2 && current >= schedule.open2 && current < schedule.close2) return true;
  return false;
}
