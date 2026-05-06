/**
 * Founders Lounge — shared formatting helpers.
 *
 * Single source of truth for presentation-layer formatting across all
 * Founders pages. Every helper is null/undefined/NaN tolerant and returns
 * a stable placeholder string ("—" or "$0") for empty inputs so call sites
 * never need to wrap these in conditionals.
 *
 * Replaces the page-local duplicates in:
 *   FoundersDashboard     (formatCurrency, formatNumber)
 *   FoundersGrowth        (formatCurrency)
 *   FoundersRevenue       (formatCurrency)
 *   FoundersViewAs        (formatDate, formatDuration)
 *   FoundersLoungeAccess  (formatDate)
 */

import { format, formatDistance } from "date-fns";
import { SPLIT_RECIPIENTS, type SplitRecipientKey } from "@shared/models/founders";

/**
 * Internal: format a USD dollar magnitude using compact K/M/B suffixes.
 * Sign-preserving. Shared between `formatCurrency` and `dollars` so
 * magnitude breakpoints and precision stay in lockstep.
 *   |v| >= 1e9  -> $X.XXB
 *   |v| >= 1e6  -> $X.XXM
 *   |v| >= 1e4  -> $X.XK       (one decimal, >= $10,000 switches to compact)
 *   otherwise   -> $X          (integer rounded)
 */
function compactUSD(v: number): string {
  if (!Number.isFinite(v)) return "$0";
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${Math.round(abs).toLocaleString("en-US")}`;
}

/**
 * Format a dollar amount (in whole dollars) with compact K/M/B suffixes
 * above $10,000. Sign-preserving.
 */
export function formatCurrency(v: number): string {
  return compactUSD(v);
}

/**
 * Format an integer with US thousands separators. Values are rounded.
 */
export function formatNumber(v: number): string {
  if (!Number.isFinite(v)) return "0";
  return Math.round(v).toLocaleString("en-US");
}

/**
 * Format a percentage value (already in percent units, e.g. 42.5).
 * Returns "—" for null / undefined.
 */
export function formatPct(v?: number | null, digits: number = 1): string {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return "—";
  return `${Number(v).toFixed(digits)}%`;
}

/**
 * Format a cents value as a USD string.
 *
 * - `null` / `undefined` / `NaN` -> `"$0"` (or `"$0.00"` with `cents: true`)
 * - `{ compact: true }` uses the same K/M/B breakpoints as `formatCurrency`.
 * - `{ cents: true }` always renders two decimal places exactly. The cent
 *   portion is taken straight from the input integer — no FP arithmetic —
 *   so values like 10001¢ render as `$100.01`, not `$100.00` after a sneaky
 *   `Math.round` collapse.
 * - Default form uses `toLocaleString` with commas and no decimals.
 */
export function dollars(
  cents?: number | null,
  opts?: { compact?: boolean; cents?: boolean }
): string {
  if (cents === null || cents === undefined || !Number.isFinite(Number(cents))) {
    return opts?.cents ? "$0.00" : "$0";
  }
  const intCents = Math.trunc(Number(cents));
  if (opts?.compact) return compactUSD(intCents / 100);
  const sign = intCents < 0 ? "-" : "";
  const abs = Math.abs(intCents);
  if (opts?.cents) {
    const wholePart = Math.trunc(abs / 100).toLocaleString("en-US");
    const fracPart = String(abs % 100).padStart(2, "0");
    return `${sign}$${wholePart}.${fracPart}`;
  }
  return `${sign}$${Math.round(abs / 100).toLocaleString("en-US")}`;
}

/**
 * Compute the 30/30/30/10 founder split for a gross deposit (in cents).
 *
 * Uses the **largest-remainder** (Hamilton) method:
 *   1. Floor each share to a whole cent.
 *   2. Distribute the leftover pennies one at a time to the recipients with
 *      the largest fractional remainder, breaking ties by `SPLIT_RECIPIENTS`
 *      order.
 *
 * This guarantees two properties the UI relies on:
 *   - **Conservation**: parts always sum exactly to the input (zero drift).
 *   - **Fairness**: when the input doesn't divide evenly, the leftover cent
 *     goes to the founder whose true share was *most* shorted by floor —
 *     not silently absorbed into "Business Reserves" where it wouldn't be
 *     a fair representation of "30% each".
 *
 * Mirrors `splitCents` in `server/routes/founders-profit.ts`. Both must stay
 * in lockstep with the percentages declared in `shared/models/founders.ts`.
 */
export function splitAmountCents(totalCents: number): Record<SplitRecipientKey, number> {
  const safe = Number.isFinite(totalCents) ? Math.round(totalCents) : 0;
  const parts = {} as Record<SplitRecipientKey, number>;
  // Step 1: floor each share, track fractional remainder + recipient order.
  const fractions: Array<{ key: SplitRecipientKey; frac: number; order: number }> = [];
  let assigned = 0;
  SPLIT_RECIPIENTS.forEach((r, order) => {
    const exact = safe * r.pct;
    const floor = Math.floor(exact);
    parts[r.key as SplitRecipientKey] = floor;
    assigned += floor;
    fractions.push({ key: r.key as SplitRecipientKey, frac: exact - floor, order });
  });
  // Step 2: distribute leftover pennies. Largest fractional remainder first;
  // ties broken by declared order in SPLIT_RECIPIENTS (founders precede retained).
  let leftover = safe - assigned;
  if (leftover > 0) {
    fractions.sort((a, b) => b.frac - a.frac || a.order - b.order);
    for (let i = 0; leftover > 0; i = (i + 1) % fractions.length) {
      parts[fractions[i].key] += 1;
      leftover -= 1;
    }
  }
  return parts;
}

/**
 * Human-readable "time since" label — e.g. "about 3 hours ago",
 * "2 days ago". Returns "—" for missing / invalid input.
 */
export function ageInDays(ts: string | Date | null | undefined): string {
  if (ts === null || ts === undefined) return "—";
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "—";
  return formatDistance(d, new Date(), { addSuffix: true });
}

/**
 * Whole days until a future timestamp (rounded up). Negative values are
 * returned as-is for past timestamps. Returns `null` when input is
 * missing or unparseable.
 */
export function daysUntil(ts: string | Date | null | undefined): number | null {
  if (ts === null || ts === undefined) return null;
  const d = typeof ts === "string" ? new Date(ts) : ts;
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return null;
  return Math.ceil((d.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

/**
 * Format a date as a short display string.
 *   style = "short"    -> "Apr 23, 2026"
 *   style = "datetime" -> "Apr 23, 6:14 PM"
 * Returns "—" for null / undefined / invalid.
 */
export function formatDate(
  ts?: string | null,
  style: "short" | "datetime" = "short"
): string {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return style === "datetime" ? format(d, "MMM d, h:mm a") : format(d, "MMM d, yyyy");
}

/**
 * Format a duration (in seconds) as compact human text.
 *   0-59s      -> "Ns"
 *   60-3599s   -> "Nm Ns"
 *   3600s+     -> "Nh Nm"
 * Returns "—" for null / undefined / invalid.
 */
export function formatDuration(seconds?: number | null): string {
  if (seconds === null || seconds === undefined || !Number.isFinite(Number(seconds))) {
    return "—";
  }
  const s = Math.max(0, Math.floor(Number(seconds)));
  if (s < 60) return `${s}s`;
  if (s < 3600) {
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem}s`;
  }
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}h ${m}m`;
}
