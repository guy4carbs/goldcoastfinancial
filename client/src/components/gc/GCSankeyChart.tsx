import { useRef, useState, useEffect } from "react";

export interface SankeyNodeData { name: string }
export interface SankeyLinkData { source: number; target: number; value: number }

export interface GCSankeyChartProps {
  nodes: SankeyNodeData[];
  links: SankeyLinkData[];
  title?: string;
  valueFormatter?: (v: number) => string;
  height?: number;
}

const PALETTE = ["#C4975A", "#8B5CF6", "#22C55E", "#3B82F6", "#F59E0B", "#EC4899", "#14B8A6", "#6B7280"];

export function GCSankeyChart({ nodes: nodesProp, links: linksProp, title, valueFormatter = (v) => `$${v.toLocaleString()}`, height = 320 }: GCSankeyChartProps) {
  // Defensive: render a clean empty state when the API hasn't populated the
  // data yet (was crashing with "undefined is not an object (evaluating 'links.map')").
  const nodes = Array.isArray(nodesProp) ? nodesProp : [];
  const links = Array.isArray(linksProp) ? linksProp : [];
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);

  if (nodes.length === 0 || links.length === 0) {
    return (
      <div style={{ border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-6)", color: "var(--gc-text-muted)", textAlign: "center", minHeight: height }}>
        {title ? <div style={{ marginBottom: "var(--gc-space-2)", color: "var(--gc-text-secondary)" }}>{title}</div> : null}
        No hierarchy flow data yet.
      </div>
    );
  }

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Find source nodes (nodes that only appear as source, not target)
  const targetIndices = new Set(links.map(l => l.target));
  const sourceIndices = links.reduce((acc, l) => {
    if (!targetIndices.has(l.source)) acc.add(l.source);
    return acc;
  }, new Set<number>());

  // Calculate totals per node
  const nodeValues = nodes.map((_, i) => {
    const outgoing = links.filter(l => l.source === i).reduce((s, l) => s + l.value, 0);
    const incoming = links.filter(l => l.target === i).reduce((s, l) => s + l.value, 0);
    return Math.max(outgoing, incoming);
  });
  const maxValue = Math.max(...nodeValues);

  // Layout: source nodes on left, target nodes on right
  const sourceNodes = Array.from(sourceIndices);
  const targetNodes = nodes.map((_, i) => i).filter(i => !sourceIndices.has(i));

  const nodeWidth = 24;
  const nodeGap = 16;
  const leftX = 0;
  const rightX = width - nodeWidth - 160; // leave room for labels
  const svgPadding = 20;

  // Position source nodes
  const sourceHeight = sourceNodes.length * 60 + (sourceNodes.length - 1) * nodeGap;
  const sourceStartY = Math.max(svgPadding, (height - sourceHeight) / 2);

  const sourcePositions = sourceNodes.map((idx, i) => ({
    idx,
    x: leftX + svgPadding,
    y: sourceStartY + i * (60 + nodeGap),
    h: Math.max(32, (nodeValues[idx] / maxValue) * 80),
  }));

  // Position target nodes
  const targetTotalH = targetNodes.reduce((s, idx) => s + Math.max(28, (nodeValues[idx] / maxValue) * 60), 0);
  const targetTotalGap = (targetNodes.length - 1) * nodeGap;
  const targetStartY = Math.max(svgPadding, (height - targetTotalH - targetTotalGap) / 2);

  let targetCurY = targetStartY;
  const targetPositions = targetNodes.map((idx) => {
    const h = Math.max(28, (nodeValues[idx] / maxValue) * 60);
    const pos = { idx, x: rightX, y: targetCurY, h };
    targetCurY += h + nodeGap;
    return pos;
  });

  const allPositions = [...sourcePositions, ...targetPositions];
  const getPos = (idx: number) => allPositions.find(p => p.idx === idx);

  // Generate bezier paths for links (skip links with missing positions)
  const linkPaths = links.map((link, i) => {
    const src = getPos(link.source);
    const tgt = getPos(link.target);
    if (!src || !tgt) return null;
    const thickness = Math.max(4, (link.value / maxValue) * 40);

    const sx = src.x + nodeWidth;
    const sy = src.y + src.h / 2;
    const tx = tgt.x;
    const ty = tgt.y + tgt.h / 2;
    const midX = (sx + tx) / 2;

    return {
      path: `M ${sx} ${sy - thickness / 2} C ${midX} ${sy - thickness / 2}, ${midX} ${ty - thickness / 2}, ${tx} ${ty - thickness / 2} L ${tx} ${ty + thickness / 2} C ${midX} ${ty + thickness / 2}, ${midX} ${sy + thickness / 2}, ${sx} ${sy + thickness / 2} Z`,
      color: PALETTE[link.source % PALETTE.length],
      value: link.value,
      sourceName: nodes[link.source].name,
      targetName: nodes[link.target].name,
      key: i,
    };
  }).filter((lp): lp is { path: string; color: string; value: number; sourceName: string; targetName: string; key: number } => lp !== null);

  const [hoveredLink, setHoveredLink] = useState<number | null>(null);

  return (
    <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "var(--gc-space-4)" }}>
      {title && <div style={{ fontFamily: "var(--gc-font-body)", fontSize: "var(--gc-text-xs)", fontWeight: 500, letterSpacing: "var(--gc-tracking-wider)", textTransform: "uppercase" as const, color: "var(--gc-text-muted)", marginBottom: "var(--gc-space-4)" }}>{title}</div>}

      <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
        <svg width={width} height={height} style={{ overflow: "visible" }}>
          {/* Links */}
          {linkPaths.map(lp => (
            <path key={lp.key} d={lp.path} fill={lp.color} opacity={hoveredLink === lp.key ? 0.6 : 0.25}
              style={{ transition: "opacity 0.2s", cursor: "pointer" }}
              onMouseEnter={() => setHoveredLink(lp.key)} onMouseLeave={() => setHoveredLink(null)} />
          ))}

          {/* Source Nodes */}
          {sourcePositions.map(sp => (
            <g key={`src-${sp.idx}`}>
              <rect x={sp.x} y={sp.y} width={nodeWidth} height={sp.h} rx={4}
                fill={PALETTE[sp.idx % PALETTE.length]} />
              <text x={sp.x + nodeWidth + 10} y={sp.y + sp.h / 2 - 6}
                fill="var(--gc-text-primary)" style={{ fontFamily: "var(--gc-font-body)", fontSize: 12, fontWeight: 500 }}>
                {nodes[sp.idx].name}
              </text>
              <text x={sp.x + nodeWidth + 10} y={sp.y + sp.h / 2 + 10}
                fill="var(--gc-gold)" style={{ fontFamily: "var(--gc-font-display)", fontSize: 14, fontWeight: 600 }}>
                {valueFormatter(nodeValues[sp.idx])}
              </text>
            </g>
          ))}

          {/* Target Nodes */}
          {targetPositions.map(tp => (
            <g key={`tgt-${tp.idx}`}>
              <rect x={tp.x} y={tp.y} width={nodeWidth} height={tp.h} rx={4}
                fill={PALETTE[tp.idx % PALETTE.length]} />
              <text x={tp.x + nodeWidth + 10} y={tp.y + tp.h / 2 - 6}
                fill="var(--gc-text-primary)" style={{ fontFamily: "var(--gc-font-body)", fontSize: 12, fontWeight: 500 }}>
                {nodes[tp.idx].name}
              </text>
              <text x={tp.x + nodeWidth + 10} y={tp.y + tp.h / 2 + 10}
                fill="var(--gc-gold)" style={{ fontFamily: "var(--gc-font-display)", fontSize: 14, fontWeight: 600 }}>
                {valueFormatter(nodeValues[tp.idx])}
              </text>
            </g>
          ))}

          {/* Hover tooltip */}
          {hoveredLink !== null && (() => {
            const lp = linkPaths[hoveredLink];
            if (!lp) return null;
            const src = getPos(links[hoveredLink]?.source ?? -1);
            const tgt = getPos(links[hoveredLink]?.target ?? -1);
            if (!src || !tgt) return null;
            const tx = (src.x + nodeWidth + tgt.x) / 2;
            const ty = (src.y + src.h / 2 + tgt.y + tgt.h / 2) / 2;
            return (
              <foreignObject x={tx - 80} y={ty - 30} width={160} height={60}>
                <div style={{ backgroundColor: "var(--gc-surface)", border: "1px solid var(--gc-border)", borderRadius: "var(--gc-radius-md)", padding: "6px 10px", fontFamily: "var(--gc-font-body)", boxShadow: "var(--gc-shadow-md)", textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: "var(--gc-text-muted)" }}>{lp.sourceName} → {lp.targetName}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--gc-gold)" }}>{valueFormatter(lp.value)}</div>
                </div>
              </foreignObject>
            );
          })()}
        </svg>
      </div>
    </div>
  );
}
