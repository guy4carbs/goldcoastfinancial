/**
 * Annuity Crediting Methods Flowchart
 *
 * Visual comparison of different annuity crediting methods:
 * - Fixed Rate
 * - Annual Point-to-Point
 * - Monthly Sum/Average
 * - Performance Trigger
 *
 * Helps agents understand and explain crediting strategies to clients.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Calculator,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CreditingMethod {
  id: string;
  name: string;
  shortName: string;
  description: string;
  howItWorks: string[];
  pros: string[];
  cons: string[];
  bestFor: string;
  complexity: "Simple" | "Moderate" | "Complex";
  example: {
    scenario: string;
    calculation: string;
    result: string;
  };
  icon: React.ElementType;
}

const CREDITING_METHODS: CreditingMethod[] = [
  {
    id: "fixed",
    name: "Fixed Rate",
    shortName: "Fixed",
    description: "Guaranteed rate declared by carrier, regardless of index performance",
    howItWorks: [
      "Carrier declares a fixed interest rate (e.g., 3%)",
      "Rate is credited regardless of market conditions",
      "Rate may change at carrier's discretion (typically annually)",
      "No participation rate or cap applies"
    ],
    pros: [
      "Predictable, guaranteed growth",
      "No market risk",
      "Easy to understand and explain"
    ],
    cons: [
      "Lower potential returns than indexed options",
      "Rate can decrease in low-interest environments",
      "No upside participation in strong markets"
    ],
    bestFor: "Conservative clients who prioritize stability over growth potential",
    complexity: "Simple",
    example: {
      scenario: "Client allocates $50,000 to fixed account at 3% declared rate",
      calculation: "$50,000 x 3% = $1,500",
      result: "Credited: $1,500 (guaranteed)"
    },
    icon: Calculator
  },
  {
    id: "annual-ptp",
    name: "Annual Point-to-Point",
    shortName: "Annual P2P",
    description: "Compares index value at start and end of crediting period (typically 1 year)",
    howItWorks: [
      "Index value recorded on contract anniversary",
      "One year later, new index value recorded",
      "Percentage change calculated",
      "Participation rate and cap applied to determine credited rate",
      "Floor (typically 0%) protects against losses"
    ],
    pros: [
      "Simple to understand",
      "Ignores intra-year volatility",
      "Clear measurement points"
    ],
    cons: [
      "Timing matters—bad start/end dates can hurt",
      "Misses recovery if index drops then rebounds",
      "Cap limits upside in strong years"
    ],
    bestFor: "Clients comfortable with annual evaluation who want simplicity",
    complexity: "Moderate",
    example: {
      scenario: "Index at 4,000 on anniversary, 4,400 one year later. Cap: 8%, Participation: 100%",
      calculation: "Growth: (4,400 - 4,000) / 4,000 = 10%. After cap: 8%",
      result: "Credited: 8% (capped from 10%)"
    },
    icon: Calendar
  },
  {
    id: "monthly-sum",
    name: "Monthly Sum/Average",
    shortName: "Monthly",
    description: "Tracks monthly index changes, sums or averages them over the year",
    howItWorks: [
      "Index value recorded each month",
      "Monthly change calculated (may have monthly cap)",
      "All monthly changes summed (sum) or averaged (average)",
      "Annual cap may also apply",
      "Negative months can offset positive months"
    ],
    pros: [
      "Can capture gains even if year ends down",
      "More measurement points reduce timing risk",
      "May benefit from volatile markets"
    ],
    cons: [
      "More complex to explain",
      "Monthly caps can significantly limit returns",
      "Negative months drag down total"
    ],
    bestFor: "Clients who understand monthly caps and want to capture interim gains",
    complexity: "Complex",
    example: {
      scenario: "Monthly cap: 2.5%. Months: +3%, +1%, -2%, +4%, -1%, +2%, +3%, -1%, +2%, +1%, +3%, +2%",
      calculation: "Capped months: 2.5%, 1%, -2%, 2.5%, -1%, 2%, 2.5%, -1%, 2%, 1%, 2.5%, 2%. Sum: 14%",
      result: "Credited: 14% (sum of capped monthly returns)"
    },
    icon: LineChart
  },
  {
    id: "trigger",
    name: "Performance Trigger",
    shortName: "Trigger",
    description: "If index is flat or positive, full declared rate is credited; if negative, 0%",
    howItWorks: [
      "Carrier declares a trigger rate (e.g., 6%)",
      "At period end, check if index is positive or flat",
      "If yes: full trigger rate credited",
      "If index is negative: 0% credited",
      "Amount of gain doesn't matter—only direction"
    ],
    pros: [
      "Simple binary outcome",
      "Can beat point-to-point in low-gain years",
      "Predictable when triggered"
    ],
    cons: [
      "No extra benefit from large gains",
      "0% in any down year, even -0.1%",
      "Trigger rates may be lower than caps"
    ],
    bestFor: "Clients who want simplicity and are comfortable with all-or-nothing approach",
    complexity: "Simple",
    example: {
      scenario: "Trigger rate: 6%. Index up 2% for the year.",
      calculation: "Index positive? Yes. Trigger rate: 6%",
      result: "Credited: 6% (full trigger rate—doesn't matter that index only gained 2%)"
    },
    icon: Zap
  }
];

interface AnnuityCreditingFlowchartProps {
  showComparison?: boolean;
  highlightMethod?: string;
  className?: string;
}

export function AnnuityCreditingFlowchart({
  showComparison = true,
  highlightMethod,
  className
}: AnnuityCreditingFlowchartProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(highlightMethod || "annual-ptp");
  const currentMethod = CREDITING_METHODS.find(m => m.id === selectedMethod)!;

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Annuity Crediting Methods</CardTitle>
            <p className="text-purple-100 text-sm">
              Understanding how interest is credited to fixed indexed annuities
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Method Selection */}
        <Tabs value={selectedMethod} onValueChange={setSelectedMethod}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 h-auto p-1">
            {CREDITING_METHODS.map(method => (
              <TabsTrigger
                key={method.id}
                value={method.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-purple-100"
              >
                <method.icon className="w-4 h-4" />
                <span className="text-xs">{method.shortName}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {CREDITING_METHODS.map(method => (
            <TabsContent key={method.id} value={method.id} className="space-y-6 mt-6">
              {/* Method Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{method.name}</h3>
                  <p className="text-gray-600 mt-1">{method.description}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    method.complexity === "Simple" && "border-green-300 text-green-700 bg-green-50",
                    method.complexity === "Moderate" && "border-amber-300 text-amber-700 bg-amber-50",
                    method.complexity === "Complex" && "border-red-300 text-red-700 bg-red-50"
                  )}
                >
                  {method.complexity}
                </Badge>
              </div>

              {/* Visual Flowchart */}
              <MethodFlowchart method={method} />

              {/* How It Works */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-purple-600" />
                  How It Works
                </h4>
                <ol className="space-y-2">
                  {method.howItWorks.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Example */}
              <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50/50">
                <h4 className="font-medium text-purple-900 mb-3">Example Calculation</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Scenario:</strong> {method.example.scenario}</p>
                  <p><strong>Calculation:</strong> {method.example.calculation}</p>
                  <p className="text-purple-700 font-semibold">
                    <strong>Result:</strong> {method.example.result}
                  </p>
                </div>
              </div>

              {/* Pros and Cons */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Advantages
                  </h4>
                  <ul className="space-y-2">
                    {method.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                        <span className="text-green-500 mt-0.5">+</span>
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Considerations
                  </h4>
                  <ul className="space-y-2">
                    {method.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                        <span className="text-red-500 mt-0.5">-</span>
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best For */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-medium text-amber-800 mb-1">Best For:</h4>
                <p className="text-sm text-amber-700">{method.bestFor}</p>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Comparison Table */}
        {showComparison && (
          <div className="mt-8">
            <h4 className="font-medium text-gray-900 mb-4">Quick Comparison</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Method</th>
                    <th className="text-left py-2 px-4">Complexity</th>
                    <th className="text-left py-2 px-4">Upside Potential</th>
                    <th className="text-left py-2 px-4">Volatility Impact</th>
                    <th className="text-left py-2 pl-4">Best Market</th>
                  </tr>
                </thead>
                <tbody>
                  {CREDITING_METHODS.map(method => (
                    <tr
                      key={method.id}
                      className={cn(
                        "border-b",
                        selectedMethod === method.id && "bg-purple-50"
                      )}
                    >
                      <td className="py-3 pr-4 font-medium">{method.shortName}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            method.complexity === "Simple" && "border-green-300 text-green-700",
                            method.complexity === "Moderate" && "border-amber-300 text-amber-700",
                            method.complexity === "Complex" && "border-red-300 text-red-700"
                          )}
                        >
                          {method.complexity}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {method.id === "fixed" && "Low"}
                        {method.id === "annual-ptp" && "Moderate-High"}
                        {method.id === "monthly-sum" && "Variable"}
                        {method.id === "trigger" && "Fixed Rate"}
                      </td>
                      <td className="py-3 px-4">
                        {method.id === "fixed" && "None"}
                        {method.id === "annual-ptp" && "End-date dependent"}
                        {method.id === "monthly-sum" && "Smoothed"}
                        {method.id === "trigger" && "Direction only"}
                      </td>
                      <td className="py-3 pl-4">
                        {method.id === "fixed" && "Any"}
                        {method.id === "annual-ptp" && "Steady growth"}
                        {method.id === "monthly-sum" && "Volatile up"}
                        {method.id === "trigger" && "Slight gains"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compliance Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Key Compliance Points for Client Discussions
          </h4>
          <ul className="text-sm text-amber-700 space-y-1">
            <li>- Crediting methods have <strong>different risk/reward profiles</strong>—match to client goals</li>
            <li>- Caps, participation rates, and trigger rates <strong>can change</strong></li>
            <li>- Past crediting performance <strong>does not guarantee</strong> future results</li>
            <li>- Client must understand the <strong>specific method</strong> they're selecting</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

// Visual flowchart for each method
function MethodFlowchart({ method }: { method: CreditingMethod }) {
  const flowchartConfig = {
    fixed: [
      { label: "Carrier Declares Rate", color: "bg-purple-100 border-purple-300" },
      { label: "Rate Applied", color: "bg-purple-100 border-purple-300" },
      { label: "Interest Credited", color: "bg-green-100 border-green-300" }
    ],
    "annual-ptp": [
      { label: "Record Start Value", color: "bg-blue-100 border-blue-300" },
      { label: "Wait 1 Year", color: "bg-gray-100 border-gray-300" },
      { label: "Record End Value", color: "bg-blue-100 border-blue-300" },
      { label: "Calculate % Change", color: "bg-purple-100 border-purple-300" },
      { label: "Apply Cap/Floor", color: "bg-amber-100 border-amber-300" },
      { label: "Credit Interest", color: "bg-green-100 border-green-300" }
    ],
    "monthly-sum": [
      { label: "Record Monthly Values", color: "bg-blue-100 border-blue-300" },
      { label: "Calculate Each Month", color: "bg-purple-100 border-purple-300" },
      { label: "Apply Monthly Cap", color: "bg-amber-100 border-amber-300" },
      { label: "Sum All Months", color: "bg-purple-100 border-purple-300" },
      { label: "Apply Annual Cap", color: "bg-amber-100 border-amber-300" },
      { label: "Credit Interest", color: "bg-green-100 border-green-300" }
    ],
    trigger: [
      { label: "Record Start Value", color: "bg-blue-100 border-blue-300" },
      { label: "Wait Period", color: "bg-gray-100 border-gray-300" },
      { label: "Check: Index Up?", color: "bg-purple-100 border-purple-300", decision: true },
      { label: "Yes: Full Trigger Rate", color: "bg-green-100 border-green-300" },
      { label: "No: 0% Credited", color: "bg-red-100 border-red-300" }
    ]
  };

  const steps = flowchartConfig[method.id as keyof typeof flowchartConfig] || [];

  return (
    <div className="flex items-center justify-center gap-2 flex-wrap py-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className={cn(
              "px-4 py-2 rounded-lg border-2 text-sm font-medium text-center min-w-[120px]",
              step.color
            )}
          >
            {step.label}
          </motion.div>
          {idx < steps.length - 1 && (
            <ArrowRight className="w-5 h-5 text-gray-400 mx-1 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// Compact version for embedding
export function CreditingMethodBadge({
  method,
  className
}: {
  method: "fixed" | "annual-ptp" | "monthly-sum" | "trigger";
  className?: string;
}) {
  const methodData = CREDITING_METHODS.find(m => m.id === method);
  if (!methodData) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("cursor-help", className)}>
            <methodData.icon className="w-3 h-3 mr-1" />
            {methodData.shortName}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="font-medium">{methodData.name}</p>
          <p className="text-xs text-gray-500 mt-1">{methodData.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
