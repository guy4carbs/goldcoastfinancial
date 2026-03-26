import { motion } from "framer-motion";
import { MessageCircle, Clock, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, RADIUS } from "@/lib/heritageDesignSystem";

interface NpsStatusIndicatorProps {
  npsScheduledAt?: string | null;
  npsScore?: number | null;
  npsReceivedAt?: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNpsLabel(score: number): { label: string; color: string } {
  if (score >= 9) return { label: 'Promoter', color: 'text-emerald-600 border-emerald-200 bg-emerald-50' };
  if (score >= 7) return { label: 'Passive', color: 'text-amber-600 border-amber-200 bg-amber-50' };
  return { label: 'Detractor', color: 'text-red-600 border-red-200 bg-red-50' };
}

export function NpsStatusIndicator({ npsScheduledAt, npsScore, npsReceivedAt }: NpsStatusIndicatorProps) {
  if (!npsScheduledAt) return null;

  // Response received
  if (npsScore != null && npsReceivedAt) {
    const { label, color } = getNpsLabel(npsScore);
    return (
      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-2 p-3 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-gray-600">Client satisfaction score:</span>
          <Badge variant="outline" className={`text-xs ${color}`}>
            {npsScore}/10 — {label}
          </Badge>
        </div>
      </motion.div>
    );
  }

  // Scheduled but not yet sent (7 days from workflow launch)
  const scheduledDate = new Date(npsScheduledAt);
  const sendDate = new Date(scheduledDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const isSent = now >= sendDate;

  if (isSent) {
    return (
      <motion.div variants={fadeInUp}>
        <div className="flex items-center gap-2 p-3 bg-amber-50/50" style={{ borderRadius: RADIUS.input }}>
          <MessageCircle className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-700">
            Satisfaction survey sent — awaiting response
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeInUp}>
      <div className="flex items-center gap-2 p-3 bg-gray-50" style={{ borderRadius: RADIUS.input }}>
        <Clock className="w-4 h-4 text-gray-400" />
        <span className="text-xs text-gray-500">
          Satisfaction survey scheduled for {formatDate(sendDate.toISOString())}
        </span>
      </div>
    </motion.div>
  );
}
