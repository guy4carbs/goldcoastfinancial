import { useState, useMemo } from "react";
import { GCPageHeader, GCKPICard, GCAreaChart, GCBarChart, GCDataTable, type Column } from "@/components/gc";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

const TRENDS = [
  { label: "May", value: 62000 }, { label: "Jun", value: 71000 }, { label: "Jul", value: 68000 },
  { label: "Aug", value: 82000 }, { label: "Sep", value: 76000 }, { label: "Oct", value: 85000 },
  { label: "Nov", value: 91000 }, { label: "Dec", value: 78000 }, { label: "Jan", value: 96000 },
  { label: "Feb", value: 88000 }, { label: "Mar", value: 102000 }, { label: "Apr", value: 89000 },
];

const BY_SOURCE = [
  { name: "Carrier Commissions", value: 524000 },
  { name: "Override Payouts", value: 178000 },
  { name: "Bonuses & Incentives", value: 42000 },
  { name: "Renewal Commissions", value: 38000 },
];

const TXN = [
  { id: "1", date: "2026-04-14", type: "incoming", desc: "Carrier commission — Mutual of Omaha (March)", amount: 18200, reference: "MOO-2026-03-445" },
  { id: "2", date: "2026-04-13", type: "incoming", desc: "Carrier commission — Transamerica (March)", amount: 12400, reference: "TRA-2026-03-221" },
  { id: "3", date: "2026-04-13", type: "payout", desc: "Agent payout — Sarah Mitchell (March)", amount: -8200, reference: "PAY-SM-2026-03" },
  { id: "4", date: "2026-04-12", type: "payout", desc: "Agent payout — Michael Chen (March)", amount: -6800, reference: "PAY-MC-2026-03" },
  { id: "5", date: "2026-04-12", type: "incoming", desc: "Carrier commission — Americo (March)", amount: 9100, reference: "AMR-2026-03-118" },
  { id: "6", date: "2026-04-11", type: "payout", desc: "Agent payout — James Rodriguez (March)", amount: -5400, reference: "PAY-JR-2026-03" },
  { id: "7", date: "2026-04-11", type: "expense", desc: "Marketing — Google Ads (April)", amount: -2200, reference: "MKGT-GA-2026-04" },
  { id: "8", date: "2026-04-10", type: "incoming", desc: "Carrier commission — Corebridge (March)", amount: 7800, reference: "CBF-2026-03-092" },
  { id: "9", date: "2026-04-10", type: "payout", desc: "Override payout — Jack Cook (March)", amount: -3200, reference: "PAY-JC-2026-03-OVR" },
  { id: "10", date: "2026-04-09", type: "expense", desc: "Software — CRM subscription (April)", amount: -480, reference: "SW-CRM-2026-04" },
  { id: "11", date: "2026-04-09", type: "incoming", desc: "Renewal commission — Multiple carriers", amount: 4600, reference: "REN-2026-03-BATCH" },
  { id: "12", date: "2026-04-08", type: "expense", desc: "Office — Supplies & equipment", amount: -890, reference: "OFF-2026-04-001" },
];

const tabs = ["All", "Incoming", "Payouts", "Expenses"];
const typeColor: Record<string, string> = { incoming: "var(--gc-status-active)", payout: "var(--gc-status-pending)", expense: "var(--gc-status-terminated)" };

const cols: Column<typeof TXN[0]>[] = [
  { key: "date", label: "Date", sortable: true },
  { key: "type", label: "Type", render: (v) => <span style={{ padding: "2px 8px", borderRadius: "var(--gc-radius-sm)", fontSize: "var(--gc-text-sm)", color: typeColor[v], backgroundColor: `color-mix(in srgb, ${typeColor[v]} 15%, transparent)`, textTransform: "capitalize" as const }}>{v}</span> },
  { key: "desc", label: "Description" },
  { key: "reference", label: "Reference", render: (v) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{v}</span> },
  { key: "amount", label: "Amount", sortable: true, render: (v) => <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: v > 0 ? "var(--gc-status-active)" : "var(--gc-text-primary)" }}>{v > 0 ? "+" : ""}${Math.abs(v).toLocaleString()}</span> },
];

export default function OpsFinance() {
  const [tab, setTab] = useState("All");
  const filtered = useMemo(() => {
    if (tab === "All") return TXN;
    const m: Record<string, string> = { Incoming: "incoming", Payouts: "payout", Expenses: "expense" };
    return TXN.filter(t => t.type === m[tab]);
  }, [tab]);

  const totals = useMemo(() => {
    const inc = TXN.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const payouts = TXN.filter(t => t.type === "payout").reduce((s, t) => s + Math.abs(t.amount), 0);
    const expenses = TXN.filter(t => t.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
    return { revenue: inc, payouts, expenses, net: inc - payouts - expenses, pending: 14200, overridePool: 28400 };
  }, []);

  return (
    <div>
      <GCPageHeader title="Finance" subtitle="Revenue tracking, payouts & financial operations" accentUnderline />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <GCKPICard label="Revenue (Month)" value={`$${(totals.revenue / 1000).toFixed(0)}K`} accentTop delta={{ value: "+15%", positive: true }} />
        <GCKPICard label="Commissions Paid" value={`$${(totals.payouts / 1000).toFixed(0)}K`} accentTop />
        <GCKPICard label="Net Revenue" value={`$${(totals.net / 1000).toFixed(0)}K`} accentTop delta={{ value: "+22%", positive: true }} />
        <GCKPICard label="Pending Payouts" value={`$${(totals.pending / 1000).toFixed(1)}K`} accentTop />
        <GCKPICard label="Override Pool" value={`$${(totals.overridePool / 1000).toFixed(1)}K`} accentTop />
        <GCKPICard label="Receivables" value="$8.2K" accentTop delta={{ value: "3 outstanding", positive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <GCAreaChart data={TRENDS} title="Monthly Revenue Trend" valueFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
        <GCBarChart data={BY_SOURCE} title="Revenue by Source" valueFormatter={v => `$${(v / 1000).toFixed(0)}K`} />
      </div>

      <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", color: "var(--gc-text-primary)", marginBottom: "var(--gc-space-4)" }}>Transactions</div>
      <div className="flex gap-1 mb-4">
        {tabs.map(t => <button key={t} onClick={() => setTab(t)} style={{ padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400, color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)", backgroundColor: "transparent", border: "none", borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent", cursor: "pointer" }}>{t}</button>)}
      </div>
      <GCDataTable columns={cols} data={filtered} searchable searchPlaceholder="Search transactions..." />
    </div>
  );
}
