import { useRef, useState, useEffect, useCallback } from "react";
import { Eraser } from "lucide-react";

interface Props {
  onSignature: (dataUrl: string) => void;
  width?: number;
  height?: number;
}

export function SignaturePadCanvas({ onSignature, width = 500, height = 160 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  }, [drawing, getPos]);

  const endDraw = useCallback(() => {
    setDrawing(false);
    if (hasDrawn && canvasRef.current) {
      onSignature(canvasRef.current.toDataURL("image/png"));
    }
  }, [hasDrawn, onSignature]);

  const clear = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHasDrawn(false);
    onSignature("");
  }, [onSignature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Resolve CSS variable to actual color for canvas API
    const computed = getComputedStyle(canvas);
    const color = computed.getPropertyValue("--gc-text-primary").trim() || "#E8D5C4";
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={width * 2}
        height={height * 2}
        style={{
          width: "100%", height, cursor: "crosshair",
          backgroundColor: "var(--gc-surface-2)", border: "1px solid var(--gc-border)",
          borderRadius: "var(--gc-radius-sm)", touchAction: "none",
        }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
      />
      <div className="flex items-center justify-between mt-2">
        <span style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-muted)" }}>Sign above using your mouse or finger</span>
        <button onClick={clear} className="flex items-center gap-1" style={{ fontSize: "var(--gc-text-xs)", color: "var(--gc-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
          <Eraser className="w-3 h-3" /> Clear
        </button>
      </div>
    </div>
  );
}
