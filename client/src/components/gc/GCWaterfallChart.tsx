import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

export interface WaterfallItem {
  label: string;
  value: number;
  isTotal?: boolean;
}

export interface GCWaterfallChartProps {
  data: WaterfallItem[];
  title?: string;
  valueFormatter?: (v: number) => string;
}

interface ChartRow {
  label: string;
  base: number;
  value: number;
  isTotal: boolean;
  isNegative: boolean;
  runningTotal: number;
}

function transformData(data: WaterfallItem[]): ChartRow[] {
  let runningTotal = 0;
  return data.map((item) => {
    if (item.isTotal) {
      return { label: item.label, base: 0, value: runningTotal, isTotal: true, isNegative: false, runningTotal };
    }
    const prevTotal = runningTotal;
    runningTotal += item.value;
    if (item.value >= 0) {
      return { label: item.label, base: prevTotal, value: item.value, isTotal: false, isNegative: false, runningTotal };
    }
    return { label: item.label, base: runningTotal, value: Math.abs(item.value), isTotal: false, isNegative: true, runningTotal };
  });
}

const WaterfallTooltip = ({ active, payload, valueFormatter }: any) => {
  if (!active || !payload?.[1]) return null;
  const row = payload[1].payload as ChartRow;
  const displayValue = row.isNegative ? -row.value : row.value;
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "8px 14px", fontFamily: "var(--gc-font-body)", boxShadow: "var(--gc-shadow-md)" }}>
      <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)", marginBottom: 2 }}>{row.label}</div>
      <div style={{ fontSize: "var(--gc-text-base)", fontWeight: 600, color: row.isTotal ? "var(--gc-gold)" : row.isNegative ? "var(--gc-status-terminated)" : "var(--gc-status-active)" }}>
        {row.isTotal ? "" : displayValue >= 0 ? "+" : ""}{valueFormatter(row.isTotal ? row.runningTotal : displayValue)}
      </div>
      {!row.isTotal && (
        <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 2 }}>
          Running total: {valueFormatter(row.runningTotal)}
        </div>
      )}
    </div>
  );
};

export function GCWaterfallChart({ data, title, valueFormatter = (v) => v.toLocaleString() }: GCWaterfallChartProps) {
  const chartData = transformData(data);
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
      {title && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>{title}</div>}
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gc-border-subtle)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} />
          <Tooltip content={<WaterfallTooltip valueFormatter={valueFormatter} />} cursor={false} />
          <Bar dataKey="base" stackId="waterfall" fill="transparent" />
          <Bar dataKey="value" stackId="waterfall" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isTotal ? "var(--gc-gold)" : entry.isNegative ? "var(--gc-status-terminated)" : "var(--gc-status-active)"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
