/**
 * Hierarchy connector edge — mirrors the Gold Coast convention: a default
 * Bezier curve in the accent color (Heritage amber, GCF would use gold) at
 * 1.5px / 40% opacity, with the override-spread % rendered as a small
 * accent-color label inline on the edge (no pill background).
 */
import { BaseEdge, getBezierPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { COLORS } from '@/lib/heritageDesignSystem';

const AMBER = COLORS.accent.amber;

export function SpreadEdge(props: EdgeProps) {
  const {
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data,
  } = props;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
  });

  const spread = data?.spread as number | undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: AMBER[500],
          strokeWidth: 1.5,
          strokeOpacity: 0.4,
          strokeLinecap: 'round',
        }}
      />
      {spread != null && spread > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'none',
              fontSize: 10,
              fontWeight: 700,
              color: AMBER[700],
              padding: '1px 4px',
              backgroundColor: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              letterSpacing: '0.01em',
            }}
            className="nodrag nopan"
          >
            {spread}%
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
