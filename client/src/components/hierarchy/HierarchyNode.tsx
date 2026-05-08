/**
 * Hierarchy node card — mirrors the Gold Coast GCNode shape and proportions
 * (240×80, two-line clamps for name + title, contract % big and prominent,
 * override badge inline, AIP/YTD on the right) but rendered in Heritage's
 * violet/amber palette instead of Gold Coast gold/burgundy.
 *
 * Click is a no-op here — the parent <HierarchyFlow> handles the click and
 * opens the slide-in detail drawer. We keep the hover lift for tactile
 * feedback.
 */
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { COLORS, RADIUS, SHADOW } from '@/lib/heritageDesignSystem';
import type { HierarchyNodeData } from './types';

const NODE_W = 240;
const NODE_H = 80;

const AMBER = COLORS.accent.amber;
const VIOLET = COLORS.primary.violet;
// Same violet→purple→amber gradient the page hero + KPI cards use, so the
// "YOU" / root node feels native to the Heritage design system instead of
// reading as a stray amber block.
const HERO_GRADIENT = COLORS.gradients.heroWithAccent;

function fmtAip(n: number): string {
  if (!n || n <= 0) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

const clampStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  lineHeight: 1.2,
};

function HierarchyNodeInner({ data, selected }: NodeProps) {
  const { member, isYou, isRoot } = data as HierarchyNodeData;

  // Override (parent contract − child contract). Stored on the member, but
  // also derivable from parentContractLevel if the upstream tree didn't pass it.
  const override = (() => {
    const { parentContractLevel } = data as HierarchyNodeData;
    if (parentContractLevel == null || member.contractLevel == null) return 0;
    const s = parentContractLevel - member.contractLevel;
    return s > 0 ? s : 0;
  })();

  // Root + YOU both get the signature Heritage gradient so they read as
  // "this is your tier" / "this is the top of the chain" without breaking
  // visual harmony with the violet stat cards above them.
  const useGradient = isRoot || isYou;

  const handleStyle: React.CSSProperties = {
    width: 8,
    height: 8,
    background: VIOLET[500],
    border: `2px solid ${VIOLET[600]}`,
    borderRadius: '50%',
  };

  const cardStyle: React.CSSProperties = {
    width: NODE_W,
    minHeight: NODE_H,
    height: 'auto',
    borderRadius: RADIUS.input,
    overflow: 'hidden',
    background: useGradient ? HERO_GRADIENT : '#fff',
    border: `${selected ? 2 : 1.5}px solid ${
      selected ? VIOLET[500] : useGradient ? 'transparent' : COLORS.gray[200]
    }`,
    boxShadow: useGradient
      ? `0 6px 20px rgba(124, 58, 237, 0.28), 0 2px 6px rgba(245, 158, 11, 0.18)`
      : SHADOW.card,
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    cursor: 'pointer',
  };

  // On gradient cards: white everything. Off-gradient: gray-900 name,
  // gray-500 title, violet contract % accent.
  const nameColor = useGradient ? '#fff' : COLORS.gray[900];
  const titleColor = useGradient ? 'rgba(255,255,255,0.92)' : COLORS.gray[500];
  const contractColor = useGradient ? '#fff' : VIOLET[700];
  const aipColor = useGradient ? 'rgba(255,255,255,0.78)' : COLORS.gray[400];
  const overrideBg = useGradient ? 'rgba(255,255,255,0.22)' : AMBER[100];
  const overrideText = useGradient ? '#fff' : AMBER[700];

  return (
    <div style={{ width: NODE_W }}>
      <Handle type="target" position={Position.Top} style={{ ...handleStyle, top: -4 }} />

      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = useGradient
            ? `0 10px 28px rgba(124, 58, 237, 0.4), 0 4px 10px rgba(245, 158, 11, 0.25)`
            : SHADOW.level2 || '0 4px 12px rgba(0,0,0,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = useGradient
            ? `0 6px 20px rgba(124, 58, 237, 0.28), 0 2px 6px rgba(245, 158, 11, 0.18)`
            : SHADOW.card;
        }}
      >
        <div style={{ padding: '10px 14px' }}>
          {/* Name + optional YOU pill */}
          <div className="flex items-center gap-1.5" style={{ marginBottom: 2 }}>
            <div
              title={member.name}
              style={{
                ...clampStyle,
                fontFamily: 'inherit',
                fontSize: 14,
                fontWeight: 600,
                color: nameColor,
                flex: 1,
              }}
            >
              {member.name}
            </div>
            {isYou && (
              <span
                style={{
                  flexShrink: 0,
                  padding: '1px 6px',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  borderRadius: RADIUS.pill,
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: '#fff',
                  lineHeight: '14px',
                }}
              >
                You
              </span>
            )}
          </div>

          {/* Title (2-line clamp) */}
          <div
            title={member.title}
            style={{
              ...clampStyle,
              fontSize: 11,
              color: titleColor,
              opacity: isRoot ? 0.95 : 1,
              marginBottom: 6,
            }}
          >
            {member.title}
          </div>

          {/* Contract % + override + AIP — all on one row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 17,
                  fontWeight: 600,
                  color: contractColor,
                  lineHeight: 1,
                }}
              >
                {member.contractLevel ?? 0}%
              </span>
              {override > 0 && (
                <span
                  style={{
                    padding: '1px 5px',
                    fontSize: 9,
                    fontWeight: 700,
                    borderRadius: 4,
                    backgroundColor: overrideBg,
                    color: overrideText,
                    letterSpacing: '0.02em',
                  }}
                >
                  {override}% override
                </span>
              )}
            </div>
            <span style={{ fontSize: 10, color: aipColor, fontWeight: 500 }}>
              {fmtAip(member.ytdCommission)}
            </span>
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...handleStyle, bottom: -4 }} />
    </div>
  );
}

export const HierarchyNode = memo(HierarchyNodeInner);
