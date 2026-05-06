import { useState } from "react";
import { Link } from "wouter";
import { GCPageHeader, GCKPICard, GCAreaChart, GCDataTable, GCStatusBadge, GCPeriodSelector, INVESTOR_PERIODS, type Column } from "@/components/gc";

const AGENTS = [
  { agent: "Samantha Brooks", role: "Team Lead", startDate: "2021-01-10", aip: 82100, policies: 29, status: "active" },
  { agent: "Thomas Wright", role: "Senior Agent", startDate: "2021-08-20", aip: 72400, policies: 26, status: "active" },
  { agent: "Marcus Rivera", role: "Senior Agent", startDate: "2022-03-15", aip: 68200, policies: 24, status: "active" },
  { agent: "Angela Martinez", role: "Senior Agent", startDate: "2022-08-14", aip: 59400, policies: 21, status: "active" },
  { agent: "Jennifer Okafor", role: "Senior Agent", startDate: "2021-11-02", aip: 54800, policies: 19, status: "active" },
  { agent: "David Chen", role: "Agent", startDate: "2023-06-20", aip: 47300, policies: 17, status: "active" },
  { agent: "Kevin O'Brien", role: "Agent", startDate: "2023-09-05", aip: 41800, policies: 15, status: "probation" },
  { agent: "Rachel Kim", role: "Agent", startDate: "2023-06-15", aip: 38200, policies: 14, status: "active" },
  { agent: "Lisa Thompson", role: "Agent", startDate: "2023-12-11", aip: 36200, policies: 13, status: "active" },
  { agent: "Derek Washington", role: "Agent", startDate: "2024-07-22", aip: 31500, policies: 11, status: "active" },
  { agent: "Robert Williams", role: "Agent", startDate: "2024-01-08", aip: 31500, policies: 11, status: "active" },
  { agent: "Carlos Mendez", role: "Agent", startDate: "2024-01-10", aip: 28900, policies: 10, status: "active" },
  { agent: "James Patterson", role: "Agent", startDate: "2024-09-03", aip: 18700, policies: 7, status: "pending" },
  { agent: "Amanda Foster", role: "Trainee", startDate: "2025-11-01", aip: 12100, policies: 4, status: "pending" },
  { agent: "Priya Patel", role: "Trainee", startDate: "2026-01-15", aip: 8200, policies: 3, status: "pending" },
];

const AIP_BY_QUARTER = [
  { label: "Q1 2025", value: 245000 },
  { label: "Q2 2025", value: 298000 },
  { label: "Q3 2025", value: 342000 },
  { label: "Q4 2025", value: 358500 },
];

const columns: Column<typeof AGENTS[number]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v: string) => <Link href="/hcms/agents" style={{ color: "var(--gc-gold)", textDecoration: "none" }} onMouseEnter={(e: any) => e.currentTarget.style.textDecoration = "underline"} onMouseLeave={(e: any) => e.currentTarget.style.textDecoration = "none"}>{v}</Link> },
  { key: "role", label: "Role" },
  { key: "startDate", label: "Start Date" },
  { key: "aip", label: "AIP", sortable: true, render: (v: number) => `$${v.toLocaleString()}` },
  { key: "policies", label: "Policies", sortable: true },
  { key: "status", label: "Status", render: (v: string) => <GCStatusBadge status={v} /> },
];

export default function InvestorsPortfolio() {
  const [period, setPeriod] = useState("ytd");
  return (
    <div>
      <GCPageHeader title="Portfolio" subtitle="Agent roster & AIP tracking" accentUnderline
        actions={
          <GCPeriodSelector value={period} onChange={setPeriod} options={INVESTOR_PERIODS} />
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Total Agents" value={34} accentTop />
        <GCKPICard label="Total AIP" value="$1.24M" accentTop />
        <GCKPICard label="Avg AIP per Agent" value="$36.5K" accentTop />
      </div>
      <div className="mb-6">
        <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-3)" }}>Agent Roster</div>
        <GCDataTable columns={columns} data={AGENTS} searchable searchPlaceholder="Search agents..." />
      </div>
      <GCAreaChart data={AIP_BY_QUARTER} title="AIP by Quarter" valueFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
    </div>
  );
}
