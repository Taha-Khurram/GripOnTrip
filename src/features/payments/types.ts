/** Card brands we recognise for formatting + validation. */
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

/** Raw card details collected from the validated card form. */
export interface CardInput {
  /** Digits only, no spaces. */
  number: string;
  /** 1–12. */
  expMonth: number;
  /** Full 4-digit year, e.g. 2027. */
  expYear: number;
  /** 3 digits (4 for Amex). */
  cvc: string;
  /** Cardholder name as printed on the card. */
  name: string;
}

/** Per-field validation messages; a field is valid when its key is absent. */
export interface CardErrors {
  number?: string;
  expiry?: string;
  cvc?: string;
  name?: string;
}

/** Everything the payments layer needs to charge a card once. */
export interface ChargeInput {
  card: CardInput;
  /** Human-facing amount in the currency's major unit (e.g. 1500 = PKR 1,500). */
  amount: number;
  /** ISO 4217 code, e.g. 'PKR', 'USD'. */
  currency: string;
  /** Short description shown in the Stripe dashboard. */
  description: string;
  /** Free-form metadata attached to the PaymentIntent (booking ids, emails…). */
  metadata?: Record<string, string>;
}

/** Result of a successful charge. */
export interface ChargeResult {
  /** Stripe PaymentIntent id, e.g. `pi_…`. */
  paymentIntentId: string;
  /** Stripe status — 'succeeded' when the money moved. */
  status: string;
}
