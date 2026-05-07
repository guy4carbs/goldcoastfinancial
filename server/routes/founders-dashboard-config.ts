import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { requireAuth, requireRole, FOUNDERS_ONLY } from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { resolveAgentAgency, ROOT_AGENCY_ID } from "../services/agencyResolver";
import { currentQuarterStart } from "./founders-oversight";

/**
 * Founder dashboard config — mutation routes for editable bits of the cockpit.
 *
 * Two surfaces today:
 *   - PUT  /goals/:metricKey  — upsert one quarterly goal for the viewer's agency
 *   - POST /cash-balance      — record a manual cash-balance snapshot
 *
 * Both routes are gated to FOUNDERS_ONLY (Wave Y tightening — Owner +
 * SystemAdmin no longer access /founders/* per founder mandate) and audit-log
 * every successful mutation through `logFounderAction` (soft-fail audit so the
 * action itself isn't blocked by an audit-write hiccup).
 */
const router = Router();

router.use(requireAuth);
router.use(requireRole(...FOUNDERS_ONLY));

// ─── Goals ────────────────────────────────────────────────────────────────────
// Per-metric quarterly target. The viewer's agency is resolved server-side via
// resolveAgentAgency — clients can't write goals for other tenants. Quarter is
// always the *current* calendar quarter (date_trunc('quarter', NOW())) so the
// UI never needs to send a period parameter.

const GoalSchema = z.object({
  targetValue: z.number().min(0),
  unit: z.enum(["usd", "count", "pct", "currency", "percent"]).optional(),
  notes: z.string().max(500).optional(),
});

// Whitelist mirrors the metric keys the read endpoint computes a `current` for.
// Adding a new key here without wiring the read side leaves the UI showing
// target without progress — keep both ends in sync.
const ALLOWED_METRIC_KEYS = [
  "revenue_quarterly",
  "new_agents_quarterly",
  "override_growth_pct",
  "retention_pct",
];

router.put("/goals/:metricKey", async (req, res) => {
  const parsed = GoalSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid goal payload" });
  }
  const { metricKey } = req.params;
  if (!ALLOWED_METRIC_KEYS.includes(metricKey)) {
    return res.status(400).json({ error: "Invalid metric_key" });
  }

  try {
    const resolved = await resolveAgentAgency(req.user!.id);
    const agencyId = resolved?.agencyId || ROOT_AGENCY_ID;

    // Current calendar quarter start (Jan 1 / Apr 1 / Jul 1 / Oct 1) anchored
    // local-time, matching how the read endpoint computes period_start.
    const now = new Date();
    // Use the shared helper from founders-oversight so PUT and GET produce
    // the same period_start string. Closes the UTC-vs-local-time drift bug
    // where saved goals didn't appear on next refetch.
    const periodStart = currentQuarterStart(now);

    await pool.query(
      `INSERT INTO founder_goals (agency_id, metric_key, period_type, period_start, target_value, unit, notes, created_by_user_id)
       VALUES ($1::uuid, $2, 'quarter', $3::date, $4, $5, $6, $7::uuid)
       ON CONFLICT (agency_id, metric_key, period_start) DO UPDATE SET
         target_value = EXCLUDED.target_value,
         unit         = COALESCE(EXCLUDED.unit, founder_goals.unit),
         notes        = COALESCE(EXCLUDED.notes, founder_goals.notes)`,
      [
        agencyId,
        metricKey,
        periodStart,
        parsed.data.targetValue,
        parsed.data.unit || "usd",
        parsed.data.notes || null,
        req.user!.id,
      ],
    );

    await logFounderAction({
      actorUserId: req.user!.id,
      action: "founder_goal_set",
      entityType: "founder_goal",
      entityId: null,
      payload: { agencyId, metricKey, periodStart, targetValue: parsed.data.targetValue },
    }).catch(() => {});

    res.json({ success: true });
  } catch (e: any) {
    console.error("[founders-dashboard-config] PUT /goals error:", e?.message);
    res.status(500).json({ error: "Failed to save goal" });
  }
});

// ─── Cash balance snapshots ───────────────────────────────────────────────────
// One INSERT per snapshot — `cash_balances` is append-only so the read endpoint
// can compute "latest per account_label" by ORDER BY as_of_at DESC. account_last4
// is optional but encouraged so the UI can render "Chase ****7368" without
// joining anywhere.

const CashSchema = z.object({
  accountLabel: z.string().min(1).max(80),
  accountLast4: z.string().length(4).optional(),
  amountUsd: z.number().min(0),
  asOfDate: z.string(),
  notes: z.string().max(500).optional(),
});

router.post("/cash-balance", async (req, res) => {
  const parsed = CashSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || "Invalid cash balance payload" });
  }

  try {
    const resolved = await resolveAgentAgency(req.user!.id);
    const agencyId = resolved?.agencyId || ROOT_AGENCY_ID;
    const balanceCents = Math.round(parsed.data.amountUsd * 100);

    const r = await pool.query(
      `INSERT INTO cash_balances (agency_id, account_label, account_last4, balance_cents, as_of_at, source, notes, created_by_user_id)
       VALUES ($1::uuid, $2, $3, $4, $5::timestamp, 'manual', $6, $7::uuid)
       RETURNING id`,
      [
        agencyId,
        parsed.data.accountLabel,
        parsed.data.accountLast4 || null,
        balanceCents,
        parsed.data.asOfDate,
        parsed.data.notes || null,
        req.user!.id,
      ],
    );

    await logFounderAction({
      actorUserId: req.user!.id,
      action: "cash_balance_recorded",
      entityType: "cash_balance",
      entityId: r.rows[0]?.id ?? null,
      payload: { agencyId, accountLabel: parsed.data.accountLabel, balanceCents },
    }).catch(() => {});

    res.json({ success: true, id: r.rows[0]?.id });
  } catch (e: any) {
    console.error("[founders-dashboard-config] POST /cash-balance error:", e?.message);
    res.status(500).json({ error: "Failed to record cash balance" });
  }
});

export default router;
