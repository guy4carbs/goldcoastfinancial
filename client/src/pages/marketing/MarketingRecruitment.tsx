import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, GCPeriodSelector, type Column } from "@/components/gc";

const FUNNEL = [
  { stage: "Applied", count: 12 },
  { stage: "Screening", count: 10 },
  { stage: "Interview", count: 8 },
  { stage: "Offer", count: 6 },
  { stage: "Onboarded", count: 5 },
];

const APPLICANTS = [
  { applicant: "David Park", appliedDate: "2026-04-15", status: "active", source: "Referral", experience: "5 years", notes: "Licensed in FL, CA" },
  { applicant: "Jennifer Lopez", appliedDate: "2026-04-12", status: "pending", source: "Web Form", experience: "3 years", notes: "Specializes in life" },
  { applicant: "Marcus Thompson", appliedDate: "2026-04-10", status: "active", source: "LinkedIn", experience: "8 years", notes: "Former agency owner" },
  { applicant: "Aisha Patel", appliedDate: "2026-04-08", status: "review", source: "Referral", experience: "2 years", notes: "P&C background" },
  { applicant: "Carlos Rivera", appliedDate: "2026-04-05", status: "pending", source: "Web Form", experience: "4 years", notes: "Bilingual EN/ES" },
  { applicant: "Emily Zhang", appliedDate: "2026-04-03", status: "terminated", source: "Job Board", experience: "1 year", notes: "Withdrew application" },
  { applicant: "Ryan O'Brien", appliedDate: "2026-03-28", status: "active", source: "Referral", experience: "6 years", notes: "Medicare specialist" },
  { applicant: "Natasha Williams", appliedDate: "2026-03-25", status: "review", source: "LinkedIn", experience: "3 years", notes: "Series 6 & 63 licensed" },
];

const cols: Column<typeof APPLICANTS[0]>[] = [
  { key: "applicant", label: "Applicant", sortable: true },
  { key: "appliedDate", label: "Applied Date", sortable: true },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={v} /> },
  { key: "source", label: "Source" },
  { key: "experience", label: "Experience" },
  { key: "notes", label: "Notes" },
];

export default function MarketingRecruitment() {
  const [period, setPeriod] = useState("this-month");
  const maxCount = Math.max(...FUNNEL.map(f => f.count));
  return (
    <div>
      <GCPageHeader title="Recruitment" subtitle="Agent recruitment pipeline & conversion" accentUnderline
        actions={
          <GCPeriodSelector value={period} onChange={setPeriod} />
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Applications (Month)" value={12} accentTop />
        <GCKPICard label="Interviews Scheduled" value={8} accentTop />
        <GCKPICard label="Offers Extended" value={6} accentTop />
        <GCKPICard label="New Agents (Month)" value={5} accentTop />
      </div>
      <div style={{ marginBottom: "var(--gc-space-6)" }}>
        <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Recruitment Funnel</div>
        <div className="flex flex-col gap-2">
          {FUNNEL.map((f, i) => (
            <div key={f.stage} className="flex items-center gap-4">
              <span style={{ width: 100, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)", textAlign: "right" }}>{f.stage}</span>
              <div style={{ flex: 1, height: 32, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-md)", position: "relative" }}>
                <div style={{ height: "100%", width: `${(f.count / maxCount) * 100}%`, background: `linear-gradient(90deg, var(--gc-gold), var(--gc-gold-bright))`, borderRadius: "var(--gc-radius-md)", transition: "width var(--gc-transition-normal)", display: "flex", alignItems: "center", paddingLeft: "var(--gc-space-3)" }}>
                  <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-md)", fontWeight: 600, color: "var(--gc-btn-primary-text)" }}>{f.count}</span>
                </div>
              </div>
              {i > 0 && <span style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", width: 50 }}>{Math.round((f.count / FUNNEL[i-1].count) * 100)}%</span>}
            </div>
          ))}
        </div>
      </div>
      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Applicant Tracker</div>
      <GCDataTable columns={cols} data={APPLICANTS} searchable />
    </div>
  );
}
