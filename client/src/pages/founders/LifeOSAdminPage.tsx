import { useEffect, useState } from "react";
import { Plus, Edit2, Send, Archive, Trash2, Eye } from "lucide-react";
import { GCModal } from "@/components/gc/GCModal";
import { SimpleMarkdown } from "@/components/lifeos/SimpleMarkdown";

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

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div style={{ padding: "var(--gc-space-6)", maxWidth: 1200, margin: "0 auto" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: "var(--gc-space-5)" }}>
        <div>
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
            Founders only
          </div>
          <h1
            style={{
              fontFamily: "var(--gc-font-display)",
              fontSize: 28,
              color: "var(--gc-text-primary)",
              margin: 0,
            }}
          >
            lifeOS releases
          </h1>
          <p style={{ color: "var(--gc-text-secondary)", margin: "6px 0 0", fontSize: "var(--gc-text-sm)" }}>
            Author release notes, pick a version, publish when the deploy lands.
          </p>
        </div>
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
          }}
        >
          <Plus className="w-4 h-4" /> New release
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--gc-text-muted)", fontSize: 14 }}>Loading…</p>
      ) : rows.length === 0 ? (
        <div
          style={{
            padding: "48px 24px",
            textAlign: "center",
            backgroundColor: "var(--gc-surface)",
            border: "1px dashed var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
          }}
        >
          <p style={{ color: "var(--gc-text-muted)", fontSize: 14, margin: 0 }}>
            No releases yet. Click <strong>New release</strong> to write the first one.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <div
              key={r.id}
              style={{
                padding: "14px 18px",
                backgroundColor: "var(--gc-surface)",
                border: "1px solid var(--gc-border)",
                borderRadius: "var(--gc-radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--gc-font-mono, monospace)",
                  fontSize: 12,
                  padding: "3px 10px",
                  borderRadius: "var(--gc-radius-full, 999px)",
                  backgroundColor: "var(--gc-surface-2)",
                  color: "var(--gc-text-muted)",
                  border: "1px solid var(--gc-border-subtle)",
                  flexShrink: 0,
                }}
              >
                {r.version}
              </span>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: "var(--gc-radius-full, 999px)",
                  color:
                    r.status === "published" ? "var(--gc-status-active, #6cd1a5)"
                    : r.status === "draft" ? "var(--gc-gold)"
                    : "var(--gc-text-muted)",
                  backgroundColor:
                    r.status === "published" ? "color-mix(in srgb, var(--gc-status-active, #6cd1a5) 14%, transparent)"
                    : r.status === "draft" ? "color-mix(in srgb, var(--gc-gold) 14%, transparent)"
                    : "var(--gc-surface-2)",
                  border: "1px solid var(--gc-border-subtle)",
                }}
              >
                {r.status}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: "var(--gc-text-primary)",
                    fontSize: "var(--gc-text-md)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
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
                  }}
                >
                  {r.summary}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <IconButton title="Preview" onClick={() => setPreviewVersion(r.version)}><Eye className="w-3.5 h-3.5" /></IconButton>
                <IconButton title="Edit" disabled={r.status !== "draft"} onClick={() => setEditingId(r.id)}><Edit2 className="w-3.5 h-3.5" /></IconButton>
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
            </div>
          ))}
        </div>
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
          <select
            value={releaseType}
            onChange={(e) => setReleaseType(e.target.value as "major" | "minor" | "patch")}
            style={inputStyle()}
          >
            <option value="patch">Patch — bug fixes</option>
            <option value="minor">Minor — new features</option>
            <option value="major">Major — flagship</option>
          </select>
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
