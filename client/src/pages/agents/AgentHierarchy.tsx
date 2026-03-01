/**
 * AgentHierarchy - Visual Tree View
 * Premium dark-themed connected node tree visualization
 * Heritage Lounge Design System
 */

import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Network,
  User,
  Phone,
  Mail,
  Users,
  TrendingUp,
  Award,
  Target,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  SHADOW,
  COLORS,
  RADIUS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import { AgentPageHero } from "@/components/agent/primitives";

// =============================================================================
// TYPES
// =============================================================================

interface HierarchyMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  level: number;
  title: string;
  ytdCommission: number;
  policiesSold: number;
  teamSize: number;
  conversionRate: number;
  avatarUrl: string | null;
}

interface HierarchyData {
  agent: HierarchyMember;
  upline: HierarchyMember[];
  downline: HierarchyMember[];
}

// =============================================================================
// API
// =============================================================================

async function fetchHierarchy(): Promise<HierarchyData | null> {
  const response = await fetch("/api/hierarchy/full", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.data : null;
}

// =============================================================================
// DEMO DATA
// =============================================================================

const DEMO_HIERARCHY: HierarchyData = {
  agent: {
    id: 'you-001',
    name: 'John Smith',
    email: 'john.smith@heritagels.org',
    phone: '(555) 123-4567',
    role: 'sales_agent',
    level: 4,
    title: 'Senior Agent',
    ytdCommission: 85000,
    policiesSold: 47,
    teamSize: 3,
    conversionRate: 24,
    avatarUrl: null,
  },
  upline: [
    {
      id: 'upline-1',
      name: 'Marcus Johnson',
      email: 'marcus.johnson@heritagels.org',
      phone: '(555) 234-5678',
      role: 'manager',
      level: 3,
      title: 'Team Lead',
      ytdCommission: 180000,
      policiesSold: 89,
      teamSize: 12,
      conversionRate: 28,
      avatarUrl: null,
    },
    {
      id: 'upline-2',
      name: 'Sarah Williams',
      email: 'sarah.williams@heritagels.org',
      phone: '(555) 345-6789',
      role: 'manager',
      level: 2,
      title: 'Regional Director',
      ytdCommission: 450000,
      policiesSold: 234,
      teamSize: 48,
      conversionRate: 26,
      avatarUrl: null,
    },
    {
      id: 'upline-3',
      name: 'Jack Thompson',
      email: 'jack.thompson@heritagels.org',
      phone: '(555) 456-7890',
      role: 'owner',
      level: 0,
      title: 'Agency Owner',
      ytdCommission: 1200000,
      policiesSold: 567,
      teamSize: 150,
      conversionRate: 25,
      avatarUrl: null,
    },
  ],
  downline: [
    {
      id: 'downline-1',
      name: 'Emily Chen',
      email: 'emily.chen@heritagels.org',
      phone: '(555) 567-8901',
      role: 'sales_agent',
      level: 5,
      title: 'Agent',
      ytdCommission: 42000,
      policiesSold: 23,
      teamSize: 0,
      conversionRate: 22,
      avatarUrl: null,
    },
    {
      id: 'downline-2',
      name: 'Michael Brown',
      email: 'michael.brown@heritagels.org',
      phone: '(555) 678-9012',
      role: 'sales_agent',
      level: 5,
      title: 'Agent',
      ytdCommission: 38000,
      policiesSold: 19,
      teamSize: 0,
      conversionRate: 20,
      avatarUrl: null,
    },
    {
      id: 'downline-3',
      name: 'Jessica Davis',
      email: 'jessica.davis@heritagels.org',
      phone: '(555) 789-0123',
      role: 'sales_agent',
      level: 6,
      title: 'New Agent',
      ytdCommission: 12000,
      policiesSold: 8,
      teamSize: 0,
      conversionRate: 18,
      avatarUrl: null,
    },
  ],
};

// =============================================================================
// DESIGN TOKENS - Premium Dark Theme
// =============================================================================

const THEME = {
  // Background
  bg: {
    primary: '#12151a',
    card: '#1a1f27',
    cardHover: '#222830',
    glass: 'rgba(30, 35, 45, 0.85)',
  },
  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    card: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(91, 156, 244, 0.3)',
  },
  // Accent colors
  accent: {
    blue: '#5b9cf4',
    purple: COLORS.primary.violet[500],
    gold: '#f4b95b',
    green: '#4ade80',
  },
  // Text
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.6)',
    muted: 'rgba(255, 255, 255, 0.4)',
  },
  // Shadows
  shadow: {
    card: '0 4px 24px rgba(0, 0, 0, 0.4), 0 1px 2px rgba(0, 0, 0, 0.2)',
    glow: '0 0 40px rgba(91, 156, 244, 0.15)',
    youGlow: `0 0 60px ${COLORS.primary.violet[500]}40, 0 0 30px ${COLORS.primary.violet[500]}20`,
  },
};

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Glowing connection dot
 */
function ConnectionDot({ glow = false }: { glow?: boolean }) {
  return (
    <div className="relative">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-3 h-3 rounded-full relative z-10"
        style={{
          backgroundColor: THEME.accent.blue,
          boxShadow: glow
            ? `0 0 12px ${THEME.accent.blue}, 0 0 24px ${THEME.accent.blue}50`
            : `0 0 8px ${THEME.accent.blue}60`,
        }}
      />
    </div>
  );
}

/**
 * Animated connector line
 */
function ConnectorLine({ height = 48, animate = true }: { height?: number; animate?: boolean }) {
  return (
    <motion.div
      initial={animate ? { scaleY: 0, opacity: 0 } : false}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-[2px] origin-top"
      style={{
        height: `${height}px`,
        background: `linear-gradient(180deg, ${THEME.accent.blue}80 0%, ${THEME.accent.blue}40 100%)`,
      }}
    />
  );
}

/**
 * Premium Tree Node Card
 */
function TreeNode({
  member,
  isYou = false,
  isFirst = false,
  isLast = false,
  onSelect,
  isSelected = false,
  delay = 0,
}: {
  member: HierarchyMember;
  isYou?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="flex flex-col items-center"
    >
      {/* Top Connection */}
      {!isFirst && (
        <div className="flex flex-col items-center">
          <ConnectionDot glow={isYou} />
        </div>
      )}

      {/* Card */}
      <motion.div
        whileHover={{ scale: 1.03, y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={onSelect}
        className={cn(
          "relative cursor-pointer",
          "rounded-2xl p-4",
          "backdrop-blur-xl",
          "min-w-[260px] max-w-[300px]",
          "transition-all duration-300"
        )}
        style={{
          backgroundColor: isYou ? `${THEME.accent.purple}15` : THEME.bg.card,
          border: `1px solid ${isYou ? THEME.accent.purple : THEME.border.card}`,
          boxShadow: isYou ? THEME.shadow.youGlow : THEME.shadow.card,
        }}
      >
        {/* YOU Badge */}
        {isYou && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: delay + 0.2, type: "spring", stiffness: 400 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            <div
              className="px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest"
              style={{
                background: `linear-gradient(135deg, ${THEME.accent.purple} 0%, ${COLORS.primary.violet[600]} 100%)`,
                color: '#fff',
                boxShadow: `0 4px 16px ${THEME.accent.purple}50`,
              }}
            >
              You
            </div>
          </motion.div>
        )}

        {/* Card Content */}
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div
            className="relative w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isYou
                ? `linear-gradient(135deg, ${THEME.accent.purple}30 0%, ${THEME.accent.purple}10 100%)`
                : `linear-gradient(135deg, ${THEME.accent.blue}20 0%, ${THEME.accent.blue}05 100%)`,
              border: `1px solid ${isYou ? THEME.accent.purple + '40' : THEME.accent.blue + '30'}`,
            }}
          >
            <User
              className="w-5 h-5"
              style={{ color: isYou ? THEME.accent.purple : THEME.accent.blue }}
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-semibold text-[15px] truncate"
              style={{ color: THEME.text.primary }}
            >
              {member.name}
            </h3>
            <p
              className="text-[13px] truncate flex items-center gap-1.5"
              style={{ color: THEME.text.secondary }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor: isYou ? THEME.accent.purple : THEME.accent.blue,
                }}
              />
              {member.title}
            </p>
          </div>
        </div>

        {/* Expanded Stats */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="mt-4 pt-4 border-t"
                style={{ borderColor: THEME.border.subtle }}
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: THEME.border.subtle }}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3" style={{ color: THEME.accent.gold }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: THEME.accent.gold }}>
                      ${Math.round(member.ytdCommission / 1000)}K
                    </p>
                    <p className="text-[10px]" style={{ color: THEME.text.muted }}>YTD</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: THEME.border.subtle }}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Award className="w-3 h-3" style={{ color: THEME.accent.blue }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: THEME.text.primary }}>
                      {member.policiesSold}
                    </p>
                    <p className="text-[10px]" style={{ color: THEME.text.muted }}>Policies</p>
                  </div>
                  <div className="text-center p-2 rounded-lg" style={{ backgroundColor: THEME.border.subtle }}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Target className="w-3 h-3" style={{ color: THEME.accent.green }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: THEME.text.primary }}>
                      {member.conversionRate}%
                    </p>
                    <p className="text-[10px]" style={{ color: THEME.text.muted }}>Conv.</p>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isYou && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-xs gap-2 rounded-xl transition-all"
                      style={{
                        backgroundColor: `${THEME.accent.blue}15`,
                        color: THEME.accent.blue,
                        border: `1px solid ${THEME.accent.blue}30`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (member.phone) window.location.href = `tel:${member.phone}`;
                      }}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-xs gap-2 rounded-xl transition-all"
                      style={{
                        backgroundColor: `${THEME.accent.purple}15`,
                        color: THEME.accent.purple,
                        border: `1px solid ${THEME.accent.purple}30`,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `mailto:${member.email}`;
                      }}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Email
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bottom Connection */}
      {!isLast && (
        <div className="flex flex-col items-center">
          <ConnectionDot glow={isYou} />
        </div>
      )}
    </motion.div>
  );
}

/**
 * Downline Branch with horizontal spread
 */
function DownlineBranch({
  members,
  selectedId,
  onSelect,
  baseDelay = 0,
}: {
  members: HierarchyMember[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  baseDelay?: number;
}) {
  if (members.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      {/* Vertical connector */}
      <ConnectorLine height={40} />

      {/* Horizontal branch */}
      {members.length > 1 && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: baseDelay }}
          className="h-[2px] mb-1"
          style={{
            width: `${Math.min(members.length * 150, 480)}px`,
            background: `linear-gradient(90deg, transparent 0%, ${THEME.accent.blue}60 20%, ${THEME.accent.blue}60 80%, transparent 100%)`,
          }}
        />
      )}

      {/* Child nodes */}
      <div className="flex justify-center gap-5">
        {members.map((member, idx) => (
          <div key={member.id} className="flex flex-col items-center">
            {members.length > 1 && <ConnectorLine height={24} />}
            <TreeNode
              member={member}
              isFirst={members.length === 1}
              isLast={true}
              isSelected={selectedId === member.id}
              onSelect={() => onSelect(member.id)}
              delay={baseDelay + 0.1 + idx * 0.1}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Loading skeleton with animation
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center py-16 gap-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="flex flex-col items-center"
        >
          <Skeleton
            className="w-[260px] h-[76px] rounded-2xl"
            style={{ backgroundColor: THEME.bg.card }}
          />
          {i < 2 && (
            <div className="w-[2px] h-12 my-1" style={{ backgroundColor: THEME.border.card }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

// Zoom control component
function ZoomControls({
  zoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-6 right-6 z-20 flex items-center gap-1 p-1.5 rounded-xl"
      style={{
        backgroundColor: THEME.bg.card,
        border: `1px solid ${THEME.border.card}`,
        boxShadow: THEME.shadow.card,
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        className="w-9 h-9 p-0 rounded-lg transition-colors"
        style={{ color: THEME.text.secondary }}
        onClick={onZoomOut}
        disabled={zoom <= 0.5}
      >
        <ZoomOut className="w-4 h-4" />
      </Button>

      <div
        className="px-3 py-1 text-xs font-medium min-w-[52px] text-center rounded-md"
        style={{
          backgroundColor: THEME.border.subtle,
          color: THEME.text.primary,
        }}
      >
        {Math.round(zoom * 100)}%
      </div>

      <Button
        size="sm"
        variant="ghost"
        className="w-9 h-9 p-0 rounded-lg transition-colors"
        style={{ color: THEME.text.secondary }}
        onClick={onZoomIn}
        disabled={zoom >= 1.5}
      >
        <ZoomIn className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 mx-1" style={{ backgroundColor: THEME.border.card }} />

      <Button
        size="sm"
        variant="ghost"
        className="w-9 h-9 p-0 rounded-lg transition-colors"
        style={{ color: THEME.text.secondary }}
        onClick={onReset}
      >
        <Maximize2 className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

export default function AgentHierarchy() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const constraintsRef = useRef(null);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.1, 2));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.4));
  const handleReset = () => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle trackpad pinch-to-zoom and scroll-to-zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    // Pinch gesture (ctrlKey is true for pinch on trackpad)
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = -e.deltaY * 0.01;
      setZoom((z) => Math.min(Math.max(z + delta, 0.4), 2));
    }
    // Regular scroll with shift for horizontal pan
    else if (e.shiftKey) {
      e.preventDefault();
      setPosition((p) => ({
        x: p.x - e.deltaY,
        y: p.y,
      }));
    }
  }, []);

  // Attach wheel listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  const { data: hierarchy, isLoading } = useQuery({
    queryKey: ["/api/hierarchy/full"],
    queryFn: fetchHierarchy,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const handleSelect = (id: string) => {
    setSelectedId(selectedId === id ? null : id);
  };

  // Use demo data if no real hierarchy data
  const hasRealData = hierarchy && (hierarchy.upline.length > 0 || hierarchy.downline.length > 0);
  const data = hasRealData ? hierarchy : DEMO_HIERARCHY;
  const isDemo = !hasRealData;

  // Reverse upline so highest level is at top
  const uplineReversed = [...data.upline].reverse();

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-5"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={Network}
            title="My Hierarchy"
            subtitle="Your place in the Heritage Family"
          >
            <div className="flex items-center gap-3">
              {isDemo && (
                <span
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300"
                >
                  Demo Data
                </span>
              )}
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {data.upline.length} Upline
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {data.downline.length} Downline
                </span>
              </div>
            </div>
          </AgentPageHero>
        </motion.div>

        {/* Tree Container */}
        <motion.div
          variants={fadeInUp}
          className="relative rounded-3xl overflow-hidden"
          style={{
            backgroundColor: THEME.bg.primary,
            minHeight: '650px',
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
          }}
        >
          {/* Gradient Overlay at Top */}
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at top, ${THEME.accent.blue}08 0%, transparent 70%)`,
            }}
          />

          {/* Dot Grid Background */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${THEME.border.card} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Tree Content - Zoomable & Draggable */}
          <div
            ref={(el) => {
              constraintsRef.current = el;
              (containerRef as any).current = el;
            }}
            className={cn(
              "relative z-10 py-16 px-8 flex flex-col items-center overflow-hidden min-h-[600px]",
              isDragging ? "cursor-grabbing" : "cursor-grab"
            )}
          >
            <motion.div
              className="flex flex-col items-center select-none"
              drag
              dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
              dragElastic={0.05}
              dragMomentum={true}
              dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
              animate={{
                scale: zoom,
                x: position.x,
                y: position.y,
              }}
              onDragStart={() => setIsDragging(true)}
              onDragEnd={(_, info) => {
                setIsDragging(false);
                setPosition({
                  x: position.x + info.offset.x,
                  y: position.y + info.offset.y,
                });
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              style={{ transformOrigin: "center center" }}
            >
              {isLoading ? (
                <LoadingState />
              ) : (
                <>
                  {/* Upline Chain */}
                  {uplineReversed.map((member, idx) => (
                    <div key={member.id} className="flex flex-col items-center">
                      <TreeNode
                        member={member}
                        isFirst={idx === 0}
                        isSelected={selectedId === member.id}
                        onSelect={() => handleSelect(member.id)}
                        delay={idx * 0.15}
                      />
                      <ConnectorLine height={48} />
                    </div>
                  ))}

                  {/* Current Agent (YOU) */}
                  <TreeNode
                    member={data.agent}
                    isYou={true}
                    isFirst={uplineReversed.length === 0}
                    isLast={data.downline.length === 0}
                    isSelected={selectedId === data.agent.id}
                    onSelect={() => handleSelect(data.agent.id)}
                    delay={uplineReversed.length * 0.15}
                  />

                  {/* Downline */}
                  {data.downline.length > 0 && (
                    <DownlineBranch
                      members={data.downline}
                      selectedId={selectedId}
                      onSelect={handleSelect}
                      baseDelay={(uplineReversed.length + 1) * 0.15}
                    />
                  )}
                </>
              )}
            </motion.div>
          </div>

          {/* Zoom Controls */}
          <ZoomControls
            zoom={zoom}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onReset={handleReset}
          />

          {/* Gradient Overlay at Bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
            style={{
              background: `linear-gradient(to top, ${THEME.bg.primary} 0%, transparent 100%)`,
            }}
          />
        </motion.div>

        {/* Legend */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-6 py-3 flex-wrap"
        >
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: THEME.accent.blue,
                boxShadow: `0 0 8px ${THEME.accent.blue}60`,
              }}
            />
            <span>Connection</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <div
              className="w-5 h-3.5 rounded"
              style={{
                backgroundColor: `${THEME.accent.purple}20`,
                border: `1.5px solid ${THEME.accent.purple}`,
              }}
            />
            <span>Your Position</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>•</span>
            <span>Click cards to expand</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>•</span>
            <span>Drag to pan</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>•</span>
            <span>Pinch to zoom</span>
          </div>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
