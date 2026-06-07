/**
 * SequenceEditorModal — create/edit an email sequence. Dynamic step builder:
 * each step picks a template, delay days/hours, and can be removed. Restyled to
 * the Gold Coast (GC) design language. Ported from heritage SequenceEditorDrawer.
 */

import { useState } from "react";
import { Plus, Trash2, Mail, Workflow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  GCModal,
  GCPrimaryButton,
  GCSecondaryButton,
  GCSelect,
} from "@/components/gc";
import {
  useCreateSequence,
  useUpdateSequence,
  type Sequence,
  type SequenceStep,
} from "@/hooks/useSequences";
import { useEmailTemplates } from "@/hooks/useEmailTemplates";
import {
  SEQ_LABEL_STYLE,
  SEQ_INPUT_STYLE,
  TRIGGER_EVENT_OPTIONS,
} from "./shared";

interface Props {
  sequence?: Sequence | null;
  onClose: () => void;
}

const emptyStep: SequenceStep = { templateId: "", delayDays: 1, delayHours: 0 };

export function SequenceEditorModal({ sequence, onClose }: Props) {
  const isEdit = !!sequence;
  const { toast } = useToast();
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
  const templateOptions = [
    { value: "", label: "Select a template…" },
    ...activeTemplates.map((t) => ({ value: t.id, label: t.name })),
  ];

  const updateStep = (index: number, patch: Partial<SequenceStep>) =>
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  const addStep = () => setSteps((prev) => [...prev, { ...emptyStep }]);
  const removeStep = (index: number) => setSteps((prev) => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!name.trim()) return toast({ title: "Sequence name is required", variant: "destructive" });
    if (steps.length === 0) return toast({ title: "Add at least one step", variant: "destructive" });
    if (steps.some((s) => !s.templateId))
      return toast({ title: "Every step needs a template selected", variant: "destructive" });

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
        toast({ title: "Sequence updated" });
      } else {
        await createMutation.mutateAsync(payload);
        toast({ title: "Sequence created" });
      }
      onClose();
    } catch (err: any) {
      toast({ title: err?.message || "Failed to save sequence", variant: "destructive" });
    }
  };

  return (
    <GCModal
      title={isEdit ? "Edit Sequence" : "New Sequence"}
      subtitle="Build a multi-step drip campaign from your email templates."
      icon={<Workflow className="w-5 h-5" style={{ color: "var(--gc-gold)" }} />}
      onClose={onClose}
      width={560}
      footer={
        <div className="flex gap-3">
          <GCSecondaryButton fullWidth onClick={onClose}>
            Cancel
          </GCSecondaryButton>
          <GCPrimaryButton fullWidth disabled={saving} onClick={handleSave}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Sequence"}
          </GCPrimaryButton>
        </div>
      }
    >
      <div className="space-y-5">
        <div>
          <label style={SEQ_LABEL_STYLE}>Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={SEQ_INPUT_STYLE}
            placeholder="e.g. New Lead Nurture"
            data-testid="input-sequence-name"
          />
        </div>

        <div>
          <label style={SEQ_LABEL_STYLE}>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            style={{ ...SEQ_INPUT_STYLE, resize: "none" }}
            placeholder="What this sequence is for…"
          />
        </div>

        <div>
          <label style={SEQ_LABEL_STYLE}>Trigger Event</label>
          <GCSelect
            value={triggerEvent}
            onValueChange={setTriggerEvent}
            options={TRIGGER_EVENT_OPTIONS}
            fullWidth
          />
        </div>

        {/* Steps builder */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label style={{ ...SEQ_LABEL_STYLE, marginBottom: 0 }}>Steps</label>
            <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>
              {steps.length} step{steps.length === 1 ? "" : "s"}
            </span>
          </div>

          {templatesLoading ? (
            <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-muted)" }}>
              Loading templates…
            </p>
          ) : activeTemplates.length === 0 ? (
            <div
              className="p-3 text-center"
              style={{
                backgroundColor: "color-mix(in srgb, var(--gc-status-warning) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--gc-status-warning) 30%, transparent)",
                borderRadius: "var(--gc-radius-sm)",
              }}
            >
              <p style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-status-warning)" }}>
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
                      border: "1px solid var(--gc-border)",
                      borderRadius: "var(--gc-radius-sm)",
                      backgroundColor: "var(--gc-surface-2)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="flex items-center justify-center text-xs font-semibold"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "var(--gc-radius-full)",
                          backgroundColor: "color-mix(in srgb, var(--gc-gold) 20%, transparent)",
                          color: "var(--gc-gold)",
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--gc-text-sm)",
                          fontWeight: 600,
                          color: "var(--gc-text-secondary)",
                        }}
                      >
                        Step {index + 1}
                      </span>
                      <button
                        onClick={() => removeStep(index)}
                        className="ml-auto p-1"
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--gc-status-terminated)",
                        }}
                        aria-label="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <GCSelect
                      value={step.templateId}
                      onValueChange={(v) => updateStep(index, { templateId: v })}
                      options={templateOptions}
                      fullWidth
                    />

                    {tmpl && (
                      <div
                        className="flex items-start gap-2 px-2 py-1.5"
                        style={{ backgroundColor: "var(--gc-surface)", borderRadius: "var(--gc-radius-sm)" }}
                      >
                        <Mail className="w-3.5 h-3.5 mt-0.5" style={{ color: "var(--gc-text-muted)" }} />
                        <span style={{ fontSize: "var(--gc-text-sm)", color: "var(--gc-text-secondary)" }}>
                          {tmpl.subject}
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label style={{ ...SEQ_LABEL_STYLE }}>Delay (days)</label>
                        <input
                          type="number"
                          min={0}
                          value={step.delayDays}
                          onChange={(e) => updateStep(index, { delayDays: Number(e.target.value) })}
                          style={SEQ_INPUT_STYLE}
                        />
                      </div>
                      <div>
                        <label style={{ ...SEQ_LABEL_STYLE }}>Delay (hours)</label>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={step.delayHours}
                          onChange={(e) => updateStep(index, { delayHours: Number(e.target.value) })}
                          style={SEQ_INPUT_STYLE}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={addStep}
                className="w-full flex items-center justify-center gap-2 py-2"
                style={{
                  border: "1px dashed var(--gc-gold)",
                  borderRadius: "var(--gc-radius-sm)",
                  color: "var(--gc-gold)",
                  fontSize: "var(--gc-text-sm)",
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
      </div>
    </GCModal>
  );
}
