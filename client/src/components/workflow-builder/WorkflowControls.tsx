/**
 * Workflow Controls
 * Custom zoom controls and fit-to-view button
 */

import { useState, useEffect } from "react";
import { useReactFlow, useViewport } from "reactflow";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2, Command } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWorkflowStore } from "./hooks/useWorkflowStore";
import { RADIUS, SHADOW, GLASS } from "@/lib/heritageDesignSystem";

export function WorkflowControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { zoom } = useViewport();
  const { canUndo, canRedo, undo, redo } = useWorkflowStore();

  const [displayZoom, setDisplayZoom] = useState(100);

  // Update display zoom when viewport changes
  useEffect(() => {
    setDisplayZoom(Math.round(zoom * 100));
  }, [zoom]);

  const handleZoomIn = () => {
    zoomIn({ duration: 200 });
  };

  const handleZoomOut = () => {
    zoomOut({ duration: 200 });
  };

  const handleFitView = () => {
    fitView({ padding: 0.2, duration: 300 });
  };

  const isMac = typeof navigator !== "undefined" && navigator.platform.includes("Mac");
  const modKey = isMac ? "⌘" : "Ctrl";

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="absolute bottom-4 left-4 flex items-center gap-1 bg-white/95 backdrop-blur-sm p-1.5 border"
        style={{
          borderRadius: RADIUS.button,
          borderColor: GLASS.border,
          boxShadow: SHADOW.level2,
        }}
      >
        {/* Undo/Redo */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-40"
              onClick={() => undo()}
              disabled={!canUndo()}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="flex items-center gap-1">
              Undo <kbd className="text-[10px] bg-slate-100 px-1 rounded">{modKey}+Z</kbd>
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:text-slate-900 disabled:opacity-40"
              onClick={() => redo()}
              disabled={!canRedo()}
            >
              <Redo2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="flex items-center gap-1">
              Redo <kbd className="text-[10px] bg-slate-100 px-1 rounded">{modKey}+Y</kbd>
            </p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Zoom controls */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:text-slate-900"
              onClick={handleZoomOut}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Zoom out</p>
          </TooltipContent>
        </Tooltip>

        <span className="text-xs font-medium text-slate-600 w-10 text-center tabular-nums">
          {displayZoom}%
        </span>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:text-slate-900"
              onClick={handleZoomIn}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Zoom in</p>
          </TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 mx-1" />

        {/* Fit view */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-600 hover:text-slate-900"
              onClick={handleFitView}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Fit to view</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 border"
        style={{
          borderRadius: RADIUS.button,
          borderColor: GLASS.border,
          boxShadow: SHADOW.level1,
        }}
      >
        <Command className="w-3 h-3 text-slate-400" />
        <span className="text-[10px] text-slate-500">
          <kbd className="bg-slate-100 px-1 rounded mr-1">{modKey}+C</kbd>Copy
          <span className="mx-1.5 text-slate-300">|</span>
          <kbd className="bg-slate-100 px-1 rounded mr-1">{modKey}+V</kbd>Paste
          <span className="mx-1.5 text-slate-300">|</span>
          <kbd className="bg-slate-100 px-1 rounded mr-1">{modKey}+D</kbd>Duplicate
        </span>
      </div>
    </TooltipProvider>
  );
}

export default WorkflowControls;
