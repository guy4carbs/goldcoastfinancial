import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export interface GCBarChartProps { data: { name: string; value: number }[]; title?: string; valueFormatter?: (v: number) => string; bare?: boolean; }

const CustomTooltip = ({ active, payload, valueFormatter }: any) => {
  if (!active || !payload?.[0]) return null;
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "8px 14px", fontFamily: "var(--gc-font-body)", boxShadow: "var(--gc-shadow-md)" }}>
      <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)", marginBottom: 2 }}>{payload[0].payload.name}</div>
      <div style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-gold)", fontWeight: 600 }}>{valueFormatter ? valueFormatter(payload[0].value) : payload[0].value}</div>
    </div>
  );
};

export function GCBarChart({ data, title, valueFormatter = (v) => v.toLocaleString(), bare = false }: GCBarChartProps) {
  const chartHeight = data.length * 40 + 28;
  const wrapperStyle = bare
    ? {}
    : { backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" };
  return (
    <div style={wrapperStyle}>
      {title && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>{title}</div>}
      <div style={{ width: "100%", height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }} barGap={0}>
            <XAxis type="number" tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} domain={[0, "dataMax"]} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--gc-text-secondary)" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip content={<CustomTooltip valueFormatter={valueFormatter} />} cursor={false} />
            <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
              {data.map((_, i) => <Cell key={i} fill="var(--gc-gold)" />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
