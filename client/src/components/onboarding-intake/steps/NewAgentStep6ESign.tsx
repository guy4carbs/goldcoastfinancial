/**
 * NewAgentStep6ESign — E-Sign Documents (separate step)
 * Tab-based document signing with local signature pad and PDF generation.
 */

import { useCallback, useState } from 'react';
import { FileSignature, CheckCircle, Clock, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { GRID, TYPE, RADIUS, COLORS } from '@/lib/heritageDesignSystem';
import { DocumentViewer } from '../shared/DocumentViewer';
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

  const signedCount = DOC_TABS.filter((d) => newAgent[d.fieldKey] === 'signed').length;

  const handleSign = useCallback(async (docId: string, signatureData: string) => {
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
            ? 'All documents signed - you may proceed'
            : `${signedCount} of 3 documents signed - ${3 - signedCount} remaining`}
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
              onClick={() => setActiveTab(doc.id)}
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

      {/* Document viewer with signature pad */}
      {DOC_TABS.map((doc) =>
        activeTab === doc.id ? (
          <DocumentViewer
            key={doc.id}
            documentId={doc.id}
            isSigned={newAgent[doc.fieldKey] === 'signed'}
            onSign={(signatureData: string) => handleSign(doc.id, signatureData)}
          />
        ) : null,
      )}

      {/* SMS Consent — appears after all documents signed */}
      {signedCount === 3 && (
        <div
          style={{
            borderRadius: RADIUS.input,
            border: `1px solid ${newAgent.smsConsent ? '#a7f3d0' : COLORS.gray[200]}`,
            backgroundColor: newAgent.smsConsent ? '#ecfdf5' : '#fafafa',
            padding: `${GRID.spacing.sm}px`,
          }}
        >
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={newAgent.smsConsent === true}
              onChange={(e) => updateNewAgentField('smsConsent' as keyof NewAgentFormData, e.target.checked as never)}
              className="mt-0.5 w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
            />
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                <MessageSquare size={14} style={{ color: COLORS.primary.violet[600] }} />
                <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[800] }}>
                  SMS Communications Consent
                </span>
              </div>
              <span style={{ fontSize: TYPE.caption, color: COLORS.gray[600], lineHeight: 1.5, display: 'block' }}>
                By checking this box, I agree to receive SMS and MMS messages from Heritage Life Solutions (Gold Coast Financial Partners LLC) including authentication codes, customer care responses, account notifications, and marketing/promotional messages. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out or HELP for help. <a href="/legal/privacy" className="underline hover:text-gray-700">Privacy Policy</a>.
              </span>
            </div>
          </label>
        </div>
      )}
    </StepCard>
  );
}
