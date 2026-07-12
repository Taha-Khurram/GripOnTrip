/**
 * Client-side card validation — the "proper value criteria" for card number,
 * expiry and CVV. These are pure functions with no Stripe dependency so they can
 * be unit-tested and reused by any card UI. They do NOT replace Stripe's own
 * checks (Stripe re-validates server-side); they give the user immediate, honest
 * feedback and stop obviously-bad requests before a network round-trip.
 */
import type { CardBrand, CardErrors, CardInput } from './types';

interface BrandMeta {
  brand: CardBrand;
  label: string;
  /** Regex the raw (digits-only) number must start with. */
  pattern: RegExp;
  /** Valid total lengths for the PAN. */
  lengths: number[];
  /** Required CVC length. */
  cvcLength: number;
  /** Digit groups used for display formatting, e.g. [4,4,4,4]. */
  gaps: number[];
}

// Order matters: the first match wins, so more specific patterns come first.
const BRANDS: BrandMeta[] = [
  {
    brand: 'amex',
    label: 'American Express',
    pattern: /^3[47]/,
    lengths: [15],
    cvcLength: 4,
    gaps: [4, 6, 5],
  },
  {
    brand: 'mastercard',
    label: 'Mastercard',
    // 51–55 and the 2221–2720 range.
    pattern: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)/,
    lengths: [16],
    cvcLength: 3,
    gaps: [4, 4, 4, 4],
  },
  {
    brand: 'discover',
    label: 'Discover',
    pattern: /^(6011|65|64[4-9]|622)/,
    lengths: [16],
    cvcLength: 3,
    gaps: [4, 4, 4, 4],
  },
  {
    brand: 'visa',
    label: 'Visa',
    pattern: /^4/,
    lengths: [16, 13, 19],
    cvcLength: 3,
    gaps: [4, 4, 4, 4],
  },
];

const UNKNOWN: BrandMeta = {
  brand: 'unknown',
  label: 'Card',
  pattern: /.*/,
  lengths: [16, 15, 19],
  cvcLength: 3,
  gaps: [4, 4, 4, 4],
};

/** Strip everything that isn't a digit. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function brandMeta(number: string): BrandMeta {
  const digits = onlyDigits(number);
  return BRANDS.find((b) => b.pattern.test(digits)) ?? UNKNOWN;
}

/** Detect the card brand from a (possibly partial) number. */
export function detectBrand(number: string): CardBrand {
  const digits = onlyDigits(number);
  if (!digits) return 'unknown';
  return brandMeta(digits).brand;
}

/** Human label for a brand, e.g. 'Visa'. */
export function brandLabel(brand: CardBrand): string {
  return (BRANDS.find((b) => b.brand === brand) ?? UNKNOWN).label;
}

/** Max input length (digits) allowed for the detected brand — for maxLength UX. */
export function maxNumberLength(number: string): number {
  return Math.max(...brandMeta(number).lengths);
}

/** Required CVC length for the detected brand (4 for Amex, else 3). */
export function cvcLength(number: string): number {
  return brandMeta(number).cvcLength;
}

/**
 * Format a raw number into brand-appropriate groups for display, e.g.
 * "4242 4242 4242 4242" or Amex "3782 822463 10005".
 */
export function formatCardNumber(value: string): string {
  const meta = brandMeta(value);
  const digits = onlyDigits(value).slice(0, Math.max(...meta.lengths));
  const parts: string[] = [];
  let i = 0;
  for (const gap of meta.gaps) {
    if (i >= digits.length) break;
    parts.push(digits.slice(i, i + gap));
    i += gap;
  }
  if (i < digits.length) parts.push(digits.slice(i));
  return parts.join(' ');
}

/** Format free-typed expiry input into "MM/YY", inserting the slash for you. */
export function formatExpiry(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);
  if (digits.length === 0) return '';
  // Auto-pad a leading month like "3" → "03" once the user moves past it.
  if (digits.length === 1) return digits;
  const month = digits.slice(0, 2);
  const year = digits.slice(2);
  return year ? `${month}/${year}` : month;
}

/** Parse "MM/YY" (or "MMYY") into month + full year, or null when incomplete. */
export function parseExpiry(value: string): { month: number; year: number } | null {
  const digits = onlyDigits(value);
  if (digits.length < 4) return null;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2, 4));
  return { month, year };
}

/** Luhn checksum — the standard mod-10 test every real card number passes. */
export function luhnValid(number: string): boolean {
  const digits = onlyDigits(number);
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits.charCodeAt(i) - 48; // '0' === 48
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Validate the card number: digits, brand length, and Luhn. */
export function cardNumberError(number: string): string | undefined {
  const digits = onlyDigits(number);
  if (!digits) return 'Card number is required.';
  const meta = brandMeta(digits);
  if (digits.length < Math.min(...meta.lengths)) return 'Card number is incomplete.';
  if (!meta.lengths.includes(digits.length)) return 'Card number is invalid.';
  if (!luhnValid(digits)) return 'Card number is invalid.';
  return undefined;
}

/**
 * Validate expiry: real month, and this month or later (not expired). `now` is
 * injectable for testing; callers pass a fresh `new Date()`.
 */
export function expiryError(value: string, now: Date): string | undefined {
  const digits = onlyDigits(value);
  if (!digits) return 'Expiry date is required.';
  if (digits.length < 4) return 'Expiry date is incomplete.';
  const parsed = parseExpiry(value);
  if (!parsed) return 'Expiry date is invalid.';
  const { month, year } = parsed;
  if (month < 1 || month > 12) return 'Expiry month is invalid.';
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return 'This card has expired.';
  }
  // Sanity cap so fat-fingered years don't sail through (cards rarely > 20y out).
  if (year > currentYear + 20) return 'Expiry year is invalid.';
  return undefined;
}

/** Validate the CVC against the detected brand's required length. */
export function cvcError(cvc: string, number: string): string | undefined {
  const digits = onlyDigits(cvc);
  if (!digits) return 'Security code is required.';
  const required = cvcLength(number);
  if (digits.length !== required) return `Security code must be ${required} digits.`;
  return undefined;
}

/** Validate the cardholder name — present and plausibly a name. */
export function nameError(name: string): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) return 'Cardholder name is required.';
  if (trimmed.length < 2) return 'Cardholder name is too short.';
  return undefined;
}

/** Raw form values, before parsing, as the user typed them. */
export interface CardFormValues {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

/** Validate the whole form at once. `now` defaults to the current time. */
export function validateCard(values: CardFormValues, now: Date): CardErrors {
  const errors: CardErrors = {};
  const n = cardNumberError(values.number);
  if (n) errors.number = n;
  const e = expiryError(values.expiry, now);
  if (e) errors.expiry = e;
  const c = cvcError(values.cvc, values.number);
  if (c) errors.cvc = c;
  const nm = nameError(values.name);
  if (nm) errors.name = nm;
  return errors;
}

/** True when the form has no outstanding errors. */
export function isCardValid(values: CardFormValues, now: Date): boolean {
  return Object.keys(validateCard(values, now)).length === 0;
}

/** Convert validated raw form values into the normalized `CardInput`. */
export function toCardInput(values: CardFormValues): CardInput {
  const parsed = parseExpiry(values.expiry)!;
  return {
    number: onlyDigits(values.number),
    expMonth: parsed.month,
    expYear: parsed.year,
    cvc: onlyDigits(values.cvc),
    name: values.name.trim(),
  };
}
