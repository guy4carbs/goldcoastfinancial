/**
 * DocuSignEmbed — Embedded DocuSign signing ceremony
 * Shows an iframe with the DocuSign signing URL.
 * Listens for postMessage from the callback page when signing completes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, Loader2, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';

interface DocuSignEmbedProps {
  signingUrl: string;
  documentType: string;
  onComplete: (envelopeId: string) => void;
  onError?: (error: string) => void;
}

export function DocuSignEmbed({ signingUrl, documentType, onComplete, onError }: DocuSignEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeFailed, setIframeFailed] = useState(false);

  // Listen for postMessage from the DocuSign callback page
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'docusign-complete') {
        if (event.data.event === 'signing_complete') {
          onComplete(event.data.envelopeId || '');
        } else if (event.data.event === 'decline' || event.data.event === 'cancel') {
          onError?.(`Signing was ${event.data.event === 'decline' ? 'declined' : 'cancelled'}`);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onComplete, onError]);

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // If iframe can't load (e.g. X-Frame-Options), offer a popup fallback
  const openInNewTab = useCallback(() => {
    window.open(signingUrl, '_blank', 'width=1000,height=800');
  }, [signingUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
      {/* Loading overlay */}
      {isLoading && (
        <div
          className="flex items-center justify-center"
          style={{ padding: GRID.spacing.xl }}
        >
          <Loader2
            size={24}
            className="animate-spin"
            style={{ color: COLORS.primary.violet[500] }}
          />
          <span
            style={{
              fontSize: TYPE.meta,
              color: COLORS.gray[500],
              marginLeft: GRID.spacing.xs,
            }}
          >
            Loading DocuSign...
          </span>
        </div>
      )}

      {/* DocuSign iframe */}
      <iframe
        ref={iframeRef}
        src={signingUrl}
        onLoad={handleIframeLoad}
        onError={() => setIframeFailed(true)}
        title={`Sign ${documentType}`}
        style={{
          width: '100%',
          height: iframeFailed ? 0 : 600,
          border: `1px solid ${COLORS.gray[200]}`,
          borderRadius: RADIUS.input,
          display: isLoading && !iframeFailed ? 'none' : 'block',
        }}
        allow="camera; microphone"
      />

      {/* Fallback if iframe is blocked */}
      {iframeFailed && (
        <div
          style={{
            backgroundColor: COLORS.accent.amber[50],
            border: `1px solid ${COLORS.accent.amber[200]}`,
            borderRadius: RADIUS.input,
            padding: GRID.spacing.md,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: GRID.spacing.sm,
          }}
        >
          <AlertTriangle size={24} style={{ color: COLORS.accent.amber[600] }} />
          <p style={{ fontSize: TYPE.meta, color: COLORS.gray[700], textAlign: 'center' }}>
            DocuSign couldn't load in this window. Click below to sign in a new tab.
          </p>
          <Button
            type="button"
            onClick={openInNewTab}
            className="text-white"
            style={{
              background: COLORS.gradients.hero,
              borderRadius: RADIUS.button,
            }}
          >
            <ExternalLink size={16} className="mr-2" />
            Open DocuSign
          </Button>
        </div>
      )}
    </div>
  );
}
