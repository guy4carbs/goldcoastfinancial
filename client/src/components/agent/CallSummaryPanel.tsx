import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText, Copy, Check, Download, Share2,
  Phone, Clock, User, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAgentStore, type Lead } from "@/lib/agentStore";

interface CallSummaryPanelProps {
  lead: Lead;
  notes: string;
  disposition: string;
  duration?: string;
  showActions?: boolean;
}

export function CallSummaryPanel({
  lead,
  notes,
  disposition,
  duration = '5 min',
  showActions = true
}: CallSummaryPanelProps) {
  const { generateCallSummary } = useAgentStore();
  const [copied, setCopied] = useState(false);

  const summary = generateCallSummary(lead, notes, disposition);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `call-summary-${lead.name.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const dispositionColors: Record<string, string> = {
    interested: 'bg-green-100 text-green-700',
    callback: 'bg-blue-100 text-blue-700',
    appointment_set: 'bg-purple-100 text-purple-700',
    not_interested: 'bg-gray-100 text-gray-600',
    no_answer: 'bg-amber-100 text-amber-700',
    voicemail: 'bg-amber-100 text-amber-700',
  };

  const dispositionLabels: Record<string, string> = {
    interested: 'Interested',
    callback: 'Callback Requested',
    appointment_set: 'Appointment Set',
    not_interested: 'Not Interested',
    no_answer: 'No Answer',
    voicemail: 'Voicemail',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-gray-200 overflow-hidden bg-white"
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900">Call Summary</h4>
                <Badge className="bg-blue-100 text-blue-700 text-[10px]">
                  <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                  Auto-Generated
                </Badge>
              </div>
              <p className="text-sm text-gray-500">Ready to attach to lead record</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {lead.name}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration}
          </span>
          <Badge className={cn("text-[10px]", dispositionColors[disposition] || 'bg-gray-100')}>
            {dispositionLabels[disposition] || disposition}
          </Badge>
        </div>
      </div>

      {/* Summary Content */}
      <div className="p-4">
        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
          {summary}
        </pre>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="p-4 bg-gray-50 border-t flex gap-2">
          <Button variant="outline" onClick={handleCopy} className="flex-1">
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
          <Button className="flex-1">
            <Share2 className="w-4 h-4 mr-1" />
            Share with Team
          </Button>
        </div>
      )}
    </motion.div>
  );
}

// Compact inline version for activity logs
export function CallSummaryBadge({ onClick }: { onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
    >
      <FileText className="w-3 h-3" />
      View Summary
    </motion.button>
  );
}
