import { useState, useEffect } from "react";
import { GCPageHeader, GCKPICard } from "@/components/gc";
import { CheckCircle, Clock, FileSignature, Award, Building2, Shield, CreditCard, GraduationCap, Briefcase, HelpCircle, GitBranch, ShieldAlert, ScrollText, AlertTriangle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { TOUR } from "@/lib/tour/selectors";

interface AgentData { user: any; profile: any; checklist: any; }

export default function AgentDashboard() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/agent-portal/me", { credentials: "include" })
      .then(async r => {
        if (!r.ok) {
          // 2FA gate fired — force redirect mirroring queryClient.ts behavior
          // (see throwIfResNotOk + the global fetch interceptor). Without this
          // local handling the user sees "Failed to load dashboard" for the
          // split-second before the interceptor navigates away.
          if (r.status === 403) {
            const body = await r.json().catch(() => ({}));
            if (body?.code === "REQUIRES_2FA_ENROLLMENT") {
              window.location.assign("/auth/2fa/enroll");
              return null;
            }
            if (body?.code === "REQUIRES_2FA") {
              window.location.assign("/auth/2fa");
              return null;
            }
          }
          throw new Error(r.status === 401 ? "Please log in again" : "Failed to load dashboard");
        }
        return r.json();
      })
      .then(d => {
        if (d === null) return; // already redirecting to the 2FA flow
        if (d?.user) setData(d); else setError("Profile data unavailable");
        setLoading(false);
      })
      .catch(e => { setError(e.message || "Network error"); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ padding: "var(--gc-space-8)" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--gc-gold)" }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "var(--gc-space-8)" }}>
        <div className="flex items-center gap-3" style={{ padding: "var(--gc-space-4)", backgroundColor: "color-mix(in srgb, var(--gc-status-terminated) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--gc-status-terminated) 25%, transparent)", borderRadius: "var(--gc-radius-md)" }}>
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--gc-status-terminated)" }} />
          <div>
            <div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Unable to load dashboard</div>
            <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>{error || "Please try refreshing the page."}</div>
          </div>
        </div>
      </div>
    );
  }

  const { user } = data;
  // Defensive: fallback to empty objects if profile/checklist are null (brand new agent)
  const profile = data.profile || {};
  const checklist = data.checklist || { ndaStatus: "pending", debtRollupStatus: "pending", complianceStatus: "pending", allCompleted: false };

  const docsSigned = [checklist.ndaStatus, checklist.debtRollupStatus, checklist.complianceStatus].filter((s: string) => s === "signed").length;
  const isBusiness = profile.dbaType === "business_entity";
  const status = profile.approvalStatus || "pending_review";

  // Dynamic checklist based on individual vs business
  const progressItems = [
    { label: "NDA Signed", done: checklist.ndaStatus === "signed", href: "/hcms/my/documents" },
    { label: "Debt Roll-Up Signed", done: checklist.debtRollupStatus === "signed", href: "/hcms/my/documents" },
    { label: "Compliance Signed", done: checklist.complianceStatus === "signed", href: "/hcms/my/documents" },
    { label: "E&O Certificate", done: !!profile.eoCertificateKey, href: "/hcms/my/eo" },
    { label: "Government ID", done: !!profile.driversLicenseKey, href: "/hcms/my/trainings" },
    { label: "AML Certificate", done: !!profile.amlCertificateKey, href: "/hcms/my/trainings" },
    { label: "Direct Deposit Form", done: !!profile.directDepositFormKey, href: "/hcms/my/bank" },
    ...(isBusiness ? [{ label: "Articles of Incorporation", done: !!profile.articlesKey, href: "/hcms/my/dba" }] : []),
  ];

  const totalDocs = Math.max(progressItems.length, 1);
  const completeDocs = progressItems.filter(i => i.done).length;

  return (
    <div>
      <GCPageHeader title={`Welcome, ${user.firstName || "Agent"}`} subtitle="Your contracting status and application overview" accentUnderline />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div data-tour-id={TOUR.AGENT.DASHBOARD.KPI_APPLICATION_STATUS}>
          <GCKPICard
            label="Application Status"
            value={status === "approved" ? "Approved" : status === "in_review" ? "In Review" : "Pending"}
            delta={{ value: status === "approved" ? "Active" : status === "in_review" ? "Under Review" : "Awaiting Review", positive: status === "approved" }}
          />
        </div>
        <div data-tour-id={TOUR.AGENT.DASHBOARD.KPI_DOCS_SIGNED}>
          <GCKPICard
            label="Documents Signed"
            value={`${docsSigned}/3`}
            delta={{ value: docsSigned === 3 ? "Complete" : `${3 - docsSigned} remaining`, positive: docsSigned === 3 }}
          />
        </div>
        <div data-tour-id={TOUR.AGENT.DASHBOARD.KPI_OVERALL_PROGRESS}>
          <GCKPICard
            label="Overall Progress"
            value={`${completeDocs}/${totalDocs}`}
            delta={{ value: completeDocs === totalDocs ? "All complete" : `${totalDocs - completeDocs} remaining`, positive: completeDocs === totalDocs }}
          />
        </div>
        <div data-tour-id={TOUR.AGENT.DASHBOARD.KPI_MEMBER_SINCE}>
          <GCKPICard
            label="Member Since"
            value={user.joinedAt ? new Date(user.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
          />
        </div>
      </div>

      {/* Contracting Progress */}
      <div data-tour-id={TOUR.AGENT.DASHBOARD.CHECKLIST} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", marginBottom: "var(--gc-space-4)" }}>
        <div className="flex items-center justify-between mb-3">
          <span style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600 }}>Contracting Progress</span>
          <span style={{ fontSize: "var(--gc-text-xs)", color: completeDocs === totalDocs ? "var(--gc-status-active)" : "var(--gc-text-muted)", fontWeight: 600 }}>{completeDocs}/{totalDocs}</span>
        </div>
        <div style={{ height: 4, backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-full)", overflow: "hidden", marginBottom: "var(--gc-space-3)" }}>
          <div style={{ height: "100%", width: `${(completeDocs / totalDocs) * 100}%`, backgroundColor: completeDocs === totalDocs ? "var(--gc-status-active)" : "var(--gc-gold)", borderRadius: "var(--gc-radius-full)", transition: "width 0.3s" }} />
        </div>
        <div className="flex flex-col gap-1">
          {progressItems.map(item => (
            <Link key={item.label} href={item.href}>
              <div className="flex items-center gap-3 cursor-pointer" style={{ padding: "var(--gc-space-1) 0" }}>
                {item.done ? <CheckCircle className="w-4 h-4" style={{ color: "var(--gc-status-active)" }} /> : <Clock className="w-4 h-4" style={{ color: "var(--gc-status-pending)" }} />}
                <span style={{ fontSize: "var(--gc-text-sm)", color: item.done ? "var(--gc-text-primary)" : "var(--gc-text-muted)" }}>{item.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Action Items — only show what needs attention */}
      {(completeDocs < totalDocs || status !== "approved") && (
        <div data-tour-id={TOUR.AGENT.DASHBOARD.ACTION_ITEMS} style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
          <div style={{ fontSize: "var(--gc-text-xs)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--gc-gold)", fontWeight: 600, marginBottom: "var(--gc-space-3)" }}>Action Items</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!profile.eoCertificateKey && (
              <Link href="/hcms/my/eo"><div className="cursor-pointer flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-status-warning)" }}>
                <ShieldAlert className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
                <div><div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Upload E&O Certificate</div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Required for contracting</div></div>
              </div></Link>
            )}
            {!profile.amlCertificateKey && (
              <Link href="/hcms/my/trainings"><div className="cursor-pointer flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-status-warning)" }}>
                <GraduationCap className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
                <div><div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Upload AML Certificate</div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Anti-money laundering cert</div></div>
              </div></Link>
            )}
            {!profile.driversLicenseKey && (
              <Link href="/hcms/my/trainings"><div className="cursor-pointer flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-status-warning)" }}>
                <Shield className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
                <div><div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Upload Government ID</div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Photo ID required</div></div>
              </div></Link>
            )}
            {!profile.directDepositFormKey && (
              <Link href="/hcms/my/bank"><div className="cursor-pointer flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-status-warning)" }}>
                <CreditCard className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
                <div><div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Upload Direct Deposit Form</div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>For commission payments</div></div>
              </div></Link>
            )}
            {isBusiness && !profile.articlesKey && (
              <Link href="/hcms/my/dba"><div className="cursor-pointer flex items-center gap-3" style={{ padding: "var(--gc-space-3)", backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)", borderLeft: "3px solid var(--gc-status-warning)" }}>
                <Building2 className="w-4 h-4" style={{ color: "var(--gc-status-warning)" }} />
                <div><div style={{ fontSize: "var(--gc-text-sm)", fontWeight: 500, color: "var(--gc-text-primary)" }}>Upload Articles of Incorporation</div><div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Business entity document</div></div>
              </div></Link>
            )}
          </div>
        </div>
      )}

      {completeDocs === totalDocs && status === "approved" && (
        <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid color-mix(in srgb, var(--gc-status-active) 30%, transparent)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)", textAlign: "center" }}>
          <CheckCircle className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--gc-status-active)" }} />
          <div style={{ fontSize: "var(--gc-text-md)", fontWeight: 500, color: "var(--gc-status-active)" }}>All Complete</div>
          <div style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>Your contracting is fully processed. Visit the Requests page to get appointed with carriers.</div>
        </div>
      )}
    </div>
  );
}
