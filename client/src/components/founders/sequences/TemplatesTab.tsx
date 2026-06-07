/**
 * TemplatesTab — email template table + create/edit modal + seed-starter
 * button. Restyled to the Gold Coast design language using GCDataTable /
 * GCModal. Ported from heritage TemplatesTab.
 */

import { useState } from "react";
import { FileText, Pencil, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  GCDataTable,
  GCModal,
  GCPrimaryButton,
  GCSecondaryButton,
  GCSelect,
  GCStatusBadge,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useEmailTemplates,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
  useSeedTemplates,
  type EmailTemplate,
} from "@/hooks/useEmailTemplates";
import {
  SEQ_LABEL_STYLE,
  SEQ_INPUT_STYLE,
  TEMPLATE_CATEGORY_OPTIONS,
  TEMPLATE_VARIABLE_HINTS,
  formatDateTime,
} from "./shared";

export function TemplatesTab() {
  const { toast } = useToast();
  const { data: templates = [], isLoading } = useEmailTemplates();
  const deleteMutation = useDeleteTemplate();
  const seedMutation = useSeedTemplates();

  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [showEditor, setShowEditor] = useState(false);
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
      toast({ title: "Template deleted" });
    } catch (err: any) {
      toast({ title: err?.message || "Failed to delete template", variant: "destructive" });
    }
  };

  const handleSeed = async () => {
    try {
      const result = await seedMutation.mutateAsync();
      if (result.forbidden) {
        setSeedForbidden(true);
        return;
      }
      toast({
        title: result.created
          ? `Seeded ${result.created} starter templates`
          : "Starter templates added",
      });
    } catch (err: any) {
      toast({ title: err?.message || "Failed to seed templates", variant: "destructive" });
    }
  };

  const columns: Column<EmailTemplate>[] = [
    {
      key: "name",
      label: "Name",
      render: (_v, t) => (
        <span style={{ fontWeight: 600, color: "var(--gc-text-primary)" }}>{t.name}</span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      render: (v) => <span className="truncate inline-block max-w-xs">{String(v)}</span>,
    },
    {
      key: "category",
      label: "Category",
      render: (v) =>
        v ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs"
            style={{ backgroundColor: "var(--gc-surface-2)", color: "var(--gc-text-secondary)" }}
          >
            {String(v)}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (v) => <GCStatusBadge status={v ? "active" : "suspended"} />,
    },
    { key: "updatedAt", label: "Updated", render: (v) => formatDateTime(String(v)) },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_v, t) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="Edit" onClick={() => openEdit(t)}>
            <Pencil className="w-4 h-4" />
          </IconBtn>
          <IconBtn title="Delete" danger onClick={() => handleDelete(t)}>
            <Trash2 className="w-4 h-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {!seedForbidden && (
          <GCSecondaryButton
            disabled={seedMutation.isPending}
            onClick={handleSeed}
            icon={<Sparkles className="w-4 h-4" />}
          >
            {seedMutation.isPending ? "Seeding…" : "Seed starter templates"}
          </GCSecondaryButton>
        )}
        <GCPrimaryButton onClick={openCreate} icon={<FileText className="w-4 h-4" />}>
          New Template
        </GCPrimaryButton>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <GCDataTable columns={columns} data={templates} searchable searchPlaceholder="Search templates…" pageSize={10} />
      )}

      {showEditor && (
        <TemplateEditorModal template={editing} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}

function TemplateEditorModal({
  template,
  onClose,
}: {
  template: EmailTemplate | null;
  onClose: () => void;
}) {
  const isEdit = !!template;
  const { toast } = useToast();
  const createMutation = useCreateTemplate();
  const updateMutation = useUpdateTemplate();

  const [name, setName] = useState(template?.name ?? "");
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState(template?.bodyHtml ?? "");
  const [bodyText, setBodyText] = useState(template?.bodyText ?? "");
  const [category, setCategory] = useState(template?.category ?? "follow_up");

  const saving = createMutation.isPending || updateMutation.isPending;
  const mono = "ui-monospace, SFMono-Regular, Menlo, monospace";

  const handleSave = async () => {
    if (!name.trim()) return toast({ title: "Template name is required", variant: "destructive" });
    if (!subject.trim()) return toast({ title: "Subject is required", variant: "destructive" });
    if (!bodyHtml.trim()) return toast({ title: "Email body is required", variant: "destructive" });

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
        toast({ title: "Template updated" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Template created" });
      }
      onClose();
    } catch (err: any) {
      toast({ title: err?.message || "Failed to save template", variant: "destructive" });
    }
  };

  return (
    <GCModal
      title={isEdit ? "Edit Template" : "New Template"}
      subtitle="Compose a reusable email. Use the variables below for personalisation."
      icon={<FileText className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
      onClose={onClose}
      width={640}
      footer={
        <div className="flex gap-3">
          <GCSecondaryButton fullWidth onClick={onClose}>
            Cancel
          </GCSecondaryButton>
          <GCPrimaryButton fullWidth disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
          </GCPrimaryButton>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label style={SEQ_LABEL_STYLE}>Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={SEQ_INPUT_STYLE}
              placeholder="e.g. Day 1 Welcome"
            />
          </div>
          <div>
            <label style={SEQ_LABEL_STYLE}>Category</label>
            <GCSelect
              value={category ?? "follow_up"}
              onValueChange={setCategory}
              options={TEMPLATE_CATEGORY_OPTIONS}
              fullWidth
            />
          </div>
        </div>

        <div>
          <label style={SEQ_LABEL_STYLE}>Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            style={SEQ_INPUT_STYLE}
            placeholder="Welcome to Gold Coast, {{lead.firstName}}"
          />
        </div>

        <div>
          <label style={SEQ_LABEL_STYLE}>Body (HTML) *</label>
          <textarea
            value={bodyHtml}
            onChange={(e) => setBodyHtml(e.target.value)}
            rows={8}
            style={{ ...SEQ_INPUT_STYLE, fontFamily: mono, fontSize: "var(--gc-text-sm)", resize: "vertical" }}
            placeholder="<p>Hi {{lead.firstName}},</p>"
          />
        </div>

        <div>
          <label style={SEQ_LABEL_STYLE}>Body (plain text)</label>
          <textarea
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={3}
            style={{ ...SEQ_INPUT_STYLE, fontFamily: mono, fontSize: "var(--gc-text-sm)", resize: "vertical" }}
            placeholder="Optional plain-text fallback…"
          />
        </div>

        <div
          className="px-3 py-2"
          style={{ backgroundColor: "var(--gc-surface-2)", borderRadius: "var(--gc-radius-sm)" }}
        >
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginBottom: 4 }}>
            Available variables:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLE_HINTS.map((v) => (
              <code
                key={v}
                style={{
                  fontSize: "var(--gc-text-xs)",
                  backgroundColor: "var(--gc-surface)",
                  border: "1px solid var(--gc-border)",
                  borderRadius: "var(--gc-radius-sm)",
                  padding: "2px 6px",
                  color: "var(--gc-gold)",
                }}
              >
                {v}
              </code>
            ))}
          </div>
        </div>
      </div>
    </GCModal>
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
      className="p-1.5"
      style={{
        borderRadius: "var(--gc-radius-sm)",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: danger ? "var(--gc-status-terminated)" : "var(--gc-text-muted)",
      }}
    >
      {children}
    </button>
  );
}
