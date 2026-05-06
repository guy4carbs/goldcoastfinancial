/**
 * Format a Date as YYYY-MM-DD using LOCAL components.
 *
 * Avoids the toISOString() trap: in any timezone east of UTC, a local Date
 * for "midnight today" maps to a previous-day UTC instant, and toISOString()
 * would return yesterday. Profit Split tracks deposits by user-local date,
 * so range bounds must be local-anchored.
 */
function fmtLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function getDateRange(period: string): { start: string; end: string } {
  const now = new Date();

  switch (period) {
    // ─── Founders Profit Split presets (DTD/WTD/MTD/QTD/6mo/YTD/All) ───
    case "today": {
      // Day-to-date — start of today through end of today (inclusive).
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "wtd": {
      // Week-to-date — Monday-anchored. JS getDay returns 0=Sun..6=Sat;
      // shift back to the Monday on/before today.
      const dow = now.getDay();
      const offsetToMonday = (dow + 6) % 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offsetToMonday);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "mtd": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "qtd": {
      const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), quarterStartMonth, 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "6mo": {
      // "Last 6 months" = current month + 5 prior months. month-6 would be
      // 7 calendar months and surface a misleading "6mo" label — keep the
      // window aligned with what the label promises.
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "all": {
      // Open-ended — anchor to a date well before any data exists.
      return { start: "1970-01-01", end: fmtLocal(now) };
    }

    // ─── Existing presets ───
    case "this-month": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "last-month": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: fmtLocal(start), end: fmtLocal(end) };
    }
    case "last-3": {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "last-6": {
      const start = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "ytd": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
    case "last-year": {
      const start = new Date(now.getFullYear() - 1, 0, 1);
      const end = new Date(now.getFullYear() - 1, 11, 31);
      return { start: fmtLocal(start), end: fmtLocal(end) };
    }
    default: {
      // Default to YTD
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: fmtLocal(start), end: fmtLocal(now) };
    }
  }
}
