// Finance Revenue endpoints — by-carrier + by-agent breakdown for the
// Founders Revenue page. Mounted at /api/finance/revenue.
//
// Wave R1 (2026-05): tenancy-scoped via viewerAgencyScope (was system-wide
// leak). Status filter widened to honor-system NOT IN ('rejected','reversed',
// 'cancelled') matching the Dashboard. Half-open date interval. Team name
// derived from agency_teams. Demo data hard-killed (per founder mandate).

import { Router, type Request } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";
import { resolveAgentAgency } from "../services/agencyResolver";

const router = Router();

const ALLOWED_PERIODS = new Set([
  "all", "today", "wtd", "mtd", "qtd", "ytd", "6mo",
  "this-month", "last-month", "last-3", "last-6", "last-year",
]);
function safePeriod(raw: any, fallback = "ytd"): string {
  const s = String(raw || fallback);
  return ALLOWED_PERIODS.has(s) ? s : fallback;
}

type ViewerScope =
  | { systemWide: true }
  | { agencyId: string }
  | { forbidden: true };

async function viewerAgencyScope(req: Request): Promise<ViewerScope> {
  const role = req.user?.role;
  if (role === "owner" || role === "system_admin") return { systemWide: true };
  const userId = req.user?.id;
  if (!userId) return { forbidden: true };
  const resolved = await resolveAgentAgency(userId);
  if (!resolved?.agencyId) return { forbidden: true };
  return { agencyId: resolved.agencyId };
}
function scopeId(scope: ViewerScope): string | null {
  if ("forbidden" in scope) return null;
  if ("systemWide" in scope) return null;
  return scope.agencyId;
}

// GET /kpis?period= — Revenue KPIs from deals (AP-based, agency-scoped)
router.get("/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    const result = await pool.query(
      `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) AS total_ap,
              COUNT(*)::int AS deal_count,
              COUNT(DISTINCT carrier)::int AS carrier_count,
              COUNT(DISTINCT agent_user_id)::int AS agent_count
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date
          AND created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)`,
      [start, end, agencyId],
    );

    const totalAP = Number(result.rows[0]?.total_ap) || 0;
    res.json({
      totalRevenue: totalAP,
      overrideIncome: 0, // Computed in /api/founders/revenue/kpis via waterfall
      renewalIncome: 0,
      dealCount: result.rows[0]?.deal_count || 0,
      carrierCount: result.rows[0]?.carrier_count || 0,
      agentCount: result.rows[0]?.agent_count || 0,
    });
  } catch (e: any) {
    console.error("[finance-revenue] /kpis error:", e?.message);
    res.status(500).json({ error: "Failed to load finance revenue KPIs" });
  }
});

// GET /quarterly?period= — AP by quarter (agency-scoped)
router.get("/quarterly", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    const result = await pool.query(
      `SELECT 'Q' || EXTRACT(QUARTER FROM created_at)::int || ' ' || EXTRACT(YEAR FROM created_at)::int AS label,
              EXTRACT(YEAR FROM created_at) AS year,
              EXTRACT(QUARTER FROM created_at) AS quarter,
              COALESCE(SUM(annual_premium::numeric), 0)::numeric(14,2) AS total
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date
          AND created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)
        GROUP BY 2, 3, 1
        ORDER BY 2, 3`,
      [start, end, agencyId],
    );
    res.json(result.rows.map(r => ({
      label: r.label,
      year: Number(r.year),
      quarter: Number(r.quarter),
      total: Number(r.total),
    })));
  } catch (e: any) {
    console.error("[finance-revenue] /quarterly error:", e?.message);
    res.status(500).json({ error: "Failed to load finance revenue quarterly" });
  }
});

// GET /by-carrier?period= — AP grouped by carrier (agency-scoped, no demo)
// Response shape: { carrier, deals, ap, issuedAp }
router.get("/by-carrier", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    const result = await pool.query(
      `SELECT d.carrier,
              COUNT(*)::int AS deals,
              COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(14,2) AS ap,
              COALESCE(SUM(CASE WHEN d.status IN ('verified','issued')
                                THEN d.annual_premium::numeric ELSE 0 END), 0)::numeric(14,2) AS issued_ap
         FROM deals d
        WHERE d.status NOT IN ('rejected', 'reversed', 'cancelled')
          AND d.created_at >= $1::date
          AND d.created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR d.agency_id = $3::uuid)
        GROUP BY d.carrier
        ORDER BY ap DESC`,
      [start, end, agencyId],
    );
    res.json(result.rows.map(r => ({
      carrier: r.carrier,
      deals: r.deals,
      ap: Number(r.ap),
      issuedAp: Number(r.issued_ap),
    })));
  } catch (e: any) {
    console.error("[finance-revenue] /by-carrier error:", e?.message);
    res.status(500).json({ error: "Failed to load revenue by carrier" });
  }
});

// GET /by-agent?period= — AP grouped by agent (agency-scoped, real team name)
// Response shape: { agentId, name, team, deals, ap }
router.get("/by-agent", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    // Team name = the manager's last name in the agent's upline chain.
    // Falls back to "—" when no manager-tier upline resolves.
    const result = await pool.query(
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
       SELECT d.agent_user_id AS agent_id,
              CONCAT(u.first_name, ' ', u.last_name) AS name,
              COALESCE(at2.manager_last_name, '') AS team_last_name,
              COUNT(*)::int AS deals,
              COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(14,2) AS ap
         FROM deals d
         JOIN users u ON u.id = d.agent_user_id
         LEFT JOIN agent_team at2 ON at2.agent_user_id = d.agent_user_id
        WHERE d.status NOT IN ('rejected', 'reversed', 'cancelled')
          AND d.created_at >= $1::date
          AND d.created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR d.agency_id = $3::uuid)
        GROUP BY d.agent_user_id, u.first_name, u.last_name, at2.manager_last_name
        ORDER BY ap DESC`,
      [start, end, agencyId],
    );
    res.json(result.rows.map(r => ({
      agentId: r.agent_id,
      name: r.name,
      team: r.team_last_name ? `Team ${r.team_last_name}` : "—",
      deals: r.deals,
      ap: Number(r.ap),
    })));
  } catch (e: any) {
    console.error("[finance-revenue] /by-agent error:", e?.message);
    res.status(500).json({ error: "Failed to load revenue by agent" });
  }
});

export default router;
