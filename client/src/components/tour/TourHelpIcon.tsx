import { HelpCircle } from "lucide-react";
import { useTour } from "@/lib/tour/TourProvider";

interface Props {
  tourId: string;
  section?: string;
  label?: string;
}

export function TourHelpIcon({ tourId, section, label = "Explain this section" }: Props) {
  const { startTour } = useTour();
  return (
    <button
      type="button"
      onClick={() => startTour(tourId, { section })}
      aria-label={label}
      title={label}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 22,
        height: 22,
        padding: 0,
        marginLeft: "var(--gc-space-1)",
        background: "transparent",
        color: "var(--gc-text-muted)",
        border: "1px solid transparent",
        borderRadius: "var(--gc-radius-full, 999px)",
        cursor: "pointer",
        transition: "color 150ms ease, background 150ms ease, border-color 150ms ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "var(--gc-gold)";
        e.currentTarget.style.borderColor = "var(--gc-border)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "var(--gc-text-muted)";
        e.currentTarget.style.borderColor = "transparent";
      }}
    >
      <HelpCircle className="w-3.5 h-3.5" />
    </button>
  );
}
