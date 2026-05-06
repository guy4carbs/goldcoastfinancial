/**
 * Lead Marketplace — revenue dashboards (founders) + checkout flow (agents).
 *
 * Wave 2 (Forge). Pairs with:
 *   - shared/models/leadMarketplace.ts (Vector — schema)
 *   - server/lib/stripe.ts             (singleton Stripe client)
 *   - server/routes/stripe-webhook.ts  (Conduit — flips lead_purchases.status
 *                                       to 'completed' on checkout.session.completed)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * MONEY HANDLING
 * ─────────────────────────────────────────────────────────────────────────────
 * All amounts are integer cents in BOTH the database and the API responses.
 * No floats anywhere — JS Number can lose pennies on fractional ops at scale.
 * Frontend formats cents → dollars at the very last mile.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * VENDOR-COST EXPOSURE GATE
 * ─────────────────────────────────────────────────────────────────────────────
 * `vendor_cost_cents` (catalog) and `vendor_cost_cents_snapshot` (purchases)
 * are FINANCE-ONLY. They are flagged as such in shared/models/leadMarketplace.ts
 * and Vector explicitly called this out. The agent-facing endpoints in this
 * file (`/api/leads/catalog`, `/api/leads/checkout`, `/api/leads/purchases/:id`)
 * SELECT only the agent-safe columns; vendor cost never enters the response
 * shape. Founders endpoints (`/api/founders/lead-revenue/*`) are gated by
 * FOUNDERS_ONLY + MANAGER_PLUS and DO surface vendor cost so Ledger can verify
 * margin math.
 */
import { Router } from "express";
import { z } from "zod";
import { pool, db } from "../db";
import {
  requireAuth,
  requireRole,
  ADMIN_PLUS,
  blockWritesDuringViewAs,
} from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";
import { stripe } from "../lib/stripe";
import { leadProducts, leadPurchases } from "@shared/schema";
import { eq, and } from "drizzle-orm";
// Demo helpers intentionally unused — per founder mandate 2026-05-04, the
// Founders Revenue page surfaces only real DB data. Empty states render
// instead of fabricated numbers. Kept the file aware of these helpers in
// case they are reintroduced for staging-only previews behind a flag.
// import {
//   DEMO_FALLBACK_ENABLED,
//   demoLeadRevenueKpis,
//   demoLeadRevenueByProduct,
// } from "../services/foundersDemoData";

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDERS — revenue dashboards. Mounted at /api/founders/lead-revenue.
// ─────────────────────────────────────────────────────────────────────────────

const foundersRouter = Router();
foundersRouter.use(requireAuth);
// Founders Lounge is founders-only. ADMIN_PLUS = [FOUNDER, OWNER, SYSTEM_ADMIN]
// (system_admin retained for break-glass). Managers are NOT admitted to founder
// financial data including vendor cost / margin math.
foundersRouter.use(requireRole(...ADMIN_PLUS));

/**
 * GET /api/founders/lead-revenue/kpis?period=
 * Aggregates over completed purchases in the requested window.
 */
foundersRouter.get("/kpis", async (req, res) => {
  try {
    const period = (req.query.period as string) || "ytd";
    const { start, end } = getDateRange(period);

    // COALESCE on vendor_cost_cents_snapshot — heritage-app branch's rows
    // pre-date that column (NULLs would zero-out the entire SUM otherwise).
    const r = await pool.query(
      `SELECT
         COALESCE(SUM(price_cents * COALESCE(quantity, 1)), 0)::bigint           AS gross_cents,
         COALESCE(SUM(COALESCE(vendor_cost_cents_snapshot, 0) * COALESCE(quantity, 1)), 0)::bigint AS vendor_cost_cents,
         COALESCE(SUM(COALESCE(quantity, 1)), 0)::int                            AS units_sold
       FROM lead_purchases
       WHERE status IN ('completed', 'paid')
         AND created_at >= $1::date
         AND created_at <  ($2::date + INTERVAL '1 day')`,
      [start, end],
    );

    const row = r.rows[0] || {};
    const grossCents = Number(row.gross_cents) || 0;
    const vendorCostCents = Number(row.vendor_cost_cents) || 0;
    const unitsSold = Number(row.units_sold) || 0;

    res.json({
      grossCents,
      vendorCostCents,
      netProfitCents: grossCents - vendorCostCents,
      unitsSold,
      periodLabel: period,
    });
  } catch (e: any) {
    console.error("Lead revenue KPIs error:", e?.message);
    res.status(500).json({ error: "Failed to load lead revenue KPIs" });
  }
});

/**
 * GET /api/founders/lead-revenue/by-product?period=
 * Per-product revenue + margin. Joined to lead_products so we keep slug+name
 * even after a product is renamed (snapshot price still applies because it's
 * stored on lead_purchases).
 */
foundersRouter.get("/by-product", async (req, res) => {
  try {
    const period = (req.query.period as string) || "ytd";
    const { start, end } = getDateRange(period);

    // The heritage-app branch's marketplace stores the product slug directly
    // in `lp.lead_type` and DOES NOT populate `lp.lead_product_id`. The
    // `feature/hcms-foundation` checkout flow stores the FK in
    // `lp.lead_product_id` and `lpd.slug` in `lp.lead_type`. To surface BOTH
    // paths in one query, join on `lpd.id = lp.lead_product_id` OR
    // `lpd.slug = lp.lead_type`. Either side wins.
    const r = await pool.query(
      `SELECT
         lpd.slug                                                               AS slug,
         lpd.name                                                               AS name,
         COALESCE(SUM(COALESCE(lp.quantity, 1)), 0)::int                        AS units,
         COALESCE(SUM(lp.price_cents * COALESCE(lp.quantity, 1)), 0)::bigint    AS gross_cents,
         COALESCE(SUM(COALESCE(lp.vendor_cost_cents_snapshot, 0) * COALESCE(lp.quantity, 1)), 0)::bigint
                                                                                AS vendor_cost_cents
       FROM lead_purchases lp
       JOIN lead_products lpd ON lpd.id = lp.lead_product_id
                              OR lpd.slug = lp.lead_type
       WHERE lp.status IN ('completed', 'paid')
         AND lp.created_at >= $1::date
         AND lp.created_at <  ($2::date + INTERVAL '1 day')
       GROUP BY lpd.slug, lpd.name
       ORDER BY gross_cents DESC`,
      [start, end],
    );

    res.json(
      r.rows.map((row: any) => {
        const grossCents = Number(row.gross_cents) || 0;
        const vendorCostCents = Number(row.vendor_cost_cents) || 0;
        const netProfitCents = grossCents - vendorCostCents;
        const marginPct = grossCents > 0 ? (netProfitCents / grossCents) * 100 : 0;
        return {
          slug: row.slug,
          name: row.name,
          units: Number(row.units) || 0,
          grossCents,
          vendorCostCents,
          netProfitCents,
          marginPct,
        };
      }),
    );
  } catch (e: any) {
    console.error("Lead revenue by-product error:", e?.message);
    res.status(500).json({ error: "Failed to load lead revenue by product" });
  }
});

/**
 * GET /api/founders/lead-revenue/by-agent?period=
 * Joined to users for display name. teamName is the manager's last name so we
 * can group rows in the UI; it's nullable when the agent isn't in any
 * manager's downline (rare but possible during onboarding gaps). Uses the
 * same agent_hierarchy `upline_chain @>` lookup that teamDerivation.ts uses.
 */
foundersRouter.get("/by-agent", async (req, res) => {
  try {
    const period = (req.query.period as string) || "ytd";
    const { start, end } = getDateRange(period);

    const r = await pool.query(
      `WITH agent_team AS (
         SELECT ah.agent_user_id,
                mu.last_name AS manager_last_name
         FROM agent_hierarchy ah
         CROSS JOIN LATERAL (
           SELECT m.agent_user_id
           FROM agent_hierarchy m
           WHERE m.hierarchy_level IN (3, 4)
             AND (m.effective_to IS NULL OR m.effective_to > NOW())
             AND ah.upline_chain @> to_jsonb(ARRAY[m.agent_user_id::text])
           LIMIT 1
         ) tm
         JOIN users mu ON mu.id = tm.agent_user_id
         WHERE (ah.effective_to IS NULL OR ah.effective_to > NOW())
       )
       SELECT
         lp.agent_user_id                                                       AS agent_id,
         CONCAT(u.first_name, ' ', u.last_name)                                  AS agent_name,
         at2.manager_last_name                                                   AS team_last_name,
         COALESCE(SUM(COALESCE(lp.quantity, 1)), 0)::int                        AS units,
         COALESCE(SUM(lp.price_cents * COALESCE(lp.quantity, 1)), 0)::bigint    AS gross_cents,
         COALESCE(SUM(
           (lp.price_cents - lp.vendor_cost_cents_snapshot) * COALESCE(lp.quantity, 1)
         ), 0)::bigint                                                          AS net_profit_cents
       FROM lead_purchases lp
       JOIN users u ON u.id = lp.agent_user_id
       LEFT JOIN agent_team at2 ON at2.agent_user_id = lp.agent_user_id
       WHERE lp.status IN ('completed', 'paid')
         AND lp.created_at >= $1::date
         AND lp.created_at <  ($2::date + INTERVAL '1 day')
       GROUP BY lp.agent_user_id, u.first_name, u.last_name, at2.manager_last_name
       ORDER BY gross_cents DESC
       LIMIT 50`,
      [start, end],
    );

    res.json(
      r.rows.map((row: any) => ({
        agentId: row.agent_id,
        agentName: row.agent_name,
        teamName: row.team_last_name ? `Team ${row.team_last_name}` : null,
        units: Number(row.units) || 0,
        grossCents: Number(row.gross_cents) || 0,
        netProfitCents: Number(row.net_profit_cents) || 0,
      })),
    );
  } catch (e: any) {
    console.error("Lead revenue by-agent error:", e?.message);
    res.status(500).json({ error: "Failed to load lead revenue by agent" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AGENT — catalog + checkout. Mounted at /api/leads.
//
// Vendor-cost columns are deliberately omitted from every SELECT below.
// ─────────────────────────────────────────────────────────────────────────────

const agentRouter = Router();
agentRouter.use(requireAuth);

/**
 * GET /api/leads/catalog
 * Returns the active products an agent can buy. Strips vendor cost.
 */
agentRouter.get("/catalog", async (_req, res) => {
  try {
    // Drizzle select with explicit fields so vendor_cost_cents physically
    // cannot leak into the response — even if a future hand-edit adds it to
    // the table, this select still won't hydrate it.
    const rows = await db
      .select({
        slug: leadProducts.slug,
        name: leadProducts.name,
        description: leadProducts.description,
        priceCents: leadProducts.priceCents,
        comingSoon: leadProducts.comingSoon,
      })
      .from(leadProducts)
      .where(eq(leadProducts.active, true));

    res.json(
      rows.map((r) => ({
        slug: r.slug,
        name: r.name,
        description: r.description ?? "",
        priceCents: r.priceCents,
        comingSoon: r.comingSoon,
      })),
    );
  } catch (e: any) {
    console.error("Lead catalog error:", e?.message);
    res.status(500).json({ error: "Failed to load lead catalog" });
  }
});

const checkoutSchema = z.object({
  slug: z.string().min(1).max(60),
});

/**
 * POST /api/leads/checkout
 * Creates a Stripe Checkout Session for the requested product and inserts a
 * pending lead_purchases row. The webhook handler flips status → 'completed'
 * once Stripe fires checkout.session.completed (matched by checkout session id).
 */
agentRouter.post(
  "/checkout",
  blockWritesDuringViewAs,
  async (req, res) => {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid payload", details: parsed.error.issues });
    }

    if (!req.user) {
      // requireAuth above guarantees this, but TS narrowing needs the check.
      return res.status(401).json({ error: "Authentication required" });
    }

    const { slug } = parsed.data;

    try {
      // Look up the product. Drizzle with explicit fields so vendor_cost_cents
      // is included here (we need it for the snapshot insert) but stays in
      // server memory — it never leaves this handler.
      const products = await db
        .select({
          id: leadProducts.id,
          slug: leadProducts.slug,
          name: leadProducts.name,
          priceCents: leadProducts.priceCents,
          vendorCostCents: leadProducts.vendorCostCents,
          stripePriceId: leadProducts.stripePriceId,
          active: leadProducts.active,
          comingSoon: leadProducts.comingSoon,
        })
        .from(leadProducts)
        .where(eq(leadProducts.slug, slug))
        .limit(1);

      const product = products[0];
      if (!product) {
        return res.status(404).json({ error: "Lead product not found" });
      }
      if (!product.active) {
        return res.status(400).json({ error: "Lead product is inactive" });
      }
      if (product.comingSoon) {
        return res
          .status(400)
          .json({ error: "Lead product is not yet available for purchase" });
      }

      // Build the line item. Prefer the canonical Stripe Price id when one
      // exists; fall back to inline price_data so checkout works even before
      // the seed-stripe-products script has been run for fresh environments.
      const lineItem: any = product.stripePriceId
        ? { price: product.stripePriceId, quantity: 1 }
        : {
            price_data: {
              currency: "usd",
              unit_amount: product.priceCents,
              product_data: { name: product.name },
            },
            quantity: 1,
          };

      // Origin for redirect URLs. Falls back to the configured public URL when
      // the request lacks an Origin header (e.g. server-to-server testing).
      const origin =
        (req.headers.origin as string | undefined) ||
        process.env.PUBLIC_APP_URL ||
        "https://heritagels.org";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [lineItem],
        success_url: `${origin}/hcms/my/leads/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/hcms/my/leads`,
        customer_email: req.user.email,
        metadata: {
          agentUserId: req.user.id,
          leadProductId: product.id,
          slug: product.slug,
        },
      });

      // Insert pending purchase. Source-of-truth for stripeCheckoutSessionId
      // — the webhook handler matches on this column to flip status.
      await db.insert(leadPurchases).values({
        agentUserId: req.user.id,
        leadProductId: product.id,
        leadType: product.slug,
        priceCents: product.priceCents,
        vendorCostCentsSnapshot: product.vendorCostCents,
        quantity: 1,
        currency: "usd",
        status: "pending",
        stripeStatus: "pending",
        stripeCheckoutSessionId: session.id,
      });

      return res.json({ checkoutUrl: session.url, sessionId: session.id });
    } catch (e: any) {
      console.error("Lead checkout error:", e?.message);
      return res.status(500).json({ error: "Failed to start checkout" });
    }
  },
);

/**
 * GET /api/leads/purchases/:sessionId
 * Polled by the success page until the webhook flips status → 'completed'.
 * Authorisation: the requesting user must own the row OR be an admin.
 */
agentRouter.get("/purchases/:sessionId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const sessionId = req.params.sessionId;
  if (!sessionId || sessionId.length > 255) {
    return res.status(400).json({ error: "Invalid session id" });
  }

  try {
    const rows = await db
      .select({
        id: leadPurchases.id,
        agentUserId: leadPurchases.agentUserId,
        status: leadPurchases.status,
        leadType: leadPurchases.leadType,
        deliveredAt: leadPurchases.deliveredAt,
        purchasedAt: leadPurchases.purchasedAt,
      })
      .from(leadPurchases)
      .where(eq(leadPurchases.stripeCheckoutSessionId, sessionId))
      .limit(1);

    const purchase = rows[0];
    if (!purchase) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const isOwner = purchase.agentUserId === req.user.id;
    const isAdmin = (ADMIN_PLUS as string[]).includes(req.user.role);
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({
      status: purchase.status ?? "pending",
      leadProductSlug: purchase.leadType,
      // `completedAt` mirrors the webhook flip — once the row is marked
      // completed the deliveredAt is set by downstream automation; until then
      // we surface purchasedAt so the UI has *something* to show. The status
      // field is the authoritative gate.
      completedAt:
        purchase.status === "completed"
          ? purchase.deliveredAt ?? purchase.purchasedAt ?? null
          : null,
    });
  } catch (e: any) {
    console.error("Lead purchase status error:", e?.message);
    return res.status(500).json({ error: "Failed to look up purchase" });
  }
});

export { foundersRouter as leadRevenueFoundersRouter, agentRouter as leadRevenueAgentRouter };
