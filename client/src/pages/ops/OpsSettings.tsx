import { useState } from "react";
import { GCPageHeader, GCDataTable, type Column } from "@/components/gc";
const USERS = [
  { id: "1", name: "Gaetano", email: "gaetano@goldcoastfnl.com", role: "owner", isActive: true, lastLogin: "2026-04-14 09:15" },
  { id: "2", name: "Jack Cook", email: "jack@goldcoastfnl.com", role: "system_admin", isActive: true, lastLogin: "2026-04-14 08:30" },
  { id: "3", name: "Nicholas Gallagher", email: "nick@goldcoastfnl.com", role: "manager", isActive: true, lastLogin: "2026-04-13 16:45" },
  { id: "4", name: "Sarah Mitchell", email: "sarah@example.com", role: "sales_agent", isActive: true, lastLogin: "2026-04-14 07:20" },
  { id: "5", name: "Demo User", email: "demo@goldcoastfnl.com", role: "client", isActive: true, lastLogin: "2026-04-12 14:00" },
];
const INTEGRATIONS = [
  { name: "Carrier APIs", status: "configured", desc: "REST polling for production data" },
  { name: "Email Service", status: "connected", desc: "Gmail API for notifications" },
  { name: "Document Storage", status: "connected", desc: "Firebase Storage for documents" },
  { name: "Telnyx", status: "configured", desc: "SMS and voice communication" },
  { name: "Google Calendar", status: "disconnected", desc: "Calendar sync for appointments" },
  { name: "Google Sheets", status: "connected", desc: "Lead export and data sync" },
];
const statusColor: Record<string, string> = { connected: "var(--gc-status-active)", configured: "var(--gc-gold)", disconnected: "var(--gc-status-terminated)" };
const userCols: Column<typeof USERS[0]>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "role", label: "Role", render: (v) => <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "var(--gc-text-sm)", fontFamily: "var(--gc-font-body)", color: "var(--gc-gold)", backgroundColor: `color-mix(in srgb, var(--gc-gold) 15%, transparent)` }}>{v}</span> },
  { key: "isActive", label: "Status", render: (v) => <span style={{ color: v ? "var(--gc-status-active)" : "var(--gc-status-terminated)", fontSize: "var(--gc-text-sm)" }}>{v ? "Active" : "Inactive"}</span> },
  { key: "lastLogin", label: "Last Login", sortable: true },
];
export default function OpsSettings() {
  const [tab, setTab] = useState<"users"|"integrations"|"system">("users");
  return (
    <div>
      <GCPageHeader title="Settings" subtitle="Platform administration & user management" accentUnderline />
      <div className="flex gap-1 mb-6">{(["users","integrations","system"] as const).map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", textTransform: "capitalize" as const }}>{t}</button>)}</div>
      {tab === "users" && <GCDataTable columns={userCols} data={USERS} searchable searchPlaceholder="Search users..." />}
      {tab === "integrations" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {INTEGRATIONS.map(i => (
            <div key={i.name} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "0px" }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)" }}>{i.name}</span>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: statusColor[i.status] }} />
              </div>
              <p style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-3)" }}>{i.desc}</p>
              <span style={{ fontSize: "var(--gc-text-sm)", color: statusColor[i.status], textTransform: "capitalize" as const }}>{i.status}</span>
            </div>
          ))}
        </div>
      )}
      {tab === "system" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[["Database", "Connected", "var(--gc-status-active)"], ["Users", "5 total", "var(--gc-text-primary)"], ["Agents", "4 active", "var(--gc-text-primary)"]].map(([label, val, color]) => (
            <div key={label as string} style={{ padding: "var(--gc-space-4)", backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "0px" }}>
              <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-2)" }}>{label}</div>
              <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: color as string }}>{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
