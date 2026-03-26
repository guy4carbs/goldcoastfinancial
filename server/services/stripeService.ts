/**
 * Stripe Payment Service
 * Handles payment intents for the Lead Marketplace
 */
import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripe(): Stripe | null {
  if (stripeClient) return stripeClient;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    console.warn('[Stripe] STRIPE_SECRET_KEY not configured');
    return null;
  }
  stripeClient = new Stripe(key);
  console.log('[Stripe] Client initialized');
  return stripeClient;
}

export function isStripeAvailable(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

export async function createPaymentIntent(
  amountCents: number,
  metadata: Record<string, string>
): Promise<{ clientSecret: string; paymentIntentId: string } | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata,
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: intent.client_secret!,
    paymentIntentId: intent.id,
  };
}

export function constructWebhookEvent(body: Buffer, sig: string): Stripe.Event | null {
  const stripe = getStripe();
  if (!stripe) return null;

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return null;

  return stripe.webhooks.constructEvent(body, sig, secret);
}
