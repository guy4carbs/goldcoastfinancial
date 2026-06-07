/**
 * TemplatesTab — email template table + create/edit dialog + seed-starter button.
 */

import { useState } from "react";
import { toast } from "sonner";
import { FileText, Pencil, Trash2, Sparkles } from "lucide-react";
import { RADIUS, TYPE, COLORS, GRID } from "@/lib/heritageDesignSystem";
import { AdminGlassCard, AdminEmptyState } from "@/components/admin/AdminHeritagePrimitives";
import {
  useEmailTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useSeedTemplates,
  type EmailTemplate,
} from "@/hooks/useEmailTemplates";
import {
  GlassModal,
  TableSkeleton,
  modalInputStyle,
  modalLabelStyle,
  primaryBtnStyle,
  ghostBtnStyle,
  formatDateTime,
} from "./shared";

const CATEGORY_OPTIONS = [
  { value: "follow_up", label: "Follow up" },
  { value: "drip_sequence", label: "Drip sequence" },
  { value: "nurture", label: "Nurture" },
  { value: "announcement", label: "Announcement" },
  { value: "welcome", label: "Welcome" },
  { value: "re_engagement", label: "Re-engagement" },
];

const VARIABLE_HINTS = ["{{lead.firstName}}", "{{lead.lastName}}", "{{lead.email}}", "{{agent.name}}", "{{agent.email}}"];

export function TemplatesTab() {
  const { data: templates = [], isLoading } = useEmailTemplates();
  const deleteMutation = useDeleteTemplate();
  const seedMutation = useSeedTemplates();

  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  // Hide the seed button once we learn the user is not an admin (403).
  const [seedForbidden, setSeedForbidden] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setShowEditor(true);
  };
  const openEdit = (t: EmailTemplate) => {
    setEditing(t);
    setShowEditor(true);
  };

  const handleDelete = async (t: EmailTemplate) => {
    if (!confirm(`Delete template "${t.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(t.id);
      toast.success("Template deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete template");
    }
  };

  const handleSeed = async () => {
    try {
      const result = await seedMutation.mutateAsync();
      if (result.forbidden) {
        // Non-admin — quietly hide the button, no scary error.
        setSeedForbidden(true);
        return;
      }
      toast.success(
        result.created ? `Seeded ${result.created} starter templates` : "Starter templates added",
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to seed templates");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {!seedForbidden && (
          <button
            onClick={handleSeed}
            disabled={seedMutation.isPending}
            className="inline-flex items-center gap-2 hover:bg-violet-50 disabled:opacity-50"
            style={{
              padding: "8px 16px",
              borderRadius: RADIUS.button,
              border: `1px solid ${COLORS.primary.violet[200]}`,
              color: COLORS.primary.violet[600],
              fontSize: TYPE.meta,
              fontWeight: 500,
              background: "white",
              cursor: "pointer",
            }}
          >
            <Sparkles className="w-4 h-4" />
            {seedMutation.isPending ? "Seeding…" : "Seed starter templates"}
          </button>
        )}
        <button onClick={openCreate} className="inline-flex items-center gap-2" style={primaryBtnStyle}>
          <FileText className="w-4 h-4" />
          New Template
        </button>
      </div>

      <AdminGlassCard style={{ padding: 0, overflow: "hidden" }}>
        {isLoading ? (
          <TableSkeleton />
        ) : templates.length === 0 ? (
          <AdminEmptyState
            icon={FileText}
            title="No templates yet"
            description={
              seedForbidden
                ? "Create a template to start building sequences."
                : 'Use "Seed starter templates" above for a quick start, or create your own.'
            }
            action={
              <button onClick={openCreate} style={primaryBtnStyle}>
                Create a template
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: COLORS.gray[50], borderBottom: `1px solid ${COLORS.gray[200]}` }}>
                <tr>
                  <Th>Name</Th>
                  <Th className="hidden md:table-cell">Subject</Th>
                  <Th className="hidden lg:table-cell">Category</Th>
                  <Th>Status</Th>
                  <Th className="hidden md:table-cell">Updated</Th>
                  <th className="px-4 py-3 text-right uppercase tracking-wider" style={thStyle}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templates.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.meta }}>{t.name}</p>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell" style={cellStyle}>
                      <span className="truncate max-w-xs inline-block">{t.subject}</span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell" style={cellStyle}>
                      {t.category ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                          style={{ background: COLORS.gray[100], color: COLORS.gray[600] }}
                        >
                          {t.category}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-4">
                      {t.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell" style={cellStyle}>
                      {formatDateTime(t.updatedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconBtn title="Edit" onClick={() => openEdit(t)}>
                          <Pencil className="w-4 h-4" />
                        </IconBtn>
                        <IconBtn title="Delete" onClick={() => handleDelete(t)} danger>
                          <Trash2 className="w-4 h-4" />
                        </IconBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminGlassCard>

      {showEditor && <TemplateEditorDialog template={editing} onClose={() => setShowEditor(false)} />}
    </div>
  );
}

// =============================================================================
// TEMPLATE EDITOR DIALOG
// =============================================================================

function TemplateEditorDialog({ template, onClose }: { template: EmailTemplate | null; onClose: () => void }) {
  const isEdit = !!template;
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();

  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(template?.bodyHtml ?? "");
  const [bodyText, setBodyText] = useState(template?.bodyText ?? "");
  const [category, setCategory] = useState(template?.category ?? "follow_up");

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Template name is required");
    if (!subject.trim()) return toast.error("Subject is required");
    if (!bodyHtml.trim()) return toast.error("Email body is required");

    const payload = {
      name: name.trim(),
      subject: subject.trim(),
      bodyHtml,
      bodyText: bodyText.trim() || undefined,
      category,
    };

    try {
      if (isEdit && template) {
        await updateMutation.mutateAsync({ id: template.id, data: payload });
        toast.success("Template updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Template created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save template");
    }
  };

  return (
    <GlassModal title={isEdit ? "Edit Template" : "New Template"} onClose={onClose} maxWidth="max-w-2xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={modalLabelStyle}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="focus:ring-2 focus:ring-primary focus:border-transparent"
              style={modalInputStyle}
              placeholder="e.g. Day 1 Welcome"
            />
          </div>
          <div>
            <label style={modalLabelStyle}>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
              style={modalInputStyle}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={modalLabelStyle}>Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="focus:ring-2 focus:ring-primary focus:border-transparent"
            style={modalInputStyle}
            placeholder="Welcome to Heritage, {{lead.firstName}}"
          />
        </div>

        <div>
          <label style={modalLabelStyle}>Body (HTML) *</label>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={8}
            className="focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            style={{ ...modalInputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: TYPE.caption }}
            placeholder="<p>Hi {{lead.firstName}},</p>"
          />
        </div>

        <div>
          <label style={modalLabelStyle}>Body (plain text)</label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={3}
            className="focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            style={{ ...modalInputStyle, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: TYPE.caption }}
            placeholder="Optional plain-text fallback…"
          />
        </div>

        <div
          className="px-3 py-2"
          style={{ background: COLORS.gray[50], borderRadius: RADIUS.input }}
        >
          <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginBottom: 4 }}>
            Available variables:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {VARIABLE_HINTS.map((v) => (
              <code
                key={v}
                style={{
                  fontSize: TYPE.micro,
                  background: "white",
                  border: `1px solid ${COLORS.gray[200]}`,
                  borderRadius: RADIUS.input,
                  padding: "2px 6px",
                  color: COLORS.primary.violet[600],
                }}
              >
                {v}
              </code>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${COLORS.gray[200]}`, paddingTop: GRID.spacing.sm }}>
          <button onClick={onClose} className="flex-1 hover:bg-gray-200" style={ghostBtnStyle}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving} className="flex-1 disabled:opacity-50" style={primaryBtnStyle}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
          </button>
        </div>
      </div>
    </GlassModal>
  );
}

// =============================================================================
// Small table helpers (local copies to keep this file self-contained)
// =============================================================================

const thStyle: React.CSSProperties = { fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[500] };
const cellStyle: React.CSSProperties = { fontSize: TYPE.meta, color: COLORS.gray[600] };

function Th({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-left uppercase tracking-wider ${className || ""}`} style={thStyle}>
      {children}
    </th>
  );
}

function IconBtn({
  children,
  title,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  title: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`p-1.5 rounded hover:bg-gray-100 ${danger ? "text-red-500 hover:bg-red-50" : "text-gray-500"}`}
      style={{ borderRadius: RADIUS.input, border: "none", background: "transparent", cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
