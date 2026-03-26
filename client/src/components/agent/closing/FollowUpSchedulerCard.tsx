import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, Check, Clock, AlertTriangle, Loader2, Zap, Mail, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";
import { useState } from "react";

interface FollowUp {
  id: string;
  follow_up_type: string;
  scheduled_for: string;
  status: string;
  completed_at: string | null;
  notes: string | null;
  auto_send_enabled?: boolean;
}

interface FollowUpSchedulerCardProps {
  leadId: string;
}

const DAY_LABELS: Record<string, string> = {
  '30_day': '30 Day',
  '60_day': '60 Day',
  '90_day': '90 Day',
};

function getCountdown(scheduledFor: string): string {
  const now = new Date();
  const target = new Date(scheduledFor);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) return `in ${diffDays} day${diffDays !== 1 ? 's' : ''}`;
  if (diffDays === 0) return 'today';
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function FollowUpSchedulerCard({ leadId }: FollowUpSchedulerCardProps) {
  const [completing, setCompleting] = useState<string | null>(null);
  const [activating, setActivating] = useState(false);
  const queryClient = useQueryClient();

  const { data: followUpResponse, isLoading } = useQuery<{
    success: boolean;
    data: {
      followUps: FollowUp[];
      overdueCount: number;
      nextDue: FollowUp | null;
      autoActivated: boolean;
    };
  }>({
    queryKey: [`/api/post-close/${leadId}/follow-ups`],
    enabled: !!leadId,
  });

  const followUps = followUpResponse?.data?.followUps || [];
  const autoActivated = followUpResponse?.data?.autoActivated || false;

  const handleComplete = async (followUpId: string) => {
    setCompleting(followUpId);
    try {
      await apiRequest("PATCH", `/api/post-close/${leadId}/follow-up/${followUpId}`, {});
      toast.success("Follow-up completed!");
      queryClient.invalidateQueries({ queryKey: [`/api/post-close/${leadId}/follow-ups`] });
    } catch (err: any) {
      toast.error(err.message || "Failed to complete follow-up");
    } finally {
      setCompleting(null);
    }
  };

  const handleActivateAuto = async () => {
    setActivating(true);
    try {
      const res = await apiRequest("POST", `/api/post-close/${leadId}/activate-auto-followups`);
      const result = await res.json();
      toast.success(result.message || "Auto follow-ups activated!");
      queryClient.invalidateQueries({ queryKey: [`/api/post-close/${leadId}/follow-ups`] });
    } catch (err: any) {
      toast.error(err.message || "Failed to activate auto follow-ups");
    } finally {
      setActivating(false);
    }
  };

  if (isLoading || followUps.length === 0) return null;

  const completedCount = followUps.filter(f => f.status === 'completed').length;

  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-500" />
              <h3 className="text-base font-semibold text-gray-900">Follow-Up Schedule</h3>
            </div>
            {/* Activate auto button or status badge */}
            {autoActivated ? (
              <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-transparent gap-1">
                <Zap className="w-2.5 h-2.5" /> Auto Email + SMS Active
              </Badge>
            ) : (
              <Button
                size="sm"
                className="h-7 text-xs bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white gap-1.5"
                style={{ borderRadius: RADIUS.button }}
                onClick={handleActivateAuto}
                disabled={activating}
              >
                {activating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Zap className="w-3 h-3" />
                )}
                Activate Auto Follow-ups
              </Button>
            )}
          </div>

          {/* Auto-send info */}
          {autoActivated && (
            <div className="flex items-center gap-3 mb-4 p-2.5 bg-violet-50" style={{ borderRadius: RADIUS.input }}>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-violet-500" />
                <span className="text-[10px] text-violet-600 font-medium">Email</span>
              </div>
              <span className="text-[10px] text-violet-300">+</span>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3 text-violet-500" />
                <span className="text-[10px] text-violet-600 font-medium">SMS</span>
              </div>
              <span className="text-[10px] text-violet-500 ml-auto">Scheduled at each milestone automatically</span>
            </div>
          )}

          {/* Horizontal timeline */}
          <div className="flex items-start justify-between relative">
            {/* Gray base line — from center of first node to center of last node */}
            <div className="absolute top-4 h-0.5 bg-gray-200" style={{ left: 'calc(16.67%)', right: 'calc(16.67%)' }} />
            {/* Green progress line — from first node to last completed node */}
            {(() => {
              if (completedCount <= 0 || followUps.length <= 1) return null;
              const lastCompletedIdx = Math.min(completedCount - 1, followUps.length - 1);
              const endPercent = (lastCompletedIdx / (followUps.length - 1)) * 66.67;
              return (
                <div
                  className="absolute top-4 h-0.5 bg-emerald-400 transition-all"
                  style={{ left: 'calc(16.67%)', width: `${endPercent}%` }}
                />
              );
            })()}

            {followUps.map((fu) => {
              const isCompleted = fu.status === 'completed';
              const now = new Date();
              const isOverdue = !isCompleted && new Date(fu.scheduled_for) < now;
              const isNext = !isCompleted && !isOverdue && followUps.find(f => f.status === 'scheduled') === fu;

              return (
                <div key={fu.id} className="flex flex-col items-center flex-1 relative z-10">
                  {/* Node */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isOverdue
                        ? "bg-amber-500 text-white"
                        : isNext
                        ? "bg-violet-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : isOverdue ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>

                  {/* Label */}
                  <span className="text-xs font-semibold text-gray-700 mt-2">
                    {DAY_LABELS[fu.follow_up_type] || fu.follow_up_type}
                  </span>

                  {/* Date */}
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    {formatDate(fu.scheduled_for)}
                  </span>

                  {/* Countdown / Status */}
                  {isCompleted ? (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 mt-1 text-emerald-600 border-emerald-200 bg-emerald-50">
                      Done
                    </Badge>
                  ) : isOverdue ? (
                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 mt-1 text-amber-600 border-amber-200 bg-amber-50">
                      {getCountdown(fu.scheduled_for)}
                    </Badge>
                  ) : (
                    <span className="text-[10px] text-gray-400 mt-1">
                      {getCountdown(fu.scheduled_for)}
                    </span>
                  )}

                  {/* Auto-send indicator */}
                  {fu.auto_send_enabled && !isCompleted && (
                    <div className="flex items-center gap-0.5 mt-1">
                      <Mail className="w-2.5 h-2.5 text-violet-400" />
                      <MessageSquare className="w-2.5 h-2.5 text-violet-400" />
                    </div>
                  )}

                  {/* Complete button (only if not auto or manual override needed) */}
                  {!isCompleted && (isOverdue || isNext) && !fu.auto_send_enabled && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2 h-6 text-[10px] px-2"
                      style={{ borderRadius: RADIUS.button }}
                      onClick={() => handleComplete(fu.id)}
                      disabled={!!completing}
                    >
                      {completing === fu.id ? (
                        <Loader2 className="w-2.5 h-2.5 animate-spin" />
                      ) : (
                        "Complete"
                      )}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
