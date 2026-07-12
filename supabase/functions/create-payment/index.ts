// Supabase Edge Function: create-payment
//
// Charges a card that the app already tokenized with Stripe's publishable key.
// The app sends a one-time `token` (`tok_…`) plus amount/currency; this function
// — holding the SECRET key — creates and confirms a PaymentIntent so the raw
// card details never touch our infrastructure.
//
// Deploy:  supabase functions deploy create-payment
// Secret:  supabase secrets set STRIPE_SECRET_KEY=sk_live_or_test_...
//
// Runs on Deno. Uses Stripe's REST API directly (no npm import) to keep the
// function tiny and dependency-free.

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY') ?? '';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

interface ChargeBody {
  token?: string;
  amount?: number; // smallest currency unit (already ×100 on the client)
  currency?: string;
  description?: string;
  metadata?: Record<string, string>;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }
  if (!STRIPE_SECRET_KEY) {
    return json({ error: 'Payments are not configured on the server.' }, 500);
  }

  // Require a signed-in caller — Supabase injects the user's JWT as Bearer.
  const auth = req.headers.get('Authorization') ?? '';
  if (!auth.startsWith('Bearer ')) {
    return json({ error: 'Not authorized.' }, 401);
  }

  let payload: ChargeBody;
  try {
    payload = (await req.json()) as ChargeBody;
  } catch {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const { token, amount, currency, description, metadata } = payload;

  if (!token || typeof token !== 'string') {
    return json({ error: 'Missing card token.' }, 400);
  }
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    return json({ error: 'Invalid amount.' }, 400);
  }
  if (!currency || typeof currency !== 'string') {
    return json({ error: 'Missing currency.' }, 400);
  }

  // Build the PaymentIntent form body. `confirm=true` charges immediately;
  // disabling redirects keeps this a single server-side call (no 3DS return_url).
  const form = new URLSearchParams();
  form.set('amount', String(Math.round(amount)));
  form.set('currency', currency.toLowerCase());
  form.set('confirm', 'true');
  form.set('payment_method_data[type]', 'card');
  form.set('payment_method_data[card][token]', token);
  form.set('automatic_payment_methods[enabled]', 'true');
  form.set('automatic_payment_methods[allow_redirects]', 'never');
  if (description) form.set('description', description);
  for (const [k, v] of Object.entries(metadata ?? {})) {
    if (v != null) form.set(`metadata[${k}]`, String(v));
  }

  try {
    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });

    const intent = (await res.json()) as {
      id?: string;
      status?: string;
      error?: { message?: string };
    };

    if (!res.ok || intent.error) {
      return json({ error: intent.error?.message ?? 'The payment was declined.' }, 402);
    }
    if (intent.status !== 'succeeded') {
      // e.g. requires_action (3DS) — not supported by this simple server flow.
      return json(
        {
          error:
            intent.status === 'requires_action'
              ? 'This card needs additional authentication that is not supported yet.'
              : `Payment not completed (status: ${intent.status}).`,
        },
        402,
      );
    }

    return json({ paymentIntentId: intent.id, status: intent.status });
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Payment processing failed.' },
      500,
    );
  }
});
