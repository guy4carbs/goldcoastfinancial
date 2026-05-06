import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Play, X } from "lucide-react";
import { useTour } from "@/lib/tour/TourProvider";
import { getTour } from "@/lib/tour/registry";
import * as persistence from "@/lib/tour/persistence";

export function ResumeTourBanner() {
  const [location] = useLocation();
  const { startTour, activeTourId, tourStoppedTick } = useTour();
  const [resume, setResume] = useState(persistence.getResume());
  const [dismissed, setDismissed] = useState(false);

  // Re-read the resume pointer whenever:
  //  - the route changes
  //  - a tour stops (user closed it, chained, or finished) — `tourStoppedTick` bumps
  useEffect(() => {
    setResume(persistence.getResume());
    setDismissed(false);
  }, [location, tourStoppedTick]);

  const [exiting, setExiting] = useState(false);

  // Reset exit animation state when a fresh pointer arrives
  useEffect(() => {
    setExiting(false);
  }, [resume?.tourId, resume?.stepIndex]);

  if (dismissed || !resume || activeTourId) return null;

  const config = getTour(resume.tourId);
  if (!config) {
    persistence.clearResume();
    return null;
  }
  // Only surface on the matching route — forgiving on query / trailing slash.
  const normalized = location.split("?")[0].replace(/\/$/, "");
  if (!normalized.startsWith(config.page.replace(/\/$/, ""))) return null;

  const handleResume = () => {
    startTour(resume.tourId, { stepIndex: resume.stepIndex });
  };

  const handleDismiss = () => {
    // Play exit animation, THEN unmount + clear state — matches the 220ms enter.
    setExiting(true);
    window.setTimeout(() => {
      persistence.clearResume();
      setDismissed(true);
    }, 220);
  };

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9998,
        width: 340,
        maxWidth: "calc(100vw - 40px)",
        padding: "14px 16px",
        background: "var(--gc-surface, #3A1018)",
        color: "var(--gc-text-primary, #E8DDD0)",
        border: "1px solid color-mix(in srgb, var(--gc-gold, #C4975A) 40%, transparent)",
        borderRadius: "var(--gc-radius-md, 8px)",
        boxShadow: "0 12px 34px rgba(0,0,0,0.28), 0 0 0 1px rgba(0,0,0,0.04)",
        fontFamily: "var(--gc-font-body, Montserrat, system-ui, sans-serif)",
        animation: exiting
          ? "gc-resume-slide-out 220ms cubic-bezier(0.4, 0, 0.84, 0.12) forwards"
          : "gc-resume-slide-in 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes gc-resume-slide-in {
          from { opacity: 0; transform: translateY(-8px) translateX(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes gc-resume-slide-out {
          from { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
          to   { opacity: 0; transform: translateY(-6px) translateX(16px) scale(0.97); }
        }
      `}</style>

      {/* Close button — absolute top-right */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Dismiss"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          padding: 4,
          background: "transparent",
          color: "var(--gc-text-muted, #A89080)",
          border: "none",
          borderRadius: 4,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.7,
          transition: "opacity 120ms ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Header row with icon + title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4, paddingRight: 20 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            background: "var(--gc-btn-primary-bg, #C4975A)",
            color: "var(--gc-btn-primary-text, #2D0A12)",
            borderRadius: 999,
            flexShrink: 0,
          }}
        >
          <Play className="w-3 h-3" style={{ marginLeft: 2 }} />
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--gc-text-primary, #E8DDD0)", letterSpacing: 0.1 }}>
          Resume walkthrough
        </div>
      </div>

      {/* Body text */}
      <div style={{ fontSize: "12.5px", color: "var(--gc-text-secondary, #B8A898)", lineHeight: 1.45, marginBottom: 12 }}>
        <span style={{ color: "var(--gc-text-primary, #E8DDD0)", fontWeight: 500 }}>{config.label}</span>
        <span style={{ opacity: 0.7 }}> · step {resume.stepIndex + 1}</span>
      </div>

      {/* Resume button — full width inside the card */}
      <button
        type="button"
        onClick={handleResume}
        style={{
          width: "100%",
          padding: "8px 14px",
          background: "var(--gc-btn-primary-bg, #C4975A)",
          color: "var(--gc-btn-primary-text, #2D0A12)",
          border: "none",
          borderRadius: "var(--gc-radius-sm, 4px)",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "filter 120ms ease, transform 120ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "brightness(1.05)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        Resume
      </button>
    </div>
  );
}
