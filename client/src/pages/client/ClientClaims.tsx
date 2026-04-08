/**
 * Client Claims Page — Filing & Tracking
 * Heritage Design System — Violet-to-Amber theme
 * Glass cards, framer-motion animations, Heritage tokens
 *
 * Governance: Nova (UI) + Forge (API) + Lumen (flow)
 */

import { useState, useRef, useCallback, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { ClientPageHero } from './primitives/ClientPageHero';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { glassCard, CLAIM_STATUS_COLORS } from './clientConstants';
import { usePortalClaims, usePortalPolicies } from '@/hooks/usePortalData';
import { useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList, FileText, Upload, Clock, CheckCircle, XCircle,
  AlertCircle, ChevronRight, ChevronDown, Plus, X, File, Trash2,
  Calendar, DollarSign, Shield, Loader2, type LucideIcon,
} from 'lucide-react';

// ─── TYPES ───────────────────────────────────────────
interface ClientClaim {
  id: string;
  claimNumber: string;
  policyId: string;
  policyNumber: string;
  type: string;
  status: string;
  description: string;
  amount: number;
  filedDate: string;
  resolvedDate?: string;
  lastUpdate: string;
}

type DemoClaim = ClientClaim;

interface UploadedFile {
  id: string;
  file: File;
  preview?: string;
}

// ─── MAP API RESPONSE ──────────────────────────────
function formatClaimDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function mapApiClaimToClient(raw: any): ClientClaim {
  return {
    id: raw.id,
    claimNumber: raw.claimNumber || `CLM-${raw.id.slice(0, 8)}`,
    policyId: raw.policyId || '',
    policyNumber: raw.policyId || '',
    type: raw.claimType || 'Other',
    status: raw.status || 'filed',
    description: raw.internalNotes || '',
    amount: raw.claimAmount || 0,
    filedDate: formatClaimDate(raw.submittedAt) || formatClaimDate(raw.createdAt),
    resolvedDate: formatClaimDate(raw.approvedAt) || formatClaimDate(raw.deniedAt) || undefined,
    lastUpdate: formatClaimDate(raw.updatedAt) || formatClaimDate(raw.createdAt),
  };
}

// ─── CLAIM STATUS TIMELINE ────────────────────────────
function ClaimStatusTimeline({ status }: { status: string }) {
  const steps = ['Filed', 'Documents', 'Under Review', 'Decision'];
  const statusIndex: Record<string, number> = {
    filed: 0,
    documents_needed: 1,
    under_review: 2,
    approved: 3,
    denied: 3,
  };
  const currentIdx = statusIndex[status] ?? 0;
  const isDenied = status === 'denied';

  return (
    <div className="flex items-center gap-2">
      {steps.map((step, idx) => (
        <Fragment key={step}>
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all',
              idx < currentIdx
                ? 'bg-violet-600 text-white'
                : idx === currentIdx
                  ? isDenied
                    ? 'bg-red-500 text-white'
                    : 'bg-violet-600 text-white ring-4 ring-violet-200'
                  : 'bg-gray-200 text-gray-500'
            )}
          >
            {idx < currentIdx ? (
              <CheckCircle size={16} />
            ) : idx === currentIdx && isDenied ? (
              <XCircle size={16} />
            ) : (
              idx + 1
            )}
          </div>
          {idx < steps.length - 1 && (
            <div
              className={cn(
                'flex-1 h-1 rounded',
                idx < currentIdx ? 'bg-violet-600' : 'bg-gray-200'
              )}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}

// ─── CLAIM TYPE OPTIONS ───────────────────────────────
const CLAIM_TYPE_OPTIONS = [
  'Living Benefits',
  'Death Benefit',
  'Disability Waiver',
  'Accidental Death',
  'Other',
] as const;

// ─── MAIN COMPONENT ──────────────────────────────────
export default function ClientClaims() {
  const [showFileForm, setShowFileForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form state
  const [formPolicy, setFormPolicy] = useState('');
  const [formType, setFormType] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal state
  const [viewClaim, setViewClaim] = useState<DemoClaim | null>(null);
  const [uploadForClaim, setUploadForClaim] = useState<DemoClaim | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<UploadedFile[]>([]);
  const [isUploadDragging, setIsUploadDragging] = useState(false);
  const additionalFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // ─── CLAIMS DATA (live from API via TanStack Query) ────
  const { data: apiClaims = [], isLoading: claimsLoading } = usePortalClaims();
  const { data: policies = [] } = usePortalPolicies();
  const queryClient = useQueryClient();

  // Map API claims to component shape, enrich policyNumber from policies
  const allClaims: ClientClaim[] = apiClaims.map((c: any) => {
    const mapped = mapApiClaimToClient(c);
    // Enrich policyNumber from live policies if available
    if (mapped.policyId && (!mapped.policyNumber || mapped.policyNumber === mapped.policyId)) {
      const policy = policies.find((p) => p.id === mapped.policyId);
      if (policy) {
        mapped.policyNumber = policy.policyNumber;
      }
    }
    return mapped;
  });

  // Split claims into active vs resolved
  const activeClaims = allClaims.filter(
    (c) => c.status !== 'approved' && c.status !== 'denied' && c.status !== 'paid'
  );
  const resolvedClaims = allClaims.filter(
    (c) => c.status === 'approved' || c.status === 'denied' || c.status === 'paid'
  );

  // ─── FILE HANDLING ───────────────────────────────────
  const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  const processFiles = useCallback((files: FileList | File[], target: 'form' | 'upload') => {
    const valid: UploadedFile[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) continue;
      if (file.size > MAX_FILE_SIZE) continue;
      valid.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      });
    }
    if (target === 'form') {
      setUploadedFiles((prev) => [...prev, ...valid]);
    } else {
      setAdditionalFiles((prev) => [...prev, ...valid]);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, target: 'form' | 'upload') => {
    e.preventDefault();
    if (target === 'form') setIsDragging(false);
    else setIsUploadDragging(false);
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files, target);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent, target: 'form' | 'upload') => {
    e.preventDefault();
    if (target === 'form') setIsDragging(true);
    else setIsUploadDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, target: 'form' | 'upload') => {
    e.preventDefault();
    if (target === 'form') setIsDragging(false);
    else setIsUploadDragging(false);
  }, []);

  const removeFile = (fileId: string, target: 'form' | 'upload') => {
    if (target === 'form') {
      setUploadedFiles((prev) => {
        const removed = prev.find((f) => f.id === fileId);
        if (removed?.preview) URL.revokeObjectURL(removed.preview);
        return prev.filter((f) => f.id !== fileId);
      });
    } else {
      setAdditionalFiles((prev) => {
        const removed = prev.find((f) => f.id === fileId);
        if (removed?.preview) URL.revokeObjectURL(removed.preview);
        return prev.filter((f) => f.id !== fileId);
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ─── FORM SUBMIT ────────────────────────────────────
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    const selectedPolicy = policies.find((p) => p.id === formPolicy);

    try {
      const res = await fetch('/api/client-portal/claim-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          policyId: formPolicy,
          policyNumber: selectedPolicy?.policyNumber || '',
          policyType: selectedPolicy?.type || '',
          claimType: formType,
          description: formDescription,
          hasDocuments: uploadedFiles.length > 0,
          documentCount: uploadedFiles.length,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to submit claim');
      }

      const data = await res.json();

      setFormSubmitted(true);

      // Upload attached files to S3 via portal documents endpoint
      if (uploadedFiles.length > 0) {
        const claimId = data.claimNumber || 'unknown';
        for (const uf of uploadedFiles) {
          try {
            const formData = new FormData();
            formData.append('file', uf.file);
            formData.append('name', `Claim ${claimId} - ${uf.file.name}`);
            formData.append('category', 'claim');
            await fetch('/api/portal/documents/upload', {
              method: 'POST',
              credentials: 'include',
              body: formData,
            });
          } catch (uploadErr) {
            console.error('Failed to upload claim document:', uploadErr);
          }
        }
      }

      // Refresh claims list
      queryClient.invalidateQueries({ queryKey: ['/api/client-portal/claims'] });

      // Reset after showing success
      setTimeout(() => {
        setShowFileForm(false);
        setFormSubmitted(false);
        setFormPolicy('');
        setFormType('');
        setFormDescription('');
        setUploadedFiles([]);
      }, 2500);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── ADDITIONAL DOC UPLOAD ──────────────────────────
  const handleUploadDocuments = async () => {
    if (additionalFiles.length === 0 || !uploadForClaim) return;

    for (const uf of additionalFiles) {
      try {
        const formData = new FormData();
        formData.append('file', uf.file);
        formData.append('name', `Claim ${uploadForClaim.claimNumber} - ${uf.file.name}`);
        formData.append('category', 'claim');
        await fetch('/api/portal/documents/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
      } catch {
        console.error('Failed to upload additional claim document');
      }
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadForClaim(null);
      setUploadSuccess(false);
      setAdditionalFiles([]);
    }, 2000);
  };

  // Format currency for claim amounts
  const formatAmount = (amount: number | undefined) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get status label
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      filed: 'Filed',
      documents_needed: 'Documents Needed',
      under_review: 'Under Review',
      approved: 'Approved',
      denied: 'Denied',
    };
    return labels[status] ?? status;
  };

  // Close form helper
  const closeForm = () => {
    setShowFileForm(false);
    setFormSubmitted(false);
    setSubmitError(null);
    setFormPolicy('');
    setFormType('');
    setFormDescription('');
    uploadedFiles.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    setUploadedFiles([]);
  };

  // ─── FILE LIST COMPONENT ───────────────────────────
  function FileList({ files, target }: { files: UploadedFile[]; target: 'form' | 'upload' }) {
    if (files.length === 0) return null;
    return (
      <div className="space-y-2 mt-3">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 px-3 py-2 bg-violet-50 border border-violet-100"
            style={{ borderRadius: RADIUS.input }}
          >
            {f.preview ? (
              <img
                src={f.preview}
                alt=""
                className="w-8 h-8 object-cover flex-shrink-0"
                style={{ borderRadius: RADIUS.input }}
              />
            ) : (
              <File style={{ width: 18, height: 18 }} className="text-violet-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-gray-800 font-medium truncate" style={{ fontSize: TYPE.caption }}>
                {f.file.name}
              </p>
              <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>
                {formatFileSize(f.file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeFile(f.id, target)}
              className="flex-shrink-0 p-1 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 style={{ width: 14, height: 14 }} className="text-red-400 hover:text-red-600" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // ─── DROPZONE COMPONENT ────────────────────────────
  function DropZone({ target, dragging }: { target: 'form' | 'upload'; dragging: boolean }) {
    const inputRef = target === 'form' ? fileInputRef : additionalFileInputRef;
    return (
      <>
        <div
          onDrop={(e) => handleDrop(e, target)}
          onDragOver={(e) => handleDragOver(e, target)}
          onDragLeave={(e) => handleDragLeave(e, target)}
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex flex-col items-center justify-center py-8 border-2 border-dashed transition-all cursor-pointer',
            dragging
              ? 'border-violet-400 bg-violet-50'
              : 'border-gray-300 bg-gray-50 hover:border-violet-300 hover:bg-violet-50/50'
          )}
          style={{ borderRadius: RADIUS.input }}
        >
          <Upload
            style={{ width: 32, height: 32, marginBottom: 8 }}
            className={dragging ? 'text-violet-500' : 'text-gray-400'}
          />
          <p className={cn('font-medium', dragging ? 'text-violet-600' : 'text-gray-500')} style={{ fontSize: TYPE.meta }}>
            {dragging ? 'Drop files here' : 'Drag & drop files here'}
          </p>
          <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
            or click to browse (PDF, JPG, PNG up to 10MB)
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              processFiles(e.target.files, target);
              e.target.value = '';
            }
          }}
        />
      </>
    );
  }

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─────────────────────────────────────── */}
        <ClientPageHero
          icon={ClipboardList}
          title="Claims"
          subtitle="File and track your insurance claims"
        >
          <Button
            onClick={() => {
              if (showFileForm) closeForm();
              else setShowFileForm(true);
            }}
            className="gap-2 font-semibold shadow-lg"
            style={{
              background: 'white',
              color: '#7c3aed',
              borderRadius: RADIUS.button,
              height: 44,
              padding: '0 24px',
            }}
          >
            <Plus style={{ width: 18, height: 18 }} />
            File a Claim
          </Button>
        </ClientPageHero>

        {/* ─── FILE A CLAIM FORM ────────────────────────── */}
        <AnimatePresence>
          {showFileForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: MOTION.duration.transition, ease: MOTION.easing }}
            >
              <Card
                className="border-0 overflow-hidden"
                style={{
                  ...glassCard,
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.hero,
                  border: '2px solid rgba(124, 58, 237, 0.15)',
                }}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                    <FileText style={{ width: 20, height: 20 }} className="text-violet-600" />
                    File a New Claim
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formSubmitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-10 gap-4"
                    >
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: RADIUS.pill,
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          boxShadow: SHADOW.glow.emerald,
                        }}
                      >
                        <CheckCircle style={{ width: 32, height: 32, color: 'white' }} />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                          Claim Submitted Successfully
                        </p>
                        <p className="text-gray-500 mt-1" style={{ fontSize: TYPE.body }}>
                          Your claim has been filed and your agent has been notified. You'll receive a confirmation shortly.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      {/* Error banner */}
                      {submitError && (
                        <div
                          className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-700"
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                        >
                          <AlertCircle style={{ width: 18, height: 18 }} className="flex-shrink-0" />
                          {submitError}
                        </div>
                      )}

                      {/* Policy select */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                          Select Policy
                        </label>
                        <div className="relative">
                          <select
                            value={formPolicy}
                            onChange={(e) => setFormPolicy(e.target.value)}
                            className="appearance-none w-full bg-white border border-gray-200 px-4 pr-10 py-2.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          >
                            <option value="">Choose a policy...</option>
                            {policies.filter((p) => p.status === 'active').map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.type} — {p.carrier} ({p.policyNumber})
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Claim type */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                          Claim Type
                        </label>
                        <div className="relative">
                          <select
                            value={formType}
                            onChange={(e) => setFormType(e.target.value)}
                            className="appearance-none w-full bg-white border border-gray-200 px-4 pr-10 py-2.5 text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300"
                            style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                          >
                            <option value="">Select claim type...</option>
                            {CLAIM_TYPE_OPTIONS.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                          Description
                        </label>
                        <textarea
                          value={formDescription}
                          onChange={(e) => setFormDescription(e.target.value)}
                          placeholder="Describe the circumstances of your claim..."
                          rows={4}
                          className="w-full bg-white border border-gray-200 px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 resize-none"
                          style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
                        />
                      </div>

                      {/* Upload zone */}
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1.5" style={{ fontSize: TYPE.meta }}>
                          Supporting Documents
                        </label>
                        <DropZone target="form" dragging={isDragging} />
                        <FileList files={uploadedFiles} target="form" />
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <Button
                          onClick={handleSubmit}
                          disabled={!formPolicy || !formType || !formDescription || isSubmitting}
                          className="gap-2 text-white font-semibold border-0"
                          style={{
                            background: (!formPolicy || !formType || !formDescription || isSubmitting)
                              ? '#d1d5db'
                              : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                            borderRadius: RADIUS.button,
                            height: 44,
                            padding: '0 24px',
                          }}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <ClipboardList style={{ width: 16, height: 16 }} />
                              Submit Claim
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={closeForm}
                          className="text-gray-600 border-gray-200"
                          style={{ borderRadius: RADIUS.button, height: 44 }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── ACTIVE CLAIMS ────────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle style={{ width: 20, height: 20 }} className="text-violet-600" />
            <h2 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
              Active Claims
            </h2>
            {activeClaims.length > 0 && (
              <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100 border-0 ml-1">
                {activeClaims.length}
              </Badge>
            )}
          </div>

          {activeClaims.length === 0 ? (
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="py-12 text-center">
                <CheckCircle style={{ width: 40, height: 40 }} className="text-emerald-400 mx-auto mb-3" />
                <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
                  No active claims
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeClaims.map((claim) => {
                const statusColor = CLAIM_STATUS_COLORS[claim.status as keyof typeof CLAIM_STATUS_COLORS] || CLAIM_STATUS_COLORS.filed;
                return (
                  <motion.div
                    key={claim.id}
                    whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                    transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                  >
                    <Card
                      className="border-0 overflow-hidden"
                      style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <CardContent className="p-6">
                        {/* Header row */}
                        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                                {claim.claimNumber}
                              </p>
                              <Badge className={cn(statusColor.bg, statusColor.text, 'hover:opacity-90 border-0 gap-1')}>
                                <div className={cn('w-1.5 h-1.5 rounded-full', statusColor.dot)} />
                                {getStatusLabel(claim.status)}
                              </Badge>
                            </div>
                            <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>
                              {claim.type}
                            </p>
                          </div>
                          {claim.amount !== undefined && (
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                              {formatAmount(claim.amount)}
                            </p>
                          )}
                        </div>

                        {/* Policy + dates */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                          <div>
                            <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                              Policy
                            </p>
                            <p className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                              {claim.policyNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                              Filed
                            </p>
                            <p className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                              {claim.filedDate}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                              Last Update
                            </p>
                            <p className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                              {claim.lastUpdate}
                            </p>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-5" style={{ fontSize: TYPE.meta }}>
                          {claim.description}
                        </p>

                        {/* Timeline */}
                        <div className="mb-5">
                          <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                            Progress
                          </p>
                          <ClaimStatusTimeline status={claim.status} />
                          <div className="flex justify-between mt-2">
                            {['Filed', 'Documents', 'Under Review', 'Decision'].map((step) => (
                              <p key={step} className="text-gray-400 text-center" style={{ fontSize: TYPE.micro, width: '25%' }}>
                                {step}
                              </p>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewClaim(claim)}
                            className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <FileText style={{ width: 14, height: 14 }} />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setUploadForClaim(claim)}
                            className="gap-1.5 text-violet-600 border-violet-200 hover:bg-violet-50"
                            style={{ borderRadius: RADIUS.button }}
                          >
                            <Upload style={{ width: 14, height: 14 }} />
                            Upload Documents
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ─── RESOLVED CLAIMS ──────────────────────────── */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle style={{ width: 20, height: 20 }} className="text-emerald-500" />
            <h2 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
              Resolved Claims
            </h2>
            {resolvedClaims.length > 0 && (
              <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-100 border-0 ml-1">
                {resolvedClaims.length}
              </Badge>
            )}
          </div>

          {resolvedClaims.length === 0 ? (
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="py-12 text-center">
                <p className="text-gray-500" style={{ fontSize: TYPE.body }}>
                  No resolved claims
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="p-2">
                <div className="space-y-1">
                  {resolvedClaims.map((claim) => {
                    const statusColor = CLAIM_STATUS_COLORS[claim.status as keyof typeof CLAIM_STATUS_COLORS] || CLAIM_STATUS_COLORS.filed;
                    return (
                      <motion.div
                        key={claim.id}
                        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.04)' }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="flex items-center justify-between flex-wrap gap-3 p-4 cursor-pointer"
                        style={{ borderRadius: RADIUS.button }}
                        onClick={() => setViewClaim(claim)}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div
                            className="flex items-center justify-center flex-shrink-0"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: RADIUS.button,
                              background: claim.status === 'approved'
                                ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)'
                                : 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                            }}
                          >
                            {claim.status === 'approved' ? (
                              <CheckCircle style={{ width: 18, height: 18 }} className="text-emerald-600" />
                            ) : (
                              <XCircle style={{ width: 18, height: 18 }} className="text-red-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {claim.claimNumber} — {claim.type}
                            </p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              Filed {claim.filedDate} {claim.resolvedDate ? `| Resolved ${claim.resolvedDate}` : ''}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {claim.amount !== undefined && (
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                              {formatAmount(claim.amount)}
                            </p>
                          )}
                          <Badge className={cn(statusColor.bg, statusColor.text, 'hover:opacity-90 border-0 gap-1')}>
                            <div className={cn('w-1.5 h-1.5 rounded-full', statusColor.dot)} />
                            {getStatusLabel(claim.status)}
                          </Badge>
                          <ChevronRight style={{ width: 16, height: 16 }} className="text-gray-400" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>

      {/* ─── VIEW DETAILS MODAL ─────────────────────────── */}
      <AnimatePresence>
        {viewClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => setViewClaim(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-white"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white"
                style={{ borderRadius: `${RADIUS.card} ${RADIUS.card} 0 0` }}
              >
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Claim Details
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {viewClaim.claimNumber}
                  </p>
                </div>
                <button
                  onClick={() => setViewClaim(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X style={{ width: 18, height: 18 }} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5 space-y-5">
                {/* Status badge */}
                {(() => {
                  const sc = CLAIM_STATUS_COLORS[viewClaim.status as keyof typeof CLAIM_STATUS_COLORS] || CLAIM_STATUS_COLORS.filed;
                  return (
                    <div className="flex items-center justify-between">
                      <Badge className={cn(sc.bg, sc.text, 'hover:opacity-90 border-0 gap-1 text-sm px-3 py-1')}>
                        <div className={cn('w-2 h-2 rounded-full', sc.dot)} />
                        {getStatusLabel(viewClaim.status)}
                      </Badge>
                      <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                        {formatAmount(viewClaim.amount)}
                      </p>
                    </div>
                  );
                })()}

                {/* Details grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Shield style={{ width: 16, height: 16 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                        Claim Type
                      </p>
                      <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                        {viewClaim.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText style={{ width: 16, height: 16 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                        Policy
                      </p>
                      <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                        {viewClaim.policyNumber}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar style={{ width: 16, height: 16 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                        Filed Date
                      </p>
                      <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                        {viewClaim.filedDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock style={{ width: 16, height: 16 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 font-semibold uppercase tracking-wider" style={{ fontSize: TYPE.micro }}>
                        {viewClaim.resolvedDate ? 'Resolved' : 'Last Update'}
                      </p>
                      <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta }}>
                        {viewClaim.resolvedDate || viewClaim.lastUpdate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wider mb-2" style={{ fontSize: TYPE.micro }}>
                    Description
                  </p>
                  <div
                    className="bg-gray-50 px-4 py-3 text-gray-700"
                    style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta, lineHeight: 1.6 }}
                  >
                    {viewClaim.description}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className="text-gray-400 font-semibold uppercase tracking-wider mb-3" style={{ fontSize: TYPE.micro }}>
                    Claim Progress
                  </p>
                  <ClaimStatusTimeline status={viewClaim.status} />
                  <div className="flex justify-between mt-2">
                    {['Filed', 'Documents', 'Under Review', 'Decision'].map((step) => (
                      <p key={step} className="text-gray-400 text-center" style={{ fontSize: TYPE.micro, width: '25%' }}>
                        {step}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Estimated timeline info */}
                <div
                  className="flex items-start gap-3 px-4 py-3 bg-violet-50 border border-violet-100"
                  style={{ borderRadius: RADIUS.input }}
                >
                  <Clock style={{ width: 18, height: 18 }} className="text-violet-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-violet-800 font-semibold" style={{ fontSize: TYPE.meta }}>
                      Estimated Processing Time
                    </p>
                    <p className="text-violet-600" style={{ fontSize: TYPE.caption }}>
                      {(viewClaim.status as string) === 'approved' || (viewClaim.status as string) === 'denied'
                        ? 'This claim has been resolved.'
                        : 'Claims are typically reviewed within 15-30 business days. Your agent will keep you updated on progress.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-white"
                style={{ borderRadius: `0 0 ${RADIUS.card} ${RADIUS.card}` }}
              >
                {(viewClaim.status as string) !== 'approved' && (viewClaim.status as string) !== 'denied' && (
                  <Button
                    onClick={() => {
                      setViewClaim(null);
                      setUploadForClaim(viewClaim);
                    }}
                    className="gap-2 text-white font-semibold border-0"
                    style={{
                      background: 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                      borderRadius: RADIUS.button,
                      height: 40,
                    }}
                  >
                    <Upload style={{ width: 14, height: 14 }} />
                    Upload Documents
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setViewClaim(null)}
                  className="text-gray-600 border-gray-200"
                  style={{ borderRadius: RADIUS.button, height: 40 }}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── UPLOAD DOCUMENTS MODAL ──────────────────────── */}
      <AnimatePresence>
        {uploadForClaim && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            onClick={() => {
              setUploadForClaim(null);
              setAdditionalFiles([]);
              setUploadSuccess(false);
            }}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-white"
              style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.hero }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Upload Documents
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {uploadForClaim.claimNumber} — {uploadForClaim.type}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUploadForClaim(null);
                    setAdditionalFiles([]);
                    setUploadSuccess(false);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X style={{ width: 18, height: 18 }} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                {uploadSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-8 gap-3"
                  >
                    <div
                      className="flex items-center justify-center"
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: RADIUS.pill,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        boxShadow: SHADOW.glow.emerald,
                      }}
                    >
                      <CheckCircle style={{ width: 28, height: 28, color: 'white' }} />
                    </div>
                    <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                      Documents Uploaded
                    </p>
                    <p className="text-gray-500 text-center" style={{ fontSize: TYPE.caption }}>
                      Your documents have been attached to the claim. Your agent will be notified.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <DropZone target="upload" dragging={isUploadDragging} />
                    <FileList files={additionalFiles} target="upload" />

                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        onClick={handleUploadDocuments}
                        disabled={additionalFiles.length === 0}
                        className="gap-2 text-white font-semibold border-0"
                        style={{
                          background: additionalFiles.length === 0
                            ? '#d1d5db'
                            : 'linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)',
                          borderRadius: RADIUS.button,
                          height: 44,
                          padding: '0 24px',
                        }}
                      >
                        <Upload style={{ width: 16, height: 16 }} />
                        Upload {additionalFiles.length > 0 ? `(${additionalFiles.length})` : ''}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadForClaim(null);
                          setAdditionalFiles([]);
                        }}
                        className="text-gray-600 border-gray-200"
                        style={{ borderRadius: RADIUS.button, height: 44 }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLoungeLayout>
  );
}
