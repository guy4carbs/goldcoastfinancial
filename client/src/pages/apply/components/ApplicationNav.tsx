import { ArrowLeft, ArrowRight, Send, Loader2 } from "lucide-react";

interface Props {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
}

export function ApplicationNav({ step, onBack, onNext, nextLabel, nextDisabled, loading }: Props) {
  const btnBase = { padding: "var(--gc-space-2) var(--gc-space-4)", borderRadius: "var(--gc-radius-sm)", fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-base)", cursor: "pointer" };

  return (
    <div className="flex justify-between mt-8">
      {step > 0 ? (
        <button onClick={onBack} className="flex items-center gap-2" style={{ ...btnBase, backgroundColor: "var(--gc-surface)", color: "var(--gc-text-secondary)", border: "1px solid var(--gc-border)" }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      ) : <div />}
      <button
        onClick={onNext}
        disabled={nextDisabled || loading}
        className="flex items-center gap-2"
        style={{
          ...btnBase,
          backgroundColor: "var(--gc-btn-primary-bg)", color: "var(--gc-btn-primary-text)",
          border: "none", fontWeight: 500,
          opacity: (nextDisabled || loading) ? 0.5 : 1,
          cursor: (nextDisabled || loading) ? "not-allowed" : "pointer",
        }}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {nextLabel || "Continue"}
        {!loading && !nextLabel && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  );
}
