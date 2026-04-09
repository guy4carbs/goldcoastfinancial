/**
 * ClientDocuments -Document Center Page
 * Heritage Design System -Violet-to-amber theme
 *
 * Document listing with category tabs, search bar, glass card rows,
 * download actions, new badges, and a working upload zone.
 */

import { useState, useRef, useCallback, DragEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { ClientPageHero } from './primitives/ClientPageHero';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { glassCard } from './clientConstants';
import { usePortalDocuments, type PortalDocument } from '@/hooks/usePortalData';
import { useQueryClient } from '@tanstack/react-query';
import {
  FolderOpen, FileText, Download, Upload, Search, Filter, File, FileBadge,
  CheckCircle, Loader2, X, ClipboardList, CreditCard, Users, IdCard, FileCheck,
  type LucideIcon,
} from 'lucide-react';

// ─── DOCUMENT CATEGORY ICON MAP ───
const DOC_CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  policy: { icon: FileText, color: 'text-violet-600' },
  application: { icon: FileCheck, color: 'text-indigo-600' },
  claims: { icon: ClipboardList, color: 'text-amber-600' },
  billing: { icon: CreditCard, color: 'text-rose-600' },
  tax: { icon: FileBadge, color: 'text-blue-600' },
  beneficiary: { icon: Users, color: 'text-teal-600' },
  statements: { icon: File, color: 'text-emerald-600' },
  correspondence: { icon: FileText, color: 'text-gray-600' },
  identification: { icon: IdCard, color: 'text-orange-600' },
  // Legacy categories (backward compat)
  statement: { icon: File, color: 'text-emerald-600' },
  form: { icon: FileCheck, color: 'text-indigo-600' },
  upload: { icon: Upload, color: 'text-gray-500' },
};

// ─── CATEGORY TABS ───
type CategoryFilter = 'all' | 'policy' | 'application' | 'claims' | 'billing' | 'tax' | 'beneficiary' | 'statements' | 'correspondence' | 'identification';

const CATEGORY_TABS: { label: string; value: CategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Policy', value: 'policy' },
  { label: 'Applications', value: 'application' },
  { label: 'Claims', value: 'claims' },
  { label: 'Billing', value: 'billing' },
  { label: 'Tax', value: 'tax' },
  { label: 'Beneficiary', value: 'beneficiary' },
  { label: 'Statements', value: 'statements' },
  { label: 'Letters', value: 'correspondence' },
  { label: 'ID & Verification', value: 'identification' },
];

// Human-readable category labels for badges
const CATEGORY_LABELS: Record<string, string> = {
  policy: 'Policy',
  application: 'Application',
  claims: 'Claim',
  billing: 'Billing',
  tax: 'Tax Form',
  beneficiary: 'Beneficiary',
  statements: 'Statement',
  correspondence: 'Letter',
  identification: 'ID / Verification',
  // Legacy
  statement: 'Statement',
  form: 'Form',
  upload: 'Uploaded',
};

// ─── FORMAT FILE SIZE ───
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── DOWNLOAD DOCUMENT (real Firebase download via API) ───
function downloadDocument(doc: PortalDocument) {
  if (doc.s3Key) {
    window.open(`/api/portal/documents/${doc.id}/download`, '_blank');
  } else {
    // Seed documents without real files — show notice
    window.open(`/api/portal/documents/${doc.id}/download`, '_blank');
  }
}

// ─── MAIN COMPONENT ───
export default function ClientDocuments() {
  const { data: apiDocuments = [], isLoading } = usePortalDocuments();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload files to server
  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError(null);
    let successCount = 0;

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('category', 'upload');

        const res = await fetch('/api/portal/documents/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Upload failed' }));
          throw new Error(err.error || `Upload failed: ${res.status}`);
        }

        successCount++;
      } catch (err: any) {
        console.error('[ClientDocuments] Upload failed:', err.message);
        setUploadError(err.message);
      }
    }

    if (successCount > 0) {
      queryClient.invalidateQueries({ queryKey: ['/api/portal/documents'] });
      setUploadSuccess(`${successCount} file${successCount > 1 ? 's' : ''} uploaded successfully`);
      setTimeout(() => setUploadSuccess(null), 3000);
    }

    setIsUploading(false);
  }, [queryClient]);

  // Drag handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // Filter documents
  const filteredDocuments = apiDocuments.filter((doc) => {
    const matchesCategory =
      activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch =
      searchQuery.trim() === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─── */}
        <ClientPageHero
          icon={FolderOpen}
          title="Documents"
          subtitle="Access your policy documents, statements, and tax forms"
        />

        {/* ─── CATEGORY TABS ─── */}
        <motion.div variants={fadeInUp} className="overflow-x-auto">
          <div
            className="inline-flex items-center bg-gray-100/80 p-1 gap-1"
            style={{ borderRadius: RADIUS.pill }}
          >
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-white text-violet-700 shadow-sm'
                    : 'text-gray-500 hover:text-violet-600',
                )}
                style={{ borderRadius: RADIUS.pill }}
              >
                {tab.label}
              </button>
            );
          })}
          </div>
        </motion.div>

        {/* ─── SEARCH BAR ─── */}
        <motion.div variants={fadeInUp}>
          <div className="relative" style={{ maxWidth: 480 }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-violet-300 transition-shadow"
              style={{
                borderRadius: RADIUS.input,
                border: '1px solid #e5e7eb',
                fontSize: TYPE.meta,
                boxShadow: SHADOW.level1,
              }}
            />
          </div>
        </motion.div>

        {/* ─── UPLOAD SUCCESS TOAST ─── */}
        <AnimatePresence>
          {uploadSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium"
              style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
            >
              <CheckCircle size={18} />
              {uploadSuccess}
            </motion.div>
          )}
          {uploadError && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 font-medium"
              style={{ padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`, borderRadius: RADIUS.button, fontSize: TYPE.meta }}
            >
              <X size={18} />
              {uploadError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── DOCUMENT LIST ─── */}
        <motion.div variants={fadeInUp} className="flex flex-col gap-3">
          {isLoading ? (
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-8 h-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-500" style={{ fontSize: TYPE.meta }}>Loading documents...</p>
              </CardContent>
            </Card>
          ) : filteredDocuments.length > 0 ? (
            filteredDocuments.map((doc, index) => {
              const catInfo = DOC_CATEGORY_ICONS[doc.category] || DOC_CATEGORY_ICONS.policy;
              const CatIcon = catInfo.icon;

              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: MOTION.duration.normal,
                    ease: MOTION.easing,
                    delay: index * 0.04,
                  }}
                  whileHover={{
                    y: -1,
                    backgroundColor: 'rgba(245, 243, 255, 0.5)',
                  }}
                  className="group"
                >
                  <Card
                    className="border-0 overflow-hidden transition-shadow"
                    style={{
                      ...glassCard,
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.level1,
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Left: Document icon */}
                        <div
                          className="flex items-center justify-center flex-shrink-0 bg-gray-50 group-hover:bg-violet-50 transition-colors"
                          style={{ width: 44, height: 44, borderRadius: RADIUS.input }}
                        >
                          <CatIcon className={cn(catInfo.color)} size={20} aria-hidden="true" />
                        </div>

                        {/* Center: Document info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {doc.name}
                            </p>
                            {doc.isNew && (
                              <Badge
                                className="bg-violet-100 text-violet-700 border-0 font-semibold"
                                style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                              >
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="text-gray-500 border-gray-200 font-normal"
                              style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                            >
                              {CATEGORY_LABELS[doc.category] || doc.category}
                            </Badge>
                            <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                              {doc.date}
                            </span>
                            <span className="text-gray-300" style={{ fontSize: TYPE.caption }}>
                              {doc.fileSize}
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-violet-600 hover:bg-violet-50"
                            style={{ borderRadius: RADIUS.button }}
                            aria-label={`Download ${doc.name}`}
                            onClick={() => downloadDocument(doc)}
                          >
                            <Download size={18} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          ) : (
            /* ─── EMPTY STATE ─── */
            <Card
              className="border-0"
              style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
            >
              <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div
                  className="flex items-center justify-center bg-violet-100 mb-4"
                  style={{ width: 64, height: 64, borderRadius: RADIUS.button }}
                >
                  <Filter className="text-violet-500" size={28} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: TYPE.title }}>
                  No documents found
                </h3>
                <p className="text-gray-500 max-w-sm" style={{ fontSize: TYPE.meta }}>
                  {searchQuery.trim()
                    ? `No documents match "${searchQuery}". Try a different search term.`
                    : `No ${activeCategory !== 'all' ? (CATEGORY_LABELS[activeCategory]?.toLowerCase() ?? '') + ' ' : ''}documents available.`}
                </p>
                {(activeCategory !== 'all' || searchQuery.trim()) && (
                  <Button
                    variant="outline"
                    className="mt-4 text-violet-600 border-violet-200 hover:bg-violet-50"
                    style={{ borderRadius: RADIUS.button, fontSize: TYPE.meta }}
                    onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* ─── UPLOAD ZONE ─── */}
        <motion.div variants={fadeInUp}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-3 py-10 px-6 text-center transition-all cursor-pointer',
              isDragOver
                ? 'bg-violet-50 border-violet-400'
                : 'hover:bg-violet-50/30 border-dashed',
            )}
            style={{
              borderRadius: RADIUS.card,
              border: isDragOver ? '2px solid #8b5cf6' : '2px dashed #ddd6fe',
              backgroundColor: isDragOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(245, 243, 255, 0.3)',
            }}
          >
            <div
              className={cn(
                'flex items-center justify-center transition-colors',
                isDragOver ? 'bg-violet-200' : 'bg-violet-100',
              )}
              style={{ width: 48, height: 48, borderRadius: RADIUS.button }}
            >
              {isUploading ? (
                <Loader2 className="text-violet-500 animate-spin" size={22} />
              ) : (
                <Upload className={cn(isDragOver ? 'text-violet-700' : 'text-violet-500')} size={22} />
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1" style={{ fontSize: TYPE.meta }}>
                {isUploading ? 'Uploading...' : isDragOver ? 'Drop files here' : 'Upload signed documents'}
              </p>
              <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                Drag & drop or click to browse — PDF, JPG, PNG, DOC up to 50MB
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}
