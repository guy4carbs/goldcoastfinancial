/**
 * IUL Visual Diagram - Cap/Floor/Participation Rate Visualization
 *
 * Interactive visual component that demonstrates how IUL crediting works
 * with caps, floors, and participation rates. Used in training modules
 * to help agents understand and explain IUL mechanics to clients.
 */

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Shield,
  BarChart3,
  ArrowRight,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

// Default values matching common IUL products
const DEFAULT_CAP = 10;
const DEFAULT_FLOOR = 0;
const DEFAULT_PARTICIPATION = 100;

interface IULScenario {
  name: string;
  indexReturn: number;
  description: string;
}

const PRESET_SCENARIOS: IULScenario[] = [
  { name: "Strong Market", indexReturn: 25, description: "Bull market with high returns" },
  { name: "Moderate Growth", indexReturn: 12, description: "Average market performance" },
  { name: "Slight Gain", indexReturn: 5, description: "Below-average positive year" },
  { name: "Flat Market", indexReturn: 0, description: "No market movement" },
  { name: "Market Decline", indexReturn: -15, description: "Significant market downturn" },
  { name: "Market Crash", indexReturn: -35, description: "Severe market correction" }
];

interface IULVisualDiagramProps {
  initialCap?: number;
  initialFloor?: number;
  initialParticipation?: number;
  showControls?: boolean;
  showScenarios?: boolean;
  className?: string;
}

export function IULVisualDiagram({
  initialCap = DEFAULT_CAP,
  initialFloor = DEFAULT_FLOOR,
  initialParticipation = DEFAULT_PARTICIPATION,
  showControls = true,
  showScenarios = true,
  className
}: IULVisualDiagramProps) {
  const [cap, setCap] = useState(initialCap);
  const [floor, setFloor] = useState(initialFloor);
  const [participation, setParticipation] = useState(initialParticipation);
  const [indexReturn, setIndexReturn] = useState(12);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Calculate credited return based on IUL mechanics
  const creditedReturn = useMemo(() => {
    // Step 1: Apply participation rate
    const afterParticipation = indexReturn * (participation / 100);

    // Step 2: Apply floor (protects against negative returns)
    const afterFloor = Math.max(afterParticipation, floor);

    // Step 3: Apply cap (limits upside)
    const afterCap = Math.min(afterFloor, cap);

    return afterCap;
  }, [indexReturn, cap, floor, participation]);

  // Determine if cap or floor was applied
  const capApplied = indexReturn * (participation / 100) > cap;
  const floorApplied = indexReturn * (participation / 100) < floor;

  // Reset to defaults
  const resetDefaults = () => {
    setCap(DEFAULT_CAP);
    setFloor(DEFAULT_FLOOR);
    setParticipation(DEFAULT_PARTICIPATION);
    setIndexReturn(12);
    setSelectedScenario(null);
  };

  // Apply scenario
  const applyScenario = (scenario: IULScenario) => {
    setIndexReturn(scenario.indexReturn);
    setSelectedScenario(scenario.name);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg">IUL Cap & Floor Visualization</CardTitle>
              <p className="text-emerald-100 text-sm">
                See how caps, floors, and participation rates affect returns
              </p>
            </div>
          </div>
          {showControls && (
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
              onClick={resetDefaults}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Visual Diagram */}
        <div className="relative bg-gray-50 rounded-xl p-6">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between py-8 text-xs text-gray-500">
            <span>+30%</span>
            <span>+15%</span>
            <span>0%</span>
            <span>-15%</span>
            <span>-30%</span>
          </div>

          {/* Chart area */}
          <div className="ml-12 relative h-64">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="border-t border-gray-200 w-full" />
              ))}
            </div>

            {/* Zero line */}
            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-gray-400" />

            {/* Cap line */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-emerald-500 cursor-help"
                    style={{ top: `${50 - (cap / 60) * 100}%` }}
                    animate={{ top: `${50 - (cap / 60) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <span className="absolute right-0 -top-5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      Cap: {cap}%
                    </span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    <strong>Cap Rate:</strong> Maximum credited return regardless of index performance.
                    Your return will never exceed this amount.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Floor line */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-blue-500 cursor-help"
                    style={{ top: `${50 - (floor / 60) * 100}%` }}
                    animate={{ top: `${50 - (floor / 60) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <span className="absolute right-0 -top-5 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      Floor: {floor}%
                    </span>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    <strong>Floor:</strong> Minimum credited return. Protects against market losses.
                    Most IUL policies have a 0% floor.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Bars */}
            <div className="absolute inset-0 flex items-center justify-around px-8">
              {/* Index Return Bar */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "w-16 rounded-t-lg relative",
                    indexReturn >= 0 ? "bg-gray-400" : "bg-gray-400"
                  )}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.abs(indexReturn) * 2}px`,
                    y: indexReturn >= 0 ? 0 : `${Math.abs(indexReturn) * 2}px`
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    position: "absolute",
                    bottom: indexReturn >= 0 ? "50%" : "auto",
                    top: indexReturn >= 0 ? "auto" : "50%",
                    transformOrigin: indexReturn >= 0 ? "bottom" : "top"
                  }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-700">
                    {indexReturn >= 0 ? "+" : ""}{indexReturn}%
                  </span>
                </motion.div>
                <span className="absolute bottom-0 translate-y-8 text-xs text-gray-600 font-medium">
                  Index Return
                </span>
              </div>

              {/* Arrow */}
              <ArrowRight className="w-8 h-8 text-gray-300 absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2" />

              {/* Credited Return Bar */}
              <div className="flex flex-col items-center">
                <motion.div
                  className={cn(
                    "w-16 rounded-t-lg relative",
                    creditedReturn >= 0
                      ? capApplied
                        ? "bg-emerald-500"
                        : "bg-emerald-400"
                      : "bg-blue-400"
                  )}
                  initial={{ height: 0 }}
                  animate={{
                    height: `${Math.abs(creditedReturn) * 2}px`,
                    y: creditedReturn >= 0 ? 0 : `${Math.abs(creditedReturn) * 2}px`
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  style={{
                    position: "absolute",
                    bottom: creditedReturn >= 0 ? "50%" : "auto",
                    top: creditedReturn >= 0 ? "auto" : "50%",
                    transformOrigin: creditedReturn >= 0 ? "bottom" : "top"
                  }}
                >
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-emerald-700">
                    {creditedReturn >= 0 ? "+" : ""}{creditedReturn.toFixed(1)}%
                  </span>
                </motion.div>
                <span className="absolute bottom-0 translate-y-8 text-xs text-emerald-700 font-medium">
                  Credited Return
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Explanation Box */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${indexReturn}-${cap}-${floor}-${participation}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-lg border-2",
              capApplied
                ? "bg-emerald-50 border-emerald-200"
                : floorApplied
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
            )}
          >
            <div className="flex items-start gap-3">
              {capApplied ? (
                <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : floorApplied ? (
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              ) : (
                <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  {capApplied
                    ? "Cap Applied - Upside Limited"
                    : floorApplied
                      ? "Floor Applied - Downside Protected"
                      : "Direct Pass-Through"}
                </p>
                <p className="text-sm text-gray-600">
                  {capApplied ? (
                    <>
                      The index returned {indexReturn}%, but after {participation}% participation rate ({(indexReturn * participation / 100).toFixed(1)}%),
                      the cap of {cap}% limits your credited return to <strong>{creditedReturn.toFixed(1)}%</strong>.
                    </>
                  ) : floorApplied ? (
                    <>
                      The index returned {indexReturn}%, which would be {(indexReturn * participation / 100).toFixed(1)}% after participation.
                      The floor of {floor}% protects you—your credited return is <strong>{creditedReturn.toFixed(1)}%</strong>.
                    </>
                  ) : (
                    <>
                      The index returned {indexReturn}%. After {participation}% participation rate,
                      your credited return is <strong>{creditedReturn.toFixed(1)}%</strong> (within cap and floor limits).
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        {showControls && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Index Return Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Index Return
                </label>
                <Badge variant={indexReturn >= 0 ? "default" : "destructive"}>
                  {indexReturn >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                  {indexReturn}%
                </Badge>
              </div>
              <Slider
                value={[indexReturn]}
                onValueChange={([v]) => {
                  setIndexReturn(v);
                  setSelectedScenario(null);
                }}
                min={-40}
                max={40}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Simulated S&P 500 annual return
              </p>
            </div>

            {/* Cap Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Cap Rate
                </label>
                <Badge variant="outline" className="text-emerald-600 border-emerald-300">
                  {cap}%
                </Badge>
              </div>
              <Slider
                value={[cap]}
                onValueChange={([v]) => setCap(v)}
                min={5}
                max={20}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Maximum credited return (carrier-set, can change)
              </p>
            </div>

            {/* Floor Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Floor
                </label>
                <Badge variant="outline" className="text-blue-600 border-blue-300">
                  {floor}%
                </Badge>
              </div>
              <Slider
                value={[floor]}
                onValueChange={([v]) => setFloor(v)}
                min={0}
                max={3}
                step={0.5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Minimum credited return (downside protection)
              </p>
            </div>

            {/* Participation Rate Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Participation Rate
                </label>
                <Badge variant="outline" className="text-purple-600 border-purple-300">
                  {participation}%
                </Badge>
              </div>
              <Slider
                value={[participation]}
                onValueChange={([v]) => setParticipation(v)}
                min={50}
                max={150}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Percentage of index gain credited before cap
              </p>
            </div>
          </div>
        )}

        {/* Preset Scenarios */}
        {showScenarios && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Quick Scenarios</h4>
            <div className="flex flex-wrap gap-2">
              {PRESET_SCENARIOS.map((scenario) => (
                <Button
                  key={scenario.name}
                  variant={selectedScenario === scenario.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => applyScenario(scenario)}
                  className={cn(
                    selectedScenario === scenario.name && "bg-emerald-600 hover:bg-emerald-700"
                  )}
                >
                  {scenario.indexReturn >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {scenario.name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Key Takeaways */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Key Compliance Points for Client Discussions
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>- Caps and participation rates are <strong>not guaranteed</strong> and can change</li>
            <li>- The floor protects against index losses, but <strong>policy charges still apply</strong></li>
            <li>- IUL is <strong>not a direct market investment</strong>—it's insurance with index-linked crediting</li>
            <li>- Past index performance does not guarantee future credited returns</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for embedding in modules
export function IULCapFloorMini({
  cap = 10,
  floor = 0,
  indexReturn = 12,
  className
}: {
  cap?: number;
  floor?: number;
  indexReturn?: number;
  className?: string;
}) {
  const creditedReturn = Math.min(Math.max(indexReturn, floor), cap);
  const capApplied = indexReturn > cap;
  const floorApplied = indexReturn < floor;

  return (
    <div className={cn("inline-flex items-center gap-4 p-3 bg-gray-50 rounded-lg", className)}>
      <div className="text-center">
        <div className="text-lg font-bold text-gray-600">{indexReturn}%</div>
        <div className="text-xs text-gray-500">Index</div>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400" />
      <div className="text-center">
        <div className={cn(
          "text-lg font-bold",
          capApplied ? "text-emerald-600" : floorApplied ? "text-blue-600" : "text-gray-700"
        )}>
          {creditedReturn}%
        </div>
        <div className="text-xs text-gray-500">
          {capApplied ? "Capped" : floorApplied ? "Floor" : "Credited"}
        </div>
      </div>
      <Badge variant="outline" className="text-xs">
        Cap: {cap}% | Floor: {floor}%
      </Badge>
    </div>
  );
}
