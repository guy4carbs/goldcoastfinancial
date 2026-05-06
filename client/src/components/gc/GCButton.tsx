import type { ReactNode, MouseEvent } from "react";

/**
 * GCPrimaryButton — gold solid CTA matching the HCMS Send Application button.
 * Use for the dominant action on a page or in a dialog.
 *
 * No fontFamily/fontSize is set so the button inherits the surrounding
 * surface text style (HCMS doesn't set them either).
 */
export function GCPrimaryButton({
  onClick,
  disabled,
  icon,
  children,
  tone = "primary",
  size = "md",
  type = "button",
  testId,
  fullWidth,
}: {
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  tone?: "primary" | "danger";
  size?: "sm" | "md";
  type?: "button" | "submit";
  testId?: string;
  fullWidth?: boolean;
}) {
  const bg =
    tone === "danger" ? "var(--gc-status-terminated)" : "var(--gc-btn-primary-bg)";
  const fg = tone === "danger" ? "#FFFFFF" : "var(--gc-btn-primary-text)";
  const padding =
    size === "sm" ? "var(--gc-space-1) var(--gc-space-3)" : "var(--gc-space-2) var(--gc-space-4)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-testid={testId}
      className={icon ? "flex items-center gap-2" : undefined}
      style={{
        padding,
        backgroundColor: bg,
        color: fg,
        borderRadius: "var(--gc-radius-sm)",
        fontWeight: 500,
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? "100%" : undefined,
      }}
    >
      {icon}
      {children}
    </button>
  );
}

/**
 * GCSecondaryButton — outlined neutral button matching the HCMS Open SureLC pattern.
 * Use for Cancel and secondary actions.
 */
export function GCSecondaryButton({
  onClick,
  disabled,
  icon,
  children,
  size = "md",
  type = "button",
  testId,
  fullWidth,
}: {
  onClick?: (e?: MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  icon?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md";
  type?: "button" | "submit";
  testId?: string;
  fullWidth?: boolean;
}) {
  const padding =
    size === "sm" ? "var(--gc-space-1) var(--gc-space-3)" : "var(--gc-space-2) var(--gc-space-4)";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-testid={testId}
      className={icon ? "flex items-center gap-2" : undefined}
      style={{
        padding,
        backgroundColor: "var(--gc-surface)",
        color: "var(--gc-text-secondary)",
        border: "1px solid var(--gc-border)",
        borderRadius: "var(--gc-radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
        width: fullWidth ? "100%" : undefined,
      }}
    >
      {icon}
      {children}
    </button>
  );
}
