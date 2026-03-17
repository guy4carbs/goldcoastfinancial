/**
 * NewAgentStep6ESign — E-Sign Documents (separate step)
 * Tab-based document signing with DocuSign integration.
 * Falls back to local document viewer when DocuSign is not configured.
 */

import { useCallback, useState } from 'react';
import { FileSignature, CheckCircle, Clock, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import { DocumentViewer } from '../shared/DocumentViewer';
import { DocuSignEmbed } from '../shared/DocuSignEmbed';
import { StepCard } from '../shared/StepCard';
import { useOnboardingIntakeForm } from '../useOnboardingIntakeForm';
import type { NewAgentFormData } from '../onboardingIntakeTypes';

const DOC_TABS = [
  { id: 'nda', label: 'NDA', fullName: 'Non-Disclosure Agreement', fieldKey: 'docusignNda' as keyof NewAgentFormData },
  { id: 'debt_rollup', label: 'Debt Roll-Up', fullName: 'Debt Roll-Up Authorization', fieldKey: 'docusignDebtRollup' as keyof NewAgentFormData },
  { id: 'compliance', label: 'Compliance', fullName: 'Compliance Acknowledgment', fieldKey: 'docusignCompliance' as keyof NewAgentFormData },
];

export function NewAgentStep6ESign() {
  const { newAgent, tokenData, updateNewAgentField } = useOnboardingIntakeForm();
  const [activeTab, setActiveTab] = useState(DOC_TABS[0].id);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [signingDocId, setSigningDocId] = useState<string | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

  const signedCount = DOC_TABS.filter((d) => newAgent[d.fieldKey] === 'signed').length;

  const handleInitiateSign = useCallback(async (docId: string) => {
    setIsInitiating(true);
    try {
      const res = await fetch('/api/onboarding/initiate-docusign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: docId,
          profileId: tokenData?.profileId,
          signerName: tokenData ? `${tokenData.firstName} ${tokenData.lastName}` : 'Agent',
          signerEmail: tokenData?.email,
        }),
      });

      const data = await res.json();

      if (data.signingUrl) {
        setSigningUrl(data.signingUrl);
        setSigningDocId(docId);
      } else {
        setSigningUrl(null);
        setSigningDocId(null);
      }
    } catch (error) {
      console.error(`Failed to initiate DocuSign for ${docId}:`, error);
      setSigningUrl(null);
      setSigningDocId(null);
    } finally {
      setIsInitiating(false);
    }
  }, [tokenData]);

  const handleDocuSignComplete = useCallback(async (envelopeId: string) => {
    if (!signingDocId) return;
    const doc = DOC_TABS.find((d) => d.id === signingDocId);
    if (!doc) return;

    try {
      await fetch('/api/onboarding/complete-docusign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: signingDocId,
          profileId: tokenData?.profileId,
          envelopeId,
        }),
      });

      updateNewAgentField(doc.fieldKey, 'signed' as never);
      toast.success(`${doc.fullName} signed successfully`);

      setSigningUrl(null);
      setSigningDocId(null);

      const nextUnsigned = DOC_TABS.find(
        (d) => d.id !== signingDocId && newAgent[d.fieldKey] !== 'signed',
      );
      if (nextUnsigned) {
        setActiveTab(nextUnsigned.id);
      }
    } catch (error) {
      console.error('Failed to complete DocuSign:', error);
    }
  }, [signingDocId, tokenData, newAgent, updateNewAgentField]);

  const handleLocalSign = useCallback(async (docId: string, signatureData: string) => {
    const doc = DOC_TABS.find((d) => d.id === docId);
    if (!doc) return;

    try {
      const res = await fetch('/api/onboarding/sign-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentType: docId,
          profileId: tokenData?.profileId,
          signatureImage: signatureData,
          signerName: tokenData ? `${tokenData.firstName} ${tokenData.lastName}` : 'Agent',
          signerEmail: tokenData?.email || '',
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || 'Failed to sign document');
        return;
      }

      updateNewAgentField(doc.fieldKey, 'signed' as never);
      toast.success(`${doc.fullName} signed successfully`);

      const nextUnsigned = DOC_TABS.find(
        (d) => d.id !== docId && newAgent[d.fieldKey] !== 'signed',
      );
      if (nextUnsigned) {
        setActiveTab(nextUnsigned.id);
      }
    } catch (error) {
      console.error('Sign document error:', error);
      toast.error('Failed to sign document. Please try again.');
    }
  }, [tokenData, newAgent, updateNewAgentField]);

  const showDocuSignIframe = signingUrl && signingDocId === activeTab;

  return (
    <StepCard
      icon={FileSignature}
      title="E-Sign Documents"
      subtitle="Read, sign, and confirm each document below"
    >
      {/* Status summary */}
      <div
        className="flex items-center gap-2"
        style={{
          backgroundColor: signedCount === 3 ? '#ecfdf5' : COLORS.primary.violet[50],
          borderRadius: RADIUS.input,
          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
        }}
      >
        {signedCount === 3 ? (
          <CheckCircle size={16} style={{ color: '#047857', flexShrink: 0 }} />
        ) : (
          <FileText size={16} style={{ color: COLORS.primary.violet[600], flexShrink: 0 }} />
        )}
        <p
          style={{
            fontSize: TYPE.meta,
            fontWeight: 600,
            color: signedCount === 3 ? '#047857' : COLORS.primary.violet[700],
            lineHeight: TYPE.lineHeight,
          }}
        >
          {signedCount === 3
            ? 'All documents signed — you may proceed'
            : `${signedCount} of 3 documents signed — ${3 - signedCount} remaining`}
        </p>
      </div>

      {/* Document tabs */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderRadius: RADIUS.input,
          border: `1px solid ${COLORS.gray[200]}`,
          overflow: 'hidden',
          backgroundColor: COLORS.gray[100],
        }}
      >
        {DOC_TABS.map((doc) => {
          const isActive = activeTab === doc.id;
          const isSigned = newAgent[doc.fieldKey] === 'signed';

          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => {
                setActiveTab(doc.id);
                if (signingDocId !== doc.id) {
                  setSigningUrl(null);
                  setSigningDocId(null);
                }
              }}
              style={{
                flex: 1,
                padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`,
                fontSize: TYPE.caption,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : isSigned ? '#047857' : COLORS.gray[600],
                backgroundColor: isActive ? COLORS.primary.violet[600] : 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transition: 'all 0.2s ease',
              }}
            >
              {isSigned ? (
                <CheckCircle size={14} style={{ color: isActive ? '#fff' : '#047857' }} />
              ) : (
                <Clock size={14} style={{ color: isActive ? '#fff' : COLORS.accent.amber[600] }} />
              )}
              {doc.label}
            </button>
          );
        })}
      </div>

      {/* Loading state */}
      {isInitiating && (
        <div className="flex items-center justify-center" style={{ padding: GRID.spacing.xl }}>
          <Loader2 size={24} className="animate-spin" style={{ color: COLORS.primary.violet[500] }} />
          <span style={{ fontSize: TYPE.meta, color: COLORS.gray[500], marginLeft: GRID.spacing.xs }}>
            Preparing DocuSign...
          </span>
        </div>
      )}

      {/* DocuSign iframe */}
      {showDocuSignIframe && !isInitiating && (
        <DocuSignEmbed
          signingUrl={signingUrl}
          documentType={activeTab}
          onComplete={handleDocuSignComplete}
          onError={(err) => {
            toast.error(err);
            setSigningUrl(null);
            setSigningDocId(null);
          }}
        />
      )}

      {/* Local document viewer (fallback) */}
      {!showDocuSignIframe && !isInitiating && DOC_TABS.map((doc) =>
        activeTab === doc.id ? (
          <DocumentViewer
            key={doc.id}
            documentId={doc.id}
            isSigned={newAgent[doc.fieldKey] === 'signed'}
            onSign={(signatureData: string) => handleLocalSign(doc.id, signatureData)}
          />
        ) : null,
      )}
    </StepCard>
  );
}
