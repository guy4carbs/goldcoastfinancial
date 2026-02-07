import { useEffect, useRef, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Play, Zap } from "lucide-react";
import {
  useNetworkCommunication,
  useConnectionStatus,
  type Avatar,
  type NetworkActivityEvent,
} from "@/lib/avatarCouncilStore";

// Avatar signature colors for connection lines and glows
// Each avatar has a UNIQUE color to make all connections visually distinct
const avatarColors: Record<string, string> = {
  // New persona slugs
  "warren-buffett": "#F59E0B",   // Amber
  "patrick-bet-david": "#06B6D4", // Cyan
  "ben-feldman": "#8B5CF6",       // Violet
  "elizur-wright": "#22C55E",     // Bright Green (changed from 10B981)
  "jordan-belfort": "#EF4444",    // Red
  "andy-elliott": "#F97316",      // Orange
  "andrew-tate": "#EC4899",       // Pink

  // Current active slugs - each must have unique color
  "insurance-expert": "#3B82F6",    // Blue
  "wolf-closer": "#EF4444",         // Red
  "intensity-coach": "#F97316",     // Orange (changed from red)
  "objection-handler": "#F59E0B",   // Amber
  "compliance-specialist": "#14B8A6", // Teal (changed from green)
  "mindset-coach": "#A855F7",       // Purple

  // Legacy fallbacks
  "sales-closer": "#DC2626",
  "persuasion-strategist": "#06B6D4",
  "underwriting-analyst": "#8B5CF6",
};

interface AvatarNetworkGraphProps {
  avatars: Avatar[];
  className?: string;
}

interface NodePosition {
  x: number;
  y: number;
  avatar: Avatar;
}

interface ActiveConnection {
  fromId: string;
  toId: string;
  startTime: number;
  duration: number;
  type: "message" | "thinking" | "broadcast";
}

export function AvatarNetworkGraph({
  avatars,
  className,
}: AvatarNetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<NodePosition[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeConnections, setActiveConnections] = useState<ActiveConnection[]>([]);

  // Get network state from store
  const {
    networkState,
    networkSubscribed,
    networkActivity,
    subscribeToNetwork,
    unsubscribeFromNetwork,
    simulateNetworkActivity,
  } = useNetworkCommunication();

  const connectionStatus = useConnectionStatus();

  // Subscribe to network events when connected
  useEffect(() => {
    if (connectionStatus === "connected" && !networkSubscribed) {
      subscribeToNetwork();
    }

    return () => {
      if (networkSubscribed) {
        unsubscribeFromNetwork();
      }
    };
  }, [connectionStatus, networkSubscribed, subscribeToNetwork, unsubscribeFromNetwork]);

  // Calculate node positions in a circle
  useEffect(() => {
    const calculatePositions = () => {
      if (!containerRef.current || avatars.length === 0) return;

      const width = containerRef.current.offsetWidth || 800;
      const height = containerRef.current.offsetHeight || 500;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 80;

      const newNodes = avatars.map((avatar, i) => {
        const angle = (i * 2 * Math.PI) / avatars.length - Math.PI / 2;
        return {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
          avatar,
        };
      });

      console.log(`[NetworkGraph] Calculated ${newNodes.length} nodes, should have ${(newNodes.length * (newNodes.length - 1)) / 2} connections`);
      setNodes(newNodes);
    };

    // Calculate immediately
    calculatePositions();

    // Also recalculate on resize
    const resizeObserver = new ResizeObserver(() => {
      calculatePositions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [avatars]);

  // Process network activity into active connections
  useEffect(() => {
    const now = Date.now();

    // Process recent activity events
    const newConnections: ActiveConnection[] = networkActivity
      .filter((event) => {
        const eventTime = new Date(event.timestamp).getTime();
        const age = now - eventTime;
        return age < (event.duration || 2000);
      })
      .map((event) => ({
        fromId: event.fromAvatarId,
        toId: event.toAvatarId || "",
        startTime: new Date(event.timestamp).getTime(),
        duration: event.duration || 2000,
        type: event.type as "message" | "thinking" | "broadcast",
      }))
      .filter((conn) => conn.toId); // Only keep connections with a target

    setActiveConnections(newConnections);

    // Set up cleanup interval
    const cleanup = setInterval(() => {
      const currentTime = Date.now();
      setActiveConnections((prev) =>
        prev.filter((conn) => currentTime - conn.startTime < conn.duration)
      );
    }, 200);

    return () => clearInterval(cleanup);
  }, [networkActivity]);

  // Check if a connection is currently active
  const isConnectionActive = useCallback(
    (fromId: string, toId: string) => {
      return activeConnections.some(
        (conn) =>
          (conn.fromId === fromId && conn.toId === toId) ||
          (conn.fromId === toId && conn.toId === fromId)
      );
    },
    [activeConnections]
  );

  // Get connection type for styling
  const getConnectionType = useCallback(
    (fromId: string, toId: string): "message" | "thinking" | "broadcast" | null => {
      const conn = activeConnections.find(
        (c) =>
          (c.fromId === fromId && c.toId === toId) ||
          (c.fromId === toId && c.toId === fromId)
      );
      return conn?.type || null;
    },
    [activeConnections]
  );

  // Get avatar's online status from network state
  const getAvatarOnlineStatus = useCallback(
    (avatarId: string): boolean => {
      if (!networkState) return false;
      const status = networkState.avatars.find((a) => a.avatarId === avatarId);
      return status?.isOnline || false;
    },
    [networkState]
  );

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Avatar Network
              {networkSubscribed && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-normal text-green-600">LIVE</span>
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Real-time communication pathways between avatar agents
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="gap-1">
              {nodes.length} avatars • {(nodes.length * (nodes.length - 1)) / 2} connections
            </Badge>
            {networkState && (
              <Badge variant="outline" className="gap-1">
                <Zap className="w-3 h-3" />
                {networkState.stats.messagesLastMinute} msg/min
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => simulateNetworkActivity(15000)}
              disabled={!networkSubscribed}
            >
              <Play className="w-4 h-4 mr-1" />
              Simulate
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div
          ref={containerRef}
          className="relative w-full h-[500px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg overflow-hidden"
        >
          {/* Animated background grid */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Connection lines - ALL avatars connected */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Active connection filter */}
              <filter id="activeGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Pre-define ALL gradients using explicit loops to avoid null values */}
              {(() => {
                const gradients: JSX.Element[] = [];
                for (let i = 0; i < nodes.length; i++) {
                  for (let j = i + 1; j < nodes.length; j++) {
                    const color1 = avatarColors[nodes[i].avatar.slug] || "#6b7280";
                    const color2 = avatarColors[nodes[j].avatar.slug] || "#6b7280";
                    gradients.push(
                      <linearGradient key={`grad-${i}-${j}`} id={`grad-${i}-${j}`} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={color1} />
                        <stop offset="100%" stopColor={color2} />
                      </linearGradient>
                    );
                  }
                }
                return gradients;
              })()}
            </defs>

            {/* Draw ALL connection lines explicitly - every avatar to every other */}
            {(() => {
              const connections: JSX.Element[] = [];
              for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                  const node1 = nodes[i];
                  const node2 = nodes[j];
                  const isHovered = hoveredNode === node1.avatar.id || hoveredNode === node2.avatar.id;
                  const isActive = isConnectionActive(node1.avatar.id, node2.avatar.id);
                  const gradientId = `grad-${i}-${j}`;
                  const color1 = avatarColors[node1.avatar.slug] || "#6b7280";
                  const color2 = avatarColors[node2.avatar.slug] || "#6b7280";

                  connections.push(
                    <g key={`connection-${node1.avatar.slug}-${node2.avatar.slug}`}>
                      {/* White base layer for contrast against dark background */}
                      <line
                        x1={node1.x}
                        y1={node1.y}
                        x2={node2.x}
                        y2={node2.y}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth={isActive ? 8 : isHovered ? 6 : 5}
                        strokeLinecap="round"
                      />

                      {/* Glow layer underneath for visibility */}
                      <line
                        x1={node1.x}
                        y1={node1.y}
                        x2={node2.x}
                        y2={node2.y}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={isActive ? 12 : isHovered ? 10 : 8}
                        strokeOpacity={0.4}
                        strokeLinecap="round"
                        filter="url(#glow)"
                      />

                      {/* Main colored line */}
                      <line
                        x1={node1.x}
                        y1={node1.y}
                        x2={node2.x}
                        y2={node2.y}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={isActive ? 4 : isHovered ? 3.5 : 3}
                        strokeOpacity={1}
                        strokeLinecap="round"
                        filter={isActive ? "url(#activeGlow)" : undefined}
                        className={cn(
                          "transition-all duration-300",
                          isActive && "animate-pulse"
                        )}
                      />

                      {/* Animated particles for active connections */}
                      {isActive && (
                        <>
                          <circle r="5" fill="white" filter="url(#glow)">
                            <animateMotion
                              dur="1s"
                              repeatCount="indefinite"
                              path={`M${node1.x},${node1.y} L${node2.x},${node2.y}`}
                            />
                          </circle>
                          <circle r="5" fill="white" filter="url(#glow)">
                            <animateMotion
                              dur="1s"
                              repeatCount="indefinite"
                              begin="0.5s"
                              path={`M${node2.x},${node2.y} L${node1.x},${node1.y}`}
                            />
                          </circle>
                        </>
                      )}
                    </g>
                  );
                }
              }
              console.log(`[NetworkGraph] Rendering ${connections.length} connections for ${nodes.length} nodes:`, nodes.map(n => n.avatar.name));
              return connections;
            })()}
          </svg>

          {/* Central hub indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div
              className={cn(
                "w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20",
                activeConnections.length > 0 && "animate-pulse"
              )}
            />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
            {networkState && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/60 text-xs font-mono">
                  {networkState.stats.activeConnections}
                </span>
              </div>
            )}
          </div>

          {/* Avatar nodes with images */}
          {nodes.map((node) => {
            const color = avatarColors[node.avatar.slug] || "#6b7280";
            const isHovered = hoveredNode === node.avatar.id;
            const isOnline = getAvatarOnlineStatus(node.avatar.id) || node.avatar.isActive;
            const hasActiveConnection = activeConnections.some(
              (c) => c.fromId === node.avatar.id || c.toId === node.avatar.id
            );

            return (
              <div
                key={node.avatar.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  left: node.x,
                  top: node.y,
                  zIndex: isHovered ? 10 : 1,
                }}
                onMouseEnter={() => setHoveredNode(node.avatar.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-full transition-all duration-300",
                    isHovered ? "scale-150 opacity-60" : "scale-100 opacity-30",
                    hasActiveConnection && "animate-ping"
                  )}
                  style={{
                    background: `radial-gradient(circle, ${color}40 0%, transparent 70%)`,
                    width: "80px",
                    height: "80px",
                    top: "-8px",
                    left: "-8px",
                  }}
                />

                {/* Avatar image container */}
                <div
                  className={cn(
                    "relative w-16 h-16 rounded-full cursor-pointer transition-all duration-300 overflow-hidden",
                    "border-2",
                    isHovered ? "scale-125 shadow-2xl" : "scale-100"
                  )}
                  style={{
                    borderColor: color,
                    boxShadow: isHovered
                      ? `0 0 30px ${color}80, 0 0 60px ${color}40`
                      : hasActiveConnection
                      ? `0 0 25px ${color}60, 0 0 50px ${color}30`
                      : `0 0 15px ${color}40`,
                  }}
                >
                  {node.avatar.avatarImageUrl ? (
                    <img
                      src={node.avatar.avatarImageUrl}
                      alt={node.avatar.name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: color }}
                    >
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-300",
                      isHovered ? "opacity-0" : "opacity-20"
                    )}
                    style={{ backgroundColor: color }}
                  />
                </div>

                {/* Label */}
                <div
                  className={cn(
                    "absolute left-1/2 -translate-x-1/2 mt-3 text-center transition-all duration-300 whitespace-nowrap",
                    isHovered ? "opacity-100 translate-y-0" : "opacity-80 translate-y-0"
                  )}
                >
                  <p
                    className="text-xs font-bold text-white drop-shadow-lg px-2 py-1 rounded"
                    style={{
                      textShadow: `0 0 10px ${color}, 0 2px 4px rgba(0,0,0,0.8)`,
                    }}
                  >
                    {node.avatar.name}
                  </p>
                  {isHovered && (
                    <Badge className="mt-1 text-[10px] bg-white/10 backdrop-blur-sm border-white/20">
                      {isOnline ? "ONLINE" : "OFFLINE"}
                    </Badge>
                  )}
                </div>

                {/* Active/Inactive indicator */}
                <div
                  className={cn(
                    "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900",
                    isOnline ? "bg-green-500" : "bg-gray-500",
                    hasActiveConnection && "animate-pulse"
                  )}
                />
              </div>
            );
          })}

          {/* Empty state */}
          {avatars.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-white/60">
              <p>No avatars to display</p>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span>Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-500" />
            <span>Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-purple-500" />
            <span>Channel</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 animate-pulse rounded" />
            <span>Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AvatarNetworkGraph;
