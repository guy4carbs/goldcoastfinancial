import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Send, Archive, Trash2, Eye, Wand2, ArrowUpRight, Sparkles, Code, Rocket } from "lucide-react";
import { GCModal } from "@/components/gc/GCModal";
import {
  GCPageHeader,
  GCKPICard,
  GCDataTable,
  GCStatusBadge,
  GCSelect,
  type Column,
} from "@/components/gc";
import { SimpleMarkdown } from "@/components/lifeos/SimpleMarkdown";
import { generateDraftFromCommits } from "@/lib/lifeos-commit-parser";
import { formatDate, formatNumber } from "./utils/format";

interface AdminRelease {
  id: string;
  version: string;
  release_type: "major" | "minor" | "patch";
  title: string;
  summary: string;
  body_markdown?: string;
  highlight_label: string | null;
  status: "draft" | "published" | "archived";
  published_at: string | null;
  published_by: string | null;
  created_at: string;
  updated_at: string;
}

const SEMVER_RE = /^(\d+)\.(\d+)\.(\d+)$/;

/**
 * /founders/lifeos — admin CMS for lifeOS releases. Founders + system_admin
 * only. Writes are gated server-side, but we also hide the page from
 * non-eligible roles in the route guard.
 */
export default function LifeOSAdminPage() {
  const [rows, setRows] = useState<AdminRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<string | null>(null);
  // The actual bundle version the server is running. Distinct from "latest
  // published note" — they can diverge if you publish before deploy lands.
  const [deployedVersion, setDeployedVersion] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/lifeos/admin/releases", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        setRows(data.releases ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshDeployedVersion = async () => {
    try {
      const r = await fetch("/api/lifeos/version", { credentials: "include" });
      if (r.ok) {
        const data = await r.json();
        if (data?.deployed_version) setDeployedVersion(data.deployed_version);
      }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    refresh();
    refreshDeployedVersion();
  }, []);

  // Stats derived from the same `rows` we fetch for the table — zero extra calls.
  const publishedRows = useMemo(() => rows.filter((r) => r.status === "published"), [rows]);
  const draftRows = useMemo(() => rows.filter((r) => r.status === "draft"), [rows]);
  const latestPublished = useMemo(() => {
    if (publishedRows.length === 0) return null;
    return [...publishedRows].sort((a, b) => {
      const ta = a.published_at ? new Date(a.published_at).getTime() : 0;
      const tb = b.published_at ? new Date(b.published_at).getTime() : 0;
      return tb - ta;
    })[0];
  }, [publishedRows]);
  const shippedThisMonth = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return publishedRows.filter((r) => {
      if (!r.published_at) return false;
      return new Date(r.published_at).getTime() >= monthStart;
    }).length;
  }, [publishedRows]);
  const latestVersion = latestPublished?.version ?? "—";
  const publishedCount = publishedRows.length;
  const draftCount = draftRows.length;

  // Columns for GCDataTable — matches the Agency Management Carriers tab shape.
  const columns: Column<AdminRelease>[] = [
    {
      key: "version",
      label: "Version",
      width: 110,
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--gc-font-mono, ui-monospace, monospace)",
            fontSize: 12,
            padding: "2px 10px",
            borderRadius: "var(--gc-radius-full, 999px)",
            backgroundColor: "var(--gc-surface-2)",
            color: "var(--gc-text-muted)",
            border: "1px solid var(--gc-border-subtle)",
            display: "inline-block",
          }}
        >
          {String(v)}
        </span>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (v, r) => (
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontWeight: 600,
              color: "var(--gc-text-primary)",
              fontSize: "var(--gc-text-md)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {r.title}
          </div>
          <div
            style={{
              color: "var(--gc-text-muted)",
              fontSize: "var(--gc-text-xs)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: 2,
            }}
          >
            {r.summary}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      width: 110,
      render: (v) => <GCStatusBadge status={String(v)} />,
    },
    {
      key: "release_type",
      label: "Type",
      width: 90,
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-secondary)",
            textTransform: "capitalize",
          }}
        >
          {String(v)}
        </span>
      ),
    },
    {
      key: "published_at",
      label: "Published",
      width: 130,
      render: (v) => (
        <span
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-xs)",
            color: "var(--gc-text-muted)",
          }}
        >
          {v ? formatDate(String(v)) : "—"}
        </span>
      ),
    },
    {
      key: "id",
      label: "",
      width: 200,
      align: "right",
      render: (_v, r) => (
        <div className="flex items-center justify-end gap-1">
          <IconButton title="Preview" onClick={() => setPreviewVersion(r.version)}>
            <Eye className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton
            title="Edit"
            disabled={r.status !== "draft"}
            onClick={() => setEditingId(r.id)}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton
            title={r.status === "published" ? "Already published" : "Publish"}
            disabled={r.status !== "draft"}
            onClick={async () => {
              await fetch(`/api/lifeos/releases/${r.id}/publish`, { method: "POST", credentials: "include" });
              await refresh();
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton
            title="Archive"
            disabled={r.status !== "published"}
            onClick={async () => {
              if (!confirm(`Archive ${r.version}? It'll stop appearing in user-facing surfaces.`)) return;
              await fetch(`/api/lifeos/releases/${r.id}/archive`, { method: "POST", credentials: "include" });
              await refresh();
            }}
          >
            <Archive className="w-3.5 h-3.5" />
          </IconButton>
          <IconButton
            title="Delete (drafts only)"
            disabled={r.status !== "draft"}
            onClick={async () => {
              if (!confirm(`Delete draft ${r.version}? This is permanent.`)) return;
              await fetch(`/api/lifeos/releases/${r.id}`, { method: "DELETE", credentials: "include" });
              await refresh();
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div>
      <GCPageHeader
        title="lifeOS Releases"
        subtitle="Author release notes, bump the version, and publish updates the whole organization sees."
        accentUnderline
        actions={
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="flex items-center gap-2"
            style={{
              padding: "var(--gc-space-2) var(--gc-space-4)",
              background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
              color: "var(--gc-ink)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 2px 8px color-mix(in srgb, var(--gc-gold) 30%, transparent)",
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-sm)",
            }}
          >
            <Plus className="w-4 h-4" /> New release
          </button>
        }
      />

      {/* KPI band — matches FoundersAgencyManagement rhythm */}
      <section aria-labelledby="lifeos-kpi-heading" className="mb-4">
        <h2 id="lifeos-kpi-heading" className="sr-only">lifeOS Release KPIs</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GCKPICard label="Latest version" value={latestVersion} accentTop />
          <GCKPICard label="Published releases" value={formatNumber(publishedCount)} accentTop />
          <GCKPICard label="Drafts" value={formatNumber(draftCount)} accentTop />
          <GCKPICard label="Shipped this month" value={formatNumber(shippedThisMonth)} accentTop />
        </div>
      </section>

      {/* Status ribbon — separates "what's running on prod" from "what's
          published as notes". When they diverge (e.g. notes ahead of
          bundle), an amber warning appears so the founder doesn't ship
          a popup that can't be satisfied. */}
      {(latestPublished || deployedVersion) && (() => {
        const noteVersion = latestPublished?.version ?? null;
        const prodVersion = deployedVersion;
        const mismatched = noteVersion && prodVersion && noteVersion !== prodVersion;
        return (
        <div
          className="flex items-center justify-between mb-3 flex-wrap gap-2"
          style={{
            padding: "8px 12px",
            backgroundColor: mismatched
              ? "color-mix(in srgb, var(--gc-gold) 8%, var(--gc-surface))"
              : "var(--gc-surface)",
            border: `1px solid ${mismatched ? "color-mix(in srgb, var(--gc-gold) 50%, transparent)" : "var(--gc-border-subtle)"}`,
            borderRadius: "var(--gc-radius-sm)",
          }}
        >
          <div
            className="flex items-center gap-4 flex-wrap"
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-text-muted)",
            }}
          >
            {prodVersion && (
              <span>
                Live on prod: <strong style={{ color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-mono, monospace)" }}>lifeOS {prodVersion}</strong>
              </span>
            )}
            {noteVersion && (
              <span>
                Latest published note: <strong style={{ color: "var(--gc-text-primary)", fontFamily: "var(--gc-font-mono, monospace)" }}>lifeOS {noteVersion}</strong>
                {latestPublished?.published_at && (
                  <span style={{ color: "var(--gc-text-muted)" }}> · {formatDate(latestPublished.published_at)}</span>
                )}
              </span>
            )}
            {mismatched && (
              <span style={{ color: "var(--gc-gold)", fontWeight: 600 }}>
                ⚠ Notes are ahead of the deployed bundle — users will see a popup that can't load.
              </span>
            )}
          </div>
          <a
            href="/lifeos/whats-new"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1"
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: "var(--gc-text-xs)",
              color: "var(--gc-gold)",
              textDecoration: "none",
            }}
          >
            View public archive <ArrowUpRight className="w-3 h-3" />
          </a>
        </div>
        );
      })()}

      {/* Releases table — same shape as Agency Management's Carriers table */}
      {/* Section label — matches the "Agency Tree" / "Agency Detail" pattern */}
      <div
        style={{
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-xs)",
          letterSpacing: "var(--gc-tracking-wider)",
          textTransform: "uppercase",
          color: "var(--gc-text-muted)",
          fontWeight: 600,
          marginBottom: "var(--gc-space-2)",
        }}
      >
        Release Log
      </div>

      {loading ? (
        <div
          style={{
            height: 200,
            backgroundColor: "var(--gc-surface)",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyReleaseConsole onNewRelease={() => setCreating(true)} />
      ) : (
        <GCDataTable<AdminRelease>
          columns={columns}
          data={rows}
        />
      )}

      {creating && (
        <ReleaseEditor
          onClose={() => setCreating(false)}
          onSaved={async () => { setCreating(false); await refresh(); }}
        />
      )}
      {editingId && (
        <ReleaseEditor
          editId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={async () => { setEditingId(null); await refresh(); }}
        />
      )}
      {previewVersion && (
        <PreviewModal
          versionString={previewVersion}
          onClose={() => setPreviewVersion(null)}
        />
      )}
    </div>
  );
}

/**
 * EmptyReleaseConsole — rich onboarding panel that fills the space the
 * release table would occupy when there's no data. Replaces the previous
 * thin dashed band (which left a 60vh dead zone). Sparkles hero, three
 * numbered steps, primary CTA, public-archive preview link.
 */
function EmptyReleaseConsole({ onNewRelease }: { onNewRelease: () => void }) {
  const steps = [
    {
      icon: <Code className="w-4 h-4" />,
      title: "Bump LIFEOS_VERSION",
      detail: "Edit shared/lifeos.ts in both repos to the next semver number (e.g. 1.0.1).",
    },
    {
      icon: <Rocket className="w-4 h-4" />,
      title: "Deploy through Railway",
      detail: "Merge to main on Gold Coast and push heritage-app for Heritage. Wait for green builds.",
    },
    {
      icon: <Sparkles className="w-4 h-4" />,
      title: "Publish notes here",
      detail: "Click New release, paste your git log into Generate from commits, and publish.",
    },
  ];
  return (
    <div
      style={{
        padding: "var(--gc-space-6)",
        backgroundColor: "var(--gc-surface)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-md)",
        backgroundImage:
          "linear-gradient(135deg, color-mix(in srgb, var(--gc-gold) 6%, transparent), transparent 55%)",
      }}
    >
      <div className="flex items-center gap-3" style={{ marginBottom: "var(--gc-space-4)" }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--gc-radius-full, 999px)",
            background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 14px color-mix(in srgb, var(--gc-gold) 40%, transparent)",
            flexShrink: 0,
          }}
        >
          <Sparkles className="w-5 h-5" style={{ color: "var(--gc-ink)" }} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: 20,
              fontWeight: 600,
              color: "var(--gc-text-primary)",
              lineHeight: 1.2,
            }}
          >
            Let's ship your first release.
          </div>
          <div
            style={{
              fontFamily: "var(--gc-font-body)",
              fontSize: 13,
              color: "var(--gc-text-secondary)",
              marginTop: 2,
            }}
          >
            Three steps from a code change to every user seeing the Update Now popup.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3" style={{ marginBottom: "var(--gc-space-4)" }}>
        {steps.map((step, idx) => (
          <div
            key={idx}
            style={{
              padding: "var(--gc-space-3) var(--gc-space-4)",
              backgroundColor: "var(--gc-surface-2)",
              border: "1px solid var(--gc-border-subtle)",
              borderRadius: "var(--gc-radius-sm)",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "var(--gc-radius-full, 999px)",
                  backgroundColor: "color-mix(in srgb, var(--gc-gold) 22%, transparent)",
                  color: "var(--gc-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--gc-font-mono, monospace)",
                  fontSize: 11,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>
              <div style={{ color: "var(--gc-text-secondary)" }}>{step.icon}</div>
              <div
                style={{
                  fontFamily: "var(--gc-font-body)",
                  fontWeight: 600,
                  color: "var(--gc-text-primary)",
                  fontSize: "var(--gc-text-sm)",
                }}
              >
                {step.title}
              </div>
            </div>
            <div
              style={{
                fontFamily: "var(--gc-font-body)",
                fontSize: 12,
                color: "var(--gc-text-muted)",
                lineHeight: 1.5,
                marginLeft: 28,
              }}
            >
              {step.detail}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onNewRelease}
          className="flex items-center gap-2"
          style={{
            padding: "var(--gc-space-2) var(--gc-space-4)",
            background: "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
            color: "var(--gc-ink)",
            border: "none",
            borderRadius: "var(--gc-radius-sm)",
            fontWeight: 600,
            cursor: "pointer",
            boxShadow: "0 2px 8px color-mix(in srgb, var(--gc-gold) 30%, transparent)",
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
          }}
        >
          <Plus className="w-4 h-4" /> Write the first release
        </button>
        <a
          href="/lifeos/whats-new"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--gc-font-body)",
            fontSize: "var(--gc-text-sm)",
            color: "var(--gc-text-secondary)",
            textDecoration: "none",
          }}
        >
          Preview the public archive →
        </a>
      </div>
    </div>
  );
}

function IconButton({ children, onClick, title, disabled }: { children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: 6,
        backgroundColor: "transparent",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
        color: disabled ? "var(--gc-text-muted)" : "var(--gc-text-secondary)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  );
}

function ReleaseEditor({ editId, onClose, onSaved }: { editId?: string; onClose: () => void; onSaved: () => void | Promise<void> }) {
  const [version, setVersion] = useState("");
  const [releaseType, setReleaseType] = useState<"major" | "minor" | "patch">("patch");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("## Highlights\n\n- \n\n## Improvements\n\n- \n\n## Fixes\n\n- ");
  const [highlight, setHighlight] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [draftModalOpen, setDraftModalOpen] = useState(false);

  // Pre-fill if editing.
  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const r = await fetch("/api/lifeos/admin/releases", { credentials: "include" });
        if (!r.ok) return;
        const data = await r.json();
        const row = (data.releases ?? []).find((x: AdminRelease) => x.id === editId);
        if (!row) return;
        setVersion(row.version);
        setReleaseType(row.release_type);
        setTitle(row.title);
        setSummary(row.summary);
        setHighlight(row.highlight_label ?? "");
        // Need to fetch full body separately since admin list doesn't return it.
        const detail = await fetch(`/api/lifeos/releases/${row.version}`, { credentials: "include" });
        if (detail.ok) {
          const d = await detail.json();
          if (d.body_markdown) setBody(d.body_markdown);
        }
      } catch { /* ignore */ }
    })();
  }, [editId]);

  const canSave = SEMVER_RE.test(version) && title.trim() && summary.trim() && body.trim();

  const save = async () => {
    setErr("");
    setSaving(true);
    try {
      const url = editId ? `/api/lifeos/releases/${editId}` : "/api/lifeos/releases";
      const method = editId ? "PATCH" : "POST";
      const body_ = JSON.stringify({
        version,
        release_type: releaseType,
        title,
        summary,
        body_markdown: body,
        highlight_label: highlight.trim() || null,
      });
      const r = await fetch(url, { method, credentials: "include", headers: { "Content-Type": "application/json" }, body: body_ });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setErr(d.error ?? "Save failed");
        return;
      }
      await onSaved();
    } catch {
      setErr("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <GCModal
      title={editId ? "Edit release" : "New lifeOS release"}
      subtitle="Authoring is private until you publish. Drafts are editable; published rows are immutable."
      onClose={onClose}
      width={780}
      footer={
        <div className="flex items-center justify-end gap-2">
          {err && <span style={{ color: "var(--gc-error, #d8624c)", fontSize: 13, marginRight: "auto" }}>{err}</span>}
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "8px 16px", backgroundColor: "transparent", color: "var(--gc-text-secondary)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!canSave || saving}
            onClick={save}
            style={{
              padding: "8px 22px",
              background: !canSave || saving ? "var(--gc-surface-2)" : "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
              color: !canSave || saving ? "var(--gc-text-muted)" : "var(--gc-ink)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontWeight: 600,
              cursor: !canSave || saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : editId ? "Save changes" : "Save draft"}
          </button>
        </div>
      }
    >
      {/* Generate from commits — top-of-form CTA */}
      <div
        style={{
          padding: "10px 14px",
          backgroundColor: "color-mix(in srgb, var(--gc-gold) 8%, var(--gc-surface-2))",
          border: "1px solid color-mix(in srgb, var(--gc-gold) 30%, transparent)",
          borderRadius: "var(--gc-radius-sm)",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Wand2 className="w-4 h-4" style={{ color: "var(--gc-gold)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ color: "var(--gc-text-primary)", fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
            Generate from commits
          </div>
          <div style={{ color: "var(--gc-text-muted)", fontSize: 12, lineHeight: 1.4 }}>
            Paste your <code style={{ fontFamily: "var(--gc-font-mono, monospace)" }}>git log</code> output — we'll turn it into plain-English notes for you to review and edit.
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDraftModalOpen(true)}
          style={{
            padding: "6px 14px",
            backgroundColor: "var(--gc-gold)",
            color: "var(--gc-ink)",
            border: "none",
            borderRadius: "var(--gc-radius-sm)",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          Generate
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3" style={{ marginBottom: 12 }}>
        <Field label="Version (X.Y.Z)" hint="Semver. Bump major / minor / patch.">
          <input
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            placeholder="1.0.1"
            disabled={!!editId}
            style={inputStyle()}
          />
        </Field>
        <Field label="Type">
          <GCSelect
            value={releaseType}
            onValueChange={(v) => setReleaseType(v as "major" | "minor" | "patch")}
            fullWidth
            options={[
              { value: "patch", label: "Patch — bug fixes" },
              { value: "minor", label: "Minor — new features" },
              { value: "major", label: "Major — flagship" },
            ]}
          />
        </Field>
      </div>
      <Field label="Title" hint="Sentence case, no exclamation marks.">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Hierarchy redesign and Founders boost" style={inputStyle()} />
      </Field>
      <div style={{ height: 12 }} />
      <Field label="Summary" hint="One or two sentences for the popup.">
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} placeholder="The hierarchy view is now sharper and faster. Founders dashboard adds revenue insights." style={{ ...inputStyle(), resize: "vertical" }} />
      </Field>
      <div style={{ height: 12 }} />
      <Field label="Highlight label (optional)" hint="Shown in the popup as a small accent. Leave blank to use the default for the type.">
        <input value={highlight} onChange={(e) => setHighlight(e.target.value)} placeholder="New" style={inputStyle()} maxLength={20} />
      </Field>
      <div style={{ height: 12 }} />
      <Field label="Body (markdown)" hint="Group changes by functional area. Use ## headings, - bullets, **bold**, [links](url).">
        <div className="grid grid-cols-2 gap-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={18}
            style={{ ...inputStyle(), fontFamily: "var(--gc-font-mono, monospace)", fontSize: 13, resize: "vertical" }}
          />
          <div
            style={{
              padding: 16,
              backgroundColor: "var(--gc-surface-2)",
              border: "1px solid var(--gc-border-subtle)",
              borderRadius: "var(--gc-radius-sm)",
              maxHeight: 440,
              overflowY: "auto",
            }}
          >
            <SimpleMarkdown source={body} />
          </div>
        </div>
      </Field>

      {draftModalOpen && (
        <CommitDraftModal
          versionHint={version}
          onClose={() => setDraftModalOpen(false)}
          onApply={(draft) => {
            // Only overwrite fields if they're empty so we don't clobber edits.
            if (!title.trim() || confirm("Replace the current title?")) setTitle(draft.title);
            if (!summary.trim() || confirm("Replace the current summary?")) setSummary(draft.summary);
            setBody(draft.bodyMarkdown);
            setDraftModalOpen(false);
          }}
        />
      )}
    </GCModal>
  );
}

function CommitDraftModal({
  versionHint,
  onClose,
  onApply,
}: {
  versionHint: string;
  onClose: () => void;
  onApply: (draft: { title: string; summary: string; bodyMarkdown: string }) => void;
}) {
  const [pasted, setPasted] = useState("");
  const [draft, setDraft] = useState<ReturnType<typeof generateDraftFromCommits> | null>(null);

  const generate = () => {
    const result = generateDraftFromCommits(pasted, versionHint || undefined);
    setDraft(result);
  };

  return (
    <GCModal
      title="Generate from commits"
      subtitle="Paste your commits (one per line) — we'll turn them into plain-English release notes. Nothing leaves this browser."
      onClose={onClose}
      width={780}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            style={{ padding: "8px 16px", backgroundColor: "transparent", color: "var(--gc-text-secondary)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-sm)", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!pasted.trim()}
            onClick={generate}
            style={{
              padding: "8px 16px",
              backgroundColor: !pasted.trim() ? "var(--gc-surface-2)" : "var(--gc-surface)",
              color: !pasted.trim() ? "var(--gc-text-muted)" : "var(--gc-text-primary)",
              border: "1px solid var(--gc-border)",
              borderRadius: "var(--gc-radius-sm)",
              fontWeight: 600,
              cursor: !pasted.trim() ? "not-allowed" : "pointer",
            }}
          >
            Generate draft
          </button>
          <button
            type="button"
            disabled={!draft}
            onClick={() => draft && onApply({ title: draft.title, summary: draft.summary, bodyMarkdown: draft.bodyMarkdown })}
            style={{
              padding: "8px 22px",
              background: !draft ? "var(--gc-surface-2)" : "linear-gradient(135deg, var(--gc-gold), var(--gc-gold-bright))",
              color: !draft ? "var(--gc-text-muted)" : "var(--gc-ink)",
              border: "none",
              borderRadius: "var(--gc-radius-sm)",
              fontWeight: 600,
              cursor: !draft ? "not-allowed" : "pointer",
            }}
          >
            Apply to editor
          </button>
        </div>
      }
    >
      <Field
        label="Commits"
        hint={`Run "git log --oneline" (or copy from your PR description) and paste the lines here. We'll categorize them by area automatically.`}
      >
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={8}
          placeholder={`Examples:\nCarriers: drop Writing # column from master directory; clear leads\nInvite: full-role selector with founder gate\nlifeOS: system update + release notes`}
          style={{ ...inputStyle(), fontFamily: "var(--gc-font-mono, monospace)", fontSize: 12, resize: "vertical" }}
        />
      </Field>

      {draft && (
        <div style={{ marginTop: 16 }}>
          <div
            style={{
              fontSize: "var(--gc-text-xs)",
              letterSpacing: "var(--gc-tracking-wider)",
              textTransform: "uppercase",
              color: "var(--gc-text-muted)",
              marginBottom: 8,
              fontWeight: 600,
            }}
          >
            Preview — {draft.recognizedCount} of {draft.totalCount} lines categorized
          </div>
          <div
            style={{
              padding: 16,
              backgroundColor: "var(--gc-surface-2)",
              border: "1px solid var(--gc-border-subtle)",
              borderRadius: "var(--gc-radius-sm)",
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--gc-text-primary)" }}>{draft.title}</div>
            <div style={{ color: "var(--gc-text-secondary)", marginBottom: 12, fontSize: 14, lineHeight: 1.5 }}>{draft.summary}</div>
            <SimpleMarkdown source={draft.bodyMarkdown} />
          </div>
        </div>
      )}
    </GCModal>
  );
}

function PreviewModal({ versionString, onClose }: { versionString: string; onClose: () => void }) {
  const [release, setRelease] = useState<AdminRelease | null>(null);
  useEffect(() => {
    (async () => {
      const r = await fetch(`/api/lifeos/releases/${versionString}`, { credentials: "include" });
      if (r.ok) setRelease(await r.json());
    })();
  }, [versionString]);
  return (
    <GCModal title={`Preview lifeOS ${versionString}`} onClose={onClose} width={640}>
      {release ? (
        <>
          <div
            style={{
              fontSize: "var(--gc-text-xs)",
              letterSpacing: "var(--gc-tracking-wider)",
              textTransform: "uppercase",
              color: "var(--gc-gold)",
              fontWeight: 600,
              marginBottom: 4,
            }}
          >
            {release.highlight_label || `${release.release_type} release`}
          </div>
          <h3 style={{ fontFamily: "var(--gc-font-display)", fontSize: 22, color: "var(--gc-text-primary)", margin: "0 0 8px" }}>
            {release.title}
          </h3>
          <p style={{ color: "var(--gc-text-secondary)", margin: "0 0 16px", fontSize: 15, lineHeight: 1.5 }}>
            {release.summary}
          </p>
          {release.body_markdown && <SimpleMarkdown source={release.body_markdown} />}
        </>
      ) : (
        <p style={{ color: "var(--gc-text-muted)", textAlign: "center", padding: 24 }}>Loading…</p>
      )}
    </GCModal>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: "var(--gc-text-xs)",
          letterSpacing: "var(--gc-tracking-wider)",
          textTransform: "uppercase",
          color: "var(--gc-text-muted)",
          marginBottom: 4,
          fontWeight: 600,
        }}
      >
        {label}
      </label>
      {children}
      {hint && <div style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function inputStyle(): React.CSSProperties {
  return {
    width: "100%",
    padding: "var(--gc-space-2) var(--gc-space-3)",
    backgroundColor: "var(--gc-surface-2)",
    border: "1px solid var(--gc-border)",
    borderRadius: "var(--gc-radius-sm)",
    color: "var(--gc-text-primary)",
    fontFamily: "var(--gc-font-body)",
    fontSize: "var(--gc-text-md)",
    outline: "none",
  };
}
