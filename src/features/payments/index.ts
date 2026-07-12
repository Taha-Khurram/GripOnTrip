/**
 * Payments — validated card entry + Stripe charging, shared across every
 * booking flow (hotels, rentals, tours, umrah).
 *
 * - `CardPaymentForm` collects and validates the card (number/expiry/CVC/name).
 * - `usePayWithCard()` tokenizes the card with Stripe (publishable key) and
 *   charges it via the `create-payment` Supabase Edge Function (secret key).
 *
 * See docs/PAYMENTS.md for the backend setup.
 */
export { CardPaymentForm, type CardPaymentFormProps } from './components/CardPaymentForm';
export { usePayWithCard } from './hooks';
export { payWithCard, createCardToken, chargeToken, toMinorUnits } from './api';
export {
  validateCard,
  isCardValid,
  detectBrand,
  brandLabel,
  cardNumberError,
  expiryError,
  cvcError,
  nameError,
  formatCardNumber,
  formatExpiry,
  luhnValid,
  type CardFormValues,
} from './validation';
export type { CardBrand, CardInput, CardErrors, ChargeInput, ChargeResult } from './types';
