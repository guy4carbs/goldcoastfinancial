/**
 * SequenceEditorDrawer — create + edit an email sequence.
 *
 * Dynamic step builder: each step picks a template (name + subject preview),
 * delay days/hours (min 0), and can be removed. Client-side validation requires
 * >= 1 step and every step to have a templateId.
 */

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Mail, GripVertical } from "lucide-react";
import { RADIUS, TYPE, COLORS, GRID } from "@/lib/heritageDesignSystem";
import {
  useCreateSequence,
  useUpdateSequence,
  type Sequence,
  type SequenceStep,
} from "@/hooks/useSequences";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import {
  GlassDrawer,
  modalInputStyle,
  modalLabelStyle,
  primaryBtnStyle,
  ghostBtnStyle,
} from "./shared";

interface Props {
  sequence?: Sequence | null;
  onClose: () => void;
}

const emptyStep: SequenceStep = { templateId: "", delayDays: 1, delayHours: 0 };

export function SequenceEditorDrawer({ sequence, onClose }: Props) {
  const isEdit = !!sequence;
  const { data: templates = [], isLoading: templatesLoading } = useEmailTemplates();
  const createMutation = useCreateSequence();
  const updateMutation = useUpdateSequence();

  const [name, setName] = useState(sequence?.name ?? "");
  const [description, setDescription] = useState(sequence?.description ?? "");
  const [triggerEvent, setTriggerEvent] = useState(sequence?.triggerEvent ?? "");
  const [steps, setSteps] = useState<SequenceStep[]>(
    sequence?.steps?.length ? sequence.steps.map((s) => ({ ...s })) : [{ ...emptyStep }],
  );

  const saving = createMutation.isPending || updateMutation.isPending;
  const activeTemplates = templates.filter((t) => t.isActive);

  const updateStep = (index: number, patch: Partial<SequenceStep>) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const addStep = () => setSteps((prev) => [...prev, { ...emptyStep }]);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Sequence name is required");
      return;
    }
    if (steps.length === 0) {
      toast.error("Add at least one step");
      return;
    }
    if (steps.some((s) => !s.templateId)) {
      toast.error("Every step needs a template selected");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      triggerEvent: triggerEvent.trim() || undefined,
      steps: steps.map((s) => ({
        templateId: s.templateId,
        delayDays: Math.max(0, Math.floor(Number(s.delayDays) || 0)),
        delayHours: Math.max(0, Math.floor(Number(s.delayHours) || 0)),
        ...(s.condition ? { condition: s.condition } : {}),
      })),
    };

    try {
      if (isEdit && sequence) {
        await updateMutation.mutateAsync({ id: sequence.id, data: payload });
        toast.success("Sequence updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Sequence created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to save sequence");
    }
  };

  return (
    <GlassDrawer title={isEdit ? "Edit Sequence" : "New Sequence"} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label style={modalLabelStyle}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="focus:ring-2 focus:ring-primary focus:border-transparent"
            style={modalInputStyle}
            placeholder="e.g. New Lead Nurture"
          />
        </div>

        <div>
          <label style={modalLabelStyle}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            style={modalInputStyle}
            placeholder="What this sequence is for..."
          />
        </div>

        <div>
          <label style={modalLabelStyle}>Trigger Event</label>
          <select
            value={triggerEvent}
            onChange={(e) => setTriggerEvent(e.target.value)}
            className="bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
            style={modalInputStyle}
          >
            <option value="">Manual enrollment only</option>
            <option value="lead_created">Lead created</option>
            <option value="quote_sent">Quote sent</option>
            <option value="appointment_missed">Appointment missed</option>
            <option value="policy_lapsed">Policy lapsed</option>
          </select>
        </div>

        {/* Steps builder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label style={{ ...modalLabelStyle, marginBottom: 0 }}>Steps</label>
            <span style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
              {steps.length} step{steps.length === 1 ? "" : "s"}
            </span>
          </div>

          {templatesLoading ? (
            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>Loading templates…</p>
          ) : activeTemplates.length === 0 ? (
            <div
              className="p-3 text-center"
              style={{
                background: COLORS.accent.amber[50],
                border: `1px solid ${COLORS.accent.amber[200]}`,
                borderRadius: RADIUS.input,
              }}
            >
              <p style={{ fontSize: TYPE.caption, color: COLORS.accent.amber[700] }}>
                No active templates yet. Create one in the Templates tab first.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps.map((step, index) => {
                const tmpl = templates.find((t) => t.id === step.templateId);
                return (
                  <div
                    key={index}
                    className="p-3 space-y-3"
                    style={{
                      border: `1px solid ${COLORS.gray[200]}`,
                      borderRadius: RADIUS.input,
                      background: COLORS.gray[50],
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4" style={{ color: COLORS.gray[300] }} />
                      <span
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: RADIUS.pill,
                          background: COLORS.primary.violet[100],
                          color: COLORS.primary.violet[700],
                        }}
                      >
                        {index + 1}
                      </span>
                      <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}>
                        Step {index + 1}
                      </span>
                      <button
                        onClick={() => removeStep(index)}
                        className="ml-auto p-1 hover:bg-red-50 text-red-500"
                        style={{ borderRadius: RADIUS.input }}
                        aria-label="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <select
                      value={step.templateId}
                      onChange={(e) => updateStep(index, { templateId: e.target.value })}
                      className="bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                      style={modalInputStyle}
                    >
                      <option value="">Select a template…</option>
                      {activeTemplates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    {tmpl && (
                      <div
                        className="flex items-start gap-2 px-2 py-1.5"
                        style={{ background: "white", borderRadius: RADIUS.input }}
                      >
                        <Mail className="w-3.5 h-3.5 mt-0.5" style={{ color: COLORS.gray[400] }} />
                        <span style={{ fontSize: TYPE.caption, color: COLORS.gray[600] }}>
                          {tmpl.subject}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ ...modalLabelStyle, fontSize: TYPE.caption }}>Delay (days)</label>
                        <input
                          type="number"
                          min={0}
                          value={step.delayDays}
                          onChange={(e) => updateStep(index, { delayDays: Number(e.target.value) })}
                          className="focus:ring-2 focus:ring-primary focus:border-transparent"
                          style={modalInputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ ...modalLabelStyle, fontSize: TYPE.caption }}>Delay (hours)</label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={step.delayHours}
                          onChange={(e) => updateStep(index, { delayHours: Number(e.target.value) })}
                          className="focus:ring-2 focus:ring-primary focus:border-transparent"
                          style={modalInputStyle}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addStep}
                className="w-full flex items-center justify-center gap-2 py-2 hover:bg-violet-50"
                style={{
                  border: `1px dashed ${COLORS.primary.violet[300]}`,
                  borderRadius: RADIUS.input,
                  color: COLORS.primary.violet[600],
                  fontSize: TYPE.meta,
                  fontWeight: 500,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <Plus className="w-4 h-4" />
                Add step
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2" style={{ borderTop: `1px solid ${COLORS.gray[200]}`, paddingTop: GRID.spacing.sm }}>
          <button onClick={onClose} className="flex-1 hover:bg-gray-200" style={ghostBtnStyle}>
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 disabled:opacity-50"
            style={primaryBtnStyle}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Sequence"}
          </button>
        </div>
      </div>
    </GlassDrawer>
  );
}
