/**
 * Custom React Flow edge — clean step connector with override spread label
 */
import { BaseEdge, getSmoothStepPath, EdgeLabelRenderer } from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import type { HierarchyTheme } from './types';

export function SpreadEdge(props: EdgeProps) {
  const {
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data,
  } = props;

  const theme = data?.theme as HierarchyTheme | undefined;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition,
    borderRadius: 8,
  });

  const spread = data?.spread as number | undefined;

  return (
    <>
      <BaseEdge
        path={edgePath}
        style={{
          stroke: theme?.colors[300] || COLORS.gray[300],
          strokeWidth: 1.5,
          strokeLinecap: 'round',
        }}
      />
      {spread != null && spread > 0 && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
              borderRadius: RADIUS.pill,
              backgroundColor: `${COLORS.semantic.success}15`,
              color: '#047857',
              fontSize: 9,
              fontWeight: 700,
              padding: '1px 6px',
              whiteSpace: 'nowrap',
              border: '1px solid #04785715',
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
