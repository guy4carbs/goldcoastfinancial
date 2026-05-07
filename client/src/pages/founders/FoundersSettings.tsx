import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Download,
  Bell,
  LogOut,
  FileJson,
  Sparkles,
  Puzzle,
  Network,
  Lock,
} from "lucide-react";
import { GCPageHeader, GCPrimaryButton, GCSecondaryButton, GCSwitch } from "@/components/gc";
import { TOUR } from "@/lib/tour/selectors";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { csrfHeaders } from "@/lib/queryClient";
// SPLIT_RECIPIENTS is the canonical founder distribution split (3 founders +
// retained reserves). Imported here so the System Constants card stays in
// sync with the ledger automatically — never duplicate the values inline.
import { SPLIT_RECIPIENTS } from "@shared/models/founders";

// ─── SHARED STYLE TOKENS ───
// Mirror FoundersTeamPerformance.tsx so the founders pages render identically.
const OUTLINED_BUTTON_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface-2)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-sm)",
  color: "var(--gc-text-secondary)",
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-sm)",
  fontWeight: 500,
  textDecoration: "none",
};

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: "var(--gc-surface)",
  border: "1px solid var(--gc-border)",
  borderRadius: "var(--gc-radius-md)",
  padding: "var(--gc-space-4)",
  display: "flex",
  flexDirection: "column",
};

const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--gc-font-body)",
  fontSize: "var(--gc-text-xs)",
  fontWeight: 500,
  letterSpacing: "var(--gc-tracking-wider)",
  textTransform: "uppercase",
  color: "var(--gc-text-muted)",
};

// ─── TYPES ───
interface NotificationPrefs {
  emergency_decisions: boolean;
  quorum_requests: boolean;
  audit_anomalies: boolean;
}

interface FeatureFlags {
  board_room: boolean;
  partnerships: boolean;
  activity: boolean;
  view_as: boolean;
}

interface FoundersSettingsShape {
  notifications: NotificationPrefs;
  flags: FeatureFlags;
  platinum: boolean;
}

const DEFAULTS: FoundersSettingsShape = {
  notifications: {
    emergency_decisions: true,
    quorum_requests: true,
    audit_anomalies: true,
  },
  flags: {
    board_room: true,
    partnerships: true,
    activity: true,
    view_as: true,
  },
  platinum: false,
};

// ─── 2FA-ENFORCED ROLES (display only) ───
// Source of truth: server/types/permissions.ts → ROLES_REQUIRING_2FA.
// That file is server-only (no @shared alias) so the labels are mirrored
// here for transparency. If the canonical list changes, update this label
// list to match — the auth gate already enforces the real list.
const TWO_FA_ROLE_LABELS = [
  "Founder",
  "Owner",
  "System Admin",
  "Director",
  "Agency Manager",
  "Manager",
  "Sales Agent",
  "Marketing Staff",
  "Investor",
];

// Wave AF1: settings persist server-side via /api/founders/settings (one
// JSONB blob per founder, keyed by user_id). Old localStorage helpers were
// removed so settings travel across devices.

// ─── MAIN ───
export default function FoundersSettings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const userId = user?.id ?? "anon";
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<FoundersSettingsShape>(DEFAULTS);
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [rangeEnd, setRangeEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<Error | null>(null);
  const [loggingOutOthers, setLoggingOutOthers] = useState(false);
  const [logoutError, setLogoutError] = useState<Error | null>(null);

  // Wave AF4a: server-side settings via React Query.
  const settingsQuery = useQuery({
    queryKey: ["/api/founders/settings"],
    queryFn: async () => {
      const res = await fetch("/api/founders/settings", { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return (await res.json()) as { settings: Partial<FoundersSettingsShape>; updatedAt: string };
    },
    staleTime: 60_000,
  });

  // Hydrate local form state when the server settings load. Merge against
  // DEFAULTS so newly-added toggles get sensible values for old rows.
  useEffect(() => {
    if (!settingsQuery.data) return;
    const s = settingsQuery.data.settings || {};
    setSettings({
      notifications: { ...DEFAULTS.notifications, ...(s.notifications || {}) },
      flags: { ...DEFAULTS.flags, ...(s.flags || {}) },
      platinum: typeof s.platinum === "boolean" ? s.platinum : DEFAULTS.platinum,
    });
  }, [settingsQuery.data]);

  const saveSettingsMutation = useMutation({
    mutationFn: async (next: FoundersSettingsShape) => {
      const res = await fetch("/api/founders/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
        body: JSON.stringify({ settings: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Synced across devices.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/founders/settings"] });
    },
    onError: (err: Error) =>
      toast({
        title: "Save failed",
        description: err.message,
        variant: "destructive",
      }),
  });

  // ─── PLATINUM CLASS APPLICATION ───
  useEffect(() => {
    const root = document.documentElement;
    if (settings.platinum) {
      root.classList.add("founders-platinum-theme");
    } else {
      root.classList.remove("founders-platinum-theme");
    }
    return () => {
      root.classList.remove("founders-platinum-theme");
    };
  }, [settings.platinum]);

  // ─── SCROLL TO EXPORT ANCHOR ───
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#export") {
      const el = document.getElementById("export");
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  // ─── DERIVED CONSTANTS (for read-only System Constants card) ───
  // Build the founder split label from the canonical SPLIT_RECIPIENTS array
  // so editing percentages in shared/models/founders.ts auto-updates this UI.
  const splitLabel = useMemo(() => {
    const founders = SPLIT_RECIPIENTS.filter((r) => r.key !== "retained");
    const pcts = SPLIT_RECIPIENTS.map((r) => `${Math.round(r.pct * 100)}%`).join(" / ");
    return `${pcts} (${founders.length} founders + retained reserves)`;
  }, []);

  // ─── SAVE ───
  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  // ─── EXPORT ───
  // Wave AF2 wired: backend accepts YYYY-MM-DD strings (not ISO timestamps).
  // Streams CSV by default; ?format=json available if needed.
  const handleExport = async () => {
    setExporting(true);
    try {
      const url = `/api/founders/activity/feed?since=${encodeURIComponent(
        rangeStart,
      )}&until=${encodeURIComponent(rangeEnd)}&format=csv`;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(
          (errBody as { error?: string }).error || `Export failed: HTTP ${res.status}`,
        );
      }
      const blob = await res.blob();
      downloadBlob(blob, `founder-audit-${rangeStart}-${rangeEnd}.csv`);
      setExportError(null);
      toast({ title: "Export ready", description: "Audit log downloaded." });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unable to export");
      setExportError(error);
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Wave AF3 wired: POST /api/auth/sessions/logout-others. CSRF required.
  // Returns { destroyed: N } indicating how many other sessions were ended.
  const handleLogoutOtherSessions = async () => {
    setLoggingOutOthers(true);
    try {
      const res = await fetch("/api/auth/sessions/logout-others", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...(await csrfHeaders()) },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || `HTTP ${res.status}`);
      }
      setLogoutError(null);
      const destroyed = (data as { destroyed?: number }).destroyed ?? 0;
      toast({
        title: "Other sessions ended",
        description:
          destroyed === 0
            ? "No other active sessions found."
            : `${destroyed} other ${destroyed === 1 ? "device" : "devices"} signed out.`,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unable to log out");
      setLogoutError(error);
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoggingOutOthers(false);
    }
  };

  // ─── NOTIFICATION HELPERS ───
  const toggleNotification = (
    key: keyof NotificationPrefs,
    value: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const toggleFlag = (key: keyof FeatureFlags, value: boolean) => {
    setSettings((prev) => ({ ...prev, flags: { ...prev.flags, [key]: value } }));
  };

  const scrollToExport = () => {
    const el = document.getElementById("export");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // ─── PAGE-LEVEL ERROR GUARD ───
  // Mirror FoundersTeamPerformance.tsx — only blank out if EVERY async path
  // errors. Most state on this page is localStorage so this guard normally
  // passes; it's kept for consistency with the other founders pages and to
  // be ready when the export + sessions endpoints come online.
  const allErrored = !!(exportError && logoutError);
  const firstError = exportError || logoutError;

  if (allErrored) {
    return (
      <div className="py-8 text-center">
        <div
          style={{
            fontFamily: "var(--gc-font-display)",
            fontSize: "var(--gc-text-lg)",
            color: "var(--gc-status-terminated)",
          }}
        >
          Unable to load settings
        </div>
        {firstError && (
          <div
            className="mt-2"
            style={{ color: "var(--gc-text-muted)", fontSize: "var(--gc-text-sm)" }}
          >
            {firstError.message}
          </div>
        )}
      </div>
    );
  }

  // ─── RENDER ───
  return (
    <div id="settings">
      <div data-tour-id={TOUR.FOUNDERS.SETTINGS.HEADER}>
        <GCPageHeader
          title="Settings"
          subtitle="Notifications, audit export, feature flags"
          accentUnderline
          actions={
            <div className="flex items-center gap-2">
              <span title="Jump to Audit Log Export">
                <GCSecondaryButton
                  onClick={scrollToExport}
                  icon={<Download className="w-4 h-4" />}
                >
                  <span className="hidden lg:inline">Export</span>
                </GCSecondaryButton>
              </span>
              <Link
                href="/founders/hierarchy"
                className="inline-flex items-center gap-1.5 px-3 py-2"
                style={OUTLINED_BUTTON_STYLE}
                title="Manage Hierarchy"
              >
                <Network className="w-4 h-4" />
                <span className="hidden xl:inline">Manage Hierarchy →</span>
              </Link>
              <GCPrimaryButton
                onClick={handleSave}
                disabled={saveSettingsMutation.isPending}
                icon={<Save className="w-4 h-4" />}
              >
                {saveSettingsMutation.isPending ? "Saving…" : "Save"}
              </GCPrimaryButton>
            </div>
          }
        />
      </div>

      <div className="space-y-6">
        {/* ─── NOTIFICATIONS ─── */}
        <div
          id="notifications"
          className="mb-4"
          data-tour-id={TOUR.FOUNDERS.SETTINGS.NOTIFICATIONS}
        >
          <div
            className="mb-3"
            style={{ display: "flex", alignItems: "center", gap: 8, ...SECTION_LABEL_STYLE }}
          >
            <Bell className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
            Notifications
          </div>
          <div style={CARD_STYLE}>
            <p
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              Per-event toggles for founder-only alerts. Stored locally per founder.
            </p>
            <div className="space-y-3">
              <SwitchRow
                label="Emergency decisions"
                description="Notify when any founder files an emergency override."
                checked={settings.notifications.emergency_decisions}
                onCheckedChange={(v) => toggleNotification("emergency_decisions", v)}
              />
              <SwitchRow
                label="Quorum requests"
                description="Notify when a proposal awaits your 2-of-4 approval."
                checked={settings.notifications.quorum_requests}
                onCheckedChange={(v) => toggleNotification("quorum_requests", v)}
              />
              <SwitchRow
                label="Audit anomalies"
                description="Notify on unusual patterns in founder audit log."
                checked={settings.notifications.audit_anomalies}
                onCheckedChange={(v) => toggleNotification("audit_anomalies", v)}
              />
            </div>
          </div>
        </div>

        {/* ─── AUDIT EXPORT ─── */}
        <div
          id="export"
          className="mb-4"
          data-tour-id={TOUR.FOUNDERS.SETTINGS.EXPORT_CARD}
        >
          <div
            className="mb-3"
            style={{ display: "flex", alignItems: "center", gap: 8, ...SECTION_LABEL_STYLE }}
          >
            <FileJson className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
            Audit Log Export
          </div>
          <div style={CARD_STYLE}>
            <p
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              Pick a date range and download the founder audit log.
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  style={{
                    fontSize: "var(--gc-text-xs)",
                    color: "var(--gc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--gc-tracking-wider)",
                  }}
                >
                  From
                </label>
                <Input
                  type="date"
                  value={rangeStart}
                  onChange={(e) => setRangeStart(e.target.value)}
                  className="h-9"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "var(--gc-text-xs)",
                    color: "var(--gc-text-muted)",
                    textTransform: "uppercase",
                    letterSpacing: "var(--gc-tracking-wider)",
                  }}
                >
                  To
                </label>
                <Input
                  type="date"
                  value={rangeEnd}
                  onChange={(e) => setRangeEnd(e.target.value)}
                  className="h-9"
                />
              </div>
              <div
                data-tour-id={TOUR.FOUNDERS.SETTINGS.EXPORT_BUTTON}
                className="flex items-center gap-2"
              >
                <GCPrimaryButton
                  onClick={handleExport}
                  disabled={exporting}
                  icon={<Download className="w-4 h-4" />}
                >
                  {exporting ? "Exporting…" : "Export CSV"}
                </GCPrimaryButton>
                <span
                  style={{
                    fontSize: "var(--gc-text-xs)",
                    fontWeight: 500,
                    padding: "2px 8px",
                    borderRadius: 999,
                    backgroundColor: "var(--gc-surface-2)",
                    border: "1px solid var(--gc-border)",
                    color: "var(--gc-text-muted)",
                  }}
                >
                  Backend coming soon
                </span>
              </div>
            </div>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
              }}
            >
              Audit-feed export endpoint not yet wired. Will support CSV with JSON fallback once shipped.
            </p>
          </div>
        </div>

        {/* ─── FEATURE FLAGS ─── */}
        <div
          id="flags"
          className="mb-4"
          data-tour-id={TOUR.FOUNDERS.SETTINGS.FEATURE_FLAGS}
        >
          <div
            className="mb-3"
            style={{ display: "flex", alignItems: "center", gap: 8, ...SECTION_LABEL_STYLE }}
          >
            <Puzzle className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
            Module Feature Flags
          </div>
          <div style={CARD_STYLE}>
            <p
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-2)",
              }}
            >
              Toggle v1 Founders modules in your view of the lounge.
            </p>
            <p
              style={{
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-4)",
                fontStyle: "italic",
              }}
            >
              These toggles affect only your view. They do not change other founders' settings.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SwitchRow
                label="Board Room"
                checked={settings.flags.board_room}
                onCheckedChange={(v) => toggleFlag("board_room", v)}
              />
              <SwitchRow
                label="Partnerships"
                checked={settings.flags.partnerships}
                onCheckedChange={(v) => toggleFlag("partnerships", v)}
              />
              <SwitchRow
                label="Activity"
                checked={settings.flags.activity}
                onCheckedChange={(v) => toggleFlag("activity", v)}
              />
              <SwitchRow
                label="View-As"
                checked={settings.flags.view_as}
                onCheckedChange={(v) => toggleFlag("view_as", v)}
              />
            </div>
          </div>
        </div>

        {/* ─── SYSTEM CONSTANTS (read-only) ─── */}
        <div
          id="constants"
          className="mb-4"
          data-tour-id={TOUR.FOUNDERS.SETTINGS.SYSTEM_CONSTANTS}
        >
          <div
            className="mb-3"
            style={{ display: "flex", alignItems: "center", gap: 8, ...SECTION_LABEL_STYLE }}
          >
            <Lock className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
            System Constants
          </div>
          <div style={CARD_STYLE}>
            <p
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              Founder-visible system invariants. Each row's source path shows where to change it.
            </p>
            <div className="space-y-3">
              <ConstantRow
                label="Founder Distribution Split"
                value={splitLabel}
                source="SPLIT_RECIPIENTS in shared/models/founders.ts"
              />
              <ConstantRow
                label="View-As Auto-Expire"
                value="4 hours"
                source="MAX_SESSION_MS in viewAsSweeper.ts"
              />
              <ConstantRow
                label="Hierarchy Min Spread"
                value="5%"
                source="MIN_SPREAD in hcms-hierarchy.ts"
              />
              <ConstantRow
                label="2FA-Enforced Roles"
                value={TWO_FA_ROLE_LABELS.join(", ")}
                source="ROLES_REQUIRING_2FA in server/types/permissions.ts"
              />
            </div>
          </div>
        </div>

        {/* ─── SESSION ─── */}
        <div
          id="sessions"
          className="mb-4"
          data-tour-id={TOUR.FOUNDERS.SETTINGS.SESSIONS}
        >
          <div
            className="mb-3"
            style={{ display: "flex", alignItems: "center", gap: 8, ...SECTION_LABEL_STYLE }}
          >
            <LogOut className="w-3.5 h-3.5" style={{ color: "var(--gc-gold)" }} />
            Session Management
          </div>
          <div style={CARD_STYLE}>
            <p
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              Manage device sessions for your founder account.
            </p>
            <div className="flex items-center gap-2">
              <GCSecondaryButton
                onClick={handleLogoutOtherSessions}
                disabled={loggingOutOthers}
                icon={<LogOut className="w-4 h-4" />}
              >
                {loggingOutOthers ? "Signing out…" : "Log Out Other Sessions"}
              </GCSecondaryButton>
              <span
                style={{
                  fontSize: "var(--gc-text-xs)",
                  fontWeight: 500,
                  padding: "2px 8px",
                  borderRadius: 999,
                  backgroundColor: "var(--gc-surface-2)",
                  border: "1px solid var(--gc-border)",
                  color: "var(--gc-text-muted)",
                }}
              >
                Backend coming soon
              </span>
            </div>
            <p
              className="mt-2"
              style={{
                fontSize: "var(--gc-text-xs)",
                color: "var(--gc-text-muted)",
              }}
            >
              Will end sessions on other devices once shipped (current session stays active).
            </p>
          </div>
        </div>

        {/* ─── PLATINUM THEME ─── */}
        <div
          id="theme"
          className="mb-4"
          data-tour-id={TOUR.FOUNDERS.SETTINGS.PLATINUM_TOGGLE}
        >
          <div
            className="mb-3"
            style={{ display: "flex", alignItems: "center", gap: 8, ...SECTION_LABEL_STYLE }}
          >
            <Sparkles
              className="w-3.5 h-3.5"
              style={{ color: "var(--gc-platinum, #D9D6D0)" }}
            />
            Platinum Theme
          </div>
          <div style={CARD_STYLE}>
            <p
              style={{
                fontSize: "var(--gc-text-sm)",
                color: "var(--gc-text-muted)",
                marginBottom: "var(--gc-space-4)",
              }}
            >
              Adds subtle platinum accents to the Founders Lounge hero cards and
              layout root.
            </p>
            <SwitchRow
              label="Emphasize platinum accents"
              checked={settings.platinum}
              onCheckedChange={(v) =>
                setSettings((prev) => ({ ...prev, platinum: v }))
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── HELPERS ───
function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1">
        <div
          style={{
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-primary)",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
            }}
          >
            {description}
          </div>
        )}
      </div>
      <GCSwitch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

function ConstantRow({
  label,
  value,
  source,
}: {
  label: string;
  value: string;
  source: string;
}) {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-[200px,1fr] gap-2 md:gap-4 py-2 border-b last:border-b-0"
      style={{ borderColor: "var(--gc-border)" }}
    >
      <div className="flex items-center gap-2">
        <span
          style={{
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-secondary)",
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <span
          aria-label="Read-only"
          title="Read-only — configured in code"
          style={{
            fontSize: 10,
            padding: "1px 6px",
            borderRadius: 999,
            backgroundColor: "var(--gc-surface-2)",
            color: "var(--gc-text-muted)",
            border: "1px solid var(--gc-border)",
            fontWeight: 500,
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          🔒 locked
        </span>
      </div>
      <div>
        <div
          style={{
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-primary)",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
            marginTop: 2,
          }}
        >
          Source: <code style={{ fontFamily: "var(--gc-font-mono, ui-monospace, SFMono-Regular, monospace)" }}>{source}</code>
        </div>
      </div>
    </div>
  );
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

