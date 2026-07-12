/**
 * Payments API. Two hops, split for PCI safety:
 *
 *  1. `createCardToken` sends the raw card straight to Stripe's `/v1/tokens`
 *     endpoint using the *publishable* key. This is the officially client-safe
 *     path — the PAN never touches our own servers, and we get back a one-time
 *     `tok_…` handle.
 *  2. `chargeToken` hands that token (plus amount/currency) to our Supabase Edge
 *     Function, which holds the *secret* key and actually creates + confirms the
 *     PaymentIntent. See docs/PAYMENTS.md for the function + secret setup.
 */
import { env } from '@/config/env';
import { supabase } from '@/lib/supabase';
import type { CardInput, ChargeInput, ChargeResult } from './types';

/** Currencies Stripe treats as having no minor unit (amount is not ×100). */
const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf',
  'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
]);

/** Convert a major-unit amount (e.g. 1500 PKR) into Stripe's smallest unit. */
export function toMinorUnits(amount: number, currency: string): number {
  const factor = ZERO_DECIMAL.has(currency.toLowerCase()) ? 1 : 100;
  return Math.round(amount * factor);
}

function requirePublishableKey(): string {
  const key = env.stripePublishableKey;
  if (!key) {
    throw new Error(
      'Card payments are not configured. Set EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ' +
        'in your .env and restart the dev server.',
    );
  }
  return key;
}

/**
 * Tokenize a card directly with Stripe. Returns a single-use `tok_…` id. Throws
 * a user-friendly Error on card errors (e.g. "Your card number is incorrect.").
 */
export async function createCardToken(card: CardInput): Promise<string> {
  const key = requirePublishableKey();

  const body = new URLSearchParams({
    'card[number]': card.number,
    'card[exp_month]': String(card.expMonth),
    'card[exp_year]': String(card.expYear),
    'card[cvc]': card.cvc,
    'card[name]': card.name,
  });

  const res = await fetch('https://api.stripe.com/v1/tokens', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  const json = (await res.json()) as {
    id?: string;
    error?: { message?: string };
  };

  if (!res.ok || !json.id) {
    throw new Error(json.error?.message ?? 'We could not verify your card. Please check the details.');
  }
  return json.id;
}

/**
 * Charge a previously-created token via the Supabase Edge Function. The user's
 * auth token is attached automatically by the Supabase client.
 */
export async function chargeToken(
  token: string,
  input: Omit<ChargeInput, 'card'>,
): Promise<ChargeResult> {
  const { data, error } = await supabase.functions.invoke<ChargeResult & { error?: string }>(
    'create-payment',
    {
      body: {
        token,
        amount: toMinorUnits(input.amount, input.currency),
        currency: input.currency.toLowerCase(),
        description: input.description,
        metadata: input.metadata ?? {},
      },
    },
  );

  if (error) {
    // Edge Function errors (FunctionsHttpError) carry the response in `context`.
    const message = await extractFunctionError(error);
    throw new Error(message);
  }
  if (!data || data.error || !data.paymentIntentId) {
    throw new Error(data?.error ?? 'The payment could not be completed. Please try again.');
  }
  return { paymentIntentId: data.paymentIntentId, status: data.status };
}

/** Pull a readable message out of a Supabase Functions error, if possible. */
async function extractFunctionError(error: unknown): Promise<string> {
  const fallback = 'The payment could not be completed. Please try again.';
  const ctx = (error as { context?: Response }).context;
  if (ctx && typeof ctx.json === 'function') {
    try {
      const parsed = (await ctx.json()) as { error?: string };
      if (parsed?.error) return parsed.error;
    } catch {
      // response wasn't JSON — fall through
    }
  }
  return error instanceof Error && error.message ? error.message : fallback;
}

/** End-to-end: tokenize the card, then charge it. Returns the charge result. */
export async function payWithCard(input: ChargeInput): Promise<ChargeResult> {
  const token = await createCardToken(input.card);
  return chargeToken(token, {
    amount: input.amount,
    currency: input.currency,
    description: input.description,
    metadata: input.metadata,
  });
}
