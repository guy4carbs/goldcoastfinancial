import { useState } from "react";
import { Link } from "wouter";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, GCPeriodSelector, type Column } from "@/components/gc";

const stageMap: Record<string, string> = {
  new: "review",
  contacted: "pending",
  qualified: "active",
  quoted: "review",
  application: "pending",
  placed: "active",
  lost: "terminated",
};

const LEADS = [
  { name: "Robert Johnson", source: "Web Form", stage: "qualified", value: 3200, agent: "Sarah Mitchell", date: "2026-04-18" },
  { name: "Maria Garcia", source: "Referral", stage: "quoted", value: 4800, agent: "Michael Chen", date: "2026-04-17" },
  { name: "James Williams", source: "Phone", stage: "contacted", value: 2100, agent: "James Rodriguez", date: "2026-04-16" },
  { name: "Patricia Brown", source: "Social Media", stage: "new", value: 1800, agent: "Lisa Nguyen", date: "2026-04-15" },
  { name: "Michael Davis", source: "Web Form", stage: "application", value: 5200, agent: "Sarah Mitchell", date: "2026-04-14" },
  { name: "Jennifer Martinez", source: "Referral", stage: "placed", value: 6100, agent: "Michael Chen", date: "2026-04-12" },
  { name: "David Wilson", source: "Paid Ads", stage: "lost", value: 2800, agent: "James Rodriguez", date: "2026-04-10" },
  { name: "Linda Anderson", source: "Phone", stage: "qualified", value: 3500, agent: "Lisa Nguyen", date: "2026-04-09" },
  { name: "Richard Taylor", source: "Web Form", stage: "contacted", value: 4100, agent: "Sarah Mitchell", date: "2026-04-08" },
  { name: "Susan Thomas", source: "Referral", stage: "placed", value: 7200, agent: "Michael Chen", date: "2026-04-05" },
];

const leadCols: Column<typeof LEADS[0]>[] = [
  { key: "name", label: "Lead Name", sortable: true, render: (v: string, row) => (
    <span style={{ color: "var(--gc-gold)", cursor: "pointer" }}
      onClick={() => alert(`${v}\nSource: ${row.source}\nStage: ${row.stage}\nValue: $${row.value.toLocaleString()}\nAgent: ${row.agent}`)}>
      {v}
    </span>
  )},
  { key: "source", label: "Source" },
  { key: "stage", label: "Stage", render: (v) => <GCStatusBadge status={stageMap[v] || v} /> },
  { key: "value", label: "Value", sortable: true, render: (v) => `$${v.toLocaleString()}` },
  { key: "agent", label: "Agent Assigned" },
  { key: "date", label: "Date", sortable: true },
];

export default function MarketingLeads() {
  const [period, setPeriod] = useState("this-month");
  return (
    <div>
      <GCPageHeader title="Leads" subtitle="Lead pipeline & source attribution" accentUnderline
        actions={
          <GCPeriodSelector value={period} onChange={setPeriod} />
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Total Leads" value={78} accentTop />
        <GCKPICard label="Qualified" value={45} accentTop />
        <GCKPICard label="Won" value={18} accentTop />
        <GCKPICard label="Lost" value={8} accentTop />
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Lead Pipeline</div>
      <GCDataTable columns={leadCols} data={LEADS} searchable />
      <div style={{ marginTop: "var(--gc-space-6)" }}>
        <Link href="/marketing" style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-gold)", textDecoration: "none" }}
          onMouseEnter={(e: any) => e.currentTarget.style.textDecoration = "underline"}
          onMouseLeave={(e: any) => e.currentTarget.style.textDecoration = "none"}>
          View source attribution on the Dashboard →
        </Link>
      </div>
    </div>
  );
}
