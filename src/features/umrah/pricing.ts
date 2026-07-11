import type { SelectOption } from '@/components/ui';
import type { CustomUmrahConfig } from './types';

/**
 * Client-side pricing model for a self-assembled ("Bespoke") Umrah package.
 *
 * Umrah has no server-side quote endpoint (packages are `[UMRAH]`-prefixed
 * agency rows — see `api.ts`), so the customizer prices a custom build locally,
 * exactly as the web does. All amounts are per-pilgrim PKR. The defaults below
 * (7 + 7 nights, 4-Star deluxe, Haramain train, breakfast, ziyarat, no visa
 * add-on) resolve to PKR 378,000 — the figure the web headlines.
 */

export interface TierOption extends SelectOption {
  /** Short label used in the compact booking summary. */
  shortLabel: string;
  /** Per-night contribution to the per-pilgrim price. */
  perNight: number;
}

export interface SurchargeOption extends SelectOption {
  /** Flat per-pilgrim add-on. */
  surcharge: number;
}

const BASE_PRICE = 131000;
const VISA_FEE = 18000;
const ZIYARAT_FEE = 12000;

/** Nights a pilgrim can pick for either city. */
export const NIGHT_OPTIONS: SelectOption<number>[] = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14].map((n) => ({
  value: n,
  label: `${n} Night${n === 1 ? '' : 's'}`,
}));

export const MAKKAH_NIGHT_OPTIONS: SelectOption<number>[] = NIGHT_OPTIONS.map((o) => ({
  value: o.value,
  label: `${o.value} Night${o.value === 1 ? '' : 's'} in Makkah`,
}));

export const MADINAH_NIGHT_OPTIONS: SelectOption<number>[] = NIGHT_OPTIONS.map((o) => ({
  value: o.value,
  label: `${o.value} Night${o.value === 1 ? '' : 's'} in Madinah`,
}));

export const HOTEL_TIERS: TierOption[] = [
  {
    value: 'economy',
    label: '3-Star Economy (Walking Distance < 800m)',
    shortLabel: '3-Star',
    perNight: 11000,
  },
  {
    value: 'deluxe',
    label: '4-Star Deluxe Comfort (Walking Distance < 250m)',
    shortLabel: '4-Star',
    perNight: 15000,
  },
  {
    value: 'luxury',
    label: '5-Star Luxury (Haram Front / Clock Tower)',
    shortLabel: '5-Star',
    perNight: 22000,
  },
];

export const TRANSPORT_OPTIONS: SurchargeOption[] = [
  { value: 'coach', label: 'Shared AC Coach Transfer', surcharge: 0 },
  { value: 'suv', label: 'Private GMC / SUV Transfer', surcharge: 15000 },
  { value: 'train', label: 'Haramain High-Speed Train VIP Class Ticket', surcharge: 25000 },
];

export const MEAL_OPTIONS: SurchargeOption[] = [
  { value: 'breakfast', label: 'Breakfast Buffet Included Daily', surcharge: 0 },
  { value: 'half', label: 'Half Board (Breakfast + Dinner)', surcharge: 12000 },
  { value: 'full', label: 'Full Board (All Meals Included)', surcharge: 24000 },
];

/** Departure cities offered on the config bar. */
export const DEPARTURE_CITIES: SelectOption[] = [
  { value: 'Lahore', label: 'Lahore (LHE)' },
  { value: 'Islamabad', label: 'Islamabad (ISB)' },
  { value: 'Karachi', label: 'Karachi (KHI)' },
  { value: 'Multan', label: 'Multan (MUX)' },
  { value: 'Peshawar', label: 'Peshawar (PEW)' },
];

/** Package-tier filter shown on the config bar (loosely maps to hotel class). */
export const PACKAGE_TIERS: SelectOption[] = [
  { value: 'all', label: 'All Classes' },
  { value: 'economy', label: 'Economy Class' },
  { value: 'deluxe', label: 'Deluxe / 4-Star' },
  { value: 'luxury', label: 'Luxury / 5-Star' },
];

/** Sensible starting point for the customizer (resolves to PKR 378,000). */
export const DEFAULT_CUSTOM_CONFIG: CustomUmrahConfig = {
  makkahNights: 7,
  madinahNights: 7,
  hotelTier: 'deluxe',
  transport: 'train',
  meals: 'breakfast',
  visaAssistance: false,
  ziyarat: true,
};

export function hotelTier(value: string): TierOption {
  return HOTEL_TIERS.find((t) => t.value === value) ?? HOTEL_TIERS[1];
}

/** Per-pilgrim price for a bespoke build. */
export function computeCustomPrice(cfg: CustomUmrahConfig): number {
  const tier = hotelTier(cfg.hotelTier);
  const transport = TRANSPORT_OPTIONS.find((t) => t.value === cfg.transport) ?? TRANSPORT_OPTIONS[0];
  const meal = MEAL_OPTIONS.find((m) => m.value === cfg.meals) ?? MEAL_OPTIONS[0];
  const nights = cfg.makkahNights + cfg.madinahNights;

  return (
    BASE_PRICE +
    nights * tier.perNight +
    transport.surcharge +
    meal.surcharge +
    (cfg.visaAssistance ? VISA_FEE : 0) +
    (cfg.ziyarat ? ZIYARAT_FEE : 0)
  );
}

/**
 * Upcoming departure months as select options, e.g. "October 2026". `from` is
 * the reference date (defaults to today); `count` is how many months forward.
 */
export function departureMonths(from: Date, count = 12): SelectOption[] {
  const out: SelectOption[] = [];
  for (let i = 0; i < count; i += 1) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    out.push({ value: label, label });
  }
  return out;
}
