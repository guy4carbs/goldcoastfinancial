import { BRAND_COLORS, BRAND_LABELS } from "../foundersConstants";
import type { BrandKey } from "../foundersConstants";

export interface FoundersBrandChipProps {
  brand: BrandKey;
  size?: "sm" | "md";
}

export function FoundersBrandChip({ brand, size = "sm" }: FoundersBrandChipProps) {
  const color = BRAND_COLORS[brand];
  const label = BRAND_LABELS[brand];
  const paddingY = size === "sm" ? "2px" : "4px";
  const paddingX = size === "sm" ? "8px" : "10px";
  const fontSize = size === "sm" ? "var(--gc-text-xs)" : "var(--gc-text-sm)";

  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        padding: `${paddingY} ${paddingX}`,
        borderRadius: "var(--gc-radius-full)",
        fontFamily: "var(--gc-font-body)",
        fontSize,
        fontWeight: 500,
        color,
        backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 35%, transparent)`,
        lineHeight: 1,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}
