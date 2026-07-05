/** Date helpers for the booking flow. */

/** Format a Date as `YYYY-MM-DD` (local). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Whole nights between two ISO dates (min 0). */
export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Parse a Postgres range string like `[2026-04-24,2026-12-01)` into a
 * `{ start, end }` pair of ISO dates, or `null` when unset/unparseable.
 */
export function parseAvailabilityRange(range?: string): { start: string; end: string } | null {
  if (!range) return null;
  const m = range.match(/[[(]\s*([\d-]+)\s*,\s*([\d-]+)\s*[)\]]/);
  if (!m) return null;
  return { start: m[1], end: m[2] };
}

/** Add `n` days to an ISO date, returning a new ISO date. */
export function addDays(iso: string, n: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}
