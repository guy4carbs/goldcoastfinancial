import { useState } from "react";
import { type Quote } from "@/lib/agentStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  DollarSign,
  Shield,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  XCircle,
  Eye,
  Mail,
  Copy,
  Printer,
  Trash2,
  History,
  PenLine,
  FileSignature,
  GitBranch,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type QuoteStatus = Quote['status'];

const statusConfig: Record<QuoteStatus, { label: string; icon: typeof Clock; color: string }> = {
  draft: { label: 'Draft', icon: FileText, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-200' },
  sent: { label: 'Sent', icon: Send, color: 'bg-blue-500/10 text-blue-600 border-blue-200' },
  viewed: { label: 'Viewed', icon: Eye, color: 'bg-purple-500/10 text-purple-600 border-purple-200' },
  accepted: { label: 'Accepted', icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 border-green-200' },
  expired: { label: 'Expired', icon: XCircle, color: 'bg-gray-500/10 text-gray-600 border-gray-200' },
};

const signatureConfig = {
  pending: { label: 'Not Sent', color: 'bg-gray-100 text-gray-600' },
  sent: { label: 'Awaiting Signature', color: 'bg-amber-100 text-amber-600' },
  signed: { label: 'Signed', color: 'bg-green-100 text-green-600' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-600' },
};

const productLabels: Record<Quote['product'], string> = {
  term: 'Term Life',
  whole: 'Whole Life',
  iul: 'IUL',
  final_expense: 'Final Expense',
};

function formatQuoteDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface QuoteDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: Quote | null;
  onUpdateStatus: (quoteId: string, newStatus: string) => void;
  onDelete: (quoteId: string) => void;
  onCreateVersion?: (quoteId: string) => void;
  onUpdateSignature?: (quoteId: string, status: 'pending' | 'sent' | 'signed' | 'declined') => void;
}

export function QuoteDetailDrawer({
  open,
  onOpenChange,
  quote,
  onUpdateStatus,
  onDelete,
  onCreateVersion,
  onUpdateSignature,
}: QuoteDetailDrawerProps) {
  const [showVersions, setShowVersions] = useState(false);

  if (!quote) return null;

  const status = statusConfig[quote.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const sigStatus = quote.signatureStatus ? signatureConfig[quote.signatureStatus] : signatureConfig.pending;
  const isTerminal = quote.status === 'accepted' || quote.status === 'expired';

  const handleCreateVersion = () => {
    if (onCreateVersion) {
      onCreateVersion(quote.id);
      toast.success('New version created');
    }
  };

  const handleSendForSignature = () => {
    if (onUpdateSignature) {
      onUpdateSignature(quote.id, 'sent');
      toast.success('Quote sent for e-signature');
    }
  };

  const handleCopyQuote = () => {
    const productLabel = productLabels[quote.product];
    const quoteText = `Quote for ${quote.clientName}\nProduct: ${productLabel}${quote.term ? ` - ${quote.term} Year` : ''}\nCoverage: $${quote.coverageAmount.toLocaleString()}\nPremium: $${quote.monthlyPremium.toLocaleString()}/mo`;
    navigator.clipboard.writeText(quoteText);
    toast.success('Quote details copied to clipboard');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSendEmail = () => {
    const productLabel = productLabels[quote.product];
    const subject = encodeURIComponent(`Quote for ${quote.clientName}`);
    const body = encodeURIComponent(`Quote Details:\n\nProduct: ${productLabel}${quote.term ? ` - ${quote.term} Year` : ''}\nCoverage: $${quote.coverageAmount.toLocaleString()}\nPremium: $${quote.monthlyPremium.toLocaleString()}/mo`);
    window.location.href = `mailto:${quote.clientEmail || ''}?subject=${subject}&body=${body}`;
  };

  const handleDelete = () => {
    onDelete(quote.id);
    onOpenChange(false);
    toast.success('Quote deleted');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-white font-bold">
              {quote.clientName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <SheetTitle className="text-left">{quote.clientName}</SheetTitle>
              <Badge className={cn("mt-1", status.color)} aria-label={`Status: ${status.label}`}>
                <StatusIcon className="w-3 h-3 mr-1" aria-hidden="true" />
                {status.label}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Quote Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Quote Details</h3>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Shield className="w-5 h-5 text-violet-500" aria-hidden="true" />
                <div>
                  <p className="text-xs text-gray-500">Product</p>
                  <p className="font-medium text-primary">
                    {productLabels[quote.product]}{quote.term ? ` - ${quote.term} Year` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-500" aria-hidden="true" />
                <div>
                  <p className="text-xs text-gray-500">Coverage Amount</p>
                  <p className="font-medium text-primary">${quote.coverageAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                <DollarSign className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                <div>
                  <p className="text-xs text-emerald-600">Monthly Premium</p>
                  <p className="font-bold text-emerald-700 text-lg">${quote.monthlyPremium.toLocaleString()}/mo</p>
                </div>
              </div>

              {quote.carrier && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-500" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-gray-500">Carrier</p>
                    <p className="font-medium text-primary">{quote.carrier}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Timeline</h3>

            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="text-sm font-medium">{formatQuoteDate(quote.createdDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Expires</p>
                <p className={cn(
                  "text-sm font-medium",
                  (quote.status === 'expired' || new Date(quote.expiresDate) < new Date()) && "text-red-600"
                )}>
                  {formatQuoteDate(quote.expiresDate)}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* E-Signature Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <FileSignature className="w-4 h-4" aria-hidden="true" />
              E-Signature
            </h3>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge className={sigStatus.color} aria-label={`Signature status: ${sigStatus.label}`}>
                  {sigStatus.label}
                </Badge>
                {quote.signedDate && (
                  <span className="text-xs text-gray-500">
                    Signed on {formatQuoteDate(quote.signedDate)}
                  </span>
                )}
              </div>
              {quote.signatureStatus !== 'signed' && !isTerminal && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSendForSignature}
                  aria-label={quote.signatureStatus === 'sent' ? 'Resend for signature' : 'Send for signature'}
                >
                  <PenLine className="w-4 h-4 mr-1" aria-hidden="true" />
                  {quote.signatureStatus === 'sent' ? 'Resend' : 'Send for Signature'}
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Version History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <GitBranch className="w-4 h-4" aria-hidden="true" />
                Versions
              </h3>
              <div className="flex gap-2">
                {(quote.versions || []).length > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowVersions(!showVersions)}
                    aria-label={showVersions ? 'Hide version history' : 'Show version history'}
                  >
                    <History className="w-4 h-4 mr-1" aria-hidden="true" />
                    {showVersions ? 'Hide' : 'Show'} History
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCreateVersion}
                  disabled={isTerminal}
                  aria-label="Create new version of this quote"
                >
                  <Plus className="w-4 h-4 mr-1" aria-hidden="true" />
                  New Version
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg">
              <Badge variant="secondary">v{quote.currentVersion || 1}</Badge>
              <span className="text-sm text-gray-600">Current version</span>
            </div>
            {showVersions && (quote.versions || []).length > 0 && (
              <div className="space-y-2 mt-2">
                {(quote.versions || []).map((ver) => (
                  <div key={ver.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">v{ver.version}</Badge>
                      <span>${ver.coverageAmount.toLocaleString()} @ ${ver.monthlyPremium.toLocaleString()}/mo</span>
                    </div>
                    <span className="text-xs text-gray-400">{formatQuoteDate(ver.createdDate)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          {/* Update Status */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Update Status</h3>

            <div className="grid grid-cols-2 gap-2">
              {quote.status !== 'sent' && quote.status !== 'expired' && quote.status !== 'accepted' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    onUpdateStatus(quote.id, 'sent');
                    toast.success('Quote marked as sent');
                  }}
                  aria-label="Mark quote as sent"
                >
                  <Send className="w-4 h-4" aria-hidden="true" />
                  Mark as Sent
                </Button>
              )}

              {quote.status !== 'accepted' && quote.status !== 'expired' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
                  onClick={() => {
                    onUpdateStatus(quote.id, 'accepted');
                    toast.success('Quote marked as accepted');
                  }}
                  aria-label="Mark quote as accepted"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  Mark Accepted
                </Button>
              )}

              {quote.status !== 'expired' && quote.status !== 'accepted' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-gray-600"
                  onClick={() => {
                    onUpdateStatus(quote.id, 'expired');
                    toast.info('Quote marked as expired');
                  }}
                  aria-label="Mark quote as expired"
                >
                  <XCircle className="w-4 h-4" aria-hidden="true" />
                  Mark Expired
                </Button>
              )}

              {isTerminal && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    onUpdateStatus(quote.id, 'draft');
                    toast.success('Quote reopened');
                  }}
                  aria-label="Reopen quote as draft"
                >
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  Reopen Quote
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Actions</h3>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleSendEmail} aria-label="Email quote details">
                <Mail className="w-4 h-4" aria-hidden="true" />
                Email Quote
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handleCopyQuote} aria-label="Copy quote details to clipboard">
                <Copy className="w-4 h-4" aria-hidden="true" />
                Copy Details
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint} aria-label="Print quote">
                <Printer className="w-4 h-4" aria-hidden="true" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                aria-label="Delete this quote"
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
