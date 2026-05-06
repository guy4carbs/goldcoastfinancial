import { useState, useEffect } from "react";
import { GCPageHeader } from "@/components/gc";
import { Info, Star, CheckCircle, AlertTriangle, Clock, Loader2, RefreshCw } from "lucide-react";

interface License {
  id: string;
  stateCode: string;
  licenseNumber: string;
  licenseType: string;
  status: string;
  effectiveDate: string | null;
  expirationDate: string | null;
  isResident: boolean;
  lastSyncedAt: string | null;
  syncSource: string;
}

function fmtDate(d: string | null): string {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return "—";
    return `${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}/${date.getUTCFullYear()}`;
  } catch { return "—"; }
}

function getDaysLeft(expirationDate: string | null): number | null {
  if (!expirationDate) return null;
  try {
    const exp = new Date(expirationDate).getTime();
    if (isNaN(exp)) return null;
    return Math.floor((exp - Date.now()) / (1000 * 60 * 60 * 24));
  } catch { return null; }
}

function StatusBadge({ status, expirationDate }: { status: string; expirationDate: string | null }) {
  const daysLeft = getDaysLeft(expirationDate);
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isExpiring = daysLeft !== null && daysLeft > 0 && daysLeft <= 90;

  if (isExpired || status === "expired") {
    return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", fontWeight: 600 }}><AlertTriangle className="w-3 h-3" /> Expired</span>;
  }
  if (isExpiring) {
    return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-warning)", fontWeight: 600 }}><Clock className="w-3 h-3" /> {daysLeft}d</span>;
  }
  if (status === "active") {
    return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-active)", fontWeight: 600 }}><CheckCircle className="w-3 h-3" /> Active</span>;
  }
  if (status === "pending") {
    return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", fontWeight: 600 }}><Clock className="w-3 h-3" /> Pending</span>;
  }
  if (status === "suspended") {
    return <span className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-status-terminated)", fontWeight: 600 }}><AlertTriangle className="w-3 h-3" /> Suspended</span>;
  }
  return <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "capitalize" }}>{status}</span>;
}

function fmtLicenseType(type: string): string {
  const map: Record<string, string> = { life_health: "Life & Health", life: "Life Only", health: "Health Only", property_casualty: "P&C" };
  return map[type] || type;
}

export default function AgentLicenses() {
  const [data, setData] = useState<any>(null);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = () => {
    setLoading(true); setError("");
    Promise.all([
      fetch("/api/agent-portal/me", { credentials: "include" }).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch("/api/licenses/agent", { credentials: "include" }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([me, lics]) => {
      if (!me?.user) { setError("Failed to load profile. Please try refreshing."); }
      else { setData(me); }
      setLicenses(Array.isArray(lics) ? lics : []);
      setLoading(false);
    }).catch(() => { setError("Network error"); setLoading(false); });
  };

  useEffect(fetchData, []);

  // Error state
  if (error && !data) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <GCPageHeader title="My Licenses" subtitle="Your insurance license information" accentUnderline />
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load licenses</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error}</div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !data) return <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}><Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} /></div>;

  const profile = data.profile || {};
  const user = data.user || {};
  const residentLicense = licenses.find(l => l.isResident);
  const residentState = residentLicense?.stateCode || profile.state || null;

  // Most recent sync time across all licenses
  const lastSync = licenses.reduce((max, lic) => {
    const time = lic.lastSyncedAt ? new Date(lic.lastSyncedAt).getTime() : 0;
    return time > max ? time : max;
  }, 0);
  const lastSyncSource = licenses.find(l => l.lastSyncedAt && new Date(l.lastSyncedAt).getTime() === lastSync)?.syncSource;

  return (
    <div>
      <GCPageHeader title="My Licenses" subtitle="Your insurance license information" accentUnderline />

      <div className="flex items-center gap-2 mb-4" style={{ padding: "var(--gc-space-3)", backgroundColor: "color-mix(in srgb, var(--gc-gold) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-gold) 20%, transparent)", borderRadius: "var(--gc-radius-sm)" }}>
        <Info className="w-4 h-4" style={{ color: "var(--gc-gold)" }} />
        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
          {licenses.length > 0 ? "License data managed by Gold Coast Financial. Contact your administrator for updates." : "No licenses on file yet. Your license data will be added after your contracting is complete."}
        </span>
      </div>

      {/* KPI Summary */}
      <div data-tour-id="agent-licenses-summary" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>NPN</span>
            <div style={{ fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)", fontFamily: "monospace" }}>{profile.npn || "—"}</div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Licensed</span>
            <div style={{ fontSize: "var(--gc-text-lg)", fontWeight: 600, color: licenses.length > 0 ? "var(--gc-status-active)" : "var(--gc-text-muted)" }}>{licenses.length > 0 ? "Yes" : "Pending"}</div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Resident State</span>
            <div style={{ fontSize: "var(--gc-text-lg)", fontWeight: 600, color: residentState ? "var(--gc-gold)" : "var(--gc-text-muted)" }}>{residentState || "—"}</div>
          </div>
          <div>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Total States</span>
            <div style={{ fontSize: "var(--gc-text-lg)", fontWeight: 600, color: "var(--gc-text-primary)" }}>{licenses.length}</div>
          </div>
        </div>
      </div>

      {/* License Table / Cards */}
      {licenses.length > 0 ? (
        <>
          {/* Desktop table */}
          <div data-tour-id="agent-licenses-table" className="hidden sm:block" style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--gc-border)" }}>
                  {["State", "License #", "Type", "Status", "Effective", "Expires"].map(h => (
                    <th key={h} style={{ padding: "var(--gc-space-2) var(--gc-space-3)", textAlign: "left", fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {licenses.map(lic => (
                  <tr key={lic.id} style={{ borderBottom: "1px solid var(--gc-border-subtle)" }}>
                    <td style={{ padding: "var(--gc-space-2) var(--gc-space-3)" }}>
                      <div className="flex items-center gap-2">
                        {lic.isResident && <Star className="w-3 h-3" style={{ color: "var(--gc-gold)" }} />}
                        <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: lic.isResident ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>{lic.stateCode}</span>
                      </div>
                    </td>
                    <td style={{ padding: "var(--gc-space-2) var(--gc-space-3)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-primary)", fontFamily: "monospace", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lic.licenseNumber || "—"}</td>
                    <td style={{ padding: "var(--gc-space-2) var(--gc-space-3)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>{fmtLicenseType(lic.licenseType)}</td>
                    <td style={{ padding: "var(--gc-space-2) var(--gc-space-3)" }}><StatusBadge status={lic.status} expirationDate={lic.expirationDate} /></td>
                    <td style={{ padding: "var(--gc-space-2) var(--gc-space-3)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{fmtDate(lic.effectiveDate)}</td>
                    <td style={{ padding: "var(--gc-space-2) var(--gc-space-3)", fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>{fmtDate(lic.expirationDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-2">
            {licenses.map(lic => (
              <div key={lic.id} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", padding: "var(--gc-space-3)", borderLeft: `3px solid ${lic.isResident ? "var(--gc-gold)" : "var(--gc-border)"}` }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {lic.isResident && <Star className="w-3 h-3" style={{ color: "var(--gc-gold)" }} />}
                    <span style={{ fontSize: "var(--gc-text-sm)", fontWeight: 600, color: lic.isResident ? "var(--gc-gold)" : "var(--gc-text-primary)" }}>{lic.stateCode}</span>
                    <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{fmtLicenseType(lic.licenseType)}</span>
                  </div>
                  <StatusBadge status={lic.status} expirationDate={lic.expirationDate} />
                </div>
                <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
                  {lic.licenseNumber && <span style={{ fontFamily: "monospace" }}>{lic.licenseNumber}</span>}
                  {lic.effectiveDate && <span> · Eff: {fmtDate(lic.effectiveDate)}</span>}
                  {lic.expirationDate && <span> · Exp: {fmtDate(lic.expirationDate)}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)", textAlign: "center" }}>
          <Info className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--gc-text-muted)", opacity: 0.4 }} />
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>No license records on file. Your licenses will be added once your contracting is processed.</p>
        </div>
      )}

      {/* Sync Info + Refresh */}
      {licenses.length > 0 && (
        <div className="flex items-center justify-between mt-3">
          <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
            {lastSync > 0 ? `Last updated: ${fmtDate(new Date(lastSync).toISOString())} · Source: ${lastSyncSource === "application" ? "Application" : lastSyncSource === "surelc" ? "SureLC" : "Admin"}` : ""}
          </span>
          <button data-tour-id="agent-licenses-sync" onClick={fetchData} className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-gold)", background: "none", border: "none", cursor: "pointer" }}>
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      )}
    </div>
  );
}
