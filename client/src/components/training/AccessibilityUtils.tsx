/**
 * Accessibility Utilities for Training Components
 *
 * Provides reusable accessibility patterns:
 * - Screen reader announcements
 * - Focus management
 * - Keyboard navigation helpers
 * - ARIA live regions
 */

import { useEffect, useRef, useCallback } from "react";

// ============================================================================
// SCREEN READER ANNOUNCEMENTS
// ============================================================================

/**
 * Hook for announcing messages to screen readers
 */
export function useAnnounce() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create announcer element if it doesn't exist
    if (!announcerRef.current) {
      const announcer = document.createElement("div");
      announcer.setAttribute("aria-live", "polite");
      announcer.setAttribute("aria-atomic", "true");
      announcer.setAttribute("role", "status");
      announcer.className = "sr-only";
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
      announcerRef.current = announcer;
    }

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current);
        announcerRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: "polite" | "assertive" = "polite") => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute("aria-live", priority);
      announcerRef.current.textContent = "";
      // Force reflow
      void announcerRef.current.offsetWidth;
      announcerRef.current.textContent = message;
    }
  }, []);

  return announce;
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Hook for trapping focus within a container (for modals/dialogs)
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for roving tabindex navigation (for lists, toolbars)
 */
export function useRovingTabIndex<T extends HTMLElement>(
  itemCount: number,
  orientation: "horizontal" | "vertical" = "vertical"
) {
  const containerRef = useRef<T>(null);
  const currentIndexRef = useRef(0);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const prevKey = orientation === "vertical" ? "ArrowUp" : "ArrowLeft";
      const nextKey = orientation === "vertical" ? "ArrowDown" : "ArrowRight";

      if (e.key === prevKey) {
        e.preventDefault();
        currentIndexRef.current = Math.max(0, currentIndexRef.current - 1);
      } else if (e.key === nextKey) {
        e.preventDefault();
        currentIndexRef.current = Math.min(itemCount - 1, currentIndexRef.current + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        currentIndexRef.current = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        currentIndexRef.current = itemCount - 1;
      } else {
        return;
      }

      // Focus the new item
      const items = containerRef.current?.querySelectorAll<HTMLElement>('[role="option"], [role="menuitem"], [data-roving-item]');
      items?.[currentIndexRef.current]?.focus();
    },
    [itemCount, orientation]
  );

  return { containerRef, handleKeyDown, currentIndex: currentIndexRef.current };
}

// ============================================================================
// KEYBOARD NAVIGATION HELPERS
// ============================================================================

/**
 * Handle keyboard activation (Enter/Space)
 */
export function handleKeyboardActivation(
  e: React.KeyboardEvent,
  callback: () => void
) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    callback();
  }
}

/**
 * Props for making a div keyboard accessible like a button
 */
export function getButtonA11yProps(
  onClick: () => void,
  label: string,
  options?: { disabled?: boolean; pressed?: boolean }
) {
  return {
    role: "button" as const,
    tabIndex: options?.disabled ? -1 : 0,
    "aria-label": label,
    "aria-disabled": options?.disabled,
    "aria-pressed": options?.pressed,
    onClick: options?.disabled ? undefined : onClick,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!options?.disabled) {
        handleKeyboardActivation(e, onClick);
      }
    },
  };
}

// ============================================================================
// PROGRESS ANNOUNCEMENTS
// ============================================================================

/**
 * Hook for announcing progress changes to screen readers
 */
export function useProgressAnnounce(progress: number, label: string) {
  const announce = useAnnounce();
  const lastAnnouncedRef = useRef(0);

  useEffect(() => {
    // Announce at 25%, 50%, 75%, and 100%
    const milestones = [25, 50, 75, 100];
    const currentMilestone = milestones.find(
      (m) => progress >= m && lastAnnouncedRef.current < m
    );

    if (currentMilestone) {
      lastAnnouncedRef.current = currentMilestone;
      announce(`${label}: ${currentMilestone}% complete`);
    }
  }, [progress, label, announce]);
}

// ============================================================================
// ACCESSIBLE ICON WRAPPER
// ============================================================================

interface AccessibleIconProps {
  icon: React.ReactNode;
  label: string;
  decorative?: boolean;
}

export function AccessibleIcon({ icon, label, decorative = false }: AccessibleIconProps) {
  if (decorative) {
    return <span aria-hidden="true">{icon}</span>;
  }

  return (
    <span role="img" aria-label={label}>
      {icon}
    </span>
  );
}

// ============================================================================
// SKIP LINK
// ============================================================================

interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

export function SkipLink({ targetId, children = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
    >
      {children}
    </a>
  );
}

// ============================================================================
// LIVE REGION COMPONENT
// ============================================================================

interface LiveRegionProps {
  message: string;
  priority?: "polite" | "assertive";
  className?: string;
}

export function LiveRegion({ message, priority = "polite", className }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className={className || "sr-only"}
    >
      {message}
    </div>
  );
}
