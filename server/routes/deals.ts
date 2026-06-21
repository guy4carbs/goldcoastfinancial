/**
 * Agency Deals API Routes
 * Submit deals, query leaderboard, track team production
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { Roles, RoleGroups } from "../types/permissions";
import { recordCommissions } from "../services/commissionRecordService";
import { notifyNewSale } from "../services/discordNotificationService";

const router = Router();

router.use(requireAuth);

// =============================================================================
// POST / — Submit a new deal
// =============================================================================
router.post("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = (req as any).user;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const { clientName, carrier, monthlyPremium, notes, productType, stateCode } = req.body;

    if (!carrier) return res.status(400).json({ success: false, message: "Carrier is required" });
    if (!monthlyPremium || parseFloat(monthlyPremium) <= 0) {
      return res.status(400).json({ success: false, message: "Monthly premium must be greater than 0" });
    }

    const monthly = parseFloat(String(monthlyPremium).replace(/[$,]/g, ''));
    const annual = Math.round(monthly * 12 * 100) / 100;

    // Resolve the submitting agent's agency so the deal is tenant-scoped and
    // shows up in the Gold Coast Founders Lounge (which filters by agency_id).
    // Mirrors the GC backfill logic: agency_teams (if the agent is a manager)
    // → nearest manager in agent_hierarchy.upline_chain → root agency fallback.
    const result = await pool.query(`
      INSERT INTO deals (agent_user_id, agency_id, client_name, carrier, monthly_premium, annual_premium, notes, product_type, state_code)
      VALUES (
        $1::uuid,
        COALESCE(
          (SELECT at.agency_id FROM agency_teams at
            WHERE at.manager_user_id = $1::uuid LIMIT 1),
          (SELECT at.agency_id
             FROM agent_hierarchy ah
             JOIN agency_teams at
               ON at.manager_user_id::text = ANY(
                    ARRAY(SELECT jsonb_array_elements_text(ah.upline_chain))
                  )
            WHERE ah.agent_user_id = $1::uuid
              AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
            ORDER BY ah.effective_from DESC
            LIMIT 1),
          '00000000-0000-4000-8000-000000000001'::uuid
        ),
        $2, $3, $4, $5, $6, $7, $8
      )
      RETURNING *
    `, [userId, clientName || null, carrier, monthly, annual, notes || null, productType || null, stateCode || null]);

    const deal = result.rows[0];

    // Broadcast via WebSocket
    try {
      const agentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agent';
      const wsServer = (req as any).app?.get?.('wsServer');
      if (wsServer?.broadcast) {
        wsServer.broadcast('deals', {
          type: 'deal_submitted',
          agentName,
          carrier,
          monthlyPremium: monthly,
          annualPremium: annual,
          clientName: clientName || null,
          dealId: deal.id,
          timestamp: Date.now(),
        });
      }
    } catch (wsErr) {
      console.error("[Deals] WebSocket broadcast failed:", wsErr);
    }

    // Calculate and record waterfall commissions for this deal
    if (annual > 0 && deal.id) {
      recordCommissions(deal.id, userId, annual, "deal").catch((err) =>
        console.error("[Deals] Commission recording failed:", err)
      );
    }

    // Post to the Discord production feed (fire-and-forget, env-gated)
    {
      const agentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agent';
      notifyNewSale({
        agentName,
        carrier,
        monthlyPremium: monthly,
        annualPremium: annual,
        clientName: clientName || null,
        productType: productType || null,
      }).catch(() => { /* already logged inside the service */ });
    }

    // Auto-populate policy map
    if (deal.id && stateCode) {
      try {
        await pool.query(`
          INSERT INTO agent_policies (user_id, state_code, client_name, carrier, coverage_type, status, premium_amount, coverage_amount, policy_number)
          VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)
        `, [userId, stateCode, clientName || null, carrier, productType || 'term_life', Math.round(monthly * 100), Math.round(annual), null]);
      } catch (err: any) {
        console.warn('[Deals] Auto-populate agent_policies failed:', err?.message);
      }
    }

    // Log to team activity feed
    try {
      const agentName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Agent';
      await pool.query(`
        INSERT INTO team_activity_feed (agent_user_id, agent_name, activity_type, title, message, metadata)
        VALUES ($1, $2, 'deal', 'Deal Submitted', $3, $4)
      `, [userId, agentName, `submitted a ${carrier} deal — $${annual.toLocaleString()} AP`, JSON.stringify({ carrier, annualPremium: annual, dealId: deal.id })]);
    } catch {}

    // Check if client already exists in Book of Business (match by name, case-insensitive)
    let bobMatch = false;
    let pendingProfileId = null;
    if (clientName && clientName.trim()) {
      try {
        const bobCheck = await pool.query(`
          SELECT p.id FROM policies p
          JOIN users u ON p.user_id = u.id
          WHERE p.agent_id = $1
          AND LOWER(CONCAT(COALESCE(u.first_name,''), ' ', COALESCE(u.last_name,''))) = LOWER($2)
          LIMIT 1
        `, [userId, clientName.trim()]);
        bobMatch = bobCheck.rows.length > 0;
      } catch {}

      // If no BoB match, create a pending profile
      if (!bobMatch) {
        try {
          const ppResult = await pool.query(`
            INSERT INTO pending_deal_profiles (deal_id, agent_user_id, client_name, carrier, product_type, state_code, monthly_premium, annual_premium)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
          `, [deal.id, userId, clientName.trim(), carrier, productType || null, stateCode || null, monthly, annual]);
          pendingProfileId = ppResult.rows[0]?.id;
        } catch (err: any) {
          console.warn('[Deals] Pending profile creation failed:', err?.message);
        }
      }
    }

    res.status(201).json({ success: true, data: deal, bobMatch, pendingProfileId });
  } catch (error: any) {
    console.error("[Deals] Error submitting deal:", error?.message);
    res.status(500).json({ success: false, message: "Failed to submit deal", detail: error?.message });
  }
});

// =============================================================================
// GET / — List deals (agents see own, managers/owners see all)
// =============================================================================
router.get("/", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const period = (req.query.period as string) || 'month';
    const periodStart = getPeriodStart(period);

    const isAgent = userRole === 'sales_agent';

    let query = `
      SELECT d.*, u.first_name as agent_first_name, u.last_name as agent_last_name
      FROM deals d
      JOIN users u ON d.agent_user_id = u.id
      WHERE d.submitted_at >= $1
    `;
    const params: any[] = [periodStart];

    if (isAgent) {
      query += ` AND d.agent_user_id = $2::uuid`;
      params.push(userId);
    }

    query += ` ORDER BY d.submitted_at DESC LIMIT 100`;

    const result = await pool.query(query, params);

    const deals = result.rows.map((r: any) => ({
      ...r,
      agentName: `${r.agent_first_name || ''} ${r.agent_last_name || ''}`.trim(),
    }));

    res.json({ success: true, data: deals });
  } catch (error: any) {
    console.error("[Deals] Error fetching deals:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch deals" });
  }
});

// =============================================================================
// GET /leaderboard — Top 20 agents by total AP
// =============================================================================
router.get("/leaderboard", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'month';
    const periodStart = getPeriodStart(period);

    const userId = (req as any).user?.id;

    const result = await pool.query(`
      SELECT d.agent_user_id,
             u.first_name, u.last_name,
             SUM(d.annual_premium::numeric) as total_ap,
             COUNT(*)::int as deal_count,
             h.contract_level
      FROM deals d
      JOIN users u ON d.agent_user_id = u.id
      LEFT JOIN agent_hierarchy h ON d.agent_user_id = h.agent_user_id AND h.effective_to IS NULL
      WHERE d.status != 'rejected'
        AND d.submitted_at >= $1
      GROUP BY d.agent_user_id, u.first_name, u.last_name, h.contract_level
      ORDER BY total_ap DESC
      LIMIT 20
    `, [periodStart]);

    let currentUserRank: number | null = null;
    const leaderboard = result.rows.map((r: any, idx: number) => {
      const isCurrentUser = userId ? r.agent_user_id === userId : false;
      if (isCurrentUser) currentUserRank = idx + 1;
      return {
        rank: idx + 1,
        agentUserId: r.agent_user_id,
        firstName: r.first_name || '',
        lastName: r.last_name || '',
        name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
        totalAP: parseFloat(r.total_ap) || 0,
        dealCount: r.deal_count || 0,
        contractLevel: parseFloat(r.contract_level) || 0,
        isCurrentUser,
      };
    });

    res.json({ success: true, data: leaderboard, currentUserRank });
  } catch (error: any) {
    console.error("[Deals] Error fetching leaderboard:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
  }
});

// =============================================================================
// GET /my-stats — Current agent's personal deal stats
// =============================================================================
router.get("/my-stats", async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });

    const period = (req.query.period as string) || 'month';
    const periodStart = getPeriodStart(period);

    const result = await pool.query(`
      SELECT
        COALESCE(SUM(annual_premium::numeric), 0) as total_ap,
        COUNT(*)::int as total_deals
      FROM deals
      WHERE agent_user_id = $1::uuid
        AND status != 'rejected'
        AND submitted_at >= $2
    `, [userId, periodStart]);

    const stats = result.rows[0];

    // Get rank among all agents
    const rankResult = await pool.query(`
      SELECT agent_user_id, SUM(annual_premium::numeric) as total_ap
      FROM deals
      WHERE status != 'rejected' AND submitted_at >= $1
      GROUP BY agent_user_id
      ORDER BY total_ap DESC
    `, [periodStart]);

    const rank = rankResult.rows.findIndex((r: any) => r.agent_user_id === userId) + 1;

    res.json({
      success: true,
      data: {
        totalAP: parseFloat(stats.total_ap) || 0,
        totalDeals: stats.total_deals || 0,
        rank: rank || 0,
      },
    });
  } catch (error: any) {
    console.error("[Deals] Error fetching my stats:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch personal stats" });
  }
});

// =============================================================================
// GET /stats — Team aggregate stats
// =============================================================================
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'month';
    const periodStart = getPeriodStart(period);

    const result = await pool.query(`
      SELECT
        COALESCE(SUM(annual_premium::numeric), 0) as total_ap,
        COUNT(*)::int as total_deals,
        COALESCE(AVG(annual_premium::numeric), 0) as avg_deal_size
      FROM deals
      WHERE status != 'rejected'
        AND submitted_at >= $1
    `, [periodStart]);

    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        totalAP: parseFloat(stats.total_ap) || 0,
        totalDeals: stats.total_deals || 0,
        avgDealSize: Math.round(parseFloat(stats.avg_deal_size) || 0),
      },
    });
  } catch (error: any) {
    console.error("[Deals] Error fetching stats:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// =============================================================================
// PATCH /:id/verify — Verify or reject a deal (manager/owner only)
// =============================================================================
router.patch("/:id/verify",
  requireRole(...RoleGroups.MANAGEMENT),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { status } = req.body;

      if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be 'verified' or 'rejected'" });
      }

      const result = await pool.query(`
        UPDATE deals SET status = $1, verified_at = NOW(), verified_by = $2::uuid, updated_at = NOW()
        WHERE id = $3::uuid
        RETURNING *
      `, [status, userId, id]);

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: "Deal not found" });
      }

      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      console.error("[Deals] Error verifying deal:", error?.message);
      res.status(500).json({ success: false, message: "Failed to verify deal" });
    }
  }
);

// =============================================================================
// HELPER: Get period start date
// =============================================================================
function getPeriodStart(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'week':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'all':
      return new Date(2020, 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

export default router;
