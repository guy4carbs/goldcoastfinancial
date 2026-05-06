import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTour } from "@/lib/tour/TourProvider";

/**
 * Elegant completion modal shown after the final tour in the onboarding chain
 * (hierarchy tour) finishes. Brand-aligned: burgundy surface, gold accents,
 * animated checkmark, Playfair headline. Auto-matches the active gc-theme.
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

  // Per-role chain ending + copy:
  //  - agent: ends on /hcms/my/hierarchy → lands on agent dashboard
  //  - admin: ends on /hcms/contracting/questions → lands on Agent Directory
  //  - finance: ends on /finance/reports → lands on Command Center
  const role = celebratingTour?.role;
  const primaryCtaHref =
    role === "admin" ? "/hcms/agents" : role === "finance" ? "/finance" : "/hcms/my/dashboard";
  const primaryCtaLabel =
    role === "admin"
      ? "Back to Agent Directory"
      : role === "finance"
      ? "Back to Command Center"
      : "Take me to my dashboard";
  const copy =
    role === "admin"
      ? {
          eyebrow: "ADMIN WALKTHROUGH COMPLETE",
          headline: `You're set up, ${firstName}.`,
          body:
            "You've seen every view in the admin HCMS — from agent applications through the full contracting matrix. Daily work lives in the Agent Directory and Contracting Overview; everything else is one click away.",
        }
      : role === "finance"
      ? {
          eyebrow: "FINANCE WALKTHROUGH COMPLETE",
          headline: `You're set up, ${firstName}.`,
          body:
            "You've seen every view in the Finance Lounge — revenue tracking, commission overrides, transaction lifecycle, and the full reporting suite. Daily work lives on the Command Center; drill into any card to dig deeper.",
        }
      : {
          eyebrow: "WALKTHROUGH COMPLETE",
          headline: `You're all set, ${firstName}.`,
          body:
            "Welcome to Gold Coast Financial Partners. You now know where every part of your agent HCMS lives — documents, licenses, carriers, and your place in the hierarchy. Once your contracting checklist is complete, you're ready to start submitting carrier requests and writing business.",
        };

  const handleGoToDashboard = () => {
    setExiting(true);
    window.setTimeout(() => {
      dismissCelebration();
      setLocation(primaryCtaHref);
    }, 240);
  };

  const activeTheme = (() => {
    if (typeof document === "undefined") return "gc-dark";
    const el = document.querySelector('[data-theme^="gc-"]');
    return el?.getAttribute("data-theme") || "gc-dark";
  })();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gc-celebration-title"
      data-theme={activeTheme}
      onClick={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        background: "rgba(0, 0, 0, 0.62)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: exiting
          ? "gc-celebration-backdrop-out 240ms ease forwards"
          : "gc-celebration-backdrop-in 260ms ease forwards",
        fontFamily: "var(--gc-font-body, Montserrat, system-ui, sans-serif)",
      }}
    >
      <style>{`
        @keyframes gc-celebration-backdrop-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gc-celebration-backdrop-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
        @keyframes gc-celebration-card-in {
          0%   { opacity: 0; transform: translateY(14px) scale(0.96); }
          60%  { opacity: 1; transform: translateY(-2px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes gc-celebration-card-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.97); }
        }
        @keyframes gc-check-draw {
          from { stroke-dashoffset: 48; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes gc-check-ring {
          from { stroke-dashoffset: 180; opacity: 0; }
          to   { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes gc-shimmer {
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
          background: "var(--gc-surface, #3A1018)",
          color: "var(--gc-text-primary, #E8DDD0)",
          border: "1px solid color-mix(in srgb, var(--gc-gold, #C4975A) 40%, transparent)",
          borderRadius: 14,
          boxShadow: "0 28px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.04)",
          textAlign: "center",
          overflow: "hidden",
          animation: exiting
            ? "gc-celebration-card-out 240ms ease forwards"
            : "gc-celebration-card-in 420ms cubic-bezier(0.2, 0.9, 0.3, 1.15) forwards",
        }}
      >
        {/* Top shimmer accent bar */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background:
              "linear-gradient(90deg, transparent 0%, var(--gc-gold, #C4975A) 20%, color-mix(in srgb, var(--gc-gold, #C4975A) 80%, white 20%) 50%, var(--gc-gold, #C4975A) 80%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "gc-shimmer 3s ease-in-out infinite",
            opacity: 0.9,
          }}
        />

        {/* Animated gold checkmark in a ring */}
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
              stroke="color-mix(in srgb, var(--gc-gold, #C4975A) 25%, transparent)"
              strokeWidth="2"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="var(--gc-gold, #C4975A)"
              strokeWidth="2.5"
              strokeLinecap="round"
              style={{
                strokeDasharray: 180,
                strokeDashoffset: 180,
                animation: "gc-check-ring 520ms ease-out 120ms forwards",
                transformOrigin: "32px 32px",
                transform: "rotate(-90deg)",
              }}
            />
            <path
              d="M20 33 L29 42 L46 24"
              fill="none"
              stroke="var(--gc-gold, #C4975A)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                strokeDasharray: 48,
                strokeDashoffset: 48,
                animation: "gc-check-draw 320ms cubic-bezier(0.3, 1, 0.4, 1) 520ms forwards",
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
            color: "var(--gc-gold, #C4975A)",
            fontWeight: 600,
            marginBottom: 10,
          }}
        >
          {copy.eyebrow}
        </div>

        {/* Headline */}
        <h2
          id="gc-celebration-title"
          style={{
            fontFamily: "var(--gc-font-display, 'Playfair Display', Georgia, serif)",
            fontSize: 26,
            lineHeight: 1.15,
            fontWeight: 600,
            color: "var(--gc-text-primary, #E8DDD0)",
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
            color: "var(--gc-text-secondary, #B8A898)",
            margin: "0 auto 24px",
            maxWidth: 380,
          }}
        >
          {copy.body}
        </p>

        {/* Primary CTA */}
        <button
          type="button"
          onClick={handleGoToDashboard}
          style={{
            width: "100%",
            padding: "12px 18px",
            background: "var(--gc-btn-primary-bg, #C4975A)",
            color: "var(--gc-btn-primary-text, #2D0A12)",
            border: "none",
            borderRadius: "var(--gc-radius-sm, 4px)",
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 0.1,
            cursor: "pointer",
            boxShadow: "0 8px 24px color-mix(in srgb, var(--gc-gold, #C4975A) 30%, transparent)",
            transition: "transform 150ms ease, filter 150ms ease, box-shadow 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = "brightness(1.05)";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow =
              "0 12px 30px color-mix(in srgb, var(--gc-gold, #C4975A) 40%, transparent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = "brightness(1)";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow =
              "0 8px 24px color-mix(in srgb, var(--gc-gold, #C4975A) 30%, transparent)";
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
            color: "var(--gc-text-muted, #A89080)",
            border: "none",
            borderRadius: "var(--gc-radius-sm, 4px)",
            fontSize: 12.5,
            cursor: "pointer",
            transition: "color 120ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gc-text-primary, #E8DDD0)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gc-text-muted, #A89080)")}
        >
          Stay on this page
        </button>
      </div>
    </div>
  );
}
