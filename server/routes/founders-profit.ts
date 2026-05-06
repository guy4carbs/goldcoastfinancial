import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import {
  requireAuth,
  requireRole,
  FOUNDERS_ONLY,
  blockWritesDuringViewAs,
} from "../middleware/auth";
import { logFounderAction } from "../services/founderAudit";
import { getDateRange } from "../utils/dateRange";
import { SPLIT_RECIPIENTS, FOUNDER_DISTRIBUTION_SOURCES } from "@shared/models/founders";

/**
 * Founders Profit Split routes — read/write the `founder_distributions` ledger
 * and surface the derived 30/30/30/10 breakdown.
 *
 * The split itself is computed on the server (not stored) using SPLIT_RECIPIENTS
 * from the shared model. Rounding remainder is absorbed into the "retained"
 * bucket so the four parts always sum exactly to the gross deposit.
 */

const router = Router();

router.use(requireAuth, requireRole(...FOUNDERS_ONLY));

const periodSchema = z
  .object({ period: z.string().optional() })
  .transform((v) => v.period || "mtd");

const depositSchema = z.object({
  depositDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "expected YYYY-MM-DD"),
  amountCents: z.number().int().positive(),
  source: z.enum(FOUNDER_DISTRIBUTION_SOURCES),
  estimatedAmountCents: z.number().int().nonnegative().optional(),
  note: z.string().max(2000).optional(),
});

// Compute split using the largest-remainder (Hamilton) method:
//   1. Floor each share.
//   2. Distribute leftover pennies to the recipients with the largest
//      fractional remainder, ties broken by SPLIT_RECIPIENTS order.
// Guarantees: parts sum exactly to totalCents AND the residue lands on the
// recipient whose true share was most under-rounded (not silently dumped
// into "retained"). Mirrors `splitAmountCents` on the client.
function splitCents(totalCents: number): Record<string, number> {
  const parts: Record<string, number> = {};
  const fractions: Array<{ key: string; frac: number; order: number }> = [];
  let assigned = 0;
  SPLIT_RECIPIENTS.forEach((r, order) => {
    const exact = totalCents * r.pct;
    const floor = Math.floor(exact);
    parts[r.key] = floor;
    assigned += floor;
    fractions.push({ key: r.key, frac: exact - floor, order });
  });
  let leftover = totalCents - assigned;
  if (leftover > 0) {
    fractions.sort((a, b) => b.frac - a.frac || a.order - b.order);
    for (let i = 0; leftover > 0; i = (i + 1) % fractions.length) {
      parts[fractions[i].key] += 1;
      leftover -= 1;
    }
  }
  return parts;
}

// Bucket granularity for the timeline endpoint — driven by selected period.
//   day:   today, wtd, mtd  → up to 31 ticks
//   week:  qtd               → up to 13 ticks
//   month: 6mo, ytd, all     → up to 12-ish ticks
// The previous mapping used week buckets for YTD/6mo, which produced 26-52
// ticks and squeezed labels into illegibility.
function bucketModeFor(period: string): "day" | "week" | "month" {
  if (period === "today" || period === "wtd" || period === "mtd") return "day";
  if (period === "qtd") return "week";
  return "month";
}

// Parse a YYYY-MM-DD string as a LOCAL Date. Avoids the new Date('2026-04-28')
// trap which interprets bare ISO dates as UTC.
function parseLocalDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function fmtLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Snap a local date back to the bucket boundary (start-of-day / Monday-of-week
// / first-of-month). Mirrors postgres `date_trunc` so client and server agree
// on what bucket a deposit lives in.
function snapToBucket(d: Date, mode: "day" | "week" | "month"): Date {
  if (mode === "day") return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (mode === "week") {
    const dow = d.getDay();
    const offsetToMonday = (dow + 6) % 7;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - offsetToMonday);
  }
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function nextBucket(d: Date, mode: "day" | "week" | "month"): Date {
  if (mode === "day") return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  if (mode === "week") return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
  return new Date(d.getFullYear(), d.getMonth() + 1, 1);
}

// Generate every bucket between start and end (inclusive). Used for gap-fill
// so the chart shows a continuous timeline even when only a few buckets have
// deposits.
function generateBuckets(start: string, end: string, mode: "day" | "week" | "month"): string[] {
  // Cap at a defensive maximum so an `all` period with no data doesn't blow up.
  const MAX = 200;
  const startBucket = snapToBucket(parseLocalDate(start), mode);
  const endBucket = parseLocalDate(end);
  const buckets: string[] = [];
  let cursor = startBucket;
  while (cursor <= endBucket && buckets.length < MAX) {
    buckets.push(fmtLocalDate(cursor));
    cursor = nextBucket(cursor, mode);
  }
  return buckets;
}

// ─── GET /summary?period=... ─────────────────────────────────────────────
router.get("/summary", async (req, res) => {
  try {
    const period = periodSchema.parse(req.query);
    const { start, end } = getDateRange(period);
    const result = await pool.query(
      `SELECT COALESCE(SUM(amount_cents), 0)::bigint AS total_cents,
              COUNT(*)::int AS deposit_count
       FROM founder_distributions
       WHERE deleted_at IS NULL
         AND deposit_date >= $1 AND deposit_date <= $2`,
      [start, end],
    );
    const totalCents = Number(result.rows[0]?.total_cents || 0);
    const depositCount = Number(result.rows[0]?.deposit_count || 0);
    res.json({
      period,
      start,
      end,
      totalCents,
      depositCount,
      splits: splitCents(totalCents),
    });
  } catch (e: any) {
    console.error("Founders profit summary error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /timeline?period=... ────────────────────────────────────────────
// Returns a gap-filled time series — every bucket in the period is present
// (zero-filled if no deposits land in it) so the chart renders a continuous
// line instead of one lonely point.
router.get("/timeline", async (req, res) => {
  try {
    const period = periodSchema.parse(req.query);
    const { start, end } = getDateRange(period);
    const mode = bucketModeFor(period);
    // to_char keeps the bucket as a YYYY-MM-DD string; avoids the JS Date
    // round-trip that timezone-shifts dates depending on server locale.
    const result = await pool.query(
      `SELECT to_char(date_trunc($1, deposit_date), 'YYYY-MM-DD') AS bucket,
              COALESCE(SUM(amount_cents), 0)::bigint AS total_cents
       FROM founder_distributions
       WHERE deleted_at IS NULL
         AND deposit_date >= $2 AND deposit_date <= $3
       GROUP BY bucket
       ORDER BY bucket ASC`,
      [mode, start, end],
    );
    const byBucket = new Map<string, number>();
    for (const r of result.rows) {
      byBucket.set(String(r.bucket), Number(r.total_cents || 0));
    }
    const buckets = generateBuckets(start, end, mode);
    const series = buckets.map((b) => {
      const total = byBucket.get(b) || 0;
      const split = splitCents(total);
      return {
        bucket: b,
        totalCents: total,
        ...split,
      };
    });
    res.json({ period, mode, start, end, series });
  } catch (e: any) {
    console.error("Founders profit timeline error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /ledger?period=...&limit=100 ────────────────────────────────────
router.get("/ledger", async (req, res) => {
  try {
    const period = periodSchema.parse(req.query);
    const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100));
    const { start, end } = getDateRange(period);
    const result = await pool.query(
      `SELECT d.id, d.deposit_date, d.amount_cents, d.source,
              d.estimated_amount_cents, d.note,
              d.created_by_user_id, d.created_at,
              u.first_name, u.last_name
       FROM founder_distributions d
       LEFT JOIN users u ON u.id = d.created_by_user_id
       WHERE d.deleted_at IS NULL
         AND d.deposit_date >= $1 AND d.deposit_date <= $2
       ORDER BY d.deposit_date DESC, d.created_at DESC
       LIMIT $3`,
      [start, end, limit],
    );
    const rows = result.rows.map((r: any) => {
      const amount = Number(r.amount_cents);
      return {
        id: r.id,
        depositDate: r.deposit_date instanceof Date ? r.deposit_date.toISOString().slice(0, 10) : r.deposit_date,
        amountCents: amount,
        source: r.source,
        estimatedAmountCents: r.estimated_amount_cents == null ? null : Number(r.estimated_amount_cents),
        note: r.note,
        createdByUserId: r.created_by_user_id,
        createdByName: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
        createdAt: r.created_at,
        splits: splitCents(amount),
      };
    });
    res.json({ period, rows });
  } catch (e: any) {
    console.error("Founders profit ledger error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── GET /estimate?asOfDate=YYYY-MM-DD ───────────────────────────────────
// Suggests a deposit amount by summing AP commission proxy from the deals
// table for the given date. Pure read; never inserts.
router.get("/estimate", async (req, res) => {
  try {
    const asOf = (req.query.asOfDate as string | undefined) || new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) {
      return res.status(400).json({ error: "asOfDate must be YYYY-MM-DD" });
    }
    // Best-effort lookup against the deals table. If the table or column is
    // missing in this environment, return zero so the modal still renders.
    let estimatedCents = 0;
    try {
      const result = await pool.query(
        `SELECT COALESCE(SUM(annual_premium), 0)::numeric AS total_ap
         FROM deals
         WHERE issued_at::date = $1`,
        [asOf],
      );
      // Treat raw AP as a stand-in for net deposit (Phase 1 — no expense model).
      const ap = Number(result.rows[0]?.total_ap || 0);
      estimatedCents = Math.round(ap * 100);
    } catch {
      estimatedCents = 0;
    }
    res.json({
      asOfDate: asOf,
      estimatedCents,
      breakdown: { source: "deals.annual_premium", note: "Phase 1 estimator — no expense deduction." },
    });
  } catch (e: any) {
    console.error("Founders profit estimate error:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ─── POST /deposits ──────────────────────────────────────────────────────
router.post("/deposits", blockWritesDuringViewAs, async (req, res) => {
  const parsed = depositSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid deposit", details: parsed.error.issues });
  }
  const { depositDate, amountCents, source, estimatedAmountCents, note } = parsed.data;
  const actorId = (req as any).user?.id || null;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const insert = await client.query(
      `INSERT INTO founder_distributions
         (deposit_date, amount_cents, source, estimated_amount_cents, note, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, deposit_date, amount_cents, source, estimated_amount_cents, note,
                 created_by_user_id, created_at`,
      [depositDate, amountCents, source, estimatedAmountCents ?? null, note ?? null, actorId],
    );
    const row = insert.rows[0];
    await logFounderAction({
      actorUserId: actorId,
      action: "profit_deposit_recorded",
      entityType: "founder_distribution",
      entityId: row.id,
      payload: {
        depositDate,
        amountCents,
        source,
        estimatedAmountCents: estimatedAmountCents ?? null,
      },
      client,
    });
    await client.query("COMMIT");
    res.status(201).json({
      id: row.id,
      depositDate: row.deposit_date instanceof Date
        ? row.deposit_date.toISOString().slice(0, 10)
        : row.deposit_date,
      amountCents: Number(row.amount_cents),
      source: row.source,
      estimatedAmountCents: row.estimated_amount_cents == null ? null : Number(row.estimated_amount_cents),
      note: row.note,
      createdByUserId: row.created_by_user_id,
      createdAt: row.created_at,
      splits: splitCents(Number(row.amount_cents)),
    });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("Founders profit deposit error:", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// ─── DELETE /deposits/:id (soft delete) ──────────────────────────────────
router.delete("/deposits/:id", blockWritesDuringViewAs, async (req, res) => {
  const id = req.params.id;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return res.status(400).json({ error: "Invalid id" });
  }
  const actorId = (req as any).user?.id || null;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const update = await client.query(
      `UPDATE founder_distributions
       SET deleted_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id, deposit_date, amount_cents`,
      [id],
    );
    if (update.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Not found" });
    }
    const row = update.rows[0];
    await logFounderAction({
      actorUserId: actorId,
      action: "profit_deposit_deleted",
      entityType: "founder_distribution",
      entityId: id,
      payload: {
        depositDate: row.deposit_date instanceof Date
          ? row.deposit_date.toISOString().slice(0, 10)
          : row.deposit_date,
        amountCents: Number(row.amount_cents),
      },
      client,
    });
    await client.query("COMMIT");
    res.json({ ok: true });
  } catch (e: any) {
    await client.query("ROLLBACK");
    console.error("Founders profit delete error:", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

export default router;
