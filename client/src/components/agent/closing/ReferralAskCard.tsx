import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Users, Send, Gift, Loader2, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

interface ReferralAskCardProps {
  leadId: string;
  clientName: string;
  referralAsked?: boolean;
}

export function ReferralAskCard({ leadId, clientName, referralAsked }: ReferralAskCardProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(referralAsked || false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: pointsResponse } = useQuery<{
    success: boolean;
    data: {
      balance: number;
      tier: string;
      totalReferrals: number;
      convertedReferrals: number;
    };
  }>({
    queryKey: ['/api/referrals/points'],
  });

  const points = pointsResponse?.data;

  const handleSendReferralAsk = async () => {
    setSending(true);
    try {
      await apiRequest("POST", `/api/post-close/${leadId}/send-referral-ask`, {
        message: message || undefined,
      });
      toast.success("Referral ask sent!");
      setSent(true);
      setShowTemplate(false);
      queryClient.invalidateQueries({ queryKey: [`/api/post-close/${leadId}`] });
    } catch (err: any) {
      toast.error(err.message || "Failed to send referral ask");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-0 overflow-hidden" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        {/* Header with warm gradient */}
        <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Gift className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Ask for Referrals</h3>
                <p className="text-[10px] text-gray-500">Best time to ask — right after closing</p>
              </div>
            </div>
            {points && (
              <Badge variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50">
                {points.tier} — {points.balance} pts
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-5">
          {sent ? (
            <div className="flex items-center gap-3 p-3 bg-emerald-50" style={{ borderRadius: RADIUS.input }}>
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-emerald-700">Referral ask sent to {clientName}</p>
                {points && (
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {points.totalReferrals} total referral{points.totalReferrals !== 1 ? 's' : ''} • {points.convertedReferrals} converted
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-3">
                Send {clientName} a quick text asking if they know anyone who could benefit from the same coverage.
              </p>

              {showTemplate ? (
                <div className="space-y-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Hi ${clientName}! I'm glad we could help you get covered. If you know anyone who could benefit from the same protection, I'd love to help them too!`}
                    className="text-sm h-20 resize-none"
                    style={{ borderRadius: RADIUS.input }}
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                      style={{ borderRadius: RADIUS.button }}
                      onClick={handleSendReferralAsk}
                      disabled={sending}
                    >
                      {sending ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Send className="w-3 h-3 mr-1" />
                      )}
                      Send Referral Ask
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs text-gray-500"
                      onClick={() => setShowTemplate(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white"
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => setShowTemplate(true)}
                  >
                    <Users className="w-3 h-3 mr-1" />
                    Send Referral Request
                  </Button>
                  {points && points.totalReferrals > 0 && (
                    <span className="text-[10px] text-gray-400">
                      {points.totalReferrals} referral{points.totalReferrals !== 1 ? 's' : ''} so far
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
