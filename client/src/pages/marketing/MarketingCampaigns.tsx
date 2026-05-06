import { useState } from "react";
import { GCPageHeader, GCKPICard, GCDataTable, GCStatusBadge, GCPeriodSelector, type Column } from "@/components/gc";

const INITIAL_CAMPAIGNS = [
  { campaign: "Google Ads Q2", channel: "Paid Ads", status: "active", budget: 5000, spend: 3200, leads: 12, roi: 180 },
  { campaign: "Facebook Agent Recruitment", channel: "Social Media", status: "active", budget: 3000, spend: 2100, leads: 8, roi: 140 },
  { campaign: "Referral Bonus Program", channel: "Referral", status: "active", budget: 2000, spend: 1500, leads: 18, roi: 450 },
  { campaign: "SEO Content Strategy", channel: "Organic", status: "active", budget: 1500, spend: 800, leads: 15, roi: 320 },
  { campaign: "LinkedIn Outreach", channel: "Social Media", status: "paused", budget: 2500, spend: 1800, leads: 5, roi: 95 },
  { campaign: "Q1 Direct Mail", channel: "Direct Mail", status: "completed", budget: 3000, spend: 2400, leads: 6, roi: 110 },
  { campaign: "Agent Webinar Series", channel: "Events", status: "draft", budget: 1000, spend: 0, leads: 0, roi: 0 },
  { campaign: "Email Nurture Campaign", channel: "Email", status: "active", budget: 500, spend: 300, leads: 14, roi: 280 },
];

const statusMap: Record<string, string> = { active: "active", paused: "pending", completed: "expired", draft: "suspended" };
const roiColor = (r: number) => r >= 200 ? "var(--gc-status-active)" : r >= 100 ? "var(--gc-gold)" : "var(--gc-status-terminated)";

const cols: Column<typeof INITIAL_CAMPAIGNS[0]>[] = [
  { key: "campaign", label: "Campaign", sortable: true },
  { key: "channel", label: "Channel" },
  { key: "status", label: "Status", render: (v) => <GCStatusBadge status={statusMap[v] || v} /> },
  { key: "budget", label: "Budget", render: (v) => `$${v.toLocaleString()}` },
  { key: "spend", label: "Spend", render: (v) => `$${v.toLocaleString()}` },
  { key: "leads", label: "Leads", sortable: true },
  { key: "roi", label: "ROI", render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontWeight: 600, color: roiColor(v) }}>{v}%</span> },
];

const inputStyle = {
  width: "100%", padding: "var(--gc-space-2) var(--gc-space-3)",
  backgroundColor: "var(--gc-surface-2)", color: "var(--gc-text-primary)",
  border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)",
  fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", outline: "none",
};

const labelStyle = {
  display: "block" as const, fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)",
  color: "var(--gc-text-secondary)", marginBottom: "var(--gc-space-1)",
};

export default function MarketingCampaigns() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: "", channel: "Paid Ads", budget: "", startDate: "" });
  const [period, setPeriod] = useState("this-month");

  const handleCreate = () => {
    if (!formData.name) return;
    setCampaigns(prev => [
      { campaign: formData.name, channel: formData.channel, status: "draft", budget: Number(formData.budget) || 0, spend: 0, leads: 0, roi: 0 },
      ...prev,
    ]);
    setFormData({ name: "", channel: "Paid Ads", budget: "", startDate: "" });
    setShowForm(false);
  };

  return (
    <div>
      <GCPageHeader title="Campaigns" subtitle="Campaign management & performance tracking"
        actions={
          <>
            <GCPeriodSelector value={period} onChange={setPeriod} />
            <button onClick={() => setShowForm(true)}
              style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", fontWeight: 500, padding: "8px 16px", borderRadius: "var(--gc-radius-md)", border: "none", cursor: "pointer", background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))", color: "var(--gc-btn-primary-text)" }}>
              New Campaign
            </button>
          </>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <GCKPICard label="Active Campaigns" value={campaigns.filter(c => c.status === "active").length} accentTop />
        <GCKPICard label="Total Budget" value={`$${(campaigns.reduce((s, c) => s + c.budget, 0) / 1000).toFixed(1)}K`} accentTop />
        <GCKPICard label="Total Spend" value={`$${(campaigns.reduce((s, c) => s + c.spend, 0) / 1000).toFixed(1)}K`} accentTop />
        <GCKPICard label="Avg ROI" value={`${Math.round(campaigns.filter(c => c.roi > 0).reduce((s, c) => s + c.roi, 0) / (campaigns.filter(c => c.roi > 0).length || 1))}%`} accentTop />
      </div>

      {showForm && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-gold)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)", marginBottom: "var(--gc-space-6)" }}>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>New Campaign</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label style={labelStyle}>Campaign Name</label>
              <input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="e.g., Spring Agent Drive" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Channel</label>
              <select value={formData.channel} onChange={e => setFormData(prev => ({ ...prev, channel: e.target.value }))} style={inputStyle}>
                <option>Paid Ads</option><option>Social Media</option><option>Referral</option>
                <option>Organic</option><option>Email</option><option>Events</option><option>Direct Mail</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Budget ($)</label>
              <input type="number" value={formData.budget} onChange={e => setFormData(prev => ({ ...prev, budget: e.target.value }))} placeholder="5000" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreate} style={{ padding: "var(--gc-space-2) var(--gc-space-6)", backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)", borderRadius: "var(--gc-radius-sm)", border: "none", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: 500 }}>Create Campaign</button>
            <button onClick={() => setShowForm(false)} style={{ padding: "var(--gc-space-2) var(--gc-space-6)", backgroundColor: "transparent", color: "var(--gc-text-secondary)", borderRadius: "var(--gc-radius-sm)", border: "1px solid var(--gc-border)", cursor: "pointer", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>All Campaigns</div>
      <GCDataTable columns={cols} data={campaigns} searchable />
    </div>
  );
}
