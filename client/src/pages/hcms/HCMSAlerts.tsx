import { GCPageHeader, GCKPICard } from "@/components/gc";
const ALERTS = [
  { id: "1", title: "TX License expires in 12 days", agent: "James Rodriguez", severity: "critical", status: "open" },
  { id: "2", title: "E&O Certificate expires in 8 days", agent: "David Park", severity: "critical", status: "open" },
  { id: "3", title: "Active in FL without license", agent: "Emily Watson", severity: "warning", status: "open" },
  { id: "4", title: "Contracting incomplete for 18 days", agent: "New Agent A", severity: "warning", status: "acknowledged" },
  { id: "5", title: "IL License expires in 75 days", agent: "Sarah Mitchell", severity: "info", status: "open" },
];
const sevColor: Record<string, string> = { critical: "var(--gc-status-terminated)", warning: "var(--gc-status-warning)", info: "var(--gc-status-review)" };
export default function HCMSAlerts() {
  return (
    <div>
      <GCPageHeader title="Alerts" subtitle="Compliance alerts & notifications" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Critical" value={2} accentTop delta={{ value: "Urgent", positive: false }} />
        <GCKPICard label="Warning" value={2} accentTop />
        <GCKPICard label="Info" value={1} accentTop />
      </div>
      <div className="flex flex-col gap-2">
        {ALERTS.map(a => (
          <div key={a.id} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderLeft: `3px solid ${sevColor[a.severity]}`, borderRadius: "0px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, color: "var(--gc-text-primary)" }}>{a.title}</div>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 2 }}>{a.agent}</div>
            </div>
            <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)", color: sevColor[a.severity], backgroundColor: `color-mix(in srgb, ${sevColor[a.severity]} 15%, transparent)` }}>{a.severity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
