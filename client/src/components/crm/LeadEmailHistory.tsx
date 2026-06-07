/**
 * LeadEmailHistory - Email delivery history for a lead.
 * Fetches GET /api/crm/leads/:id/emails and renders status-coded rows.
 */

import { useQuery } from '@tanstack/react-query';
import { Mail, MailOpen, MousePointerClick, AlertTriangle, ListOrdered } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RADIUS } from '@/lib/heritageDesignSystem';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface LeadEmail {
  id: string;
  toEmail: string;
  subject: string | null;
  status: string;
  sentAt: string | null;
  deliveredAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  bouncedAt: string | null;
  bounceReason: string | null;
  openCount: number | null;
  clickCount: number | null;
  sequenceId: string | null;
  templateId: string | null;
}

interface LeadEmailHistoryProps {
  leadId: string;
}

// =============================================================================
// HELPERS
// =============================================================================

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-gray-100 text-gray-600',
  delivered: 'bg-blue-100 text-blue-600',
  opened: 'bg-green-100 text-green-600',
  clicked: 'bg-emerald-100 text-emerald-700',
  bounced: 'bg-red-100 text-red-600',
  skipped: 'bg-amber-100 text-amber-600',
  failed: 'bg-amber-100 text-amber-600',
};

function getStatusStyle(status: string): string {
  return STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatAbsolute(dateStr: string | null): string {
  if (!dateStr) return 'Not sent';
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// =============================================================================
// COMPONENT
// =============================================================================

export function LeadEmailHistory({ leadId }: LeadEmailHistoryProps) {
  const { data, isLoading } = useQuery<LeadEmail[]>({
    queryKey: [`/api/crm/leads/${leadId}/emails`],
    enabled: !!leadId,
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="p-2 bg-gray-50"
            style={{ borderRadius: RADIUS.input }}
          >
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const emails = data || [];

  if (emails.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-4">
        No emails sent to this lead yet
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {emails.map((email) => {
        const openCount = email.openCount || 0;
        const clickCount = email.clickCount || 0;
        return (
          <div
            key={email.id}
            className="p-2 bg-gray-50 text-sm"
            style={{ borderRadius: RADIUS.input }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-900 truncate">
                  {email.subject || '(no subject)'}
                </p>
                <p
                  className="text-xs text-gray-500"
                  title={formatAbsolute(email.sentAt)}
                >
                  {formatRelative(email.sentAt)} · {email.toEmail}
                </p>
              </div>
              <Badge
                className={cn(
                  'text-[10px] px-1.5 py-0 h-5 border-0 capitalize shrink-0',
                  getStatusStyle(email.status),
                )}
              >
                {email.status}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {email.sequenceId && (
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-600">
                  <ListOrdered className="w-3 h-3" />
                  via sequence
                </span>
              )}
              {openCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-green-600">
                  <MailOpen className="w-3 h-3" />
                  {openCount} {openCount === 1 ? 'open' : 'opens'}
                </span>
              )}
              {clickCount > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700">
                  <MousePointerClick className="w-3 h-3" />
                  {clickCount} {clickCount === 1 ? 'click' : 'clicks'}
                </span>
              )}
              {email.status === 'bounced' && email.bounceReason && (
                <span className="inline-flex items-center gap-1 text-[10px] text-red-600">
                  <AlertTriangle className="w-3 h-3" />
                  {email.bounceReason}
                </span>
              )}
              {openCount === 0 &&
                clickCount === 0 &&
                !email.sequenceId &&
                email.status !== 'bounced' && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
                    <Mail className="w-3 h-3" />
                    No engagement yet
                  </span>
                )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default LeadEmailHistory;
