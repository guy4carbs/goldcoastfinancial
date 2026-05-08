import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "@/lib/tour/TourProvider";

/**
 * Elegant completion modal shown after the final tour in an onboarding chain
 * finishes. Heritage palette: violet surface, amber accent, animated checkmark,
 * Playfair headline.
 */
export function TourCompletionCelebration() {
  const { celebratingTour, dismissCelebration } = useTour();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [exiting, setExiting] = useState(false);

  // Reset exit state whenever a new celebration begins
  useEffect(() => {
    if (celebratingTour) setExiting(false);
  }, [celebratingTour]);

  // Esc closes
  useEffect(() => {
    if (!celebratingTour) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [celebratingTour]);

  if (!celebratingTour) return null;

  const firstName = (user?.firstName || "").split(" ")[0] || "Agent";

  const handleClose = () => {
    setExiting(true);
    window.setTimeout(() => {
      dismissCelebration();
    }, 240);
  };

  // Per-role chain ending + copy.
  const role = celebratingTour?.role;
  const primaryCtaHref = role === "crm" ? "/crm/dashboard" : "/agents/dashboard";
  const primaryCtaLabel = role === "crm" ? "Back to CRM" : "Back to Dashboard";
  const copy =
    role === "crm"
      ? {
          eyebrow: "CRM WALKTHROUGH COMPLETE",
          headline: `You're set up, ${firstName}.`,
          body:
            "You've seen every view in the Heritage CRM — pipeline, contacts, clients, segments, and the import/export Lobby. Day-to-day work lives in Pipeline and Contacts; the rest is one click into the depth you need.",
        }
      : {
          eyebrow: "AGENT LOUNGE WALKTHROUGH COMPLETE",
          headline: `Welcome aboard, ${firstName}.`,
          body:
            "You've seen every view in your Agent Lounge — dialer, calendar, communications, leads, deals, hierarchy, and the rest. Daily work lives on the Dashboard; everything else is one click away.",
        };

  const handleGoToDashboard = () => {
    setExiting(true);
    window.setTimeout(() => {
      dismissCelebration();
      setLocation(primaryCtaHref);
    }, 240);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="heritage-celebration-title"
      data-theme="heritage-light"
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(30, 27, 75, 0.62)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: exiting
          ? "heritage-celebration-backdrop-out 240ms ease forwards"
          : "heritage-celebration-backdrop-in 260ms ease forwards",
        fontFamily: "Montserrat, system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes heritage-celebration-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes heritage-celebration-backdrop-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes heritage-celebration-card-in {
          0%   { opacity: 0; transform: translateY(14px) scale(0.96); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes heritage-celebration-card-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.97); }
        }
        @keyframes heritage-check-draw {
          from { stroke-dashoffset: 48; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes heritage-check-ring {
          from { stroke-dashoffset: 180; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes heritage-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: 480,
          maxWidth: "100%",
          padding: "36px 32px 28px",
          background: "#ffffff",
          color: "#1f2937",
          border: "1px solid rgba(124, 58, 237, 0.35)",
          borderRadius: 14,
          boxShadow: "0 28px 80px rgba(91, 33, 182, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          textAlign: "center",
          overflow: "hidden",
          animation: exiting
            ? "heritage-celebration-card-out 240ms ease forwards"
            : "heritage-celebration-card-in 420ms cubic-bezier(0.2, 0.9, 0.3, 1.15) forwards",
        }}
      >
        {/* Top shimmer accent bar — violet → amber → violet gradient */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, transparent 0%, #7c3aed 20%, #f59e0b 50%, #7c3aed 80%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "heritage-shimmer 3s ease-in-out infinite",
            opacity: 0.95,
          }}
        />

        {/* Animated amber checkmark in a ring */}
        <div
          aria-hidden
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg viewBox="0 0 64 64" width="72" height="72">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="rgba(245, 158, 11, 0.25)"
              strokeWidth="2"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 180,
                strokeDashoffset: 180,
                animation: "heritage-check-ring 520ms ease-out 120ms forwards",
                transformOrigin: "32px 32px",
                transform: "rotate(-90deg)",
              }}
            />
            <path
              d="M20 33 L29 42 L46 24"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 48,
                strokeDashoffset: 48,
                animation: "heritage-check-draw 320ms cubic-bezier(0.3, 1, 0.4, 1) 520ms forwards",
              }}
            />
          </svg>
        </div>

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#7c3aed",
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          {copy.eyebrow}
        </div>

        {/* Headline */}
        <h2
          id="heritage-celebration-title"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 26,
            lineHeight: 1.15,
            fontWeight: 600,
            color: "#1f2937",
            margin: "0 0 12px",
            letterSpacing: "-0.015em",
          }}
        >
          {copy.headline}
        </h2>

        {/* Body copy */}
        <p
          style={{
            fontSize: 14,
            lineHeight: 1.55,
            color: "#4b5563",
            margin: "0 auto 24px",
            maxWidth: 380,
          }}
        >
          {copy.body}
        </p>

        {/* Primary CTA — amber */}
        <button
          type="button"
          onClick={handleGoToDashboard}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: "#f59e0b",
            color: "#1f2937",
            border: "none",
            borderRadius: "4px",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0.1,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(245, 158, 11, 0.35)",
            transition: "transform 150ms ease, filter 150ms ease, box-shadow 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.05)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 12px 30px rgba(245, 158, 11, 0.45)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(245, 158, 11, 0.35)";
          }}
        >
          {primaryCtaLabel}
        </button>

        {/* Ghost close */}
        <button
          type="button"
          onClick={handleClose}
          style={{
            marginTop: 10,
            padding: "8px 14px",
            background: "transparent",
            color: "#6b7280",
            border: "none",
            borderRadius: "4px",
            fontSize: 12.5,
            cursor: "pointer",
            transition: "color 120ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1f2937")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
        >
          Stay on this page
        </button>
      </div>
    </div>
  );
}
