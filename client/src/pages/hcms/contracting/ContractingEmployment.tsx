import { GCPageHeader, GCDataTable, type Column } from "@/components/gc";
const MOCK = [
  { agent: "Sarah Mitchell", employer: "Northwestern Mutual", position: "Financial Advisor", startDate: "2020-03-01", endDate: "2025-12-31", reason: "Seeking independent opportunity", current: false },
  { agent: "Sarah Mitchell", employer: "Heritage Life Solutions", position: "Sales Agent", startDate: "2026-01-01", endDate: "", reason: "", current: true },
  { agent: "James Rodriguez", employer: "New York Life", position: "Agent", startDate: "2018-06-01", endDate: "2023-08-15", reason: "Relocated to Texas", current: false },
  { agent: "James Rodriguez", employer: "Primerica", position: "Senior Agent", startDate: "2023-09-01", endDate: "2025-11-30", reason: "Transition to independent", current: false },
  { agent: "James Rodriguez", employer: "Heritage Life Solutions", position: "Sales Agent", startDate: "2026-01-15", endDate: "", reason: "", current: true },
  { agent: "Michael Chen", employer: "State Farm", position: "Licensed Agent", startDate: "2019-01-15", endDate: "2024-12-31", reason: "Career advancement", current: false },
  { agent: "Michael Chen", employer: "Heritage Life Solutions", position: "Senior Agent", startDate: "2025-01-15", endDate: "", reason: "", current: true },
  { agent: "Emily Watson", employer: "Allstate", position: "Claims Adjuster", startDate: "2021-05-01", endDate: "2025-07-31", reason: "Transition to sales", current: false },
  { agent: "Emily Watson", employer: "Heritage Life Solutions", position: "Agent", startDate: "2025-08-15", endDate: "", reason: "", current: true },
  { agent: "David Park", employer: "MetLife", position: "Financial Planner", startDate: "2017-09-01", endDate: "2024-06-30", reason: "Independent practice", current: false },
  { agent: "David Park", employer: "Heritage Life Solutions", position: "Team Lead", startDate: "2024-07-15", endDate: "", reason: "", current: true },
];
const cols: Column<typeof MOCK[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "employer", label: "Employer / Agency", sortable: true },
  { key: "position", label: "Position" },
  { key: "startDate", label: "Start Date", sortable: true },
  { key: "endDate", label: "End Date", render: (v) => v || <span style={{ color: "var(--gc-status-active)", fontWeight: 500 }}>Current</span> },
  { key: "reason", label: "Reason for Leaving", render: (v) => v || "—" },
  { key: "current", label: "Current", render: (v) => v ? <span style={{ color: "var(--gc-status-active)" }}>Yes</span> : <span style={{ color: "var(--gc-text-muted)" }}>No</span> },
];
export default function ContractingEmployment() {
  return (
    <div>
      <GCPageHeader title="Employment History" subtitle="Previous agencies & employment records for licensing" accentUnderline />
      <GCDataTable columns={cols} data={MOCK} searchable searchPlaceholder="Search employment history..." />
    </div>
  );
}
