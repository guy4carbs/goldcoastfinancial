import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGCTheme } from "./GCThemeProvider";

export interface GCSelectOption {
  value: string;
  label: string;
}

export interface GCSelectProps {
  value: string;
  onValueChange: (v: string) => void;
  options: GCSelectOption[];
  placeholder?: string;
  width?: number | string;
  fullWidth?: boolean;
  disabled?: boolean;
  testId?: string;
  /** Override theme; defaults to current GC theme. */
  theme?: string;
  /** Optional trigger className passthrough. */
  triggerClassName?: string;
}

/**
 * Radix Select wrapped with GC tokens. Crucially propagates the active GC
 * theme onto SelectContent (which is portaled outside GCShell), so dropdown
 * panels inherit the same surface/border/text variables as the rest of the
 * lounge.
 */
export function GCSelect({
  value,
  onValueChange,
  options,
  placeholder,
  width,
  fullWidth,
  disabled,
  testId,
  theme: themeOverride,
  triggerClassName,
}: GCSelectProps) {
  const { theme } = useGCTheme();
  const resolvedTheme = themeOverride ?? theme;

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={triggerClassName}
        data-testid={testId}
        style={{
          width: fullWidth ? "100%" : width,
          height: "auto",
          padding: "var(--gc-space-2) var(--gc-space-3)",
          backgroundColor: "var(--gc-surface-2)",
          border: "1px solid var(--gc-border)",
          color: "var(--gc-text-primary)",
          fontFamily: "var(--gc-font-body)",
          fontSize: "var(--gc-text-md)",
          borderRadius: "var(--gc-radius-sm)",
        }}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        data-theme={resolvedTheme}
        style={{
          backgroundColor: "var(--gc-surface)",
          border: "1px solid var(--gc-border)",
          color: "var(--gc-text-primary)",
          fontFamily: "var(--gc-font-body)",
          borderRadius: "var(--gc-radius-sm)",
        }}
      >
        {options.map((o) => (
          <SelectItem
            key={o.value}
            value={o.value}
            style={{
              color: "var(--gc-text-primary)",
              fontSize: "var(--gc-text-sm)",
            }}
          >
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
