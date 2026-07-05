import type { Money } from '@/types';

/** Format a Money value using the device locale and its currency code. */
export function formatMoney(money: Money, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 0,
  }).format(money.amount);
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
