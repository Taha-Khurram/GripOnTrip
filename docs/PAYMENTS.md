# Payments (Stripe)

Card payments run through a two-hop flow that keeps raw card data off our
servers:

```
 App (CardPaymentForm)
   │  raw card  ─────────────────►  Stripe /v1/tokens   (publishable key)
   │  ◄─────────  tok_xxx  ────────
   │
   │  { token, amount, currency }  ─►  Supabase Edge Function `create-payment`
   │                                     │  creates + confirms a PaymentIntent
   │                                     └─►  Stripe /v1/payment_intents  (SECRET key)
   │  ◄──────  { paymentIntentId, status: 'succeeded' }  ──────
```

- The **publishable key** (`pk_…`) ships in the app via
  `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`. It can only tokenize cards — safe to bundle.
- The **secret key** (`sk_…`) lives **only** as a Supabase Edge Function secret.
  It is never in the app bundle or in any `EXPO_PUBLIC_*` var.

## Files

| Concern                | Location                                            |
| ---------------------- | --------------------------------------------------- |
| Card UI + validation   | `src/features/payments/`                            |
| Tokenize + charge (app)| `src/features/payments/api.ts`                      |
| Charge (server)        | `supabase/functions/create-payment/index.ts`        |

## One-time backend setup

You need the [Supabase CLI](https://supabase.com/docs/guides/cli) and to be
linked to the project (`supabase link --project-ref ivkorsriknpkrdnmmgwg`).

```bash
# 1. Set the Stripe secret key (test key for dev, live key for prod).
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx

# 2. Deploy the function.
supabase functions deploy create-payment
```

That's it — no DB migration is required. The function verifies the caller is a
signed-in user (Supabase attaches their JWT automatically) and returns the
PaymentIntent id on success.

## Client env

Add to `.env` (already scaffolded in `.env.example`):

```
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

Restart the dev server with a cleared cache after changing env: `npx expo start -c`.

## Testing

Use Stripe's [test cards](https://stripe.com/docs/testing):

| Card number          | Result            |
| -------------------- | ----------------- |
| `4242 4242 4242 4242`| Succeeds          |
| `4000 0000 0000 0002`| Declined          |
| `4000 0000 0000 9995`| Insufficient funds|

Any future expiry (e.g. `12/34`) and any CVC (`123`) work with test cards.

## Notes & limitations

- **Currency support.** Amounts are converted to Stripe's smallest unit
  (`toMinorUnits`), ×100 for normal currencies. Confirm your Stripe account can
  settle the currencies your listings use (e.g. `PKR`). Otherwise present prices
  in a supported currency.
- **3D Secure.** This simple server flow disables redirect-based authentication
  (`allow_redirects: never`). Cards that force 3DS are rejected with a clear
  message. If you need SCA/3DS, switch to the PaymentSheet flow with
  `@stripe/stripe-react-native` and a client-secret returned by the function.
- **Booking status.** On a successful charge the booking is written with
  `payment_status: 'paid'` and a `payment_method` of `Card (Stripe)`; the Stripe
  PaymentIntent id is saved to the booking notes / reference for reconciliation.
