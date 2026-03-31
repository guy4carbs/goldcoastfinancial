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
// LEAD COST & DISPLAY NAME CONSTANTS
// =============================================================================
const LEAD_COSTS_CENTS: Record<string, number> = {
  consolidation: 50,
  survey: 35,
  live_iul: 5000,
  high_intent_iul: 10000,
  ai_qualified: 2000,
};

const LEAD_TYPE_NAMES: Record<string, string> = {
  consolidation: 'Consolidation',
  survey: 'Survey',
  live_iul: 'Live IUL',
  high_intent_iul: 'High Intent IUL',
  ai_qualified: 'AI Qualified',
};

function getLeadPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'daily':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'weekly': {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    }
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    case 'all':
    default:
      return new Date(2020, 0, 1);
  }
}

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
// GET /analytics — Lead Revenue analytics (summary, trends, purchase history)
// =============================================================================
router.get('/analytics', requireAuth, async (req: Request, res: Response) => {
  try {
    const { lead_type, status: filterStatus, search, page = '1', limit = '50', period = 'all' } = req.query;
    const periodStart = getLeadPeriodStart(period as string);

    // --- SUMMARY: Revenue/Cost/Profit by lead type ---
    const summaryResult = await pool.query(`
      SELECT lead_type, COUNT(*) AS purchase_count,
             SUM(quantity) AS total_quantity,
             SUM(price_cents) AS total_revenue_cents
      FROM lead_purchases WHERE status = 'paid' AND purchased_at >= $1
      GROUP BY lead_type
    `, [periodStart]);

    let totalRevenueCents = 0;
    let totalCostCents = 0;
    let totalLeadsSold = 0;

    const byType = summaryResult.rows.map(row => {
      const qty = parseInt(row.total_quantity) || 0;
      const revCents = parseInt(row.total_revenue_cents) || 0;
      const costCents = qty * (LEAD_COSTS_CENTS[row.lead_type] || 0);
      const profitCents = revCents - costCents;
      const marginPercent = revCents > 0 ? (profitCents / revCents) * 100 : 0;

      totalRevenueCents += revCents;
      totalCostCents += costCents;
      totalLeadsSold += qty;

      return {
        leadType: row.lead_type,
        displayName: LEAD_TYPE_NAMES[row.lead_type] || row.lead_type,
        purchaseCount: parseInt(row.purchase_count) || 0,
        quantitySold: qty,
        revenueCents: revCents,
        costCents,
        profitCents,
        marginPercent: Math.round(marginPercent * 10) / 10,
      };
    });

    const totalProfitCents = totalRevenueCents - totalCostCents;
    const profitMarginPercent = totalRevenueCents > 0 ? Math.round((totalProfitCents / totalRevenueCents) * 1000) / 10 : 0;

    // --- TRENDS: Monthly aggregation ---
    const trendsResult = await pool.query(`
      SELECT TO_CHAR(purchased_at, 'YYYY-MM') AS month,
             lead_type,
             SUM(quantity) AS total_quantity,
             SUM(price_cents) AS total_revenue_cents
      FROM lead_purchases WHERE status = 'paid' AND purchased_at >= $1
      GROUP BY month, lead_type ORDER BY month ASC
    `, [periodStart]);

    // Aggregate by month
    const monthMap: Record<string, { revenueCents: number; costCents: number; profitCents: number }> = {};
    for (const row of trendsResult.rows) {
      const m = row.month;
      if (!monthMap[m]) monthMap[m] = { revenueCents: 0, costCents: 0, profitCents: 0 };
      const qty = parseInt(row.total_quantity) || 0;
      const rev = parseInt(row.total_revenue_cents) || 0;
      const cost = qty * (LEAD_COSTS_CENTS[row.lead_type] || 0);
      monthMap[m].revenueCents += rev;
      monthMap[m].costCents += cost;
      monthMap[m].profitCents += (rev - cost);
    }

    const trends = Object.entries(monthMap).map(([month, data]) => {
      const [y, m] = month.split('-');
      const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return {
        month,
        monthDisplay: `${monthNames[parseInt(m) - 1]} ${y}`,
        ...data,
      };
    });

    // --- PURCHASES: Paginated history with agent names ---
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const offset = (pageNum - 1) * limitNum;

    let whereConditions = ['1=1'];
    let params: any[] = [];
    let paramIdx = 1;

    whereConditions.push(`lp.purchased_at >= $${paramIdx++}`);
    params.push(periodStart);

    if (lead_type && lead_type !== 'all') {
      whereConditions.push(`lp.lead_type = $${paramIdx++}`);
      params.push(lead_type);
    }
    if (filterStatus && filterStatus !== 'all') {
      whereConditions.push(`lp.status = $${paramIdx++}`);
      params.push(filterStatus);
    }
    if (search) {
      whereConditions.push(`(u.first_name ILIKE $${paramIdx} OR u.last_name ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    const whereClause = whereConditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM lead_purchases lp JOIN users u ON lp.agent_user_id = u.id WHERE ${whereClause}`,
      params
    );

    const purchasesResult = await pool.query(
      `SELECT lp.id, lp.lead_type, lp.quantity, lp.price_cents, lp.status, lp.stripe_status, lp.purchased_at, lp.created_at,
              u.first_name, u.last_name, u.email
       FROM lead_purchases lp
       JOIN users u ON lp.agent_user_id = u.id
       WHERE ${whereClause}
       ORDER BY lp.purchased_at DESC NULLS LAST, lp.created_at DESC
       LIMIT $${paramIdx++} OFFSET $${paramIdx++}`,
      [...params, limitNum, offset]
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenueCents,
          totalCostCents,
          totalProfitCents,
          profitMarginPercent,
          totalLeadsSold,
          byType,
        },
        trends,
        purchases: {
          data: purchasesResult.rows.map(r => ({
            id: r.id,
            agentName: `${r.first_name} ${r.last_name}`,
            agentEmail: r.email,
            leadType: r.lead_type,
            displayName: LEAD_TYPE_NAMES[r.lead_type] || r.lead_type,
            quantity: r.quantity,
            priceCents: r.price_cents,
            status: r.status || r.stripe_status || 'pending',
            purchasedAt: r.purchased_at || r.created_at,
          })),
          total: parseInt(countResult.rows[0]?.count) || 0,
          page: pageNum,
          limit: limitNum,
        },
      },
    });
  } catch (error) {
    console.error('Lead purchases analytics error:', error);
    res.status(500).json({ success: false, error: 'Failed to load analytics' });
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
