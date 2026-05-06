// Founders Oversight router — dashboard + revenue + growth endpoints.
// Mounted at /api/founders by routes.ts. ADMIN_PLUS gated.
//
// Tenancy model:
//   - OWNER / SYSTEM_ADMIN: system-wide reads (scope = null).
//   - FOUNDER and other ADMIN_PLUS roles: queries are scoped to the
//     viewer's resolved agency via resolveAgentAgency(). If the viewer
//     can't be resolved to an agency, the request fail-closes with 403
//     (no silent fallback to ROOT to prevent cross-tenant leak).
//
// Demo fallback fires only when:
//   1. DEMO_FALLBACK_ENABLED env flag is on, AND
//   2. The scope is system-wide OR ROOT_AGENCY_ID, AND
//   3. The real query returned an empty/zero result.
// Scoped non-root founders never see another tenant's filler numbers.

import { Router, type Request } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
// Demo helpers retained for legacy revenue endpoints only. Per founder
// mandate 2026-05-04, dashboard / growth surface only real DB data — those
// endpoints never call demo helpers, so the imports below are scoped to
// the revenue-page-specific stubs that still support fallback.
import {
  demoRevenueKpis,
  demoRevenuePeriodTrend,
} from "../services/foundersDemoData";
import { resolveAgentAgency, ROOT_AGENCY_ID } from "../services/agencyResolver";
import { calculateWaterfallOverrides } from "../services/commissionWaterfallService";
import { getDateRange } from "../utils/dateRange";

const router = Router();

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// Returns the scope agency_id or null for system-wide queries.
function scopeId(scope: ViewerScope): string | null {
  if ("forbidden" in scope) return null;
  if ("systemWide" in scope) return null;
  return scope.agencyId;
}

// Demo eligibility: HARD-KILLED for the dashboard.
// Per founder request 2026-05-04, the Founders Dashboard must surface only
// real DB data — no example/mock/fallback numbers ever. Empty states render
// instead. Other founders pages (revenue, growth, etc.) keep their own
// demo behavior independent of this flag.
function isDemoEligible(_scope: ViewerScope): boolean {
  return false;
}

const ALLOWED_PERIODS = new Set([
  "all", "today", "wtd", "mtd", "qtd", "ytd", "6mo",
  "this-month", "last-month", "last-3", "last-6", "last-year",
]);
function safePeriod(raw: any, fallback = "ytd"): string {
  const s = String(raw || fallback);
  return ALLOWED_PERIODS.has(s) ? s : fallback;
}

function periodLabel(p: string): string {
  const map: Record<string, string> = {
    all: "all-time", today: "today", wtd: "wtd", mtd: "mtd", qtd: "qtd",
    ytd: "ytd", "6mo": "6mo", "this-month": "mtd", "last-month": "last-month",
    "last-3": "last-3", "last-6": "last-6", "last-year": "last-year",
  };
  return map[p] || p;
}

// Single source of truth for quarter boundaries — used by /quarterly-goals
// (read) AND /goals/:metricKey (write). Local-time, never UTC, so the same
// "now" produces the same period_start string on both sides — closes the
// near-midnight UTC drift bug where saved goals didn't appear on read.
export function currentQuarterStart(now: Date = new Date()): string {
  const q = Math.floor(now.getMonth() / 3);
  const d = new Date(now.getFullYear(), q * 3, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function nextQuarterStart(now: Date = new Date()): string {
  const q = Math.floor(now.getMonth() / 3);
  const d = new Date(now.getFullYear(), (q + 1) * 3, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Scoped agent IDs for the viewer's agency. Returns null for system-wide.
async function scopedAgentIds(agencyId: string | null): Promise<string[] | null> {
  if (!agencyId) return null;
  // Agents whose hierarchy resolves into a manager of this agency, OR who are
  // managers of this agency themselves.
  const r = await pool.query(
    `SELECT DISTINCT u.id::text AS id
       FROM users u
       LEFT JOIN agent_hierarchy ah ON ah.agent_user_id = u.id
                                    AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
      WHERE u.is_active = true
        AND (
          EXISTS (SELECT 1 FROM agency_teams at WHERE at.manager_user_id = u.id AND at.agency_id = $1::uuid)
          OR EXISTS (
            SELECT 1 FROM agency_teams at
             WHERE at.agency_id = $1::uuid
               AND at.manager_user_id::text = ANY(
                 ARRAY(SELECT jsonb_array_elements_text(COALESCE(ah.upline_chain, '[]'::jsonb)))
               )
          )
        )`,
    [agencyId],
  );
  return r.rows.map((row: any) => row.id);
}

function genericError(_e: any, msg: string) {
  // Body stays generic; the actual error is logged server-side.
  return { error: msg };
}

// ─── 1. DASHBOARD ─────────────────────────────────────────────────────────────

router.get("/dashboard/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved for viewer." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    // Revenue: every submitted deal counts toward AP (honor system —
    // we don't have direct carrier API verification yet). Founder request
    // 2026-05-04: trust the agent at submission time. If a deal is later
    // reversed, the status update will reduce the figure on next read.
    const revRes = await pool.query(
      `SELECT COALESCE(SUM(annual_premium), 0) AS revenue
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date
          AND created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)`,
      [start, end, agencyId],
    );
    const revenue = parseFloat(revRes.rows[0]?.revenue || "0");

    // Active agents (scoped).
    const agentIds = await scopedAgentIds(agencyId);
    let activeAgents = 0;
    if (agentIds === null) {
      const a = await pool.query(
        `SELECT COUNT(*)::int AS c FROM users
          WHERE role IN ('sales_agent', 'agency_manager', 'director') AND is_active = true`,
      );
      activeAgents = a.rows[0]?.c || 0;
    } else {
      activeAgents = agentIds.length;
    }

    // Cash position — sum latest balance per (account_label, account_last4).
    let cashPosition: number | null = null;
    if (agencyId) {
      const cb = await pool.query(
        `SELECT COALESCE(SUM(balance_cents), 0) / 100.0 AS total
           FROM (
             SELECT DISTINCT ON (account_label, COALESCE(account_last4, ''))
                    balance_cents
               FROM cash_balances
              WHERE agency_id = $1::uuid
              ORDER BY account_label, COALESCE(account_last4, ''), as_of_at DESC
           ) latest`,
        [agencyId],
      );
      const total = parseFloat(cb.rows[0]?.total || "0");
      cashPosition = total > 0 ? total : null;
    }

    // Founder profit — walk waterfall for each in-scope deal, sum overrides
    // credited to founders WITHIN the same agency. Skip when no deals in window.
    let founderProfit = 0;
    try {
      const dealRes = await pool.query(
        `SELECT id, agent_user_id, annual_premium, created_at
           FROM deals
          WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
            AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
            AND ($3::uuid IS NULL OR agency_id = $3::uuid)
          LIMIT 500`,
        [start, end, agencyId],
      );
      // Founder IDs scoped to agency (or all founders if system-wide).
      const founderRes = await pool.query(
        agencyId
          ? `SELECT u.id::text AS id FROM users u
              WHERE u.role = 'founder' AND u.is_active = true
                AND EXISTS (
                  SELECT 1 FROM agency_teams at
                   WHERE at.manager_user_id = u.id AND at.agency_id = $1::uuid
                )`
          : `SELECT u.id::text AS id FROM users u WHERE u.role = 'founder' AND u.is_active = true`,
        agencyId ? [agencyId] : [],
      );
      const founderSet = new Set(founderRes.rows.map((r: any) => String(r.id)));
      for (const d of dealRes.rows) {
        const wf = await calculateWaterfallOverrides(
          d.agent_user_id,
          parseFloat(d.annual_premium || "0"),
          d.created_at,
        );
        for (const lvl of wf.levels) {
          if (founderSet.has(String(lvl.agentUserId)) && !lvl.isPersonal) {
            founderProfit += lvl.overrideEarning;
          }
        }
      }
    } catch (wfErr: any) {
      console.warn("[oversight] founder profit walk skipped:", wfErr?.message);
    }

    // Lead profit — surfaced only at root/system-wide scope (lead_purchases
    // has no agency_id column today).
    let leadProfit: number | null = null;
    if (!agencyId || agencyId === ROOT_AGENCY_ID) {
      try {
        const lp = await pool.query(
          `SELECT COALESCE(SUM(price_cents * COALESCE(quantity, 1)), 0) AS gross
             FROM lead_purchases
            WHERE status = 'completed'
              AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
          [start, end],
        );
        // Without vendor_cost_cents_snapshot column, treat profit as 0 today.
        // The gross is informational; future migration adds vendor cost snapshot.
        leadProfit = Math.round(parseFloat(lp.rows[0]?.gross || "0") / 100);
      } catch {
        leadProfit = 0;
      }
    }

    res.json({
      revenue: Math.round(revenue),
      activeAgents,
      cashPosition,
      founderProfit: Math.round(founderProfit),
      leadProfit,
      periodLabel: periodLabel(period),
    });
  } catch (e: any) {
    console.error("[oversight] /dashboard/kpis error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load dashboard KPIs"));
  }
});

router.get("/dashboard/at-a-glance", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    const sparkRes = await pool.query(
      `SELECT date_trunc('day', created_at)::date AS day,
              COALESCE(SUM(annual_premium), 0)::numeric(14,2) AS value
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)
        GROUP BY day ORDER BY day ASC`,
      [start, end, agencyId],
    );
    const sparkline = sparkRes.rows.map((r: any) => ({
      date: new Date(r.day).toISOString().split("T")[0],
      value: parseFloat(r.value || "0"),
    }));

    const ndRes = await pool.query(
      `SELECT COUNT(*)::int AS c FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)`,
      [start, end, agencyId],
    );
    const newDeals = ndRes.rows[0]?.c || 0;

    // New agents in window (scoped).
    const naRes = await pool.query(
      agencyId
        ? `SELECT COUNT(DISTINCT u.id)::int AS c FROM users u
            WHERE u.role IN ('sales_agent', 'agency_manager', 'director')
              AND u.is_active = true
              AND u.created_at >= $1::date AND u.created_at < ($2::date + INTERVAL '1 day')
              AND EXISTS (
                SELECT 1 FROM agent_hierarchy ah WHERE ah.agent_user_id = u.id
                  AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
                  AND EXISTS (
                    SELECT 1 FROM agency_teams at
                     WHERE at.agency_id = $3::uuid
                       AND at.manager_user_id::text = ANY(
                         ARRAY(SELECT jsonb_array_elements_text(COALESCE(ah.upline_chain, '[]'::jsonb)))
                       )
                  )
              )`
        : `SELECT COUNT(*)::int AS c FROM users
            WHERE role IN ('sales_agent', 'agency_manager', 'director')
              AND is_active = true
              AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      agencyId ? [start, end, agencyId] : [start, end],
    );
    const newAgents = naRes.rows[0]?.c || 0;

    let leadProfit: number | null = null;
    if (!agencyId || agencyId === ROOT_AGENCY_ID) {
      try {
        const lp = await pool.query(
          `SELECT COALESCE(SUM(price_cents * COALESCE(quantity, 1)), 0) / 100 AS gross
             FROM lead_purchases
            WHERE status = 'completed'
              AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
          [start, end],
        );
        leadProfit = parseFloat(lp.rows[0]?.gross || "0");
      } catch { leadProfit = 0; }
    }

    // Override income — overrides credited to in-scope founders.
    let overrideIncome = 0;
    try {
      const dealRes = await pool.query(
        `SELECT id, agent_user_id, annual_premium, created_at
           FROM deals
          WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
            AND created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
            AND ($3::uuid IS NULL OR agency_id = $3::uuid)
          LIMIT 500`,
        [start, end, agencyId],
      );
      const founderRes = await pool.query(
        agencyId
          ? `SELECT u.id::text AS id FROM users u
              WHERE u.role = 'founder' AND u.is_active = true
                AND EXISTS (
                  SELECT 1 FROM agency_teams at
                   WHERE at.manager_user_id = u.id AND at.agency_id = $1::uuid
                )`
          : `SELECT u.id::text AS id FROM users u WHERE u.role = 'founder' AND u.is_active = true`,
        agencyId ? [agencyId] : [],
      );
      const founderSet = new Set(founderRes.rows.map((r: any) => String(r.id)));
      for (const d of dealRes.rows) {
        const wf = await calculateWaterfallOverrides(d.agent_user_id, parseFloat(d.annual_premium || "0"), d.created_at);
        for (const lvl of wf.levels) {
          if (founderSet.has(String(lvl.agentUserId)) && !lvl.isPersonal) overrideIncome += lvl.overrideEarning;
        }
      }
    } catch (wfErr: any) {
      console.warn("[oversight] override walk skipped:", wfErr?.message);
    }

    res.json({
      sparkline,
      newDeals,
      overrideIncome: Math.round(overrideIncome),
      leadProfit,
      newAgents,
      periodLabel: periodLabel(period),
    });
  } catch (e: any) {
    console.error("[oversight] /dashboard/at-a-glance error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load at-a-glance"));
  }
});

router.get("/dashboard/attention", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);

    const items: any[] = [];
    const agentIds = await scopedAgentIds(agencyId);

    // Returned contracting requests.
    try {
      const r = await pool.query(
        agentIds
          ? `SELECT COUNT(*)::int AS c FROM agent_contracting_requests
              WHERE status = 'returned' AND agent_user_id::text = ANY($1::text[])`
          : `SELECT COUNT(*)::int AS c FROM agent_contracting_requests WHERE status = 'returned'`,
        agentIds ? [agentIds] : [],
      );
      const c = r.rows[0]?.c || 0;
      if (c > 0) items.push({
        id: "returned-requests", kind: "contracting_request",
        title: `${c} contracting request${c === 1 ? "" : "s"} need re-submission`,
        count: c, href: "/hcms/agents", urgency: c >= 3 ? "high" : "medium",
      });
    } catch {}

    // Licenses expiring within 30 days.
    try {
      const r = await pool.query(
        agentIds
          ? `SELECT COUNT(*)::int AS c FROM agent_licenses
              WHERE expiration_date IS NOT NULL
                AND expiration_date > CURRENT_DATE
                AND expiration_date < CURRENT_DATE + INTERVAL '30 days'
                AND user_id::text = ANY($1::text[])`
          : `SELECT COUNT(*)::int AS c FROM agent_licenses
              WHERE expiration_date IS NOT NULL
                AND expiration_date > CURRENT_DATE
                AND expiration_date < CURRENT_DATE + INTERVAL '30 days'`,
        agentIds ? [agentIds] : [],
      );
      const c = r.rows[0]?.c || 0;
      if (c > 0) items.push({
        id: "expiring-licenses", kind: "license_expiring",
        title: `${c} license${c === 1 ? "" : "s"} expiring within 30 days`,
        count: c, href: "/hcms/agents", urgency: c >= 5 ? "high" : "med",
      });
    } catch {}

    // Pending board decisions (if table exists).
    try {
      const r = await pool.query(`SELECT COUNT(*)::int AS c FROM board_decisions WHERE status = 'proposed'`);
      const c = r.rows[0]?.c || 0;
      if (c > 0) items.push({
        id: "board-decisions", kind: "board_decision",
        title: `${c} board decision${c === 1 ? "" : "s"} awaiting quorum`,
        count: c, href: "/founders/access", urgency: "high",
      });
    } catch {}

    res.json(items);
  } catch (e: any) {
    console.error("[oversight] /dashboard/attention error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load attention items"));
  }
});

router.get("/dashboard/quarterly-goals", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope) || ROOT_AGENCY_ID;

    const periodStart = currentQuarterStart();
    const periodEnd = nextQuarterStart();

    const goalsRes = await pool.query(
      `SELECT metric_key, target_value, unit
         FROM founder_goals
        WHERE agency_id = $1::uuid
          AND period_type = 'quarter'
          AND period_start = $2::date`,
      [agencyId, periodStart],
    );

    // Compute current values for each metric.
    // Revenue this quarter only — bounded on BOTH ends so late-in-quarter or
    // post-rollover queries don't include prior periods (audit fix #1).
    const revRes = await pool.query(
      `SELECT COALESCE(SUM(annual_premium), 0) AS revenue
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date
          AND created_at < $2::date
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)`,
      [periodStart, periodEnd, agencyId === ROOT_AGENCY_ID ? null : agencyId],
    );
    const revenueQ = parseFloat(revRes.rows[0]?.revenue || "0");

    const agentIds = await scopedAgentIds(agencyId);
    const naRes = await pool.query(
      agentIds
        ? `SELECT COUNT(*)::int AS c FROM users
            WHERE id::text = ANY($1::text[])
              AND created_at >= $2::date
              AND role IN ('sales_agent', 'agency_manager', 'director')
              AND is_active = true`
        : `SELECT COUNT(*)::int AS c FROM users
            WHERE created_at >= $1::date
              AND role IN ('sales_agent', 'agency_manager', 'director') AND is_active = true`,
      agentIds ? [agentIds, periodStart] : [periodStart],
    );
    const newAgentsQ = naRes.rows[0]?.c || 0;

    const out = goalsRes.rows.map((g: any) => {
      const target = parseFloat(g.target_value);
      let current = 0;
      let unit: "currency" | "count" | "percent" = "percent";
      let label = g.metric_key;
      if (g.metric_key === "revenue_quarterly") {
        current = revenueQ; unit = "currency"; label = "Revenue target";
      } else if (g.metric_key === "new_agents_quarterly") {
        current = newAgentsQ; unit = "count"; label = "New agents";
      } else if (g.metric_key === "override_growth_pct") {
        current = 0; unit = "percent"; label = "Override growth";
      } else if (g.metric_key === "retention_pct") {
        current = 0; unit = "percent"; label = "Retention";
      }
      const pct = target > 0 ? Math.min(100, Math.max(0, Math.round((current / target) * 100))) : 0;
      return { label, current, target, pct, unit, isExample: false };
    });

    res.json(out);
  } catch (e: any) {
    console.error("[oversight] /dashboard/quarterly-goals error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load quarterly goals"));
  }
});

router.get("/dashboard/recent-activity", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const rawLimit = parseInt(String(req.query.limit ?? "15"), 10);
    const limit = Math.min(50, Math.max(1, isNaN(rawLimit) ? 15 : rawLimit));

    const agentIds = await scopedAgentIds(agencyId);
    const rows = await pool.query(
      agentIds
        ? `SELECT id, lead_id, type, title, description, performed_by, created_at
             FROM lead_activities
            WHERE performed_by = ANY($1::text[])
            ORDER BY created_at DESC LIMIT $2`
        : `SELECT id, lead_id, type, title, description, performed_by, created_at
             FROM lead_activities
            ORDER BY created_at DESC LIMIT $1`,
      agentIds ? [agentIds, limit] : [limit],
    );

    const items = rows.rows.map((r: any) => ({
      id: r.id,
      ts: new Date(r.created_at).toISOString(),
      kind: r.type === "conversion" ? "lead_converted"
        : r.type === "deal_submitted" ? "policy_issued"
        : r.type === "agent_hired" ? "agent_onboarded"
        : "lead_converted",
      title: r.title || r.description || "Activity",
      href: r.lead_id ? `/ops/crm?lead=${r.lead_id}` : null,
    }));

    res.json(items);
  } catch (e: any) {
    console.error("[oversight] /dashboard/recent-activity error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load recent activity"));
  }
});

router.get("/dashboard/compliance", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const agentIds = await scopedAgentIds(agencyId);

    let activeLicensesCurrent = 0, activeLicensesTotal = 0;
    let eoCurrentPct = 0;
    let pendingBgChecks = 0;
    let overdueTraining = 0;

    try {
      const lic = await pool.query(
        agentIds
          ? `SELECT
                COUNT(DISTINCT user_id)::int AS total,
                COUNT(DISTINCT user_id) FILTER (
                  WHERE status = 'active'
                    AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
                )::int AS current
               FROM agent_licenses
              WHERE user_id::text = ANY($1::text[])`
          : `SELECT
                COUNT(DISTINCT user_id)::int AS total,
                COUNT(DISTINCT user_id) FILTER (
                  WHERE status = 'active'
                    AND (expiration_date IS NULL OR expiration_date > CURRENT_DATE)
                )::int AS current
               FROM agent_licenses`,
        agentIds ? [agentIds] : [],
      );
      activeLicensesCurrent = lic.rows[0]?.current || 0;
      activeLicensesTotal = lic.rows[0]?.total || 0;
    } catch {}

    try {
      const eo = await pool.query(
        agentIds
          ? `SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE eo_expiration_date::date > CURRENT_DATE)::int AS valid
               FROM agent_profiles
              WHERE user_id::text = ANY($1::text[])`
          : `SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE eo_expiration_date::date > CURRENT_DATE)::int AS valid
               FROM agent_profiles`,
        agentIds ? [agentIds] : [],
      );
      const total = eo.rows[0]?.total || 0;
      const valid = eo.rows[0]?.valid || 0;
      eoCurrentPct = total > 0 ? Math.round((valid / total) * 100) : 100;
    } catch {}

    try {
      const bg = await pool.query(
        agentIds
          ? `SELECT COUNT(*)::int AS c FROM agent_profiles
              WHERE approval_status = 'pending_review' AND user_id::text = ANY($1::text[])`
          : `SELECT COUNT(*)::int AS c FROM agent_profiles WHERE approval_status = 'pending_review'`,
        agentIds ? [agentIds] : [],
      );
      pendingBgChecks = bg.rows[0]?.c || 0;
    } catch {}

    try {
      const tr = await pool.query(
        agentIds
          ? `SELECT COUNT(*)::int AS c FROM training_completions
              WHERE (status = 'expired' OR (status = 'pending' AND expires_at IS NOT NULL AND expires_at < NOW()))
                AND agent_user_id::text = ANY($1::text[])`
          : `SELECT COUNT(*)::int AS c FROM training_completions
              WHERE (status = 'expired' OR (status = 'pending' AND expires_at IS NOT NULL AND expires_at < NOW()))`,
        agentIds ? [agentIds] : [],
      );
      overdueTraining = tr.rows[0]?.c || 0;
    } catch {}

    res.json({
      activeLicenses: { current: activeLicensesCurrent, total: activeLicensesTotal },
      eoCurrent: { pct: eoCurrentPct },
      pendingBackgroundChecks: { count: pendingBgChecks },
      overdueTraining: { count: overdueTraining },
      isExample: false,
    });
  } catch (e: any) {
    console.error("[oversight] /dashboard/compliance error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load compliance"));
  }
});

router.get("/dashboard/top-performers", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);
    const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit ?? "5"), 10) || 5));

    const r = await pool.query(
      `SELECT u.id::text AS user_id, u.first_name, u.last_name,
              ap.dba_type, ap.company_name, ap.dba_name,
              COALESCE(SUM(d.annual_premium), 0)::numeric(14,2) AS total_premium,
              COUNT(d.id)::int AS deal_count
         FROM users u
         LEFT JOIN agent_profiles ap ON ap.user_id::text = u.id::text
         LEFT JOIN deals d ON d.agent_user_id = u.id
                          AND d.status NOT IN ('rejected', 'reversed', 'cancelled')
                          AND d.created_at >= $1::date
                          AND d.created_at < ($2::date + INTERVAL '1 day')
                          AND ($3::uuid IS NULL OR d.agency_id = $3::uuid)
        WHERE u.role IN ('sales_agent', 'agency_manager', 'director', 'founder', 'owner') AND u.is_active = true
        GROUP BY u.id, u.first_name, u.last_name, ap.dba_type, ap.company_name, ap.dba_name
        HAVING COUNT(d.id) > 0
        ORDER BY total_premium DESC
        LIMIT $4`,
      [start, end, agencyId, limit],
    );

    const rows = r.rows.map((row: any, i: number) => {
      const isBiz = row.dba_type === "business_entity";
      const name = isBiz
        ? (row.company_name || row.dba_name || `${row.first_name || ""} ${row.last_name || ""}`.trim())
        : `${row.first_name || ""} ${row.last_name || ""}`.trim();
      return {
        rank: i + 1,
        userId: row.user_id,
        name: name || "Unknown",
        dbaType: row.dba_type || "individual",
        isBusinessEntity: isBiz,
        deals: row.deal_count,
        totalPremium: parseFloat(row.total_premium || "0"),
        href: `/hcms/agents/${row.user_id}`,
      };
    });

    res.json(rows);
  } catch (e: any) {
    console.error("[oversight] /dashboard/top-performers error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load top performers"));
  }
});

router.get("/dashboard/onboarding-pipeline", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const agentIds = await scopedAgentIds(agencyId);

    const buckets: Array<{key: string; label: string; count: number; href: string; kind: string}> = [];

    const count = async (status: string): Promise<number> => {
      try {
        const r = await pool.query(
          agentIds
            ? `SELECT COUNT(*)::int AS c FROM agent_profiles
                WHERE approval_status = $1 AND user_id::text = ANY($2::text[])`
            : `SELECT COUNT(*)::int AS c FROM agent_profiles WHERE approval_status = $1`,
          agentIds ? [status, agentIds] : [status],
        );
        return r.rows[0]?.c || 0;
      } catch { return 0; }
    };

    buckets.push({ key: "new",        label: "Pending",   count: await count("pending_review"), href: "/hcms/agents?status=pending_review", kind: "new" });
    buckets.push({ key: "in-review",  label: "In Review", count: await count("in_review"),      href: "/hcms/agents?status=in_review",      kind: "in-review" });
    buckets.push({ key: "appointed",  label: "Approved",  count: await count("approved"),       href: "/hcms/agents?status=approved",       kind: "appointed" });
    buckets.push({ key: "active",     label: "Declined",  count: await count("rejected"),       href: "/hcms/agents?status=rejected",       kind: "active" });

    res.json({ buckets, periodLabel: "current" });
  } catch (e: any) {
    console.error("[oversight] /dashboard/onboarding-pipeline error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load onboarding pipeline"));
  }
});

router.get("/dashboard/carrier-velocity", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);
    const startD = new Date(start);
    const endD = new Date(end);
    const dur = Math.max(1, (endD.getTime() - startD.getTime()) / (1000 * 60 * 60 * 24));
    const prevEnd = new Date(startD); prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd); prevStart.setDate(prevStart.getDate() - dur);

    const agentIds = await scopedAgentIds(agencyId);
    const apptFilter = agentIds ? `AND ca.agent_user_id::text = ANY($3::text[])` : "";

    const countAppts = async (s: Date, e: Date): Promise<number> => {
      try {
        const r = await pool.query(
          `SELECT COUNT(*)::int AS c FROM carrier_appointments ca
            WHERE ca.created_at >= $1::date
              AND ca.created_at < ($2::date + INTERVAL '1 day')
              AND ca.status IN ('appointed', 'approved') ${apptFilter}`,
          agentIds ? [s.toISOString().slice(0,10), e.toISOString().slice(0,10), agentIds]
                   : [s.toISOString().slice(0,10), e.toISOString().slice(0,10)],
        );
        return r.rows[0]?.c || 0;
      } catch { return 0; }
    };

    const currentTotal = await countAppts(startD, endD);
    const prevTotal = await countAppts(prevStart, prevEnd);
    const deltaPct = prevTotal > 0 ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;

    let byCarrier: Array<{carrier: string; count: number}> = [];
    try {
      const r = await pool.query(
        `SELECT ca.carrier_id, COALESCE(cd.name, ca.carrier_id) AS carrier_name, COUNT(*)::int AS count
           FROM carrier_appointments ca
           LEFT JOIN carrier_directory cd ON cd.id::text = ca.carrier_id::text
          WHERE ca.created_at >= $1::date AND ca.created_at < ($2::date + INTERVAL '1 day')
            AND ca.status IN ('appointed', 'approved') ${apptFilter}
          GROUP BY ca.carrier_id, cd.name
          ORDER BY count DESC`,
        agentIds ? [start, end, agentIds] : [start, end],
      );
      byCarrier = r.rows.map((row: any) => ({
        carrier: row.carrier_name || row.carrier_id,
        count: row.count,
      }));
    } catch {}

    res.json({ currentTotal, prevTotal, deltaPct: Math.round(deltaPct * 10) / 10, byCarrier, periodLabel: periodLabel(period) });
  } catch (e: any) {
    console.error("[oversight] /dashboard/carrier-velocity error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load carrier velocity"));
  }
});

router.get("/dashboard/cash-flow", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope) || ROOT_AGENCY_ID;

    const r = await pool.query(
      `SELECT DISTINCT ON (account_label, COALESCE(account_last4, ''))
              account_label, account_last4, balance_cents, as_of_at, source
         FROM cash_balances
        WHERE agency_id = $1::uuid
        ORDER BY account_label, COALESCE(account_last4, ''), as_of_at DESC`,
      [agencyId],
    );
    const accounts = r.rows.map((row: any) => ({
      accountLabel: row.account_label,
      last4: row.account_last4 || "",
      balanceCents: parseInt(row.balance_cents, 10),
      asOfDate: row.as_of_at ? new Date(row.as_of_at).toISOString() : undefined,
      source: row.source,
    }));
    if (accounts.length === 0) {
      return res.json({
        totalCents: null, accounts: [], isExample: false,
        message: "No bank accounts connected. Add one via Manage Cash.",
        hasPlaidConnected: false,
      });
    }
    const totalCents = accounts.reduce((s, a) => s + a.balanceCents, 0);
    const asOfAt = r.rows.reduce((max: Date | null, row: any) => {
      const d = new Date(row.as_of_at);
      return !max || d > max ? d : max;
    }, null);
    res.json({
      totalCents, asOfAt: asOfAt ? asOfAt.toISOString() : null,
      accounts, hasPlaidConnected: false,
    });
  } catch (e: any) {
    console.error("[oversight] /dashboard/cash-flow error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load cash flow"));
  }
});

// ─── 2. REVENUE ───────────────────────────────────────────────────────────────

router.get("/revenue/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);

    // YTD AP — honor system, half-open interval, agency-scoped.
    const ytdRes = await pool.query(
      `SELECT COALESCE(SUM(annual_premium), 0) AS ytd
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= date_trunc('year', CURRENT_DATE)
          AND created_at < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year')
          AND ($1::uuid IS NULL OR agency_id = $1::uuid)`,
      [agencyId],
    );
    const apYtd = parseFloat(ytdRes.rows[0]?.ytd || "0");

    // MTD AP — same conventions as YTD.
    const mtdRes = await pool.query(
      `SELECT COALESCE(SUM(annual_premium), 0) AS mtd
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= date_trunc('month', CURRENT_DATE)
          AND created_at < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')
          AND ($1::uuid IS NULL OR agency_id = $1::uuid)`,
      [agencyId],
    );
    const apMtd = parseFloat(mtdRes.rows[0]?.mtd || "0");

    // Override YTD — walk waterfall for every YTD deal, sum overrides credited
    // to founders inside this agency. Same engine as the dashboard.
    let overrideYtd = 0;
    try {
      const dealRes = await pool.query(
        `SELECT id, agent_user_id, annual_premium, created_at
           FROM deals
          WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
            AND created_at >= date_trunc('year', CURRENT_DATE)
            AND created_at < (date_trunc('year', CURRENT_DATE) + INTERVAL '1 year')
            AND ($1::uuid IS NULL OR agency_id = $1::uuid)
          LIMIT 1000`,
        [agencyId],
      );
      const founderRes = await pool.query(
        agencyId
          ? `SELECT u.id::text AS id FROM users u
              WHERE u.role = 'founder' AND u.is_active = true
                AND EXISTS (
                  SELECT 1 FROM agency_teams at
                   WHERE at.manager_user_id = u.id AND at.agency_id = $1::uuid
                )`
          : `SELECT u.id::text AS id FROM users u WHERE u.role = 'founder' AND u.is_active = true`,
        agencyId ? [agencyId] : [],
      );
      const founderSet = new Set(founderRes.rows.map((r: any) => String(r.id)));
      for (const d of dealRes.rows) {
        const wf = await calculateWaterfallOverrides(
          d.agent_user_id,
          parseFloat(d.annual_premium || "0"),
          d.created_at,
        );
        for (const lvl of wf.levels) {
          if (founderSet.has(String(lvl.agentUserId)) && !lvl.isPersonal) {
            overrideYtd += lvl.overrideEarning;
          }
        }
      }
    } catch (wfErr: any) {
      console.warn("[oversight] /revenue/kpis override walk skipped:", wfErr?.message);
    }

    // Net margin = (apYtd - operatingCosts) / apYtd. Without a real expense
    // table we surface override % as a proxy: overrideYtd / apYtd × 100.
    // Frontend label is "Margin %"; clear in the tooltip what's measured.
    const netMargin = apYtd > 0 ? Math.round((overrideYtd / apYtd) * 1000) / 10 : 0;

    res.json({
      apMtd: Math.round(apMtd),
      apYtd: Math.round(apYtd),
      overrideYtd: Math.round(overrideYtd),
      netMargin,
    });
  } catch (e: any) {
    console.error("[oversight] /revenue/kpis error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load revenue KPIs"));
  }
});

router.get("/revenue/period-trend", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);

    const r = await pool.query(
      `SELECT to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
              COALESCE(SUM(annual_premium), 0)::numeric(14,2) AS revenue
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= CURRENT_DATE - INTERVAL '24 months'
          AND ($1::uuid IS NULL OR agency_id = $1::uuid)
        GROUP BY 1 ORDER BY 1 ASC`,
      [agencyId],
    );
    const all = r.rows.map((row: any) => ({ month: row.month, revenue: parseFloat(row.revenue || "0") }));
    const current = all.slice(-12);
    const prior = all.slice(0, 12);
    res.json({ current, prior, periodLabel: periodLabel(period) });
  } catch (e: any) {
    console.error("[oversight] /revenue/period-trend error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load revenue period trend"));
  }
});

router.get("/revenue/override-decomposition", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    // Walk waterfall for every in-period deal. Aggregate overrides per upline
    // user (the founder/manager/director receiving each spread). Show top
    // earners across the chain so the founder can see WHO is receiving
    // override income inside their agency.
    const dealRes = await pool.query(
      `SELECT id, agent_user_id, annual_premium, created_at
         FROM deals
        WHERE status NOT IN ('rejected', 'reversed', 'cancelled')
          AND created_at >= $1::date
          AND created_at < ($2::date + INTERVAL '1 day')
          AND ($3::uuid IS NULL OR agency_id = $3::uuid)
        LIMIT 1000`,
      [start, end, agencyId],
    );

    let premiumTotal = 0;
    let totalPaidOut = 0;
    const byUser = new Map<string, {
      agentUserId: string;
      name: string;
      hierarchyTitle: string;
      contractLevel: number;
      spreadPct: number; // average spread for this user across deals where they earned
      overrideAmount: number;
      _spreadSum: number;
      _spreadCount: number;
    }>();

    for (const d of dealRes.rows) {
      const premium = parseFloat(d.annual_premium || "0");
      premiumTotal += premium;
      const wf = await calculateWaterfallOverrides(d.agent_user_id, premium, d.created_at);
      for (const lvl of wf.levels) {
        if (lvl.isPersonal) continue;
        if (lvl.overrideEarning <= 0) continue;
        const key = String(lvl.agentUserId);
        const existing = byUser.get(key);
        if (existing) {
          existing.overrideAmount += lvl.overrideEarning;
          existing._spreadSum += lvl.spread;
          existing._spreadCount += 1;
          existing.spreadPct = existing._spreadSum / existing._spreadCount;
        } else {
          byUser.set(key, {
            agentUserId: lvl.agentUserId,
            name: lvl.name,
            hierarchyTitle: lvl.hierarchyTitle,
            contractLevel: lvl.contractLevel,
            spreadPct: lvl.spread,
            overrideAmount: lvl.overrideEarning,
            _spreadSum: lvl.spread,
            _spreadCount: 1,
          });
        }
        totalPaidOut += lvl.overrideEarning;
      }
    }

    const levels = Array.from(byUser.values())
      .sort((a, b) => b.overrideAmount - a.overrideAmount)
      .map((l) => ({
        agentUserId: l.agentUserId,
        name: l.name,
        hierarchyTitle: l.hierarchyTitle,
        contractLevel: l.contractLevel,
        spreadPct: Math.round(l.spreadPct * 10) / 10,
        overrideAmount: Math.round(l.overrideAmount),
        shareOfTotal: totalPaidOut > 0
          ? Math.round((l.overrideAmount / totalPaidOut) * 1000) / 10
          : 0,
      }));

    res.json({
      premiumTotal: Math.round(premiumTotal),
      totalPaidOut: Math.round(totalPaidOut),
      levels,
      isExample: false,
      periodLabel: periodLabel(period),
    });
  } catch (e: any) {
    console.error("[oversight] /revenue/override-decomposition error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load override decomposition"));
  }
});

// ─── 3. GROWTH ────────────────────────────────────────────────────────────────

// ─── GROWTH ENDPOINTS — all 5 wired to real DB queries (Wave G1) ─────────
//
// Source of truth: agent_profiles (lifecycle), agency_teams + agencies
// (org structure), agent_hierarchy.upline_chain (downline rollups), deals
// (production). All queries scoped via viewerAgencyScope + scopedAgentIds.
// No demo helpers — empty DB → empty arrays / null KPIs (frontend handles).

router.get("/growth/kpis", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);
    const agentIds = await scopedAgentIds(agencyId);

    const apps = await pool.query(
      agentIds
        ? `SELECT COUNT(*)::int AS c FROM agent_profiles
            WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')
              AND user_id::text = ANY($3::text[])`
        : `SELECT COUNT(*)::int AS c FROM agent_profiles
            WHERE created_at >= $1::date AND created_at < ($2::date + INTERVAL '1 day')`,
      agentIds ? [start, end, agentIds] : [start, end],
    );
    const hired = await pool.query(
      agentIds
        ? `SELECT COUNT(*)::int AS c FROM agent_profiles
            WHERE approval_status = 'approved'
              AND approved_at >= $1::date AND approved_at < ($2::date + INTERVAL '1 day')
              AND user_id::text = ANY($3::text[])`
        : `SELECT COUNT(*)::int AS c FROM agent_profiles
            WHERE approval_status = 'approved'
              AND approved_at >= $1::date AND approved_at < ($2::date + INTERVAL '1 day')`,
      agentIds ? [start, end, agentIds] : [start, end],
    );
    const applicantsThisPeriod = apps.rows[0]?.c || 0;
    const hiredThisPeriod = hired.rows[0]?.c || 0;
    const conversionPct = applicantsThisPeriod > 0
      ? Math.round((hiredThisPeriod / applicantsThisPeriod) * 1000) / 10
      : 0;

    // avgTimeToProductivityDays = days from approved_at → first deals.submitted_at,
    // averaged across the period's approval cohort. Returns null if no
    // approved-with-deals agent in the window (frontend renders "—").
    let avgTimeToProductivityDays: number | null = null;
    try {
      const ttp = await pool.query(
        agentIds
          ? `SELECT AVG(EXTRACT(EPOCH FROM (first_deal.first_at - ap.approved_at)) / 86400)::numeric(8,1) AS avg_days
               FROM agent_profiles ap
               JOIN LATERAL (
                 SELECT MIN(d.submitted_at) AS first_at FROM deals d WHERE d.agent_user_id = ap.user_id
               ) first_deal ON first_deal.first_at IS NOT NULL
              WHERE ap.approval_status = 'approved'
                AND ap.approved_at >= $1::date AND ap.approved_at < ($2::date + INTERVAL '1 day')
                AND first_deal.first_at >= ap.approved_at
                AND ap.user_id::text = ANY($3::text[])`
          : `SELECT AVG(EXTRACT(EPOCH FROM (first_deal.first_at - ap.approved_at)) / 86400)::numeric(8,1) AS avg_days
               FROM agent_profiles ap
               JOIN LATERAL (
                 SELECT MIN(d.submitted_at) AS first_at FROM deals d WHERE d.agent_user_id = ap.user_id
               ) first_deal ON first_deal.first_at IS NOT NULL
              WHERE ap.approval_status = 'approved'
                AND ap.approved_at >= $1::date AND ap.approved_at < ($2::date + INTERVAL '1 day')
                AND first_deal.first_at >= ap.approved_at`,
        agentIds ? [start, end, agentIds] : [start, end],
      );
      const raw = ttp.rows[0]?.avg_days;
      if (raw != null) avgTimeToProductivityDays = Math.round(parseFloat(raw) * 10) / 10;
    } catch (ttpErr: any) {
      console.warn("[oversight] /growth/kpis time-to-productivity skipped:", ttpErr?.message);
    }

    res.json({
      applicantsThisPeriod, hiredThisPeriod, conversionPct,
      avgTimeToProductivityDays,
      periodLabel: periodLabel(period),
    });
  } catch (e: any) {
    console.error("[oversight] /growth/kpis error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load growth KPIs"));
  }
});

router.get("/growth/funnel", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);
    const agentIds = await scopedAgentIds(agencyId);

    // Stage definitions — counts of distinct agents whose lifecycle reached
    // each stage during the window. Each later stage is a strict subset of
    // earlier stages, so the chart always tapers right (or stays flat).
    const stageDefs: Array<{ stage: string; statuses: string[]; requiresDeal: boolean; color: string }> = [
      { stage: "Applicants", statuses: ["pending_review", "in_review", "approved", "rejected"], requiresDeal: false, color: "var(--gc-gold)" },
      { stage: "In Review",  statuses: ["in_review", "approved", "rejected"], requiresDeal: false, color: "var(--gc-gold)" },
      { stage: "Approved",   statuses: ["approved"], requiresDeal: false, color: "var(--gc-gold)" },
      { stage: "First Deal", statuses: ["approved"], requiresDeal: true,  color: "var(--gc-gold-bright,var(--gc-gold))" },
    ];

    const stages: Array<{ stage: string; count: number; color: string }> = [];
    for (const def of stageDefs) {
      const statusArr = def.statuses;
      const params: any[] = [start, end, statusArr];
      let sql = `
        SELECT COUNT(DISTINCT ap.user_id)::int AS count
          FROM agent_profiles ap
         WHERE ap.created_at >= $1::date
           AND ap.created_at < ($2::date + INTERVAL '1 day')
           AND ap.approval_status = ANY($3::text[])`;
      if (def.requiresDeal) {
        sql += ` AND EXISTS (SELECT 1 FROM deals d WHERE d.agent_user_id = ap.user_id AND d.status NOT IN ('rejected','reversed','cancelled'))`;
      }
      if (agentIds) {
        params.push(agentIds);
        sql += ` AND ap.user_id::text = ANY($${params.length}::text[])`;
      }
      try {
        const r = await pool.query(sql, params);
        stages.push({ stage: def.stage, count: r.rows[0]?.count || 0, color: def.color });
      } catch (stageErr: any) {
        console.warn(`[oversight] /growth/funnel stage "${def.stage}" skipped:`, stageErr?.message);
        stages.push({ stage: def.stage, count: 0, color: def.color });
      }
    }
    res.json(stages);
  } catch (e: any) {
    console.error("[oversight] /growth/funnel error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load growth funnel"));
  }
});

router.get("/growth/teams", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit ?? "10"), 10) || 10));
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);

    // Aggregate agency_teams: name, manager, agent count (downline via
    // agent_hierarchy.upline_chain), period revenue (deals scoped to downline).
    // Ordered by revenue desc.
    const params: any[] = [start, end];
    let scopeFilter = "";
    if (agencyId) {
      params.push(agencyId);
      scopeFilter = ` AND at.agency_id = $${params.length}::uuid`;
    }
    params.push(limit);
    const limitIdx = params.length;

    const r = await pool.query(
      `SELECT at.manager_user_id::text AS id,
              COALESCE(a.name, 'Team') AS name,
              TRIM(COALESCE(mu.first_name, '') || ' ' || COALESCE(mu.last_name, '')) AS manager,
              COALESCE(team_stats.agents, 0)::int AS agents,
              COALESCE(team_stats.revenue, 0)::numeric(14,2) AS revenue
         FROM agency_teams at
         JOIN agencies a ON a.id = at.agency_id
         JOIN users mu ON mu.id = at.manager_user_id
         LEFT JOIN LATERAL (
           SELECT COUNT(DISTINCT ah.agent_user_id)::int AS agents,
                  COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(14,2) AS revenue
             FROM agent_hierarchy ah
             LEFT JOIN deals d ON d.agent_user_id = ah.agent_user_id
                              AND d.status NOT IN ('rejected', 'reversed', 'cancelled')
                              AND d.created_at >= $1::date
                              AND d.created_at < ($2::date + INTERVAL '1 day')
            WHERE ah.upline_chain @> to_jsonb(ARRAY[at.manager_user_id::text])
              AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
         ) team_stats ON true
        WHERE 1=1 ${scopeFilter}
        ORDER BY revenue DESC, agents DESC
        LIMIT $${limitIdx}`,
      params,
    );

    res.json(r.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      manager: row.manager || "—",
      agents: Number(row.agents) || 0,
      revenue: Number(row.revenue) || 0,
      pipeline: null,
      conversion: null,
      status: "active" as const,
    })));
  } catch (e: any) {
    console.error("[oversight] /growth/teams error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load growth teams"));
  }
});

router.get("/growth/top-performers", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const period = safePeriod(req.query.period);
    const { start, end } = getDateRange(period);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit ?? "25"), 10) || 25));
    const agentIds = await scopedAgentIds(agencyId);

    // Same engine as /dashboard/top-performers but excludes founder/owner —
    // Growth is about agent recruitment + production, not founder writing.
    const params: any[] = [start, end, agencyId];
    let agentScope = "";
    if (agentIds) {
      params.push(agentIds);
      agentScope = ` AND u.id::text = ANY($${params.length}::text[])`;
    }
    params.push(limit);
    const limitIdx = params.length;

    const r = await pool.query(
      `SELECT u.id::text AS id,
              TRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')) AS name,
              COALESCE(team.team_label, '—') AS team,
              COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(14,2) AS revenue,
              COUNT(d.id)::int AS deals
         FROM users u
         LEFT JOIN deals d ON d.agent_user_id = u.id
                          AND d.status NOT IN ('rejected', 'reversed', 'cancelled')
                          AND d.created_at >= $1::date
                          AND d.created_at < ($2::date + INTERVAL '1 day')
                          AND ($3::uuid IS NULL OR d.agency_id = $3::uuid)
         LEFT JOIN LATERAL (
           SELECT 'Team ' || mu.last_name AS team_label
             FROM agent_hierarchy ah
             JOIN agency_teams at ON at.manager_user_id::text = ANY(
               ARRAY(SELECT jsonb_array_elements_text(COALESCE(ah.upline_chain, '[]'::jsonb)))
             )
             JOIN users mu ON mu.id = at.manager_user_id
            WHERE ah.agent_user_id = u.id
              AND (ah.effective_to IS NULL OR ah.effective_to > NOW())
            LIMIT 1
         ) team ON true
        WHERE u.role IN ('sales_agent', 'agency_manager', 'director')
          AND u.is_active = true ${agentScope}
        GROUP BY u.id, u.first_name, u.last_name, team.team_label
        HAVING COUNT(d.id) > 0
        ORDER BY revenue DESC
        LIMIT $${limitIdx}`,
      params,
    );

    res.json(r.rows.map((row: any, i: number) => ({
      id: row.id,
      rank: i + 1,
      name: row.name || "Unknown",
      team: row.team,
      revenue: Number(row.revenue) || 0,
      deals: Number(row.deals) || 0,
    })));
  } catch (e: any) {
    console.error("[oversight] /growth/top-performers error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load growth top performers"));
  }
});

router.get("/growth/hiring-trend", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const scope = await viewerAgencyScope(req);
    if ("forbidden" in scope) return res.status(403).json({ error: "Agency not resolved." });
    const agencyId = scopeId(scope);
    const months = Math.min(24, Math.max(1, parseInt(String(req.query.months ?? "6"), 10) || 6));
    const agentIds = await scopedAgentIds(agencyId);

    const params: any[] = [months];
    let scopeFilter = "";
    if (agentIds) {
      params.push(agentIds);
      scopeFilter = ` AND user_id::text = ANY($${params.length}::text[])`;
    }

    const r = await pool.query(
      `SELECT to_char(date_trunc('month', approved_at), 'YYYY-MM') AS ym,
              to_char(date_trunc('month', approved_at), 'Mon') AS month,
              COUNT(*)::int AS hires
         FROM agent_profiles
        WHERE approval_status = 'approved'
          AND approved_at >= date_trunc('month', CURRENT_DATE) - (($1::int - 1) * INTERVAL '1 month')
          ${scopeFilter}
        GROUP BY 1, 2
        ORDER BY 1 ASC`,
      params,
    );
    const byYm = new Map<string, { month: string; hires: number }>();
    for (const row of r.rows) byYm.set(row.ym, { month: row.month, hires: Number(row.hires) || 0 });

    // Backfill missing months with 0 so chart never has gaps.
    const now = new Date();
    const series: Array<{ month: string; hires: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = d.toLocaleString("en-US", { month: "short" });
      const found = byYm.get(ym);
      series.push(found ?? { month: monthLabel, hires: 0 });
    }
    res.json(series);
  } catch (e: any) {
    console.error("[oversight] /growth/hiring-trend error:", e?.message);
    res.status(500).json(genericError(e, "Failed to load hiring trend"));
  }
});

export default router;
