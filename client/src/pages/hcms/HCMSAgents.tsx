import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
import { Link } from "wouter";

const MOCK = [
  { id: "1", name: "Sarah Mitchell", email: "sarah@example.com", status: "approved", state: "IL", createdAt: "2026-04-10" },
  { id: "2", name: "James Rodriguez", email: "james@example.com", status: "pending_review", state: "TX", createdAt: "2026-04-08" },
  { id: "3", name: "Michael Chen", email: "michael@example.com", status: "approved", state: "CA", createdAt: "2026-03-15" },
  { id: "4", name: "Emily Watson", email: "emily@example.com", status: "in_review", state: "FL", createdAt: "2026-04-05" },
  { id: "5", name: "David Park", email: "david@example.com", status: "approved", state: "NY", createdAt: "2026-02-20" },
  { id: "6", name: "Lisa Thompson", email: "lisa@example.com", status: "rejected", state: "AZ", createdAt: "2026-03-01" },
];

const tabs = ["All", "Pending", "Active", "Terminated"] as const;

export default function HCMSAgents() {
  const [tab, setTab] = useState<string>("All");
  const filtered = useMemo(() => {
    if (tab === "All") return MOCK;
    const m: Record<string, string[]> = { Pending: ["pending_review", "in_review"], Active: ["approved"], Terminated: ["rejected", "terminated"] };
    return MOCK.filter(a => m[tab]?.includes(a.status));
  }, [tab]);

  const columns: Column<typeof MOCK[0]>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "status", label: "Status", sortable: true, render: (v) => <GCStatusBadge status={v} /> },
    { key: "state", label: "State", sortable: true },
    { key: "createdAt", label: "Applied", sortable: true },
    { key: "id", label: "Actions", render: (_, row) => <Link href={`/hcms/agents/${row.id}`}><span style={{ color: "var(--gc-gold)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}>View</span></Link> },
  ];

  return (
    <div>
      <GCPageHeader title="Agent Directory" subtitle="All registered agents" accentUnderline
        actions={<button style={{ padding: "var(--gc-space-2) var(--gc-space-4)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500, border: "none", cursor: "pointer" }}>Add Agent</button>} />
      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer", transition: "color var(--gc-transition-fast)" }}>{t}</button>
        ))}
      </div>
      <GCDataTable columns={columns} data={filtered} searchable searchPlaceholder="Search agents..." />
    </div>
  );
}
