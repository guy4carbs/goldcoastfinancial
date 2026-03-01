/**
 * Workflow Test Modal
 * Dry-run visualization with animated execution flow
 */

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Play,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  SkipForward,
  Zap,
  GitBranch,
  Timer,
  StopCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Node execution result from backend
interface NodeExecutionResult {
  nodeId: string;
  nodeType: string;
  nodeLabel?: string;
  status: "success" | "failed" | "skipped";
  output?: Record<string, unknown>;
  error?: string;
  duration: number;
}

interface WorkflowExecutionResult {
  success: boolean;
  executionId: string;
  results: NodeExecutionResult[];
  error?: string;
  duration?: number;
}

interface WorkflowTestModalProps {
  open: boolean;
  onClose: () => void;
  workflowId: string;
  workflowName: string;
}

// Status icon component
function StatusIcon({ status }: { status: NodeExecutionResult["status"] }) {
  switch (status) {
    case "success":
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "failed":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "skipped":
      return <SkipForward className="w-4 h-4 text-gray-400" />;
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
}

// Node type icon component
function NodeTypeIcon({ type }: { type: string }) {
  switch (type) {
    case "trigger":
      return <Zap className="w-4 h-4 text-emerald-500" />;
    case "action":
      return <Play className="w-4 h-4 text-teal-500" />;
    case "condition":
      return <GitBranch className="w-4 h-4 text-amber-500" />;
    case "wait":
      return <Timer className="w-4 h-4 text-cyan-500" />;
    case "end":
      return <StopCircle className="w-4 h-4 text-red-500" />;
    default:
      return <AlertCircle className="w-4 h-4 text-gray-400" />;
  }
}

// Node result card component
function NodeResultCard({
  result,
  isActive,
  index,
}: {
  result: NodeExecutionResult;
  isActive: boolean;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasOutput = result.output && Object.keys(result.output).length > 0;
  const hasError = !!result.error;

  return (
    <div
      className={cn(
        "border rounded-lg p-3 transition-all duration-300",
        isActive && "ring-2 ring-violet-500 bg-violet-50",
        result.status === "success" && !isActive && "border-emerald-200 bg-emerald-50/50",
        result.status === "failed" && !isActive && "border-red-200 bg-red-50/50",
        result.status === "skipped" && !isActive && "border-gray-200 bg-gray-50/50"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Step number */}
        <div
          className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
            isActive && "bg-violet-500 text-white",
            !isActive && result.status === "success" && "bg-emerald-500 text-white",
            !isActive && result.status === "failed" && "bg-red-500 text-white",
            !isActive && result.status === "skipped" && "bg-gray-300 text-gray-600"
          )}
        >
          {index + 1}
        </div>

        {/* Node type icon */}
        <NodeTypeIcon type={result.nodeType} />

        {/* Node info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">
              {result.nodeLabel || result.nodeId}
            </span>
            <Badge variant="outline" className="text-xs capitalize">
              {result.nodeType}
            </Badge>
          </div>
          {result.duration > 0 && (
            <span className="text-xs text-gray-500">{result.duration}ms</span>
          )}
        </div>

        {/* Status */}
        <StatusIcon status={result.status} />

        {/* Expand toggle */}
        {(hasOutput || hasError) && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {expanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t space-y-2">
          {hasError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              <strong>Error:</strong> {result.error}
            </div>
          )}
          {hasOutput && (
            <div className="text-xs font-mono bg-gray-100 p-2 rounded overflow-x-auto">
              <pre>{JSON.stringify(result.output, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function WorkflowTestModal({
  open,
  onClose,
  workflowId,
  workflowName,
}: WorkflowTestModalProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(-1);
  const [results, setResults] = useState<NodeExecutionResult[]>([]);
  const [executionResult, setExecutionResult] = useState<WorkflowExecutionResult | null>(null);
  const [testData, setTestData] = useState<string>(
    JSON.stringify(
      {
        lead: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          phone: "(555) 123-4567",
          status: "new",
        },
        agent: {
          name: "Test Agent",
          email: "agent@heritage.com",
        },
      },
      null,
      2
    )
  );
  const [testDataError, setTestDataError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setResults([]);
      setCurrentNodeIndex(-1);
      setExecutionResult(null);
    }
  }, [open]);

  // Validate test data JSON
  const validateTestData = useCallback((data: string): boolean => {
    try {
      JSON.parse(data);
      setTestDataError(null);
      return true;
    } catch {
      setTestDataError("Invalid JSON format");
      return false;
    }
  }, []);

  // Run the test
  const runTest = useCallback(async () => {
    if (!validateTestData(testData)) return;

    setIsRunning(true);
    setResults([]);
    setCurrentNodeIndex(-1);
    setExecutionResult(null);

    try {
      const response = await fetch(`/api/workflow-automations/${workflowId}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ testData: JSON.parse(testData) }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Test failed");
      }

      const result: WorkflowExecutionResult = await response.json();
      setExecutionResult(result);

      // Animate through results one by one
      if (result.results && result.results.length > 0) {
        for (let i = 0; i < result.results.length; i++) {
          setCurrentNodeIndex(i);
          setResults((prev) => [...prev, result.results[i]]);
          // Pause for animation visibility
          await new Promise((resolve) => setTimeout(resolve, 400));
        }
      }

      setCurrentNodeIndex(-1);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setExecutionResult({
        success: false,
        executionId: "",
        results: [],
        error: errorMessage,
      });
    } finally {
      setIsRunning(false);
    }
  }, [workflowId, testData, validateTestData]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-violet-500" />
            Test Workflow
          </DialogTitle>
          <DialogDescription>
            Dry run &quot;{workflowName}&quot; without executing real actions
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 space-y-4">
          {/* Test Data Input */}
          <div className="space-y-2">
            <Label htmlFor="testData" className="text-sm font-medium">
              Test Data (JSON)
            </Label>
            <Textarea
              id="testData"
              value={testData}
              onChange={(e) => {
                setTestData(e.target.value);
                validateTestData(e.target.value);
              }}
              placeholder='{"lead": {"firstName": "John", ...}}'
              className={cn(
                "font-mono text-xs h-32 resize-none",
                testDataError && "border-red-500 focus:ring-red-500"
              )}
              disabled={isRunning}
            />
            {testDataError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {testDataError}
              </p>
            )}
          </div>

          {/* Results */}
          {(results.length > 0 || executionResult?.error) && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Execution Results</Label>
              <ScrollArea className="h-[250px] border rounded-lg p-3">
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <NodeResultCard
                      key={result.nodeId}
                      result={result}
                      isActive={index === currentNodeIndex}
                      index={index}
                    />
                  ))}

                  {executionResult?.error && !results.length && (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                      <strong>Error:</strong> {executionResult.error}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Summary */}
          {executionResult && !isRunning && (
            <div
              className={cn(
                "p-3 rounded-lg flex items-center gap-3",
                executionResult.success ? "bg-emerald-50" : "bg-red-50"
              )}
            >
              {executionResult.success ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="font-medium text-emerald-700">Test Completed Successfully</p>
                    <p className="text-sm text-emerald-600">
                      {results.length} nodes executed in dry-run mode
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-700">Test Failed</p>
                    <p className="text-sm text-red-600">
                      {executionResult.error || "Workflow execution encountered an error"}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose} disabled={isRunning}>
            Close
          </Button>
          <Button
            onClick={runTest}
            disabled={isRunning || !!testDataError}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Test
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default WorkflowTestModal;
