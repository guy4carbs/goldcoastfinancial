import { Router } from "express";
import { pool } from "../db";
import { requireAuth, requireRole, ADMIN_PLUS } from "../middleware/auth";
import { getDateRange } from "../utils/dateRange";

const router = Router();

router.get("/pnl", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");
    const revenue = await pool.query(
      `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
       FROM deals
       WHERE created_at >= $1 AND created_at <= $2`,
      [start, end]
    );
    const revenueTotal = Number(revenue.rows[0]?.total) || 0;
    const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toLocaleString()}`;
    res.json([
      { label: "Total AP Submitted", value: fmt(revenueTotal) },
      { label: "Est. Agent Commission (~80%)", value: fmt(Math.round(revenueTotal * 0.80)) },
      { label: "Est. Agency Override (~20%)", value: fmt(Math.round(revenueTotal * 0.20)) },
      { label: "Net AP", value: fmt(revenueTotal) },
    ]);
  } catch (e: any) { console.error("Finance reports error:", e.message); res.status(500).json({ error: e.message }); }
});

router.get("/commissions", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");
    const result = await pool.query(
      `SELECT carrier as commission_type,
              COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total,
              COUNT(*)::int as count
       FROM deals
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY carrier
       ORDER BY total DESC`,
      [start, end]
    );
    const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toLocaleString()}`;
    res.json(result.rows.map((r: any) => ({
      type: r.commission_type || "Unknown",
      total: fmt(Number(r.total)),
      count: r.count,
    })));
  } catch (e: any) { console.error("Finance reports error:", e.message); res.status(500).json({ error: e.message }); }
});

router.get("/agent-performance", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");

    const agentStats = await pool.query(
      `SELECT d.agent_user_id,
              CONCAT(u.first_name, ' ', u.last_name) as name,
              COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(12,2) as total,
              COUNT(*)::int as deals
       FROM deals d
       JOIN users u ON u.id = d.agent_user_id
       WHERE d.created_at >= $1 AND d.created_at <= $2
       GROUP BY d.agent_user_id, u.first_name, u.last_name
       ORDER BY total DESC`,
      [start, end]
    );

    const agents = agentStats.rows;
    const activeAgents = agents.length;
    const topAgent = agents[0] || null;
    const totalRevenue = agents.reduce((sum: number, a: any) => sum + Number(a.total), 0);
    const avgRevenue = activeAgents > 0 ? Number((totalRevenue / activeAgents).toFixed(2)) : 0;

    const fmt = (v: number) => v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v.toLocaleString()}`;
    res.json({
      topProducer: topAgent?.name || "N/A",
      topRevenue: topAgent ? fmt(Number(topAgent.total)) : "$0",
      avgRevenue: fmt(avgRevenue),
      activeAgents,
      retention: "N/A",
    });
  } catch (e: any) { console.error("Finance reports error:", e.message); res.status(500).json({ error: e.message }); }
});

router.get("/export", requireAuth, requireRole(...ADMIN_PLUS), async (req, res) => {
  try {
    const { start, end } = getDateRange((req.query.period as string) || "ytd");
    const period = (req.query.period as string) || "ytd";

    const revenue = await pool.query(
      `SELECT COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total
       FROM deals WHERE created_at >= $1 AND created_at <= $2`,
      [start, end]
    );

    const byCarrier = await pool.query(
      `SELECT carrier, COALESCE(SUM(annual_premium::numeric), 0)::numeric(12,2) as total, COUNT(*)::int as count
       FROM deals WHERE created_at >= $1 AND created_at <= $2
       GROUP BY carrier ORDER BY total DESC`,
      [start, end]
    );

    const agentPerf = await pool.query(
      `SELECT CONCAT(u.first_name, ' ', u.last_name) as name,
              COALESCE(SUM(d.annual_premium::numeric), 0)::numeric(12,2) as total,
              COUNT(*)::int as deals
       FROM deals d JOIN users u ON u.id = d.agent_user_id
       WHERE d.created_at >= $1 AND d.created_at <= $2
       GROUP BY u.first_name, u.last_name ORDER BY total DESC`,
      [start, end]
    );

    const lines: string[] = [];
    lines.push(`Finance Report - Period: ${period} (${start} to ${end})`);
    lines.push("");
    lines.push("AP Summary");
    lines.push("Category,Amount");
    lines.push(`Total AP Submitted,${revenue.rows[0]?.total || 0}`);
    lines.push("");
    lines.push("AP by Carrier");
    lines.push("Carrier,AP,Deals");
    for (const row of byCarrier.rows) {
      lines.push(`${row.carrier},${row.total},${row.count}`);
    }
    lines.push("");
    lines.push("Agent Performance");
    lines.push("Agent,AP,Deals");
    for (const row of agentPerf.rows) {
      lines.push(`${row.name},${row.total},${row.deals}`);
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="finance-report-${period}.csv"`);
    res.send(lines.join("\n"));
  } catch (e: any) { console.error("Finance reports error:", e.message); res.status(500).json({ error: e.message }); }
});

export default router;
