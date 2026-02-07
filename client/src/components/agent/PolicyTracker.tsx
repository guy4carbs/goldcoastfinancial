import { motion } from "framer-motion";
import {
  FileText, Send, Clock, CheckCircle2, Award, XCircle, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/agentStore";

interface PolicyTrackerProps {
  lead: Lead;
  onUpdateStatus?: (status: Lead['policyStatus']) => void;
}

const POLICY_STAGES: {
  status: Lead['policyStatus'];
  label: string;
  icon: typeof FileText;
  color: string;
  bgColor: string;
}[] = [
  { status: 'quoted', label: 'Quoted', icon: FileText, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  { status: 'submitted', label: 'Submitted', icon: Send, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { status: 'pending_underwriting', label: 'Underwriting', icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  { status: 'approved', label: 'Approved', icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { status: 'issued', label: 'Issued', icon: Award, color: 'text-green-600', bgColor: 'bg-green-100' },
];

const DECLINED_STAGE = { status: 'declined' as Lead['policyStatus'], label: 'Declined', icon: XCircle, color: 'text-red-600', bgColor: 'bg-red-100' };

export function PolicyTracker({ lead, onUpdateStatus }: PolicyTrackerProps) {
  const currentStageIndex = POLICY_STAGES.findIndex(s => s.status === lead.policyStatus);
  const isDeclined = lead.policyStatus === 'declined';

  // Get date for current status from history
  const getStatusDate = (status: Lead['policyStatus']) => {
    const historyEntry = lead.policyStatusHistory?.find(h => h.to === status);
    if (historyEntry) {
      return new Date(historyEntry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return null;
  };

  if (!lead.policyStatus) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center">
        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-500">No policy in progress</p>
        {onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus('quoted')}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Start tracking a quote
          </button>
        )}
      </div>
    );
  }

  if (isDeclined) {
    return (
      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-700">Application Declined</p>
            {getStatusDate('declined') && (
              <p className="text-xs text-red-500">{getStatusDate('declined')}</p>
            )}
          </div>
        </div>
        {lead.carrier && (
          <p className="text-sm text-red-600">Carrier: {lead.carrier}</p>
        )}
        {onUpdateStatus && (
          <button
            onClick={() => onUpdateStatus('quoted')}
            className="mt-3 text-xs text-primary hover:underline"
          >
            Try with another carrier
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-700">Policy Progress</h4>
        {lead.carrier && (
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            {lead.carrier}
          </span>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 z-0">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(currentStageIndex / (POLICY_STAGES.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-primary"
          />
        </div>

        {/* Stages */}
        <div className="relative flex justify-between z-10">
          {POLICY_STAGES.map((stage, index) => {
            const isCompleted = index <= currentStageIndex;
            const isCurrent = index === currentStageIndex;
            const Icon = stage.icon;
            const statusDate = getStatusDate(stage.status);

            return (
              <div key={stage.status} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted ? stage.bgColor : "bg-gray-100",
                    isCurrent && "ring-2 ring-primary ring-offset-2"
                  )}
                  onClick={() => onUpdateStatus && onUpdateStatus(stage.status)}
                  style={{ cursor: onUpdateStatus ? 'pointer' : 'default' }}
                >
                  <Icon className={cn(
                    "w-5 h-5",
                    isCompleted ? stage.color : "text-gray-300"
                  )} />
                </motion.div>
                <span className={cn(
                  "text-[10px] mt-2 font-medium text-center",
                  isCompleted ? "text-gray-700" : "text-gray-400"
                )}>
                  {stage.label}
                </span>
                {statusDate && isCompleted && (
                  <span className="text-[9px] text-gray-400">{statusDate}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Policy number */}
      {lead.policyNumber && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-green-700 font-medium">Policy Number</p>
          <p className="text-sm font-mono text-green-800">{lead.policyNumber}</p>
        </div>
      )}

      {/* Action buttons for stage advancement */}
      {onUpdateStatus && currentStageIndex < POLICY_STAGES.length - 1 && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onUpdateStatus(POLICY_STAGES[currentStageIndex + 1].status)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
          >
            Advance to {POLICY_STAGES[currentStageIndex + 1].label}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdateStatus('declined')}
            className="px-3 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
          >
            Declined
          </button>
        </div>
      )}

      {/* Status history */}
      {lead.policyStatusHistory && lead.policyStatusHistory.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-2">Status History</p>
          <div className="space-y-2">
            {lead.policyStatusHistory.slice().reverse().map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-2 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                <span className="text-gray-500">
                  {new Date(entry.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
                <span className="text-gray-700">
                  {entry.from ? `${entry.from.replace('_', ' ')} → ` : ''}
                  {entry.to?.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
