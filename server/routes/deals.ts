/**
 * Agency Deals API Routes
 * Submit deals, query leaderboard, track team production
 */
import { Router, Request, Response } from "express";
import { pool } from "../db";
import { requireAuth, requireRole } from "../middleware/auth";
import { Roles } from "../types/permissions";

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

    const { clientName, carrier, monthlyPremium, notes } = req.body;

    if (!carrier) return res.status(400).json({ success: false, message: "Carrier is required" });
    if (!monthlyPremium || parseFloat(monthlyPremium) <= 0) {
      return res.status(400).json({ success: false, message: "Monthly premium must be greater than 0" });
    }

    const monthly = parseFloat(String(monthlyPremium).replace(/[$,]/g, ''));
    const annual = Math.round(monthly * 12 * 100) / 100;

    const result = await pool.query(`
      INSERT INTO deals (agent_user_id, client_name, carrier, monthly_premium, annual_premium, notes)
      VALUES ($1::uuid, $2, $3, $4, $5, $6)
      RETURNING *
    `, [userId, clientName || null, carrier, monthly, annual, notes || null]);

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

    res.status(201).json({ success: true, data: deal });
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

    const result = await pool.query(`
      SELECT d.agent_user_id,
             u.first_name, u.last_name,
             SUM(d.annual_premium::numeric) as total_ap,
             COUNT(*)::int as deal_count
      FROM deals d
      JOIN users u ON d.agent_user_id = u.id
      WHERE d.status != 'rejected'
        AND d.submitted_at >= $1
      GROUP BY d.agent_user_id, u.first_name, u.last_name
      ORDER BY total_ap DESC
      LIMIT 20
    `, [periodStart]);

    const leaderboard = result.rows.map((r: any, idx: number) => ({
      rank: idx + 1,
      agentUserId: r.agent_user_id,
      firstName: r.first_name || '',
      lastName: r.last_name || '',
      name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
      totalAP: parseFloat(r.total_ap) || 0,
      dealCount: r.deal_count || 0,
    }));

    res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    console.error("[Deals] Error fetching leaderboard:", error?.message);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard" });
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
  requireRole(Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER),
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
