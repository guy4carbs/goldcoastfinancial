import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export interface GCAreaChartProps { data: { label: string; value: number; value2?: number }[]; title?: string; valueFormatter?: (v: number) => string; keys?: string[]; }

export function GCAreaChart({ data, title, valueFormatter = (v) => v.toLocaleString(), keys }: GCAreaChartProps) {
  const hasSecond = data.some(d => d.value2 !== undefined);
  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
      {title && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>{title}</div>}
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="gcGoldGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#C4975A" stopOpacity={0.3} /><stop offset="100%" stopColor="#C4975A" stopOpacity={0} /></linearGradient>
            <linearGradient id="gcBlueGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.2} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--gc-border-subtle)" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "var(--gc-text-muted)" }} axisLine={false} tickLine={false} tickFormatter={valueFormatter} />
          <Tooltip contentStyle={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", fontFamily: "var(--gc-font-body)", fontSize: 12 }} formatter={(v: number) => [valueFormatter(v)]} />
          <Area type="monotone" dataKey="value" stroke="#C4975A" strokeWidth={2} fill="url(#gcGoldGrad)" name={keys?.[0] || "Value"} />
          {hasSecond && <Area type="monotone" dataKey="value2" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" fill="url(#gcBlueGrad)" name={keys?.[1] || "Value 2"} />}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
