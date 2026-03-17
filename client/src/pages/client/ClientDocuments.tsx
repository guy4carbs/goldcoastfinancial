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
import { glassCard, fmtCurrency } from './clientConstants';
import { usePortalDocuments, usePortalPolicies, type PortalDocument, type PortalPolicy } from '@/hooks/usePortalData';
import { FolderOpen, FileText, Download, Upload, Search, Filter, File, FileBadge, CheckCircle, X, type LucideIcon } from 'lucide-react';

// ─── DOCUMENT CATEGORY ICON MAP ───
const DOC_CATEGORY_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  policy: { icon: FileText, color: 'text-violet-600' },
  tax: { icon: FileBadge, color: 'text-blue-600' },
  statement: { icon: File, color: 'text-emerald-600' },
  correspondence: { icon: FileText, color: 'text-amber-600' },
  upload: { icon: Upload, color: 'text-gray-500' },
};

// ─── CATEGORY TABS ───
type CategoryFilter = 'all' | 'policy' | 'tax' | 'statement' | 'correspondence';

const CATEGORY_TABS: { label: string; value: CategoryFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Policy Documents', value: 'policy' },
  { label: 'Tax Forms', value: 'tax' },
  { label: 'Statements', value: 'statement' },
  { label: 'Correspondence', value: 'correspondence' },
];

// Human-readable category labels for badges
const CATEGORY_LABELS: Record<string, string> = {
  policy: 'Policy',
  tax: 'Tax Form',
  statement: 'Statement',
  correspondence: 'Correspondence',
  upload: 'Uploaded',
};

// ─── UPLOADED FILE TYPE ───
interface UploadedDoc {
  id: string;
  name: string;
  category: string;
  date: string;
  fileSize: string;
  isNew: boolean;
  policyId: string;
  file: File;
}

// ─── FORMAT FILE SIZE ───
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ─── DOCUMENT HTML GENERATORS ───

function generatePolicyDocHTML(doc: PortalDocument, policies: PortalPolicy[]) {
  const policy = policies.find((p) => p.id === doc.policyId);
  if (!policy) return generateGenericDocHTML(doc);

  return `<!DOCTYPE html><html><head>
<title>${doc.name}</title>
<style>
  body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; }
  .header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; color: #7c3aed; font-size: 28px; }
  .header p { margin: 0; color: #666; font-size: 14px; }
  .badge { display: inline-block; padding: 3px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; }
  .active { background: #dcfce7; color: #166534; }
  .pending { background: #fef9c3; color: #854d0e; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  th { color: #6b7280; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
  .section-title { font-size: 18px; color: #7c3aed; margin: 28px 0 8px; border-bottom: 1px solid #ede9fe; padding-bottom: 6px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="header">
  <h1>Heritage Life Solutions</h1>
  <p>Policy Document -${policy.carrier}</p>
</div>
<h2 style="margin:0 0 4px">${policy.type} <span class="badge ${policy.status}">${policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}</span></h2>
<p style="color:#666;margin:0 0 16px">${policy.carrier}</p>
<h3 class="section-title">Policy Details</h3>
<table>
  <tr><th>Policy Number</th><td>${policy.policyNumber}</td></tr>
  <tr><th>Coverage Amount</th><td>${fmtCurrency(policy.coverageAmount)}</td></tr>
  <tr><th>Monthly Premium</th><td>$${policy.monthlyPremium}/mo</td></tr>
  <tr><th>Start Date</th><td>${policy.startDate}</td></tr>
  ${policy.endDate ? `<tr><th>End Date</th><td>${policy.endDate}</td></tr>` : ''}
  <tr><th>Next Payment</th><td>${policy.nextPaymentDate ?? 'N/A'}</td></tr>
  <tr><th>Auto-Pay</th><td>${policy.autoPayEnabled ? 'Enabled' : 'Disabled'}</td></tr>
  ${policy.cashValue ? `<tr><th>Cash Value</th><td>${fmtCurrency(policy.cashValue)}</td></tr>` : ''}
</table>
<h3 class="section-title">Beneficiary Information</h3>
<table>
  <tr><th>Primary Beneficiary</th><td>${policy.beneficiaryName ?? 'N/A'}</td></tr>
  <tr><th>Relationship</th><td>${policy.beneficiaryRelationship ?? 'N/A'}</td></tr>
</table>
<h3 class="section-title">Important Notices</h3>
<p style="font-size:13px;color:#4b5563;line-height:1.6">
  This document is a summary of your ${policy.type} policy with ${policy.carrier}.
  Your full policy contract, including all riders, exclusions, and conditions, is on file with ${policy.carrier}.
  Please review your complete policy documents and contact your agent with any questions.
</p>
<div class="footer">
  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} -Heritage Life Solutions &copy; ${new Date().getFullYear()}
  <br/>This is a summary document. For official policy documents, please contact your agent.
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
}

function generateStatementHTML(doc: PortalDocument, policies: PortalPolicy[]) {
  const policy = policies.find((p) => p.id === doc.policyId);
  if (!policy) return generateGenericDocHTML(doc);

  const monthlyPayments = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2025, i).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    return `<tr><td>${month}</td><td>$${policy.monthlyPremium}.00</td><td style="color:#166534">Paid</td></tr>`;
  }).join('');

  return `<!DOCTYPE html><html><head>
<title>${doc.name}</title>
<style>
  body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; }
  .header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; color: #7c3aed; font-size: 28px; }
  .header p { margin: 0; color: #666; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0 24px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  th { color: #6b7280; font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; background: #f9fafb; }
  .section-title { font-size: 18px; color: #7c3aed; margin: 28px 0 8px; border-bottom: 1px solid #ede9fe; padding-bottom: 6px; }
  .summary-box { background: #f5f3ff; border: 1px solid #ede9fe; border-radius: 12px; padding: 20px; margin: 16px 0 24px; }
  .summary-box .row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 14px; }
  .summary-box .total { border-top: 2px solid #7c3aed; margin-top: 8px; padding-top: 8px; font-weight: bold; font-size: 16px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="header">
  <h1>Heritage Life Solutions</h1>
  <p>Annual Statement -Year Ending December 31, 2025</p>
</div>
<h2 style="margin:0 0 4px">${policy.type} -${policy.carrier}</h2>
<p style="color:#666;margin:0 0 24px">Policy: ${policy.policyNumber}</p>
<h3 class="section-title">Account Summary</h3>
<div class="summary-box">
  <div class="row"><span>Coverage Amount</span><span>${fmtCurrency(policy.coverageAmount)}</span></div>
  <div class="row"><span>Monthly Premium</span><span>$${policy.monthlyPremium}.00</span></div>
  ${policy.cashValue ? `<div class="row"><span>Cash Value (as of Dec 31)</span><span>${fmtCurrency(policy.cashValue)}</span></div>` : ''}
  <div class="row total"><span>Total Premiums Paid (2025)</span><span>${fmtCurrency(policy.monthlyPremium * 12)}</span></div>
</div>
<h3 class="section-title">Payment History -2025</h3>
<table>
  <tr><th>Month</th><th>Amount</th><th>Status</th></tr>
  ${monthlyPayments}
</table>
<div class="footer">
  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} -Heritage Life Solutions &copy; ${new Date().getFullYear()}
  <br/>This is a summary document. For official statements, please contact your agent.
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
}

function generateTaxFormHTML(doc: PortalDocument, policies: PortalPolicy[]) {
  const policy = policies.find((p) => p.id === doc.policyId);

  return `<!DOCTYPE html><html><head>
<title>${doc.name}</title>
<style>
  body { font-family: 'Courier New', monospace; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; }
  .form-header { border: 2px solid #1a1a1a; padding: 16px; margin-bottom: 24px; }
  .form-header h1 { margin: 0; font-size: 20px; }
  .form-header .subtitle { color: #666; font-size: 12px; margin-top: 4px; }
  .form-row { display: flex; border: 1px solid #ccc; margin-bottom: -1px; }
  .form-cell { padding: 12px; border-right: 1px solid #ccc; flex: 1; }
  .form-cell:last-child { border-right: none; }
  .form-cell .label { font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
  .form-cell .value { font-size: 14px; font-weight: bold; }
  .section-title { font-size: 14px; font-weight: bold; margin: 24px 0 8px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #1a1a1a; padding-bottom: 4px; }
  .footer { margin-top: 40px; font-size: 11px; color: #666; line-height: 1.5; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="form-header">
  <h1>Form 1099-R</h1>
  <div class="subtitle">Distributions From Pensions, Annuities, Retirement or Profit-Sharing Plans, IRAs, Insurance Contracts, etc.</div>
  <div class="subtitle" style="margin-top:8px">Tax Year: 2025</div>
</div>
<div class="section-title">Payer Information</div>
<div class="form-row">
  <div class="form-cell" style="flex:2">
    <div class="label">Payer's Name</div>
    <div class="value">${policy ? policy.carrier : 'Heritage Life Solutions'}</div>
  </div>
  <div class="form-cell">
    <div class="label">Payer's TIN</div>
    <div class="value">**-***7842</div>
  </div>
</div>
<div class="section-title">Recipient Information</div>
<div class="form-row">
  <div class="form-cell" style="flex:2">
    <div class="label">Recipient's Name</div>
    <div class="value">Marcus J. Williams</div>
  </div>
  <div class="form-cell">
    <div class="label">Recipient's TIN</div>
    <div class="value">***-**-4821</div>
  </div>
</div>
<div class="form-row">
  <div class="form-cell" style="flex:2">
    <div class="label">Account Number</div>
    <div class="value">${policy ? policy.policyNumber : 'N/A'}</div>
  </div>
</div>
<div class="section-title">Distribution Information</div>
<div class="form-row">
  <div class="form-cell">
    <div class="label">1. Gross Distribution</div>
    <div class="value">$4,200.00</div>
  </div>
  <div class="form-cell">
    <div class="label">2a. Taxable Amount</div>
    <div class="value">$1,890.00</div>
  </div>
</div>
<div class="form-row">
  <div class="form-cell">
    <div class="label">2b. Taxable Amount Not Determined</div>
    <div class="value"></div>
  </div>
  <div class="form-cell">
    <div class="label">3. Capital Gain</div>
    <div class="value">$0.00</div>
  </div>
</div>
<div class="form-row">
  <div class="form-cell">
    <div class="label">4. Federal Income Tax Withheld</div>
    <div class="value">$378.00</div>
  </div>
  <div class="form-cell">
    <div class="label">7. Distribution Code</div>
    <div class="value">7 -Normal Distribution</div>
  </div>
</div>
<div class="footer">
  <strong>Important:</strong> This is a tax document. Provide this form to your tax preparer. This information has been reported to the Internal Revenue Service.
  <br/><br/>
  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} -Heritage Life Solutions &copy; ${new Date().getFullYear()}
  <br/>This is a summary representation. For official IRS forms, contact your carrier directly.
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
}

function generateCorrespondenceHTML(doc: PortalDocument, policies: PortalPolicy[]) {
  const isWelcome = doc.name.toLowerCase().includes('welcome');
  const isBeneficiary = doc.name.toLowerCase().includes('beneficiary');
  const policy = policies.find((p) => p.id === doc.policyId);

  let body: string;
  if (isWelcome) {
    body = `
<p>Dear Marcus,</p>
<p>Welcome to Heritage Life Solutions! We are delighted to have you as a client and look forward to helping you protect what matters most.</p>
<p>Your agent, <strong>Sarah Thompson</strong>, has been assigned to your account and is available to assist you with any questions regarding your coverage. You can reach Sarah directly at <strong>sarah@heritagels.org</strong> or <strong>(954) 555-0147</strong>.</p>
<p>Here is a summary of your new policy:</p>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">Policy</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${policy?.type ?? 'Term Life'} -${policy?.carrier ?? 'Protective Life'}</td></tr>
  <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">Policy Number</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${policy?.policyNumber ?? 'HLS-2022-10042'}</td></tr>
  <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">Coverage</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${policy ? fmtCurrency(policy.coverageAmount) : '$500,000'}</td></tr>
</table>
<p>You can access your Client Portal at any time to view your policies, download documents, make payments, and communicate with your agent.</p>
<p>Thank you for trusting Heritage Life Solutions with your family's financial protection.</p>`;
  } else if (isBeneficiary) {
    body = `
<p>Dear Marcus,</p>
<p>This letter confirms that the beneficiary change for your ${policy?.type ?? 'IUL'} policy (<strong>${policy?.policyNumber ?? 'HLS-2023-20156'}</strong>) has been processed successfully.</p>
<h3 style="color:#7c3aed;font-size:16px;margin:24px 0 8px">Updated Beneficiary Information</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">Primary Beneficiary</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${policy?.beneficiaryName ?? 'Lisa Mitchell'}</td></tr>
  <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">Relationship</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">${policy?.beneficiaryRelationship ?? 'Spouse'}</td></tr>
  <tr><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px">Effective Date</td><td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;font-weight:600">September 5, 2024</td></tr>
</table>
<p>Please review the information above and contact your agent if any corrections are needed. This change will be reflected in your next policy statement.</p>`;
  } else {
    body = `<p>Dear Marcus,</p><p>Please find the enclosed document regarding your account with Heritage Life Solutions.</p><p>If you have any questions, please contact your agent, Sarah Thompson, at sarah@heritagels.org.</p>`;
  }

  return `<!DOCTYPE html><html><head>
<title>${doc.name}</title>
<style>
  body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.7; }
  .letterhead { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 32px; }
  .letterhead h1 { margin: 0; color: #7c3aed; font-size: 24px; }
  .letterhead .address { text-align: right; font-size: 12px; color: #6b7280; line-height: 1.5; }
  .date { color: #6b7280; font-size: 14px; margin-bottom: 24px; }
  p { margin: 0 0 16px; font-size: 14px; }
  .signature { margin-top: 40px; }
  .signature .name { font-weight: bold; margin-top: 32px; }
  .signature .title { color: #6b7280; font-size: 13px; }
  .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="letterhead">
  <div>
    <h1>Heritage Life Solutions</h1>
    <p style="margin:4px 0 0;color:#6b7280;font-size:13px">Protecting What Matters Most</p>
  </div>
  <div class="address">
    1200 Corporate Blvd, Suite 400<br/>
    Fort Lauderdale, FL 33394<br/>
    (954) 555-0100
  </div>
</div>
<div class="date">${doc.date}</div>
${body}
<div class="signature">
  <p style="margin:0">Warm regards,</p>
  <p class="name" style="margin:32px 0 0">Sarah Thompson</p>
  <p class="title" style="margin:2px 0 0">Licensed Insurance Agent -NPN: 18847291</p>
  <p class="title">Heritage Life Solutions</p>
</div>
<div class="footer">
  Heritage Life Solutions &copy; ${new Date().getFullYear()} -All rights reserved.
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
}

function generateGenericDocHTML(doc: { name: string; date: string; category: string }) {
  return `<!DOCTYPE html><html><head>
<title>${doc.name}</title>
<style>
  body { font-family: 'Georgia', serif; max-width: 700px; margin: 40px auto; padding: 0 24px; color: #1a1a1a; }
  .header { border-bottom: 3px solid #7c3aed; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { margin: 0 0 4px; color: #7c3aed; font-size: 28px; }
  .header p { margin: 0; color: #666; font-size: 14px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af; }
  @media print { body { margin: 20px; } }
</style></head><body>
<div class="header">
  <h1>Heritage Life Solutions</h1>
  <p>${doc.name}</p>
</div>
<p style="font-size:14px;color:#4b5563">Document dated ${doc.date}. Category: ${CATEGORY_LABELS[doc.category] ?? doc.category}.</p>
<p style="font-size:14px;color:#4b5563">For the complete document, please contact your agent or visit the Heritage Life Solutions office.</p>
<div class="footer">
  Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} -Heritage Life Solutions &copy; ${new Date().getFullYear()}
</div>
<script>window.onload = function() { window.print(); }</script>
</body></html>`;
}

function downloadDocument(doc: PortalDocument, policies: PortalPolicy[]) {
  let html: string;
  switch (doc.category) {
    case 'policy':
      html = generatePolicyDocHTML(doc, policies);
      break;
    case 'statement':
      html = generateStatementHTML(doc, policies);
      break;
    case 'tax':
      html = generateTaxFormHTML(doc, policies);
      break;
    case 'correspondence':
      html = generateCorrespondenceHTML(doc, policies);
      break;
    default:
      html = generateGenericDocHTML(doc);
  }
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ─── MAIN COMPONENT ───
export default function ClientDocuments() {
  const { data: apiDocuments = [], isLoading } = usePortalDocuments();
  const { data: policies = [] } = usePortalPolicies();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process uploaded files
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newDocs: UploadedDoc[] = Array.from(files).map((file, i) => ({
      id: `upload-${Date.now()}-${i}`,
      name: file.name,
      category: 'upload',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      fileSize: formatFileSize(file.size),
      isNew: true,
      policyId: '',
      file,
    }));

    setUploadedDocs((prev) => [...newDocs, ...prev]);
    setUploadSuccess(`${files.length} file${files.length > 1 ? 's' : ''} uploaded successfully`);
    setTimeout(() => setUploadSuccess(null), 3000);
  }, []);

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

  // Remove an uploaded doc
  const removeUploadedDoc = useCallback((id: string) => {
    setUploadedDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Download uploaded file back
  const downloadUploadedFile = useCallback((doc: UploadedDoc) => {
    const url = URL.createObjectURL(doc.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Combine all documents: uploads first, then API data
  const allDocuments = [
    ...uploadedDocs.map((d) => ({ ...d, isUploaded: true as const })),
    ...apiDocuments.map((d) => ({ ...d, isUploaded: false as const })),
  ];

  // Filter
  const filteredDocuments = allDocuments.filter((doc) => {
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
        <motion.div variants={fadeInUp} className="flex items-center gap-2 flex-wrap">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveCategory(tab.value)}
                className={cn(
                  'px-4 py-2 font-medium transition-all',
                  isActive
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-700',
                )}
                style={{
                  borderRadius: RADIUS.pill,
                  fontSize: TYPE.meta,
                  boxShadow: isActive ? SHADOW.level2 : SHADOW.level1,
                  border: isActive ? 'none' : '1px solid #e5e7eb',
                }}
              >
                {tab.label}
              </button>
            );
          })}
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
                            {doc.isUploaded && (
                              <Badge
                                className="bg-emerald-100 text-emerald-700 border-0 font-semibold"
                                style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}
                              >
                                Uploaded
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
                            onClick={() => {
                              if (doc.isUploaded) {
                                downloadUploadedFile(doc as UploadedDoc);
                              } else {
                                downloadDocument(doc as PortalDocument, policies);
                              }
                            }}
                          >
                            <Download size={18} />
                          </Button>
                          {doc.isUploaded && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                              style={{ borderRadius: RADIUS.button }}
                              aria-label={`Remove ${doc.name}`}
                              onClick={() => removeUploadedDoc(doc.id)}
                            >
                              <X size={16} />
                            </Button>
                          )}
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
              <Upload className={cn(isDragOver ? 'text-violet-700' : 'text-violet-500')} size={22} />
            </div>
            <div>
              <p className="font-semibold text-gray-700 mb-1" style={{ fontSize: TYPE.meta }}>
                {isDragOver ? 'Drop files here' : 'Upload signed documents'}
              </p>
              <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                Drag & drop or click to browse -PDF, JPG, PNG, DOC up to 10MB
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </ClientLoungeLayout>
  );
}
