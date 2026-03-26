/**
 * Lead Marketplace API Routes
 * Browse lead products, create payment intents, track purchases
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth } from "../middleware/auth";
import { createPaymentIntent, isStripeAvailable, constructWebhookEvent } from "../services/stripeService";

const router = Router();

// =============================================================================
// LEAD PRODUCTS (server-side source of truth — never trust client prices)
// =============================================================================
const LEAD_PRODUCTS = [
  {
    id: 'consolidation',
    name: 'Consolidation Leads',
    priceCents: 99,
    priceDisplay: '$0.99',
    description: 'Pre-qualified consolidation prospects looking to combine coverage',
    icon: 'layers',
    gradient: 'from-blue-500 to-indigo-600',
    image: 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1774561546465-hf_20260326_213010_2f228bdf-2626-4d4b-bab0-cfef190426eb.jpeg?alt=media&token=9a009024-137a-474f-972d-b5c15da46ce3',
  },
  {
    id: 'survey',
    name: 'Survey Leads',
    priceCents: 50,
    priceDisplay: '$0.50',
    description: 'Survey-generated insurance leads with verified contact info',
    icon: 'clipboard-check',
    gradient: 'from-emerald-500 to-teal-600',
    image: 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1774561536208-hf_20260326_213240_7afb9842-a86d-4e8b-80f2-9ba852f6ce06.jpeg?alt=media&token=7736f3ba-4b5e-4657-afee-fe95d6329d38',
  },
  {
    id: 'live_iul',
    name: 'Live IUL Leads',
    priceCents: 6000,
    priceDisplay: '$60.00',
    description: 'Live IUL prospects ready for immediate consultation',
    icon: 'phone-call',
    gradient: 'from-violet-500 to-purple-600',
    image: 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1774561520280-hf_20260326_213746_ff7fdfc9-b979-4a5b-bbd4-c2691881cb01.png?alt=media&token=60be58b2-35a2-4edd-96d7-95cc628135aa',
    comingSoon: true,
  },
  {
    id: 'high_intent_iul',
    name: 'High Intent Live IUL Leads',
    priceCents: 11000,
    priceDisplay: '$110.00',
    description: 'High-intent live IUL buyers with strong purchase signals',
    icon: 'flame',
    gradient: 'from-amber-500 to-orange-600',
    image: 'https://firebasestorage.googleapis.com/v0/b/gold-coast-fnl.firebasestorage.app/o/products%2F1774561499389-hf_20260326_213938_4294b403-cb88-4174-94ed-1040374e4750.png?alt=media&token=76ab4666-7104-490a-a44c-d6f2f2dc8972',
    comingSoon: true,
  },
  {
    id: 'ai_qualified',
    name: 'AI Qualified Live Inbounds',
    priceCents: 3000,
    priceDisplay: '$30.00',
    description: 'AI pre-screened inbound callers qualified for life insurance',
    comingSoon: true,
    icon: 'bot',
    gradient: 'from-pink-500 to-rose-600',
    image: '',
  },
];

// =============================================================================
// GET /products — List available lead products
// =============================================================================
router.get("/products", (_req: Request, res: Response) => {
  res.json({ success: true, data: LEAD_PRODUCTS });
});

// =============================================================================
// POST /create-payment-intent — Create Stripe PaymentIntent for a lead purchase
// =============================================================================
router.post("/create-payment-intent", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    if (!isStripeAvailable()) {
      return res.status(503).json({ success: false, message: "Payment processing not configured" });
    }

    const { productId, quantity = 1, states = [] } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });
    if (!Array.isArray(states) || states.length === 0) {
      return res.status(400).json({ success: false, message: "Select at least one state" });
    }

    // Look up product server-side (never trust client price)
    const product = LEAD_PRODUCTS.find(p => p.id === productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const qty = Math.max(1, Math.floor(Number(quantity)));
    const totalCents = product.priceCents * qty;

    // Create Stripe PaymentIntent
    const result = await createPaymentIntent(totalCents, {
      userId,
      productId: product.id,
      productName: product.name,
      quantity: String(qty),
      states: states.join(','),
    });

    if (!result) {
      return res.status(500).json({ success: false, message: "Failed to create payment" });
    }

    // Save purchase record
    await pool.query(`
      INSERT INTO lead_purchases (agent_user_id, lead_type, price_cents, quantity, stripe_payment_intent_id, stripe_status)
      VALUES ($1::uuid, $2, $3, $4, $5, 'created')
    `, [userId, product.id, totalCents, qty, result.paymentIntentId]);

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      product: {
        name: product.name,
        priceCents: totalCents,
        priceDisplay: `$${(totalCents / 100).toFixed(2)}`,
      },
    });
  } catch (error: any) {
    console.error("[LeadPurchases] Payment intent error:", error?.message);
    res.status(500).json({ success: false, message: "Failed to create payment", detail: error?.message });
  }
});

// =============================================================================
// GET /my-purchases — Agent's purchase history
// =============================================================================
router.get("/my-purchases", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const result = await pool.query(`
      SELECT * FROM lead_purchases
      WHERE agent_user_id = $1::uuid
      ORDER BY purchased_at DESC
      LIMIT 50
    `, [userId]);

    res.json({ success: true, data: result.rows });
  } catch (error: any) {
    console.error("[LeadPurchases] History error:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch purchase history" });
  }
});

// =============================================================================
// WEBHOOK — Stripe payment events (no auth, raw body)
// =============================================================================
export const leadPurchasesWebhookRouter = Router();

leadPurchasesWebhookRouter.post("/stripe-webhook", async (req: Request, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    if (!sig) return res.status(400).json({ error: "Missing stripe-signature header" });

    // Use raw body saved by express.json verify callback
    const rawBody = (req as any).rawBody || req.body;
    const event = constructWebhookEvent(Buffer.isBuffer(rawBody) ? rawBody : Buffer.from(JSON.stringify(rawBody)), sig);
    if (!event) return res.status(400).json({ error: "Invalid webhook" });

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object as any;
      await pool.query(`
        UPDATE lead_purchases
        SET status = 'paid', stripe_status = 'succeeded'
        WHERE stripe_payment_intent_id = $1
      `, [intent.id]);
      console.log(`[LeadPurchases] Payment succeeded: ${intent.id}`);
    }

    if (event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object as any;
      await pool.query(`
        UPDATE lead_purchases
        SET status = 'failed', stripe_status = 'failed'
        WHERE stripe_payment_intent_id = $1
      `, [intent.id]);
      console.warn(`[LeadPurchases] Payment failed: ${intent.id}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error("[LeadPurchases] Webhook error:", error?.message);
    res.status(400).json({ error: "Webhook processing failed" });
  }
});

export default router;
