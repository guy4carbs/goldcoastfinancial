/**
 * NetworkGraphPanel - D3 force-directed graph of avatar network
 *
 * Displays:
 * - Nodes: Avatars with size based on activity
 * - Edges: Active communication paths between avatars
 * - Live animations during debates
 * - Interactive: click, drag, zoom, pan
 */

import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Activity,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface GraphNode {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
  isResponding: boolean;
  sessionCount: number;
  messageCount: number;
  avgLatency: number;
  hasError?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: "debate" | "reference" | "handoff";
  weight: number;
  isActive: boolean;
  debateId?: string;
}

export interface NetworkGraphPanelProps {
  nodes: GraphNode[];
  edges: GraphEdge[];

  // Interaction handlers
  onNodeClick?: (node: GraphNode) => void;
  onNodeDoubleClick?: (node: GraphNode) => void;
  onEdgeClick?: (edge: GraphEdge) => void;

  // Options
  showInactiveNodes?: boolean;
  showEdgeLabels?: boolean;
  nodeSizeMetric?: "sessions" | "messages" | "latency";
  layout?: "force" | "circular" | "hierarchical";

  // Customization
  className?: string;
}

// =============================================================================
// NODE COLORS
// =============================================================================

const NODE_COLORS: Record<string, string> = {
  "insurance-expert": "#3b82f6",     // blue-500
  "sales-closer": "#f97316",         // orange-500
  "mindset-coach": "#a855f7",        // purple-500
  "compliance-specialist": "#10b981", // emerald-500
  "persuasion-strategist": "#ef4444", // red-500
  "objection-handler": "#f59e0b",    // amber-500
  "underwriting-analyst": "#6366f1", // indigo-500
  "intensity-coach": "#f43f5e",      // rose-500
};

const DEFAULT_NODE_COLOR = "#6b7280"; // gray-500

// =============================================================================
// COMPONENT
// =============================================================================

export function NetworkGraphPanel({
  nodes,
  edges,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  showInactiveNodes = true,
  showEdgeLabels = false,
  nodeSizeMetric = "sessions",
  layout = "force",
  className,
}: NetworkGraphPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Local state for controls
  const [localShowInactive, setLocalShowInactive] = useState(showInactiveNodes);
  const [localShowLabels, setLocalShowLabels] = useState(showEdgeLabels);
  const [localSizeMetric, setLocalSizeMetric] = useState(nodeSizeMetric);
  const [localLayout, setLocalLayout] = useState(layout);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter nodes based on settings
  const visibleNodes = localShowInactive
    ? nodes
    : nodes.filter((n) => n.isActive);

  const visibleNodeIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
  );

  // ===== ZOOM CONTROLS =====
  const handleZoomIn = useCallback(() => {
    setZoom((z) => Math.min(z * 1.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((z) => Math.max(z / 1.2, 0.3));
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // ===== D3 RENDERING =====
  // NOTE: Actual D3 implementation would go here
  // This is a placeholder that shows the structure

  useEffect(() => {
    if (!svgRef.current) return;

    // D3 force simulation setup would go here:
    // 1. Create force simulation with nodes
    // 2. Add link force for edges
    // 3. Add collision force
    // 4. Add centering force
    // 5. Render nodes as circles
    // 6. Render edges as lines/paths
    // 7. Add drag behavior
    // 8. Add zoom behavior
    // 9. Add animations for active states

    console.log("D3 graph would render here with:", {
      nodes: visibleNodes.length,
      edges: visibleEdges.length,
      layout: localLayout,
      sizeMetric: localSizeMetric,
    });
  }, [visibleNodes, visibleEdges, localLayout, localSizeMetric, zoom]);

  // ===== CALCULATE NODE SIZE =====
  const getNodeSize = useCallback(
    (node: GraphNode): number => {
      const baseSize = 30;
      const maxSize = 60;
      let metric: number;

      switch (localSizeMetric) {
        case "sessions":
          metric = node.sessionCount;
          break;
        case "messages":
          metric = node.messageCount;
          break;
        case "latency":
          metric = Math.max(0, 3000 - node.avgLatency) / 100; // Inverse: faster = bigger
          break;
        default:
          metric = 1;
      }

      // Normalize to 0-1 range (would use actual max from data)
      const normalized = Math.min(metric / 20, 1);
      return baseSize + normalized * (maxSize - baseSize);
    },
    [localSizeMetric]
  );

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-shrink-0 py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Avatar Network
          </CardTitle>

          {/* Quick stats */}
          <div className="text-sm text-muted-foreground">
            {visibleNodes.length} nodes · {visibleEdges.length} connections
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative" ref={containerRef}>
        {/* ===== GRAPH AREA ===== */}
        <svg
          ref={svgRef}
          className="w-full h-full min-h-[400px]"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
          role="img"
          aria-label="Avatar network graph"
        >
          {/* Placeholder content - D3 would render here */}
          <g className="edges">
            {visibleEdges.map((edge) => (
              <line
                key={edge.id}
                className={cn(
                  "stroke-current",
                  edge.isActive ? "stroke-primary" : "stroke-muted-foreground/30"
                )}
                strokeWidth={Math.max(1, edge.weight / 5)}
                strokeDasharray={edge.type === "handoff" ? "5,5" : undefined}
                onClick={() => onEdgeClick?.(edge)}
                style={{ cursor: "pointer" }}
              />
            ))}
          </g>
          <g className="nodes">
            {visibleNodes.map((node) => {
              const size = getNodeSize(node);
              const color = NODE_COLORS[node.slug] || DEFAULT_NODE_COLOR;

              return (
                <g
                  key={node.id}
                  className="node"
                  onClick={() => onNodeClick?.(node)}
                  onDoubleClick={() => onNodeDoubleClick?.(node)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Node circle */}
                  <circle
                    r={size / 2}
                    fill={color}
                    opacity={node.isActive ? 1 : 0.4}
                    className={cn(
                      "transition-all",
                      node.isResponding && "animate-pulse"
                    )}
                  />

                  {/* Error indicator */}
                  {node.hasError && (
                    <circle
                      r={size / 2 + 4}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth={2}
                      strokeDasharray="4,4"
                    />
                  )}

                  {/* Label */}
                  <text
                    y={size / 2 + 14}
                    textAnchor="middle"
                    className="text-xs fill-current"
                  >
                    {node.name.split(" ")[0]}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* ===== CONTROLS OVERLAY ===== */}
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
          {/* Left: Zoom controls */}
          <div className="flex items-center gap-1 bg-background/90 rounded-lg p-1 shadow-lg border">
            <Button variant="ghost" size="icon" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleResetZoom}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFullscreen}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Right: Options */}
          <div className="flex items-center gap-4 bg-background/90 rounded-lg p-2 shadow-lg border">
            {/* Layout selector */}
            <Select value={localLayout} onValueChange={(v) => setLocalLayout(v as typeof layout)}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue placeholder="Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="force">Force</SelectItem>
                <SelectItem value="circular">Circular</SelectItem>
                <SelectItem value="hierarchical">Hierarchical</SelectItem>
              </SelectContent>
            </Select>

            {/* Node size metric */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Size:</span>
              <Select value={localSizeMetric} onValueChange={(v) => setLocalSizeMetric(v as typeof nodeSizeMetric)}>
                <SelectTrigger className="w-[100px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sessions">Sessions</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                  <SelectItem value="latency">Latency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-inactive"
                checked={localShowInactive}
                onCheckedChange={(c) => setLocalShowInactive(c === true)}
              />
              <label htmlFor="show-inactive" className="text-xs">
                Show inactive
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="show-labels"
                checked={localShowLabels}
                onCheckedChange={(c) => setLocalShowLabels(c === true)}
              />
              <label htmlFor="show-labels" className="text-xs">
                Edge labels
              </label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default NetworkGraphPanel;
