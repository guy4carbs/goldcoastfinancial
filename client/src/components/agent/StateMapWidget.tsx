/**
 * StateMapWidget - Dashboard Widget for Territory Coverage
 *
 * Shows an interactive US map with two views:
 * 1. Licensed States - States where the agent is licensed
 * 2. Policy Map - States where the agent has closed policies
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { USStateMap, type StateData } from "@/components/maps/USStateMap";
import { US_STATES, ABBREV_TO_NAME } from "@/components/maps/usStatesPaths";
import { Map, FileCheck, Award, TrendingUp, Expand, X } from "lucide-react";
import { RADIUS, COLORS } from "@/lib/heritageDesignSystem";
import { cn } from "@/lib/utils";
import { ManageLicensesModal } from "./ManageLicensesModal";
import { ManagePoliciesModal } from "./ManagePoliciesModal";

type MapView = 'licenses' | 'policies';

interface StateMapWidgetProps {
  agentId?: string;
  className?: string;
}

interface LicenseSummary {
  licenses: Array<{
    id: string;
    stateCode: string;
    status: string;
    licenseNumber?: string;
    expirationDate?: string;
  }>;
  territories: Array<{
    id: string;
    stateCode: string;
    isPrimary: boolean;
  }>;
}

export function StateMapWidget({ agentId, className }: StateMapWidgetProps) {
  const [activeView, setActiveView] = useState<MapView>('licenses');
  const [expanded, setExpanded] = useState(false);
  const [manageLicensesOpen, setManageLicensesOpen] = useState(false);
  const [managePoliciesOpen, setManagePoliciesOpen] = useState(false);

  // Fetch license data from API
  const { data: licenseSummary, isLoading } = useQuery<LicenseSummary>({
    queryKey: ["/api/licenses/summary"],
    queryFn: async () => {
      const response = await fetch("/api/licenses/summary", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch licenses");
      return response.json();
    },
  });

  // Fetch policy data from API
  interface PolicySummaryItem {
    stateCode: string;
    count: number;
    totalPremium: number;
    totalCoverage: number;
  }

  const { data: policySummary } = useQuery<{ policies: PolicySummaryItem[] }>({
    queryKey: ["/api/policies/summary"],
    queryFn: async () => {
      const response = await fetch("/api/policies/summary", { credentials: "include" });
      if (!response.ok) throw new Error("Failed to fetch policies");
      return response.json();
    },
  });

  // Transform API policy data into map state data
  const policyMapData = useMemo(() => {
    const result: Record<string, StateData> = {};
    if (policySummary?.policies) {
      policySummary.policies.forEach(p => {
        result[p.stateCode] = {
          highlighted: true,
          count: p.count,
          value: p.totalPremium,
        };
      });
    }
    return result;
  }, [policySummary]);

  // Transform API license data into map state data
  const licenseMapData = useMemo(() => {
    const result: Record<string, StateData> = {};
    if (licenseSummary?.licenses) {
      licenseSummary.licenses.forEach(lic => {
        result[lic.stateCode] = {
          highlighted: true,
          status: lic.status === 'active' ? 'active'
            : lic.status === 'pending' ? 'pending'
            : 'expired',
        };
      });
    }
    return result;
  }, [licenseSummary]);

  // Current data based on active view
  const currentData = activeView === 'licenses' ? licenseMapData : policyMapData;

  // Calculate stats
  const stats = useMemo(() => {
    const data = Object.entries(currentData).filter(([_, d]) => d.highlighted);
    return {
      statesCount: data.length,
      totalPolicies: data.reduce((sum, [_, d]) => sum + (d.count || 0), 0),
      totalValue: data.reduce((sum, [_, d]) => sum + (d.value || 0), 0),
      activeCount: data.filter(([_, d]) => d.status === 'active').length,
      pendingCount: data.filter(([_, d]) => d.status === 'pending').length,
    };
  }, [currentData]);

  // Sorted state list for expanded modal
  const stateList = useMemo(() => {
    return US_STATES
      .map(state => ({
        abbreviation: state.abbreviation,
        name: state.name,
        data: currentData[state.abbreviation],
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [currentData]);

  // Shared toggle component
  const ViewToggle = ({ variant = 'light' }: { variant?: 'light' | 'dark' }) => (
    <div
      className="flex gap-1 p-1"
      style={{
        backgroundColor: variant === 'dark' ? 'rgba(255, 255, 255, 0.1)' : COLORS.gray[100],
        borderRadius: RADIUS.button,
      }}
    >
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setActiveView('licenses')}
        className={cn(
          "h-7 px-3 text-xs font-medium transition-all",
          activeView === 'licenses'
            ? variant === 'dark'
              ? "bg-white text-violet-700 shadow-sm"
              : "bg-white text-violet-700 shadow-sm"
            : variant === 'dark'
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
        style={{ borderRadius: RADIUS.button }}
      >
        <FileCheck className="w-3 h-3 mr-1" />
        Licenses
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setActiveView('policies')}
        className={cn(
          "h-7 px-3 text-xs font-medium transition-all",
          activeView === 'policies'
            ? variant === 'dark'
              ? "bg-white text-violet-700 shadow-sm"
              : "bg-white text-violet-700 shadow-sm"
            : variant === 'dark'
              ? "text-white/70 hover:text-white hover:bg-white/10"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
        )}
        style={{ borderRadius: RADIUS.button }}
      >
        <Award className="w-3 h-3 mr-1" />
        Policies
      </Button>
    </div>
  );

  return (
    <>
      <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] } } }} className={className}>
        <Card
          className={cn("border-0 overflow-hidden")}
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Standard widget header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
                >
                  <Map className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900">Territory Coverage</span>
                  <p className="text-xs text-gray-500 font-normal">
                    {activeView === 'licenses'
                      ? `${stats.statesCount} states licensed`
                      : `${stats.totalPolicies} policies across ${stats.statesCount} states`
                    }
                  </p>
                </div>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => activeView === 'licenses' ? setManageLicensesOpen(true) : setManagePoliciesOpen(true)}
                  className="h-7 px-2.5 text-xs font-medium text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  Manage
                </Button>
                <ViewToggle variant="light" />
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setExpanded(true)}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Expand className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Map Content */}
          <CardContent className="pt-0 pb-4 px-4">
            <div className={cn("transition-opacity duration-300", isLoading && "opacity-50")}>
              <USStateMap
                stateData={currentData}
                showCounts={activeView === 'policies'}
                highlightColor={activeView === 'licenses' ? COLORS.primary.violet[500] : COLORS.primary.violet[600]}
                onStateClick={(code, name) => {
                  console.log(`Clicked: ${name} (${code})`);
                }}
              />
            </div>

            {/* Legend & Stats */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              {activeView === 'licenses' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS.primary.violet[500] }}
                      />
                      <span className="text-xs text-gray-600">Active ({stats.activeCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS.accent.amber[400] }}
                      />
                      <span className="text-xs text-gray-600">Pending ({stats.pendingCount})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-gray-200" />
                      <span className="text-xs text-gray-600">Not Licensed</span>
                    </div>
                  </div>
                  <Badge
                    className="bg-violet-100 text-violet-700 border-0"
                    style={{ borderRadius: RADIUS.pill }}
                  >
                    {stats.statesCount} States
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ backgroundColor: COLORS.primary.violet[600] }}
                      />
                      <span className="text-xs text-gray-600">Has Policies</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-gray-200" />
                      <span className="text-xs text-gray-600">No Policies</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className="bg-violet-100 text-violet-700 border-0"
                      style={{ borderRadius: RADIUS.pill }}
                    >
                      {stats.totalPolicies} Policies
                    </Badge>
                    {stats.totalValue > 0 && (
                      <Badge
                        className="bg-amber-100 text-amber-700 border-0"
                        style={{ borderRadius: RADIUS.pill }}
                      >
                        <TrendingUp className="w-3 h-3 mr-1" />
                        ${stats.totalValue.toLocaleString()} AP
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Expanded Modal */}
      <Dialog open={expanded} onOpenChange={setExpanded}>
        <DialogContent
          className="max-w-[1280px] w-[95vw] h-[85vh] p-0 border-0 overflow-hidden [&>button.absolute]:hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: 24,
            boxShadow: '0 16px 24px rgba(0, 0, 0, 0.08)',
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>
              {activeView === 'licenses' ? 'License Map' : 'Policy Map'}
            </DialogTitle>
            <DialogDescription>
              {activeView === 'licenses'
                ? 'States where you are licensed'
                : 'Policies submitted per state'
              }
            </DialogDescription>
          </DialogHeader>

          {/* Custom modal header */}
          <div className="px-6 pt-6 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25"
              >
                <Map className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {activeView === 'licenses' ? 'License Map' : 'Policy Map'}
                </h2>
                <p className="text-sm text-gray-500">
                  {activeView === 'licenses'
                    ? `Licensed in ${stats.statesCount} states`
                    : `${stats.totalPolicies} policies across ${stats.statesCount} states`
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ViewToggle variant="light" />
              <button
                onClick={() => setExpanded(false)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Color gradient bar */}
          <div className="mx-6 h-0.5 rounded-full" style={{ background: `linear-gradient(90deg, ${COLORS.primary.violet[500]} 0%, ${COLORS.primary.violet[300]} 40%, ${COLORS.accent.amber[300]} 70%, ${COLORS.accent.amber[400]} 100%)` }} />

          {/* Modal body: map + state list */}
          <div className="flex flex-1 min-h-0 px-6 py-4 gap-6">
            {/* Map area */}
            <div className="flex-1 flex flex-col min-w-0">
              <ExpandedMap
                stateData={currentData}
                activeView={activeView}
              />

              {/* Legend below map */}
              <div className="mt-4 flex items-center gap-6">
                {activeView === 'licenses' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.primary.violet[500] }} />
                      <span className="text-xs text-gray-500">Active ({stats.activeCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.accent.amber[400] }} />
                      <span className="text-xs text-gray-500">Pending ({stats.pendingCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f0ebe0' }} />
                      <span className="text-xs text-gray-500">Not Licensed</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS.primary.violet[500] }} />
                      <span className="text-xs text-gray-500">Has Policies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#f0ebe0' }} />
                      <span className="text-xs text-gray-500">No Policies</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* State list sidebar */}
            <div
              className="w-56 flex-shrink-0 flex flex-col"
              style={{
                background: COLORS.primary.violet[50],
                borderRadius: 16,
                border: `1px solid ${COLORS.primary.violet[100]}`,
              }}
            >
              {/* List header */}
              <div className="px-4 py-3 border-b border-violet-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">States</span>
                <span className="text-xs font-medium text-gray-500">
                  {activeView === 'licenses' ? 'Status' : 'Deals'}
                </span>
              </div>

              {/* Scrollable state list */}
              <ScrollArea className="flex-1">
                <div className="py-1">
                  {stateList.map((state) => {
                    const isActive = state.data?.highlighted;
                    return (
                      <div
                        key={state.abbreviation}
                        className={cn(
                          "flex items-center justify-between px-4 py-2 transition-colors",
                          isActive ? "hover:bg-violet-100/60" : "hover:bg-violet-50"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: !isActive
                                ? COLORS.gray[300]
                                : state.data?.status === 'pending'
                                  ? COLORS.accent.amber[500]
                                  : state.data?.status === 'expired'
                                    ? '#ef4444'
                                    : COLORS.primary.violet[500],
                            }}
                          />
                          <span className={cn("text-sm truncate", isActive ? "text-gray-900 font-medium" : "text-gray-600")}>{state.name}</span>
                          <span className={cn("text-xs flex-shrink-0", isActive ? "text-gray-500" : "text-gray-400")}>{state.abbreviation}</span>
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {activeView === 'licenses' ? (
                            isActive ? (
                              <span className={cn(
                                "text-xs font-semibold capitalize",
                                state.data?.status === 'active' && "text-emerald-600",
                                state.data?.status === 'pending' && "text-amber-600",
                                state.data?.status === 'expired' && "text-red-500",
                              )}>
                                {state.data?.status || 'active'}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )
                          ) : (
                            <span className={cn(
                              "text-sm font-semibold tabular-nums",
                              isActive && state.data?.count ? "text-violet-700" : "text-gray-400"
                            )}>
                              {state.data?.count || 0}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>

              {/* List footer */}
              <div className="px-4 py-3 border-t border-violet-100">
                {activeView === 'licenses' ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total Licensed</span>
                    <span className="text-sm font-bold text-violet-600">{stats.statesCount}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Total Policies</span>
                      <span className="text-sm font-bold text-violet-600">{stats.totalPolicies}</span>
                    </div>
                    {stats.totalValue > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Total AP</span>
                        <span className="text-sm font-bold text-amber-600">${stats.totalValue.toLocaleString()} AP</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* License Management Modal */}
      <ManageLicensesModal open={manageLicensesOpen} onOpenChange={setManageLicensesOpen} />

      {/* Policy Management Modal */}
      <ManagePoliciesModal open={managePoliciesOpen} onOpenChange={setManagePoliciesOpen} />
    </>
  );
}

// Small states that need smaller font
const SMALL_STATES = new Set(['DC', 'RI', 'DE', 'CT', 'NJ', 'NH', 'VT', 'MA', 'MD', 'HI']);

// Manual centroid overrides for states where d3's geometric centroid lands poorly
const LABEL_OFFSETS: Record<string, [number, number]> = {
  FL: [10, -10],     // Florida — center in northern peninsula
  MI: [15, 25],      // Michigan — move down into lower peninsula
  LA: [-10, -10],    // Louisiana — nudge into upper-left body
  CA: [-10, 0],      // California — nudge west into body
  ID: [0, 8],        // Idaho — nudge south into wider part
  AK: [0, 0],
  HI: [0, 0],
  NY: [5, 0],        // New York — nudge east away from PA border
  VA: [10, -2],      // Virginia — nudge east
  MD: [5, 0],        // Maryland — nudge east
  MA: [8, 0],        // Massachusetts — nudge east
  NJ: [0, 3],        // New Jersey — nudge south
};

function getLabelPosition(abbrev: string, centroid: [number, number]): [number, number] {
  const offset = LABEL_OFFSETS[abbrev];
  if (offset) {
    return [centroid[0] + offset[0], centroid[1] + offset[1]];
  }
  return centroid;
}

/**
 * Expanded map with state abbreviation labels rendered on each state
 */
function ExpandedMap({
  stateData,
  activeView,
}: {
  stateData: Record<string, StateData>;
  activeView: MapView;
}) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  return (
    <div className="flex-1 flex items-center justify-center">
      <svg
        viewBox="0 0 975 610"
        className="w-full h-auto"
        style={{ maxHeight: 'calc(85vh - 240px)' }}
      >
        {US_STATES.map((state) => {
          const data = stateData[state.abbreviation];
          const isHighlighted = data?.highlighted || false;
          const isHovered = hoveredState === state.abbreviation;

          const beige = '#f0ebe0';
          const beigeHover = '#e6dfd2';
          let fillColor = beige;
          if (isHighlighted) {
            if (data?.status === 'pending') {
              fillColor = COLORS.accent.amber[400];
            } else if (data?.status === 'expired') {
              fillColor = '#ef4444';
            } else {
              fillColor = COLORS.primary.violet[500];
            }
          }

          return (
            <g key={state.abbreviation}>
              <path
                d={state.path}
                fill={isHovered && isHighlighted ? COLORS.primary.violet[400] : isHovered && !isHighlighted ? beigeHover : fillColor}
                stroke={isHighlighted ? 'rgba(255, 255, 255, 0.7)' : '#c8bfb0'}
                strokeWidth={isHovered ? 2 : 1}
                strokeLinejoin="round"
                className="transition-colors duration-150 cursor-pointer"
                onMouseEnter={() => setHoveredState(state.abbreviation)}
                onMouseLeave={() => setHoveredState(null)}
              />
              {/* State abbreviation label */}
              {(() => {
                const pos = getLabelPosition(state.abbreviation, state.centroid);
                const isSmall = SMALL_STATES.has(state.abbreviation);
                return (
                  <text
                    x={pos[0]}
                    y={pos[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isHighlighted ? '#ffffff' : '#7a7265'}
                    fontSize={isSmall ? 8 : 11}
                    fontWeight="700"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    letterSpacing="0.5"
                    className="pointer-events-none select-none"
                    style={{ textShadow: isHighlighted ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}
                  >
                    {state.abbreviation}
                  </text>
                );
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default StateMapWidget;
