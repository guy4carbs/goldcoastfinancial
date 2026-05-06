import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { listTeams, listTeamAgents } from "../services/teamDerivation";
import { getDateRange } from "../utils/dateRange";
import {
  pipelineForAgents,
  rollupForAgents,
  complianceForAgents,
  EXCLUDED_DEAL_STATUSES,
  genericError,
} from "./founders-book";

const router = Router();

// Founders Lounge is founders-only. ADMIN_PLUS = [FOUNDER, OWNER, SYSTEM_ADMIN].
router.use(requireAuth, requireRole(...ADMIN_PLUS));

// Per-agent monthly quota used for tier classification + on-track scoring.
// Static for now; future: pull from `commission_targets` if/when team-level
// quotas are wired.
const MONTHLY_QUOTA_DEFAULT = 20000;

// Tier thresholds (must mirror client-side TIER_THRESHOLDS in
// FoundersTeamPerformance.tsx).
function classifyTier(quotaAttainment: number): "Elite" | "Proven" | "Rising" | "New" {
  if (quotaAttainment > 110) return "Elite";
  if (quotaAttainment >= 90) return "Proven";
  if (quotaAttainment >= 70) return "Rising";
  return "New";
}

// =============================================================================
// GET /kpis — top-of-page tile values for the period
// =============================================================================
router.get("/kpis", async (req, res) => {
  const period = (req.query.period as string) || "ytd";
  try {
    const range = getDateRange(period);
    const teams = await listTeams();

    let activeAgents = 0;
    let topTeam: { name: string; revenue: number } = { name: "—", revenue: 0 };
    let teamsOnTrack = 0;
    let totalQuotaAttainment = 0;

    for (const team of teams) {
      const agents = await listTeamAgents(team.id);
      const ids = agents.map((a) => a.id);
      activeAgents += agents.filter((a) => a.isActive).length;
      const pipe = await pipelineForAgents(ids, range);
      const pol = await rollupForAgents(ids, range);

      const teamRevenue = pol.totalPremium + pipe.revenueInPeriod;
      if (teamRevenue > topTeam.revenue) {
        topTeam = { name: team.name, revenue: teamRevenue };
      }

      // Real retention: % of in-period policies that are still active.
      const retentionRate =
        pol.policyCount > 0 ? (pol.activePolicyCount / pol.policyCount) * 100 : null;
      const conversionRate =
        pipe.dealCount > 0 ? (pol.policyCount / pipe.dealCount) * 100 : 0;

      // On-track if either: (a) the team has no in-period policies yet
      // (forming team), or (b) retention >= 90 AND conversion >= 20.
      if (
        pol.policyCount === 0 ||
        ((retentionRate ?? 0) >= 90 && conversionRate >= 20)
      ) {
        teamsOnTrack += 1;
      }

      // Per-team quota = MONTHLY_QUOTA_DEFAULT * agentCount (period-agnostic);
      // using revenueInPeriod as the achievement signal.
      const teamQuota = MONTHLY_QUOTA_DEFAULT * Math.max(1, agents.length);
      const teamAttainment = teamQuota > 0 ? (pipe.revenueInPeriod / teamQuota) * 100 : 0;
      totalQuotaAttainment += teamAttainment;
    }

    const avgQuotaAttainment = teams.length > 0 ? totalQuotaAttainment / teams.length : 0;

    res.json({
      activeAgents,
      avgQuotaAttainment,
      topTeamName: topTeam.name,
      topTeamRevenue: topTeam.revenue,
      teamsOnTrack,
      totalTeams: teams.length,
      // Period-over-period deltas not wired yet (would need a second range
      // query and date arithmetic). null until implemented; frontend renders
      // an em-dash for null values.
      deltas: {
        activeAgents: null,
        avgQuotaAttainment: null,
        topTeamRevenue: null,
        teamsOnTrack: null,
      },
    });
  } catch (e: any) {
    console.error("[founders-teams] /kpis error:", e?.message);
    res.status(500).json(genericError("Failed to load team KPIs"));
  }
});

// =============================================================================
// GET / — teams with performance projection for the period
// =============================================================================
router.get("/", async (req, res) => {
  const period = (req.query.period as string) || "ytd";
  try {
    const range = getDateRange(period);
    const teams = await listTeams();

    const enriched = await Promise.all(
      teams.map(async (team) => {
        const agents = await listTeamAgents(team.id);
        const ids = agents.map((a) => a.id);
        const pipe = await pipelineForAgents(ids, range);
        const pol = await rollupForAgents(ids, range);

        const monthlyQuota = MONTHLY_QUOTA_DEFAULT * Math.max(1, agents.length);
        const quotaAttainment =
          monthlyQuota > 0 ? (pipe.revenueInPeriod / monthlyQuota) * 100 : 0;
        const conversionRate =
          pipe.dealCount > 0 ? (pol.policyCount / pipe.dealCount) * 100 : 0;
        const retentionRate =
          pol.policyCount > 0 ? (pol.activePolicyCount / pol.policyCount) * 100 : null;

        // Status mirrors founders-book.ts:142-151 so the same team can't be
        // tagged "on-track" on Book and "behind" here.
        let status: "on-track" | "at-risk" | "behind";
        if (pol.policyCount === 0) {
          status = "on-track";
        } else if ((retentionRate ?? 0) >= 90 && conversionRate >= 20) {
          status = "on-track";
        } else if (conversionRate >= 15) {
          status = "at-risk";
        } else {
          status = "behind";
        }

        return {
          ...team,
          policyCount: pol.policyCount,
          totalPremium: pol.totalPremium,
          pipelineValue: pipe.pipelineValue,
          revenueLast30: pipe.revenueInPeriod,
          conversionRate,
          quotaAttainment,
          retentionRate,
          status,
        };
      }),
    );
    res.json(enriched);
  } catch (e: any) {
    console.error("[founders-teams] / error:", e?.message);
    res.status(500).json(genericError("Failed to load teams"));
  }
});

// =============================================================================
// GET /:teamId/agents — per-agent rankings with tier + real compliance
// =============================================================================
router.get("/:teamId/agents", async (req, res) => {
  const period = (req.query.period as string) || "ytd";
  try {
    const range = getDateRange(period);
    const teamId = req.params.teamId;
    const agents = await listTeamAgents(teamId);
    const allIds = agents.map((a) => a.id);

    const compliance = await complianceForAgents(allIds);

    const enriched = await Promise.all(
      agents.map(async (agent) => {
        const pipe = await pipelineForAgents([agent.id], range);
        const pol = await rollupForAgents([agent.id], range);
        const quotaAttainment =
          MONTHLY_QUOTA_DEFAULT > 0
            ? (pipe.revenueInPeriod / MONTHLY_QUOTA_DEFAULT) * 100
            : 0;
        return {
          ...agent,
          revenueMtd: pipe.revenueInPeriod,
          pipelineValue: pipe.pipelineValue,
          policyCount: pol.policyCount,
          totalPremium: pol.totalPremium,
          quotaAttainment,
          tier: classifyTier(quotaAttainment),
          status: agent.isActive ? "active" : "on-leave",
          compliance: compliance[agent.id] ?? null,
        };
      }),
    );

    enriched.sort((a, b) => b.quotaAttainment - a.quotaAttainment);
    res.json(enriched.map((a, i) => ({ rank: i + 1, ...a })));
  } catch (e: any) {
    console.error("[founders-teams] /:teamId/agents error:", e?.message);
    res.status(500).json(genericError("Failed to load team agents"));
  }
});

// =============================================================================
// GET /trends?months=N — monthly written-premium per team over the last N months
// =============================================================================
router.get("/trends", async (req, res) => {
  try {
    const months = Math.min(24, Math.max(1, Number(req.query.months) || 6));
    const teams = await listTeams();

    // Always emit one row per month so the chart axis renders even when DB
    // is empty. Backfill missing months below.
    const buildEmptyRows = (): Array<Record<string, any>> => {
      const out: Array<Record<string, any>> = [];
      const now = new Date();
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        out.push({
          month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        });
      }
      return out;
    };

    if (teams.length === 0) {
      return res.json(buildEmptyRows());
    }

    // Per-team agent map (one query per team — cheap, teams are scarce).
    const teamAgentMap: Record<string, string[]> = {};
    for (const t of teams) {
      const agents = await listTeamAgents(t.id);
      teamAgentMap[t.name] = agents.map((a) => a.id);
    }

    // Pull monthly revenue for all distinct agents in one shot. Honors the
    // canonical EXCLUDED_DEAL_STATUSES blacklist so terminal failures don't
    // inflate the trend line.
    const allIds = Array.from(new Set(Object.values(teamAgentMap).flat()));
    const revenueByAgentMonth: Record<string, Record<string, number>> = {};
    if (allIds.length > 0) {
      try {
        const rows = await pool.query(
          `SELECT agent_user_id::text AS agent_id,
                  TO_CHAR(date_trunc('month', created_at), 'YYYY-MM') AS month,
                  COALESCE(SUM(annual_premium::numeric), 0)::numeric AS revenue
           FROM deals
           WHERE agent_user_id = ANY($1::uuid[])
             AND created_at >= NOW() - ($2::int || ' months')::interval
             AND status IS NOT NULL
             AND NOT (status = ANY($3::text[]))
           GROUP BY 1, 2`,
          [allIds, months, EXCLUDED_DEAL_STATUSES],
        );
        for (const r of rows.rows) {
          if (!revenueByAgentMonth[r.month]) revenueByAgentMonth[r.month] = {};
          revenueByAgentMonth[r.month][r.agent_id] = Number(r.revenue) || 0;
        }
      } catch (qerr: any) {
        // No swallow — surface the failure so it shows up in logs and the
        // chart silently zeros (better than a 500 since the rest of the page
        // can render). Returning the zero-filled rows is the contract.
        console.error("[founders-teams] /trends query failed:", qerr?.message);
      }
    }

    const out = buildEmptyRows();
    for (const row of out) {
      const monthMap = revenueByAgentMonth[row.month] || {};
      for (const [teamName, agentIds] of Object.entries(teamAgentMap)) {
        row[teamName] = agentIds.reduce((acc, id) => acc + (monthMap[id] || 0), 0);
      }
    }
    res.json(out);
  } catch (e: any) {
    console.error("[founders-teams] /trends error:", e?.message);
    res.status(500).json(genericError("Failed to load team trends"));
  }
});

export default router;
