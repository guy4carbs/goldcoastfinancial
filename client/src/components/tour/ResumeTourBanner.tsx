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
        background: "#ffffff",
        color: "#1f2937",
        border: "1px solid rgba(124, 58, 237, 0.35)",
        borderRadius: "8px",
        boxShadow: "0 12px 34px rgba(124, 58, 237, 0.22), 0 0 0 1px rgba(0,0,0,0.04)",
        fontFamily: "Montserrat, system-ui, sans-serif",
        animation: exiting
          ? "heritage-resume-slide-out 220ms cubic-bezier(0.4, 0, 0.84, 0.12) forwards"
          : "heritage-resume-slide-in 220ms cubic-bezier(0.22, 1, 0.36, 1)",
        pointerEvents: exiting ? "none" : "auto",
      }}
    >
      <style>{`
        @keyframes heritage-resume-slide-in {
          from { opacity: 0; transform: translateY(-8px) translateX(8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) translateX(0) scale(1); }
        }
        @keyframes heritage-resume-slide-out {
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
          color: "#6b7280",
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
            background: "#f59e0b",
            color: "#1f2937",
            borderRadius: 999,
            flexShrink: 0,
          }}
        >
          <Play className="w-3 h-3" style={{ marginLeft: 2 }} />
        </div>
        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1f2937", letterSpacing: 0.1 }}>
          Resume walkthrough
        </div>
      </div>

      {/* Body text */}
      <div style={{ fontSize: "12.5px", color: "#4b5563", lineHeight: 1.45, marginBottom: 12 }}>
        <span style={{ color: "#1f2937", fontWeight: 500 }}>{config.label}</span>
        <span style={{ opacity: 0.7 }}> · step {resume.stepIndex + 1}</span>
      </div>

      {/* Resume button — full width inside the card */}
      <button
        type="button"
        onClick={handleResume}
        style={{
          width: "100%",
          padding: "8px 14px",
          background: "#f59e0b",
          color: "#1f2937",
          border: "none",
          borderRadius: "4px",
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
