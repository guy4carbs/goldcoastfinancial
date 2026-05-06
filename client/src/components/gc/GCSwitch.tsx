import { Switch } from "@/components/ui/switch";
import type { ComponentProps } from "react";

// Gold-when-checked, GC-bordered Switch override.
// Use this everywhere instead of the bare shadcn Switch — the bare component
// renders maroon-on-checked which conflicts with the GC theme.
export const GC_SWITCH_CLASS =
  "data-[state=checked]:!bg-[var(--gc-gold)] data-[state=unchecked]:!bg-[var(--gc-border)] [&>span]:!bg-[var(--gc-bg)]";

type GCSwitchProps = ComponentProps<typeof Switch>;

export function GCSwitch({ className = "", ...props }: GCSwitchProps) {
  return <Switch className={`${GC_SWITCH_CLASS} ${className}`.trim()} {...props} />;
}
