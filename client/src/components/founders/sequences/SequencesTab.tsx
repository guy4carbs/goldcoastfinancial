/**
 * SequencesTab — the list of email sequences with inline row actions
 * (edit / enroll / view enrollments / toggle active / delete). Restyled to the
 * Gold Coast design language using GCDataTable. Ported from heritage
 * SequencesTable.
 */

import { useState } from "react";
import { Workflow, Pencil, UserPlus, Users, Power, PowerOff, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  GCDataTable,
  GCPrimaryButton,
  GCStatusBadge,
  type Column,
} from "@/components/gc";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useSequences,
  useUpdateSequence,
  useDeleteSequence,
  type Sequence,
} from "@/hooks/useSequences";
import { SequenceEditorModal } from "./SequenceEditorModal";
import { EnrollLeadModal } from "./EnrollLeadModal";
import { EnrollmentsModal } from "./EnrollmentsModal";

export function SequencesTab() {
  const { toast } = useToast();
  const { data: sequences = [], isLoading } = useSequences();
  const updateMutation = useUpdateSequence();
  const deleteMutation = useDeleteSequence();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Sequence | null>(null);
  const [enrollFor, setEnrollFor] = useState<Sequence | null>(null);
  const [enrollmentsFor, setEnrollmentsFor] = useState<Sequence | null>(null);

  const openNew = () => {
    setEditing(null);
    setEditorOpen(true);
  };
  const openEdit = (seq: Sequence) => {
    setEditing(seq);
    setEditorOpen(true);
  };

  const toggleActive = async (seq: Sequence) => {
    try {
      await updateMutation.mutateAsync({ id: seq.id, data: { isActive: !seq.isActive } });
      toast({ title: seq.isActive ? "Sequence deactivated" : "Sequence activated" });
    } catch (err: any) {
      toast({ title: err?.message || "Failed to update sequence", variant: "destructive" });
    }
  };

  const handleDelete = async (seq: Sequence) => {
    if (!confirm(`Delete "${seq.name}"? This deactivates the sequence.`)) return;
    try {
      await deleteMutation.mutateAsync(seq.id);
      toast({ title: "Sequence deleted" });
    } catch (err: any) {
      toast({ title: err?.message || "Failed to delete sequence", variant: "destructive" });
    }
  };

  const columns: Column<Sequence>[] = [
    {
      key: "name",
      label: "Sequence",
      render: (_v, seq) => (
        <div className="min-w-0">
          <p style={{ fontWeight: 600, color: "var(--gc-text-primary)" }}>{seq.name}</p>
          {seq.description && (
            <p
              className="truncate max-w-xs"
              style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}
            >
              {seq.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "steps",
      label: "Steps",
      align: "right",
      render: (_v, seq) => seq.steps?.length ?? 0,
    },
    {
      key: "enrollments",
      label: "Enrollments",
      render: (_v, seq) => (
        <span>
          <span style={{ color: "var(--gc-status-active)", fontWeight: 600 }}>
            {seq.activeEnrollments ?? 0}
          </span>{" "}
          / {seq.totalEnrollments ?? 0}
        </span>
      ),
    },
    {
      key: "isActive",
      label: "Status",
      render: (v) => <GCStatusBadge status={v ? "active" : "suspended"} />,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_v, seq) => (
        <div className="flex items-center justify-end gap-1">
          <IconBtn title="Edit" onClick={() => openEdit(seq)}>
            <Pencil className="w-4 h-4" />
          </IconBtn>
          <IconBtn title="Enroll lead" onClick={() => setEnrollFor(seq)}>
            <UserPlus className="w-4 h-4" />
          </IconBtn>
          <IconBtn title="View enrollments" onClick={() => setEnrollmentsFor(seq)}>
            <Users className="w-4 h-4" />
          </IconBtn>
          <IconBtn title={seq.isActive ? "Deactivate" : "Activate"} onClick={() => toggleActive(seq)}>
            {seq.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </IconBtn>
          <IconBtn title="Delete" danger onClick={() => handleDelete(seq)}>
            <Trash2 className="w-4 h-4" />
          </IconBtn>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <GCPrimaryButton onClick={openNew} icon={<Plus className="w-4 h-4" />}>
          New Sequence
        </GCPrimaryButton>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : sequences.length === 0 ? (
        <div
          className="py-12 text-center"
          style={{
            backgroundColor: "var(--gc-surface)",
            border: "1px solid var(--gc-border)",
            borderRadius: "var(--gc-radius-md)",
          }}
        >
          <Workflow className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: "var(--gc-text-muted)" }} />
          <p style={{ fontSize: "var(--gc-text-base)", color: "var(--gc-text-secondary)" }}>
            No sequences yet
          </p>
          <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)", marginTop: 4, marginBottom: 16 }}>
            Build a drip campaign to automatically nurture your leads.
          </p>
          <div className="inline-flex">
            <GCPrimaryButton onClick={openNew}>Create your first sequence</GCPrimaryButton>
          </div>
        </div>
      ) : (
        <GCDataTable
          columns={columns}
          data={sequences}
          searchable
          searchPlaceholder="Search sequences…"
          pageSize={10}
        />
      )}

      {editorOpen && (
        <SequenceEditorModal sequence={editing} onClose={() => setEditorOpen(false)} />
      )}
      {enrollFor && <EnrollLeadModal sequence={enrollFor} onClose={() => setEnrollFor(null)} />}
      {enrollmentsFor && (
        <EnrollmentsModal sequence={enrollmentsFor} onClose={() => setEnrollmentsFor(null)} />
      )}
    </div>
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
