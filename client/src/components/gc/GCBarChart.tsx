import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface GCBarChartProps { data: { name: string; value: number }[]; title?: string; valueFormatter?: (v: number) => string; }

export function GCBarChart({ data, title, valueFormatter = (v) => v.toLocaleString() }: GCBarChartProps) {
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
      {title && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>{title}</div>}
      <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ left: 80, right: 16, top: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--gc-text-secondary)" }} axisLine={false} tickLine={false} width={80} />
          <Tooltip contentStyle={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", fontFamily: "var(--gc-font-body)", fontSize: 12 }} formatter={(v: number) => [valueFormatter(v), "Value"]} />
          <Bar dataKey="value" radius={0}>{data.map((_, i) => <Cell key={i} fill="var(--gc-gold)" />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
