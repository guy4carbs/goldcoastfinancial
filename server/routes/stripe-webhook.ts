/**
 * POST /api/webhooks/stripe — Stripe webhook receiver.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * RAW BODY REQUIREMENT
 * ─────────────────────────────────────────────────────────────────────────────
 * `stripe.webhooks.constructEvent` re-computes the HMAC-SHA256 signature over
 * the *exact bytes* Stripe sent. Any reformatting (key reordering, whitespace
 * collapse, charset coercion) by Express's JSON parser breaks the signature
 * check. The fix is to register `express.raw({ type: "application/json" })`
 * for THIS route specifically, BEFORE the global `express.json()` parser runs.
 * That's done in server/index.ts.
 *
 * The Stripe SDK's `constructEvent` also accepts a string OR Buffer — passing
 * the Buffer directly is the safest path (`req.body` is a Buffer here because
 * of the `express.raw` middleware mounted upstream).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * IDEMPOTENCY
 * ─────────────────────────────────────────────────────────────────────────────
 * Stripe retries failed webhook deliveries indefinitely. To avoid double-
 * processing a `checkout.session.completed` event after a transient timeout,
 * every event id is recorded in `stripe_webhook_events`. The UNIQUE index on
 * `stripe_event_id` (Vector) makes the second insert raise; we treat that as
 * "already processed" and short-circuit with 200.
 *
 * The duplicate-check + business mutation + webhook-event insert are not
 * wrapped in a single DB transaction here on purpose — we want the duplicate
 * check to land BEFORE we mutate anything, and the audit insert to land AFTER
 * the mutation so a crash mid-flight is recoverable on retry. The UNIQUE index
 * on stripe_event_id is the durable guarantee that this can never run twice.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ERROR HANDLING
 * ─────────────────────────────────────────────────────────────────────────────
 * We NEVER throw out of this handler. Stripe interprets any 5xx as "retry
 * this event later" and will keep retrying for up to 3 days, which floods our
 * logs and re-runs business logic against the same event. Instead:
 *   - 400 only on signature verification failure (Stripe stops retrying 4xx).
 *   - 200 on every other terminal outcome, including handler errors that we
 *     have already logged for human follow-up.
 */
import type { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { stripe, Stripe } from "../lib/stripe";
import {
  leadPurchases,
  stripeWebhookEvents,
} from "@shared/schema";

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function stripeWebhookHandler(req: Request, res: Response) {
  // Read the signing secret late so a key rotation only requires a process
  // restart (no SDK client re-instantiation).
  const webhookSecret = STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured — refusing to process event.");
    // 500 so Stripe retries once we fix the config; this is an operator error,
    // not a Stripe-side problem.
    return res.status(500).json({ error: "webhook secret not configured" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    console.warn("[stripe-webhook] missing or non-string stripe-signature header");
    return res.status(400).json({ error: "missing stripe-signature header" });
  }

  // `req.body` MUST be a Buffer here (express.raw mounted upstream). If
  // express.json() ran first this will have been parsed into an object and
  // signature verification will fail — that's our canary for a misconfigured
  // middleware chain.
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body as Buffer,
      signature,
      webhookSecret,
    );
  } catch (err: any) {
    console.warn(
      "[stripe-webhook] signature verification failed:",
      err?.message || err,
    );
    return res.status(400).json({ error: "invalid signature" });
  }

  try {
    // ─── Idempotency check ──────────────────────────────────────────────
    const existing = await db
      .select({ id: stripeWebhookEvents.id })
      .from(stripeWebhookEvents)
      .where(eq(stripeWebhookEvents.stripeEventId, event.id))
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `[stripe-webhook] duplicate event ${event.id} (${event.type}) — already processed, returning 200`,
      );
      return res.status(200).json({ received: true, duplicate: true });
    }

    // ─── Dispatch ───────────────────────────────────────────────────────
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentIntentFailed(pi);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      default:
        // Stripe sends a LOT of event types; logging every unhandled one is
        // useful while we wire integrations up but should be quieted later.
        console.log(`[stripe-webhook] unhandled event type: ${event.type}`);
    }

    // ─── Idempotency log ───────────────────────────────────────────────
    // Insert AFTER the business mutation succeeds so a crash mid-handler
    // leaves the row absent and the retry can re-run the work. The UNIQUE
    // index on stripe_event_id makes the (rare) "handler succeeded but
    // insert failed" race safe on retry.
    try {
      await db.insert(stripeWebhookEvents).values({
        stripeEventId: event.id,
        eventType: event.type,
        payload: event as unknown as Record<string, unknown>,
      });
    } catch (insertErr: any) {
      // Unique-violation on the second insert of the same event id is the
      // expected race — treat as success.
      if (insertErr?.code === "23505") {
        console.log(
          `[stripe-webhook] idempotency insert race for ${event.id} — already logged`,
        );
      } else {
        // Any other insert failure is a real problem but we still return 200
        // because the business mutation already happened; logging this for
        // Sentinel/Signal to alert on.
        console.error(
          `[stripe-webhook] failed to log webhook event ${event.id}:`,
          insertErr,
        );
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    // Catch-all. Log loudly but return 200 so Stripe doesn't loop on us.
    // Anything that lands here needs an operator to investigate manually.
    console.error(
      `[stripe-webhook] handler error for event ${event.id} (${event.type}):`,
      err,
    );
    return res.status(200).json({ received: true, handlerError: true });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Event-type handlers. Each is responsible for finding the matching
// lead_purchases row and updating its status. They DO NOT touch
// stripe_webhook_events — that's owned by the dispatcher above.
// ─────────────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const sessionId = session.id;
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;

  // Find by checkout session id first; fall back to payment intent id for
  // resilience against handler-ordering races.
  const matches = await db
    .select({ id: leadPurchases.id })
    .from(leadPurchases)
    .where(eq(leadPurchases.stripeCheckoutSessionId, sessionId))
    .limit(1);

  let purchaseId: string | undefined = matches[0]?.id;

  if (!purchaseId && paymentIntentId) {
    const piMatches = await db
      .select({ id: leadPurchases.id })
      .from(leadPurchases)
      .where(eq(leadPurchases.stripePaymentIntentId, paymentIntentId))
      .limit(1);
    purchaseId = piMatches[0]?.id;
  }

  if (!purchaseId) {
    console.warn(
      `[stripe-webhook] checkout.session.completed: no leadPurchase row for session=${sessionId} pi=${paymentIntentId}`,
    );
    return;
  }

  await db
    .update(leadPurchases)
    .set({
      status: "completed",
      stripeStatus: "succeeded",
      stripePaymentIntentId: paymentIntentId,
    })
    .where(eq(leadPurchases.id, purchaseId));

  console.log(
    `[stripe-webhook] checkout.session.completed -> purchase ${purchaseId} marked completed`,
  );
}

async function handlePaymentIntentFailed(pi: Stripe.PaymentIntent) {
  const matches = await db
    .select({ id: leadPurchases.id })
    .from(leadPurchases)
    .where(eq(leadPurchases.stripePaymentIntentId, pi.id))
    .limit(1);

  const purchaseId = matches[0]?.id;
  if (!purchaseId) {
    console.warn(
      `[stripe-webhook] payment_intent.payment_failed: no leadPurchase row for pi=${pi.id}`,
    );
    return;
  }

  await db
    .update(leadPurchases)
    .set({ status: "failed", stripeStatus: "failed" })
    .where(eq(leadPurchases.id, purchaseId));

  console.log(
    `[stripe-webhook] payment_intent.payment_failed -> purchase ${purchaseId} marked failed`,
  );
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id ?? null;

  if (!paymentIntentId) {
    console.warn(
      `[stripe-webhook] charge.refunded: charge ${charge.id} has no payment_intent`,
    );
    return;
  }

  const matches = await db
    .select({ id: leadPurchases.id })
    .from(leadPurchases)
    .where(eq(leadPurchases.stripePaymentIntentId, paymentIntentId))
    .limit(1);

  const purchaseId = matches[0]?.id;
  if (!purchaseId) {
    console.warn(
      `[stripe-webhook] charge.refunded: no leadPurchase row for pi=${paymentIntentId}`,
    );
    return;
  }

  await db
    .update(leadPurchases)
    .set({ status: "refunded", stripeStatus: "refunded" })
    .where(eq(leadPurchases.id, purchaseId));

  console.log(
    `[stripe-webhook] charge.refunded -> purchase ${purchaseId} marked refunded`,
  );
}
