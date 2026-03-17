/**
 * DocuSignCards — Three document signing cards
 * Displays signing status and triggers DocuSign flow
 */

import { FileSignature, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GRID, TYPE, RADIUS, COLORS, MOTION } from '@/lib/heritageDesignSystem';
import { DOCUSIGN_DOCUMENTS } from '../onboardingIntakeConstants';

interface DocumentStatus {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'signed';
}

interface DocuSignCardsProps {
  documents: DocumentStatus[];
  onSign: (docId: string) => void;
  disabled?: boolean;
}

function StatusBadge({ status }: { status: 'pending' | 'signed' }) {
  const isPending = status === 'pending';

  return (
    <span
      className="inline-flex items-center gap-1 whitespace-nowrap"
      style={{
        fontSize: TYPE.micro,
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: RADIUS.pill,
        backgroundColor: isPending ? '#fffbeb' : '#ecfdf5',
        color: isPending ? '#b45309' : '#047857',
      }}
    >
      {!isPending && <CheckCircle size={12} />}
      {isPending ? 'Pending' : 'Signed'}
    </span>
  );
}

export function DocuSignCards({ documents, onSign, disabled }: DocuSignCardsProps) {
  // Merge constant definitions with runtime status
  const mergedDocs = DOCUSIGN_DOCUMENTS.map((doc) => {
    const statusDoc = documents.find((d) => d.id === doc.id);
    return {
      ...doc,
      status: (statusDoc?.status || 'pending') as 'pending' | 'signed',
    };
  });

  return (
    <div className="flex flex-col" style={{ gap: GRID.spacing.sm }}>
      {mergedDocs.map((doc) => {
        const isSigned = doc.status === 'signed';

        return (
          <div
            key={doc.id}
            className="flex items-center gap-4 border border-gray-200 bg-white"
            style={{
              borderRadius: RADIUS.button,
              padding: GRID.spacing.md,
            }}
          >
            {/* Document Icon */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 44,
                height: 44,
                borderRadius: RADIUS.input,
                backgroundColor: isSigned
                  ? '#ecfdf5'
                  : COLORS.primary.violet[50],
              }}
            >
              <FileSignature
                size={20}
                style={{
                  color: isSigned
                    ? '#047857'
                    : COLORS.primary.violet[600],
                }}
              />
            </div>

            {/* Name + Description */}
            <div className="flex-1 min-w-0">
              <p
                className="truncate"
                style={{
                  fontSize: TYPE.meta,
                  fontWeight: 700,
                  color: COLORS.gray[800],
                  lineHeight: TYPE.lineHeight,
                }}
              >
                {doc.name}
              </p>
              <p
                className="line-clamp-2"
                style={{
                  fontSize: TYPE.micro,
                  color: COLORS.gray[500],
                  lineHeight: TYPE.lineHeight,
                  marginTop: 2,
                }}
              >
                {doc.description}
              </p>
            </div>

            {/* Status + Sign Button */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={doc.status} />

              {!isSigned && (
                <Button
                  type="button"
                  onClick={() => onSign(doc.id)}
                  disabled={disabled}
                  className="text-white"
                  style={{
                    background: COLORS.gradients.hero,
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.micro,
                    fontWeight: 600,
                    padding: '8px 16px',
                    border: 'none',
                    transition: `all ${MOTION.duration.hover}s ${MOTION.easingCSS}`,
                  }}
                >
                  Sign Document
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
