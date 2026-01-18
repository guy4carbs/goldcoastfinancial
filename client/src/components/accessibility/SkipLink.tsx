import { useRef, useEffect } from "react";

/**
 * Skip Link Component for Accessibility
 * Allows keyboard users to skip navigation and go directly to main content
 */

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-[hsl(348,65%,20%)] focus:text-white focus:rounded-sm focus:outline-none focus:ring-2 focus:ring-[hsl(42,60%,55%)] focus:ring-offset-2 transition-all"
    >
      Skip to main content
    </a>
  );
}

/**
 * Screen Reader Only Text
 * For adding context to screen readers without visual display
 */
export function SrOnly({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

/**
 * Focus Trap Component
 * Keeps focus within a modal or dialog for accessibility
 */
export function useFocusTrap(isActive: boolean) {
  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !trapRef.current) return;

    const focusableElements = trapRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => {
      document.removeEventListener("keydown", handleTab);
    };
  }, [isActive]);

  return trapRef;
}

/**
 * Announce to Screen Readers
 * For dynamic content changes that need to be announced
 */
export function LiveRegion({
  message,
  assertive = false
}: {
  message: string;
  assertive?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={assertive ? "assertive" : "polite"}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Accessible Icon Button
 * Ensures icon-only buttons have proper labels
 */
export function IconButton({
  icon,
  label,
  onClick,
  className = "",
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={className}
    >
      {icon}
      <span className="sr-only">{label}</span>
    </button>
  );
}
