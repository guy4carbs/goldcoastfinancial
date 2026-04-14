import { GCPageHeader, GCKPICard } from "@/components/gc";
import { Link } from "wouter";
import { BarChart3, FileText, GitBranch, DollarSign, Shield, TrendingUp } from "lucide-react";
const MODULES = [
  { title: "Production", desc: "View production metrics & carrier performance", href: "/ops/production", icon: BarChart3 },
  { title: "Deal Submissions", desc: "Track and verify deal submissions", href: "/ops/deals", icon: FileText },
  { title: "Sales Pipeline", desc: "Manage leads & conversion funnel", href: "/ops/pipeline", icon: GitBranch },
  { title: "Commissions", desc: "Commission tracking & payouts", href: "/ops/commissions", icon: DollarSign },
  { title: "Compliance", desc: "Compliance flags & audit trail", href: "/ops/compliance", icon: Shield },
  { title: "Analytics", desc: "Cross-module reporting & dashboards", href: "/ops/analytics", icon: TrendingUp },
];
const ACTIVITY = [
  { text: "Sarah Mitchell submitted a deal", time: "2h ago" },
  { text: "James Rodriguez approved as active agent", time: "5h ago" },
  { text: "New lead from web form: Robert Johnson", time: "6h ago" },
  { text: "Commission payout processed — $12,400", time: "1d ago" },
];
export default function OpsDashboard() {
  return (
    <div>
      <GCPageHeader title="Operations Hub" subtitle="Back-office command center" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Active Agents" value={34} accentTop delta={{ value: "+3", positive: true }} />
        <GCKPICard label="Pipeline Value" value="$245K" accentTop />
        <GCKPICard label="Monthly AIP" value="$142K" accentTop delta={{ value: "+12%", positive: true }} />
        <GCKPICard label="Conversion Rate" value="23%" accentTop delta={{ value: "+2%", positive: true }} />
        <GCKPICard label="Pending Contracting" value={8} accentTop />
        <GCKPICard label="Compliance Alerts" value={3} accentTop delta={{ value: "Action needed", positive: false }} />
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Quick Access</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {MODULES.map(m => (
          <Link key={m.href} href={m.href}>
            <div style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", cursor: "pointer", transition: "border-color var(--gc-transition-normal)" }} onMouseEnter={e => (e.currentTarget.style.borderLeftColor = "var(--gc-gold)", e.currentTarget.style.borderLeftWidth = "3px")} onMouseLeave={e => (e.currentTarget.style.borderLeftColor = "", e.currentTarget.style.borderLeftWidth = "")}>
              <div className="flex items-center gap-3 mb-2">
                <div style={{ padding: "var(--gc-space-2)", backgroundColor: `color-mix(in srgb, var(--gc-gold) 15%, transparent)`, borderRadius: "50%" }}><m.icon className="w-4 h-4" style={{ color: "var(--gc-gold)" }} /></div>
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>{m.title}</span>
              </div>
              <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>{m.desc}</p>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Recent Activity</div>
      <div className="flex flex-col gap-2">
        {ACTIVITY.map((a, i) => (
          <div key={i} style={{ padding: "var(--gc-space-3) var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border-subtle)", borderRadius: "var(--gc-radius-md)", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-primary)" }}>{a.text}</span>
            <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", flexShrink: 0, marginLeft: "var(--gc-space-4)" }}>{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
