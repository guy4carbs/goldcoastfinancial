/**
 * DocumentViewer — Full document reading + signature + confirmation
 * Renders full legal document text in a scrollable container.
 * Agent must scroll to the bottom, draw a signature, and check confirmation boxes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, AlertCircle, Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { GRID, TYPE, RADIUS, COLORS, SHADOW } from '@/lib/heritageDesignSystem';
import { DOCUMENT_CONTENT } from '@shared/documentContent';

// ---------------------------------------------------------------------------
// Signature Pad (canvas-based)
// ---------------------------------------------------------------------------
interface SignaturePadProps {
  onSignatureChange: (hasSignature: boolean) => void;
  onClear: () => void;
  disabled?: boolean;
  externalCanvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

function SignaturePad({ onSignatureChange, onClear, disabled, externalCanvasRef }: SignaturePadProps) {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    isDrawing.current = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [disabled, getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current || disabled) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    if (!hasDrawn.current) {
      hasDrawn.current = true;
      onSignatureChange(true);
    }
  }, [disabled, getPos, onSignatureChange]);

  const endDraw = useCallback(() => {
    isDrawing.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    onSignatureChange(false);
    onClear();
  }, [onSignatureChange, onClear]);

  // Set up canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  return (
    <div>
      <div
        style={{
          border: `2px dashed ${COLORS.gray[300]}`,
          borderRadius: RADIUS.input,
          backgroundColor: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: 120,
            cursor: disabled ? 'not-allowed' : 'crosshair',
            touchAction: 'none',
          }}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {/* Signature line */}
        <div
          style={{
            position: 'absolute',
            bottom: 28,
            left: 24,
            right: 24,
            height: 1,
            backgroundColor: COLORS.gray[300],
          }}
        />
        <span
          style={{
            position: 'absolute',
            bottom: 10,
            left: 24,
            fontSize: TYPE.micro,
            color: COLORS.gray[400],
          }}
        >
          Sign here
        </span>
      </div>
      <div className="flex justify-end mt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearCanvas}
          style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}
        >
          <Eraser size={14} className="mr-1" />
          Clear Signature
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DocumentViewer
// ---------------------------------------------------------------------------
interface DocumentViewerProps {
  documentId: string;
  isSigned: boolean;
  onSign: (signatureData: string) => void;
  onInitiateDocuSign?: () => void;
}

export function DocumentViewer({ documentId, isSigned, onSign, onInitiateDocuSign }: DocumentViewerProps) {
  const doc = DOCUMENT_CONTENT[documentId];
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [agreedRead, setAgreedRead] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [agreedAccurate, setAgreedAccurate] = useState(false);

  // Reset state when document changes
  useEffect(() => {
    setHasScrolledToBottom(false);
    setHasSignature(false);
    setAgreedRead(false);
    setAgreedTerms(false);
    setAgreedAccurate(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [documentId]);

  // Track scroll position
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 40;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    if (atBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  if (!doc) return null;

  const allChecked = agreedRead && agreedTerms && agreedAccurate;
  const canSign = hasScrolledToBottom && hasSignature && allChecked && !isSigned;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
      {/* Scroll instruction */}
      {!hasScrolledToBottom && !isSigned && (
        <div
          className="flex items-center gap-2"
          style={{
            backgroundColor: COLORS.accent.amber[50],
            border: `1px solid ${COLORS.accent.amber[200]}`,
            borderRadius: RADIUS.input,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
          }}
        >
          <AlertCircle size={16} style={{ color: COLORS.accent.amber[600], flexShrink: 0 }} />
          <p style={{ fontSize: TYPE.micro, color: COLORS.accent.amber[700], lineHeight: TYPE.lineHeight }}>
            Please read the entire document by scrolling to the bottom before signing.
          </p>
        </div>
      )}

      {/* Document body — scrollable */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{
          maxHeight: 420,
          overflowY: 'auto',
          border: `1px solid ${COLORS.gray[200]}`,
          borderRadius: RADIUS.input,
          backgroundColor: '#fff',
          padding: GRID.spacing.md,
        }}
      >
        {/* Document header */}
        <div style={{ textAlign: 'center', marginBottom: GRID.spacing.lg, paddingBottom: GRID.spacing.md, borderBottom: `2px solid ${COLORS.gray[200]}` }}>
          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
            Heritage Life Solutions — Gold Coast Financial Group, LLC
          </p>
          <h3 style={{ fontSize: TYPE.section, fontWeight: 800, color: COLORS.gray[900], letterSpacing: 0.5 }}>
            {doc.title}
          </h3>
          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400], marginTop: 6 }}>
            Illinois License #22128144
          </p>
        </div>

        {/* Sections */}
        {doc.sections.map((section, i) => (
          <div key={i} style={{ marginBottom: GRID.spacing.md }}>
            <h4
              style={{
                fontSize: TYPE.meta,
                fontWeight: 700,
                color: COLORS.gray[800],
                marginBottom: 6,
                lineHeight: TYPE.lineHeight,
              }}
            >
              {section.heading}
            </h4>
            <p
              style={{
                fontSize: TYPE.caption,
                color: COLORS.gray[600],
                lineHeight: 1.7,
                textAlign: 'justify',
              }}
            >
              {section.body}
            </p>
          </div>
        ))}

        {/* End of document marker */}
        <div
          style={{
            textAlign: 'center',
            paddingTop: GRID.spacing.md,
            borderTop: `2px solid ${COLORS.gray[200]}`,
            marginTop: GRID.spacing.md,
          }}
        >
          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400], fontStyle: 'italic' }}>
            — End of Document —
          </p>
        </div>
      </div>

      {/* Already signed state */}
      {isSigned && (
        <div
          className="flex items-center gap-3"
          style={{
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: RADIUS.input,
            padding: GRID.spacing.md,
          }}
        >
          <CheckCircle size={20} style={{ color: '#047857', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: TYPE.meta, fontWeight: 700, color: '#047857', lineHeight: TYPE.lineHeight }}>
              Document Signed
            </p>
            <p style={{ fontSize: TYPE.micro, color: '#059669', lineHeight: TYPE.lineHeight }}>
              You have successfully signed this document.
            </p>
          </div>
        </div>
      )}

      {/* Signature + confirmation section (only if not yet signed) */}
      {!isSigned && (
        <>
          {/* DocuSign option */}
          {onInitiateDocuSign && (
            <Button
              type="button"
              onClick={onInitiateDocuSign}
              disabled={!hasScrolledToBottom}
              className="w-full font-semibold"
              style={{
                background: hasScrolledToBottom ? '#4630EB' : COLORS.gray[300],
                color: '#fff',
                borderRadius: RADIUS.button,
                padding: '12px 24px',
                fontSize: TYPE.body,
                fontWeight: 700,
                border: 'none',
                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                opacity: hasScrolledToBottom ? 1 : 0.6,
              }}
            >
              Sign with DocuSign
            </Button>
          )}

          {onInitiateDocuSign && (
            <div className="flex items-center gap-3" style={{ color: COLORS.gray[400] }}>
              <div style={{ flex: 1, height: 1, backgroundColor: COLORS.gray[200] }} />
              <span style={{ fontSize: TYPE.micro }}>or sign locally below</span>
              <div style={{ flex: 1, height: 1, backgroundColor: COLORS.gray[200] }} />
            </div>
          )}

          {/* Signature pad */}
          <div>
            <p
              style={{
                fontSize: TYPE.meta,
                fontWeight: 700,
                color: hasScrolledToBottom ? COLORS.gray[800] : COLORS.gray[400],
                marginBottom: 8,
                lineHeight: TYPE.lineHeight,
              }}
            >
              Your Signature <span style={{ color: COLORS.semantic.error }}>*</span>
            </p>
            <SignaturePad
              onSignatureChange={setHasSignature}
              onClear={() => setHasSignature(false)}
              disabled={!hasScrolledToBottom}
              externalCanvasRef={signatureCanvasRef}
            />
          </div>

          {/* Confirmation checkboxes */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              opacity: hasScrolledToBottom ? 1 : 0.5,
              pointerEvents: hasScrolledToBottom ? 'auto' : 'none',
            }}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedRead}
                onCheckedChange={(v) => setAgreedRead(v === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <span style={{ fontSize: TYPE.caption, color: COLORS.gray[700], lineHeight: TYPE.lineHeight }}>
                I have read the entire document and understand all terms and conditions contained herein.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedTerms}
                onCheckedChange={(v) => setAgreedTerms(v === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <span style={{ fontSize: TYPE.caption, color: COLORS.gray[700], lineHeight: TYPE.lineHeight }}>
                I agree to be bound by all terms, obligations, and conditions set forth in this agreement.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedAccurate}
                onCheckedChange={(v) => setAgreedAccurate(v === true)}
                disabled={!hasScrolledToBottom}
                className="mt-0.5"
              />
              <span style={{ fontSize: TYPE.caption, color: COLORS.gray[700], lineHeight: TYPE.lineHeight }}>
                I certify that the information I have provided is true and accurate to the best of my knowledge.
              </span>
            </label>
          </div>

          {/* Sign button */}
          <Button
            type="button"
            onClick={() => {
              const canvas = signatureCanvasRef.current;
              if (!canvas) return;
              const signatureData = canvas.toDataURL('image/png');
              onSign(signatureData);
            }}
            disabled={!canSign}
            className="w-full text-white font-semibold"
            style={{
              background: canSign
                ? COLORS.gradients.hero
                : COLORS.gray[300],
              borderRadius: RADIUS.button,
              padding: '12px 24px',
              fontSize: TYPE.body,
              fontWeight: 700,
              border: 'none',
              cursor: canSign ? 'pointer' : 'not-allowed',
              opacity: canSign ? 1 : 0.6,
            }}
          >
            <CheckCircle size={18} className="mr-2" />
            Sign &amp; Confirm Document
          </Button>
        </>
      )}
    </div>
  );
}
