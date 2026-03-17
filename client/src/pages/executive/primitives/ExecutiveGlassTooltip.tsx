/**
 * Executive Glass Tooltip — Custom Recharts tooltip with glass morphism
 * Heritage Design System — Orange/Amber theme
 */

import { RADIUS, TYPE, COLORS, SHADOW } from '@/lib/heritageDesignSystem';

interface ExecutiveGlassTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  formatter?: (value: number) => string;
}

export function ExecutiveGlassTooltip({
  active,
  payload,
  label,
  formatter,
}: ExecutiveGlassTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: RADIUS.button,
        boxShadow: SHADOW.card,
        padding: 12,
      }}
    >
      {label && (
        <p
          className="font-semibold text-gray-900"
          style={{ fontSize: TYPE.meta, marginBottom: 4 }}
        >
          {label}
        </p>
      )}
      <div className="flex flex-col gap-1">
        {payload.map((entry: any, index: number) => {
          const displayValue = formatter
            ? formatter(entry.value)
            : entry.value;
          return (
            <div key={index} className="flex items-center gap-2">
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 9999,
                  backgroundColor: entry.color,
                  flexShrink: 0,
                }}
              />
              <span
                className="text-gray-600"
                style={{ fontSize: TYPE.caption }}
              >
                {entry.name}
              </span>
              <span
                className="font-semibold text-gray-900 ml-auto"
                style={{ fontSize: TYPE.caption }}
              >
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ExecutiveGlassTooltip;
