/**
 * Integrations API — service-token authenticated endpoints for trusted internal
 * tools (the Discord bot). NOT session/CSRF auth: a single bearer token in the
 * `x-bot-token` header, compared against process.env.BOT_SERVICE_TOKEN.
 *
 * POST /api/integrations/deals — create a deal on behalf of an agent, with the
 * SAME pipeline as the agent-lounge route: agency_id resolution + waterfall
 * commission recording + Discord production-feed notification.
 *
 * Domain: Conduit (integration) + Forge (route). Commission recording is the
 * unchanged Ledger logic (recordCommissions). Sentinel: token-gated.
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { recordCommissions } from "../services/commissionRecordService";

const router = Router();

const ROOT_AGENCY_ID = "00000000-0000-4000-8000-000000000001";

// Service-token gate. Constant-time-ish compare; rejects if token unset.
function requireServiceToken(req: Request, res: Response, next: () => void): void {
  const expected = process.env.BOT_SERVICE_TOKEN;
  const got = req.header("x-bot-token");
  if (!expected || !got || got !== expected) {
    res.status(401).json({ success: false, message: "Invalid service token" });
    return;
  }
  next();
}

router.use(requireServiceToken);

// POST /api/integrations/deals
router.post("/deals", async (req: Request, res: Response) => {
  try {
    const {
      agentUserId, carrier, monthlyPremium, annualPremium,
      clientName, productType, stateCode,
    } = req.body || {};

    if (!agentUserId) return res.status(400).json({ success: false, message: "agentUserId is required" });
    if (!carrier) return res.status(400).json({ success: false, message: "carrier is required" });

    const monthly = parseFloat(String(monthlyPremium ?? "").replace(/[$,]/g, "")) || 0;
    const annual = annualPremium
      ? Math.round(parseFloat(String(annualPremium).replace(/[$,]/g, "")) * 100) / 100
      : Math.round(monthly * 12 * 100) / 100;
    if (annual <= 0) return res.status(400).json({ success: false, message: "premium must be greater than 0" });

    // Same agency_id resolution as the agent-lounge deal route.
    const result = await pool.query(`
      INSERT INTO deals (agent_user_id, agency_id, client_name, carrier, monthly_premium, annual_premium, product_type, state_code, status)
      VALUES (
        $1::uuid,
        COALESCE(
          (SELECT at.agency_id FROM agency_teams at WHERE at.manager_user_id = $1::uuid LIMIT 1),
          (SELECT at.agency_id FROM agent_hierarchy ah
             JOIN agency_teams at ON at.manager_user_id::text = ANY(
                  ARRAY(SELECT jsonb_array_elements_text(ah.upline_chain)))
            WHERE ah.agent_user_id = $1::uuid
              AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
            ORDER BY ah.effective_from DESC LIMIT 1),
          $8::uuid
        ),
        $2, $3, $4, $5, $6, $7, 'submitted'
      )
      RETURNING *
    `, [agentUserId, clientName || null, carrier, monthly, annual, productType || null, stateCode || null, ROOT_AGENCY_ID]);

    const deal = result.rows[0];

    // Waterfall commissions — the same Ledger pipeline the lounge uses.
    if (annual > 0 && deal?.id) {
      recordCommissions(deal.id, agentUserId, annual, "deal").catch((err) =>
        console.error("[Integrations] Commission recording failed:", err?.message),
      );
    }

    // Resolve the agency name for the response (the bot shows it).
    let agencyName: string | null = null;
    if (deal?.agency_id) {
      try {
        const a = await pool.query("SELECT name FROM agencies WHERE id = $1::uuid LIMIT 1", [deal.agency_id]);
        agencyName = a.rows[0]?.name ?? null;
      } catch { /* agencies table optional */ }
    }

    // NOTE: no production-feed notification here. The GCF Production Feed posts
    // only for deals submitted directly in the Heritage agent lounge
    // (server/routes/deals.ts). A Discord /sale already shows its own "Sale
    // Logged" card, so firing the webhook too would double-post.

    return res.status(201).json({
      success: true,
      deal: { id: deal.id, agency_id: deal.agency_id, annual_premium: annual, monthly_premium: monthly },
      agency: agencyName,
    });
  } catch (error: any) {
    console.error("[Integrations] Error creating deal:", error?.message);
    return res.status(500).json({ success: false, message: "Failed to create deal", detail: error?.message });
  }
});

export default router;
