import { useState, useMemo } from "react";
import { GCPageHeader, GCDataTable, GCStatusBadge, type Column } from "@/components/gc";
const INDIVIDUALS = [
  { agent: "Sarah Mitchell", legalName: "Sarah Ann Mitchell", ssn: "***-**-4523", dob: "1989-06-15", address: "1240 Michigan Ave, Chicago, IL 60601", entityType: "Individual" },
  { agent: "James Rodriguez", legalName: "James Manuel Rodriguez", ssn: "***-**-8891", dob: "1985-03-22", address: "4502 Oak Lawn Ave, Dallas, TX 75219", entityType: "Individual" },
  { agent: "Emily Watson", legalName: "Emily Rose Watson", ssn: "***-**-3310", dob: "1992-11-08", address: "2200 Biscayne Blvd, Miami, FL 33137", entityType: "Individual" },
];
const ENTITIES = [
  { agent: "Michael Chen", entityName: "Chen Financial Services LLC", ein: "**-***4412", stateOfInc: "CA", businessAddress: "450 Sutter St, San Francisco, CA 94108", registeredAgent: "Michael Chen", articlesOnFile: true },
  { agent: "David Park", entityName: "Park Insurance Group Inc", ein: "**-***7789", stateOfInc: "NY", businessAddress: "125 Park Ave, New York, NY 10017", registeredAgent: "David Park", articlesOnFile: true },
];
const LOA_AGENTS = [
  { agent: "Lisa Thompson", states: "AZ", status: "active", renewalDate: "2026-09-01", notes: "License maintenance only — not actively selling" },
];
const tabs = ["Individual", "Business Entity", "LOA"] as const;
const indCols: Column<typeof INDIVIDUALS[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "legalName", label: "Legal Name" },
  { key: "ssn", label: "SSN", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "dob", label: "DOB" },
  { key: "address", label: "Residential Address" },
];
const entCols: Column<typeof ENTITIES[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "entityName", label: "Entity Name", sortable: true },
  { key: "ein", label: "EIN", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-sm)" }}>{v}</span> },
  { key: "stateOfInc", label: "State of Inc." },
  { key: "businessAddress", label: "Business Address" },
  { key: "articlesOnFile", label: "Articles", render: (v) => v ? <GCStatusBadge status="active" /> : <GCStatusBadge status="warning" /> },
];
const loaCols: Column<typeof LOA_AGENTS[0]>[] = [
  { key: "agent", label: "Agent", sortable: true, render: (v) => <span style={{ fontWeight: 500 }}>{v}</span> },
  { key: "states", label: "Licensed States" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "renewalDate", label: "Next Renewal" },
  { key: "notes", label: "Notes" },
];
export default function ContractingDBA() {
  const [tab, setTab] = useState<typeof tabs[number]>("Individual");
  return (
    <div>
      <GCPageHeader title="Doing Business As" subtitle="Individual, business entity & LOA (Licenses Only Agent) profiles" accentUnderline />
      <div className="flex gap-1 mb-4">{tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}</div>
      {tab === "Individual" && <GCDataTable columns={indCols} data={INDIVIDUALS} searchable />}
      {tab === "Business Entity" && <GCDataTable columns={entCols} data={ENTITIES} searchable />}
      {tab === "LOA" && <GCDataTable columns={loaCols} data={LOA_AGENTS} searchable />}
    </div>
  );
}
