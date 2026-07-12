import type { Money } from '@/types';

/** Format a Money value using the device locale and its currency code. */
export function formatMoney(money: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount);
}

/**
 * Compact money for tight spaces, e.g. 28000 PKR → "Rs.28k", 1500000 → "Rs.1.5M".
 * Falls back to the full {@link formatMoney} for currencies without a short symbol.
 */
export function formatCompactMoney(money: Money): string {
  const { amount, currency } = money;
  const symbol = currency === 'PKR' ? 'Rs.' : null;
  if (!symbol) return formatMoney(money);
  const abbrev = (div: number, suffix: string) => {
    const v = amount / div;
    return `${symbol}${Number.isInteger(v) ? v : v.toFixed(1)}${suffix}`;
  };
  if (amount >= 1_000_000) return abbrev(1_000_000, 'M');
  if (amount >= 1_000) return abbrev(1_000, 'k');
  return `${symbol}${amount}`;
}

/** Short, human-friendly date, e.g. "Jul 4, 2026". */
export function formatDate(iso: string, locale = 'en-US'): string {
  return new Date(iso).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Clamp a rating to one decimal for display, e.g. 4.666 -> "4.7". */
export function formatRating(rating?: number): string {
  return rating == null ? '—' : rating.toFixed(1);
}

/** Truncate text to `max` characters with an ellipsis. */
export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
