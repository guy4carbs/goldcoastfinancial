/**
 * USStateMap - Interactive US State Map Component
 *
 * Renders an SVG map of all 50 US states + DC with:
 * - Highlighting based on data
 * - Hover tooltips
 * - Click handlers
 * - Heritage Design System styling
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { US_STATES, MAP_VIEWBOX, ABBREV_TO_NAME } from "./usStatesPaths";
import { COLORS, RADIUS } from "@/lib/heritageDesignSystem";
import { cn } from "@/lib/utils";

export interface StateData {
  highlighted: boolean;
  count?: number;
  status?: 'active' | 'pending' | 'expired';
  value?: number;
}

export interface USStateMapProps {
  /** Map of state abbreviation (e.g., "IL") to data */
  stateData: Record<string, StateData>;
  /** Callback when a state is clicked */
  onStateClick?: (stateCode: string, stateName: string) => void;
  /** Show count badges on states */
  showCounts?: boolean;
  /** Custom highlight color (default: violet) */
  highlightColor?: string;
  /** Custom inactive color (default: gray-200) */
  inactiveColor?: string;
  /** Pending state color */
  pendingColor?: string;
  /** Additional className for the container */
  className?: string;
}

// Get color based on state data
function getStateColor(
  data: StateData | undefined,
  highlightColor: string,
  inactiveColor: string,
  pendingColor: string
): string {
  if (!data || !data.highlighted) {
    return inactiveColor;
  }

  if (data.status === 'pending') {
    return pendingColor;
  }

  if (data.status === 'expired') {
    return '#ef4444'; // red-500
  }

  return highlightColor;
}

export function USStateMap({
  stateData,
  onStateClick,
  showCounts = false,
  highlightColor = COLORS.primary.violet[500],
  inactiveColor = '#e5e7eb', // gray-200
  pendingColor = COLORS.accent.amber[400],
  className,
}: USStateMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // Calculate statistics
  const stats = useMemo(() => {
    const highlighted = Object.entries(stateData).filter(([_, d]) => d.highlighted);
    const totalCount = highlighted.reduce((sum, [_, d]) => sum + (d.count || 0), 0);
    const totalValue = highlighted.reduce((sum, [_, d]) => sum + (d.value || 0), 0);
    return {
      statesCount: highlighted.length,
      totalCount,
      totalValue,
    };
  }, [stateData]);

  const handleMouseMove = (e: React.MouseEvent<SVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleStateClick = (abbrev: string) => {
    if (onStateClick) {
      onStateClick(abbrev, ABBREV_TO_NAME[abbrev]);
    }
  };

  // Get tooltip content
  const getTooltipContent = () => {
    if (!hoveredState) return null;

    const data = stateData[hoveredState];
    const stateName = ABBREV_TO_NAME[hoveredState];

    return (
      <div className="text-center">
        <p className="font-semibold text-gray-900">{stateName}</p>
        {data?.highlighted && (
          <>
            {data.status && (
              <p className={cn(
                "text-xs font-medium capitalize",
                data.status === 'active' && "text-green-600",
                data.status === 'pending' && "text-amber-600",
                data.status === 'expired' && "text-red-600"
              )}>
                {data.status}
              </p>
            )}
            {data.count !== undefined && data.count > 0 && (
              <p className="text-xs text-gray-600">
                {data.count} {data.count === 1 ? 'policy' : 'policies'}
              </p>
            )}
            {data.value !== undefined && data.value > 0 && (
              <p className="text-xs text-gray-600">
                ${data.value.toLocaleString()} AP
              </p>
            )}
          </>
        )}
        {!data?.highlighted && (
          <p className="text-xs text-gray-400">Not active</p>
        )}
      </div>
    );
  };

  return (
    <div className={cn("relative", className)}>
      {/* SVG Map */}
      <svg
        viewBox={MAP_VIEWBOX}
        className="w-full h-auto"
        onMouseMove={handleMouseMove}
        style={{ maxHeight: '300px' }}
      >
        {/* Background */}
        <rect width="959" height="593" fill="transparent" />

        {/* States */}
        {US_STATES.map((state) => {
          const data = stateData[state.abbreviation];
          const isHighlighted = data?.highlighted || false;
          const isHovered = hoveredState === state.abbreviation;
          const fillColor = getStateColor(data, highlightColor, inactiveColor, pendingColor);

          return (
            <motion.path
              key={state.abbreviation}
              d={state.path}
              fill={fillColor}
              stroke="#ffffff"
              strokeWidth={isHovered ? 2 : 1}
              strokeLinejoin="round"
              className={cn(
                "transition-all duration-200 cursor-pointer",
                isHighlighted && "drop-shadow-sm"
              )}
              style={{
                filter: isHovered ? 'brightness(0.9)' : undefined,
                transform: isHovered ? 'scale(1.02)' : undefined,
                transformOrigin: 'center',
              }}
              onMouseEnter={() => setHoveredState(state.abbreviation)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => handleStateClick(state.abbreviation)}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.15 }}
            />
          );
        })}

        {/* Count badges (only if showCounts is true) */}
        {showCounts && US_STATES.map((state) => {
          const data = stateData[state.abbreviation];
          if (!data?.highlighted || !data.count || data.count === 0) return null;

          const [cx, cy] = state.centroid;

          return (
            <g key={`badge-${state.abbreviation}`}>
              <circle
                cx={cx}
                cy={cy}
                r={12}
                fill={COLORS.accent.amber[500]}
                stroke="#ffffff"
                strokeWidth={2}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={10}
                fontWeight="bold"
              >
                {data.count > 99 ? '99+' : data.count}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredState && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute pointer-events-none z-10 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-100"
          style={{
            left: tooltipPosition.x + 10,
            top: tooltipPosition.y - 10,
            borderRadius: RADIUS.button,
          }}
        >
          {getTooltipContent()}
        </motion.div>
      )}
    </div>
  );
}

export default USStateMap;
