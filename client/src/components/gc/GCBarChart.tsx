import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface GCBarChartProps { data: { name: string; value: number }[]; title?: string; valueFormatter?: (v: number) => string; }

export function GCBarChart({ data, title, valueFormatter = (v) => v.toLocaleString() }: GCBarChartProps) {
  const chartHeight = Math.max(160, data.length * 36 + 32);
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
      {title && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>{title}</div>}
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }} barCategoryGap="20%">
            <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--gc-text-secondary)" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", fontFamily: "var(--gc-font-body)", fontSize: 12, padding: "8px 12px" }} formatter={(v: number) => [valueFormatter(v), ""]} cursor={{ fill: "var(--gc-hover-overlay)" }} />
            <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill="var(--gc-gold)" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
