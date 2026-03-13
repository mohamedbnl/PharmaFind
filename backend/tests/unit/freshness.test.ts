// Unit tests for freshness thresholds
const FRESHNESS = { VERIFIED: 6, RECENT: 24, POSSIBLY_OUTDATED: 72 };

function getFreshnessLabel(lastConfirmedAt: Date): string {
  const hoursAgo = (Date.now() - lastConfirmedAt.getTime()) / (1000 * 60 * 60);
  if (hoursAgo < FRESHNESS.VERIFIED) return 'verified';
  if (hoursAgo < FRESHNESS.RECENT) return 'recent';
  if (hoursAgo < FRESHNESS.POSSIBLY_OUTDATED) return 'possibly_outdated';
  return 'unverified';
}

describe('getFreshnessLabel', () => {
  it('returns verified for < 6h', () => {
    const d = new Date(Date.now() - 1 * 60 * 60 * 1000);
    expect(getFreshnessLabel(d)).toBe('verified');
  });

  it('returns recent for 6–24h', () => {
    const d = new Date(Date.now() - 12 * 60 * 60 * 1000);
    expect(getFreshnessLabel(d)).toBe('recent');
  });

  it('returns possibly_outdated for 24–72h', () => {
    const d = new Date(Date.now() - 48 * 60 * 60 * 1000);
    expect(getFreshnessLabel(d)).toBe('possibly_outdated');
  });

  it('returns unverified for > 72h', () => {
    const d = new Date(Date.now() - 96 * 60 * 60 * 1000);
    expect(getFreshnessLabel(d)).toBe('unverified');
  });
});
