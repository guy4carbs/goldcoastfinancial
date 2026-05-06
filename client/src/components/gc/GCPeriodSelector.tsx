import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface PeriodOption {
  value: string;
  label: string;
}

export const FINANCE_PERIODS: PeriodOption[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-3", label: "Last 3 Months" },
  { value: "last-6", label: "Last 6 Months" },
  { value: "ytd", label: "Year to Date" },
  { value: "last-year", label: "Last Year" },
];

export const INVESTOR_PERIODS: PeriodOption[] = [
  { value: "this-month", label: "This Month" },
  { value: "last-quarter", label: "Last Quarter" },
  { value: "ytd", label: "Year to Date" },
  { value: "last-year", label: "Last Year" },
  { value: "all-time", label: "All Time" },
];

// Founders Profit Split — granular DTD/WTD/MTD/QTD/6mo/YTD/All preset.
// Keys must stay in sync with `getDateRange()` on the server.
export const FOUNDER_PROFIT_PERIODS: PeriodOption[] = [
  { value: "today", label: "Today (DTD)" },
  { value: "wtd",   label: "Week (WTD)" },
  { value: "mtd",   label: "Month (MTD)" },
  { value: "qtd",   label: "Quarter (QTD)" },
  { value: "6mo",   label: "Last 6 mo" },
  { value: "ytd",   label: "Year (YTD)" },
  { value: "all",   label: "All time" },
];

export interface GCPeriodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  options?: PeriodOption[];
}

export function GCPeriodSelector({ value, onChange, options = FINANCE_PERIODS }: GCPeriodSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: "relative", display: "inline-block" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: "inline-flex", alignItems: "center", gap: "var(--gc-space-2)",
          padding: "var(--gc-space-2) var(--gc-space-4)",
          backgroundColor: open ? "color-mix(in srgb, var(--gc-gold) 12%, transparent)" : "var(--gc-surface-2)",
          color: open ? "var(--gc-gold)" : "var(--gc-text-primary)",
          border: open ? "1px solid var(--gc-gold)" : "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)",
          fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 500,
          cursor: "pointer", outline: "none",
          transition: "all var(--gc-transition-fast)",
          minWidth: 140,
          justifyContent: "space-between",
        }}
      >
        <span>{selected?.label || "Select period"}</span>
        <ChevronDown className="w-3.5 h-3.5" style={{
          transition: "transform var(--gc-transition-fast)",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          opacity: 0.6,
        }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 100,
          minWidth: 180,
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-md)",
          boxShadow: "var(--gc-shadow-lg)",
          padding: "var(--gc-space-1) 0",
          overflow: "hidden",
        }}>
          {options.map(opt => {
            const isActive = opt.value === value;
            return (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "var(--gc-space-3)",
                  width: "100%",
                  padding: "var(--gc-space-2) var(--gc-space-4)",
                  backgroundColor: isActive ? "color-mix(in srgb, var(--gc-gold) 10%, transparent)" : "transparent",
                  color: isActive ? "var(--gc-gold)" : "var(--gc-text-primary)",
                  border: "none", cursor: "pointer",
                  fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)",
                  fontWeight: isActive ? 500 : 400,
                  textAlign: "left",
                  transition: "background-color var(--gc-transition-fast)",
                }}
                onMouseEnter={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "var(--gc-hover-overlay)";
                }}
                onMouseLeave={e => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span style={{ width: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isActive && <Check className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />}
                </span>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
