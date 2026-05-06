import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { GCPageHeader, GCDataTable, GCStatusBadge, GCPeriodSelector, type Column } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";

interface DealTransaction {
  id: string;
  date: string;
  type: string;
  desc: string;
  amount: number;
  reference: string;
}

interface TransactionSummary {
  incoming: number;
  leadRevenue: number;
  net: number;
  dealCount: number;
  leadPurchases: number;
  pending: number;
  confirmed: number;
  rejected: number;
}

const tabs = ["All", "Submitted", "Verified", "Rejected", "Lead Purchases"];
const statusMap: Record<string, string> = {
  submitted: "pending",
  verified: "active",
  issued: "active",
  rejected: "terminated",
  lead_purchase: "info",
};

const cols: Column<DealTransaction>[] = [
  { key: "date", label: "Date", sortable: true, render: (v: string) => {
    try { return new Date(v).toLocaleDateString(); } catch { return v; }
  }},
  { key: "type", label: "Status", render: (v: string) => <GCStatusBadge status={statusMap[v] || v} /> },
  { key: "desc", label: "Description" },
  { key: "reference", label: "Reference", render: (v: string) => <span style={{ fontFamily: "monospace", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{(v || "").substring(0, 8)}...</span> },
  { key: "amount", label: "Annual Premium", sortable: true, align: "right", render: (v: number) => {
    const amt = typeof v === "number" ? v : 0;
    return <span style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)" }}>${amt.toLocaleString()}</span>;
  }},
];

export default function FinanceTransactions() {
  const [tab, setTab] = useState("All");
  const [period, setPeriod] = useState("ytd");

  const typeParam = tab === "All" ? "" : tab === "Lead Purchases" ? "lead_purchase" : tab.toLowerCase();

  const { data: transactions = [], isLoading: txnLoading, error: txnError } = useQuery<DealTransaction[]>({
    queryKey: [`/api/finance/transactions?period=${period}&type=${typeParam}`],
  });

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery<TransactionSummary>({
    queryKey: [`/api/finance/transactions/summary?period=${period}`],
  });

  const isLoading = txnLoading || summaryLoading;
  const error = txnError || summaryError;

  const fmt = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`;
    if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`;
    return `$${v.toLocaleString()}`;
  };

  return (
    <div>
      <div data-tour-id={TOUR.FINANCE.TRANSACTIONS.HEADER}>
        <GCPageHeader title="Transactions" subtitle="Deal submission ledger" accentUnderline
          actions={<div data-tour-id={TOUR.FINANCE.TRANSACTIONS.PERIOD}><GCPeriodSelector value={period} onChange={setPeriod} /></div>}
        />
      </div>

      {error ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-lg)", color: "var(--gc-status-terminated)", marginBottom: "var(--gc-space-2)" }}>Failed to load transactions</div>
          <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{(error as Error).message}</div>
        </div>
      ) : isLoading ? (
        <div style={{ padding: "var(--gc-space-8)", textAlign: "center", color: "var(--gc-text-muted)", fontFamily: "var(--gc-font-body)" }}>Loading transactions...</div>
      ) : (
        <>
          <div data-tour-id={TOUR.FINANCE.TRANSACTIONS.SUMMARY} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total AP", value: fmt(summary?.incoming || 0), color: "var(--gc-text-primary)" },
              { label: "Lead Revenue", value: fmt(summary?.leadRevenue || 0), color: "var(--gc-gold)" },
              { label: "Deals", value: String(summary?.dealCount || 0), color: "var(--gc-text-primary)" },
              { label: "Lead Purchases", value: String(summary?.leadPurchases || 0), color: "var(--gc-gold)" },
            ].map(s => (
              <div key={s.label} style={{
                backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-3)",
              }}>
                <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase" as const, letterSpacing: "var(--gc-tracking-wider)", marginBottom: "var(--gc-space-1)" }}>{s.label}</div>
                <div style={{ fontFamily: "var(--gc-font-display)", fontSize: "var(--gc-text-xl)", fontWeight: 600, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div data-tour-id={TOUR.FINANCE.TRANSACTIONS.TABS} className="flex gap-1 mb-4">
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "var(--gc-space-2) var(--gc-space-4)", fontFamily: "var(--gc-font-body)",
                fontSize: "var(--gc-text-base)", fontWeight: tab === t ? 500 : 400,
                color: tab === t ? "var(--gc-nav-active-text)" : "var(--gc-text-secondary)",
                backgroundColor: "transparent", border: "none",
                borderBottom: tab === t ? "2px solid var(--gc-gold)" : "2px solid transparent",
                cursor: "pointer",
              }}>{t}</button>
            ))}
          </div>

          <div data-tour-id={TOUR.FINANCE.TRANSACTIONS.TABLE}>
            <GCDataTable columns={cols} data={transactions} searchable searchPlaceholder="Search by agent, carrier, or product..." />
          </div>
        </>
      )}
    </div>
  );
}
