/**
 * SequencesTable — list of sequences with inline row actions.
 */

import { toast } from "sonner";
import { Workflow, Pencil, UserPlus, Users, Power, PowerOff, Trash2 } from "lucide-react";
import { RADIUS, TYPE, COLORS } from "@/lib/heritageDesignSystem";
import { AdminGlassCard, AdminEmptyState } from "@/components/admin/AdminHeritagePrimitives";
import {
  useDeleteSequence,
  useUpdateSequence,
  type Sequence,
} from "@/hooks/useSequences";
import { TableSkeleton } from "./shared";

interface Props {
  sequences: Sequence[];
  isLoading: boolean;
  onNew: () => void;
  onEdit: (seq: Sequence) => void;
  onEnroll: (seq: Sequence) => void;
  onViewEnrollments: (seq: Sequence) => void;
}

export function SequencesTable({
  sequences,
  isLoading,
  onNew,
  onEdit,
  onEnroll,
  onViewEnrollments,
}: Props) {
  const deleteMutation = useDeleteSequence();
  const updateMutation = useUpdateSequence();

  const toggleActive = async (seq: Sequence) => {
    try {
      await updateMutation.mutateAsync({ id: seq.id, data: { isActive: !seq.isActive } });
      toast.success(seq.isActive ? "Sequence deactivated" : "Sequence activated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update sequence");
    }
  };

  const handleDelete = async (seq: Sequence) => {
    if (!confirm(`Delete "${seq.name}"? This deactivates the sequence.`)) return;
    try {
      await deleteMutation.mutateAsync(seq.id);
      toast.success("Sequence deleted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete sequence");
    }
  };

  return (
    <AdminGlassCard style={{ padding: 0, overflow: "hidden" }}>
      {isLoading ? (
        <TableSkeleton />
      ) : sequences.length === 0 ? (
        <AdminEmptyState
          icon={Workflow}
          title="No sequences yet"
          description="Build a drip campaign to automatically nurture your leads."
          action={
            <button onClick={onNew} style={primaryActionStyle}>
              Create your first sequence
            </button>
          }
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: COLORS.gray[50], borderBottom: `1px solid ${COLORS.gray[200]}` }}>
              <tr>
                <Th>Sequence</Th>
                <Th className="hidden md:table-cell">Steps</Th>
                <Th className="hidden md:table-cell">Enrollments</Th>
                <Th>Status</Th>
                <th className="px-4 py-3 text-right uppercase tracking-wider" style={thStyle}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sequences.map((seq) => (
                <tr key={seq.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p style={{ fontWeight: 600, color: COLORS.gray[900], fontSize: TYPE.meta }}>{seq.name}</p>
                    {seq.description && (
                      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }} className="truncate max-w-xs">
                        {seq.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell" style={cellStyle}>
                    {seq.steps?.length ?? 0}
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell" style={cellStyle}>
                    <span style={{ color: COLORS.semantic.success, fontWeight: 600 }}>
                      {seq.activeEnrollments ?? 0}
                    </span>{" "}
                    / {seq.totalEnrollments ?? 0}
                  </td>
                  <td className="px-4 py-4">
                    {seq.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <IconBtn title="Edit" onClick={() => onEdit(seq)}>
                        <Pencil className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn title="Enroll lead" onClick={() => onEnroll(seq)}>
                        <UserPlus className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn title="View enrollments" onClick={() => onViewEnrollments(seq)}>
                        <Users className="w-4 h-4" />
                      </IconBtn>
                      <IconBtn
                        title={seq.isActive ? "Deactivate" : "Activate"}
                        onClick={() => toggleActive(seq)}
                      >
                        {seq.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </IconBtn>
                      <IconBtn title="Delete" onClick={() => handleDelete(seq)} danger>
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
  );
}

const thStyle: React.CSSProperties = {
  fontSize: TYPE.micro,
  fontWeight: 600,
  color: COLORS.gray[500],
};

const cellStyle: React.CSSProperties = { fontSize: TYPE.meta, color: COLORS.gray[600] };

const primaryActionStyle: React.CSSProperties = {
  padding: "8px 20px",
  borderRadius: RADIUS.button,
  background: COLORS.primary.violet[600],
  color: "white",
  fontSize: TYPE.meta,
  fontWeight: 500,
  border: "none",
  cursor: "pointer",
};

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
