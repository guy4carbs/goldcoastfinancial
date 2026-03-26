import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle, Trophy, ChevronLeft, ChevronRight,
  Mail, MessageSquare, BookOpen, ShieldCheck, ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";

interface Closing {
  id: string;
  clientName: string;
  coverageType?: string;
  policyNumber?: string;
  carrier: string;
  coverageAmount: number;
  monthlyPremium: number;
  wonDate: string;
  commissionEarned: number | null;
  commissionStatus?: string;
  workflowStatus?: string | null;
  welcomeEmailSent?: boolean;
  welcomeSmsSent?: boolean;
  bookOfBusinessUpdated?: boolean;
  detailsVerified?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function RecentClosings({
  closings,
  selectedLeadId,
  onSelectLead,
}: {
  closings?: Closing[];
  selectedLeadId?: string | null;
  onSelectLead: (id: string) => void;
}) {
  const [page, setPage] = useState(0);
  const items = closings || [];
  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginated = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-violet-500" />
              Recently Closed Clients
            </h2>
            {items.length > 0 && (
              <Badge variant="outline" className="text-violet-600 border-violet-200">
                {items.length} closed
              </Badge>
            )}
          </div>
          <div className="space-y-2">
            {paginated.map((c) => {
              const isSelected = selectedLeadId === c.id;
              return (
                <div
                  key={c.id}
                  className={`flex items-center gap-3 p-3 transition-colors ${
                    isSelected
                      ? "bg-violet-50 ring-1 ring-violet-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={{ borderRadius: RADIUS.input }}
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.clientName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {c.carrier} — {c.policyNumber || c.coverageType || 'Policy'}
                    </p>
                  </div>

                  {/* Post-close status dots */}
                  <div className="flex items-center gap-1 shrink-0">
                    <StatusDot done={c.welcomeEmailSent} label="Welcome Email" icon={Mail} />
                    <StatusDot done={c.welcomeSmsSent} label="Welcome SMS" icon={MessageSquare} />
                    <StatusDot done={c.bookOfBusinessUpdated} label="Book of Business" icon={BookOpen} />
                    <StatusDot done={c.detailsVerified} label="Details Verified" icon={ShieldCheck} />
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      ${c.coverageAmount?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">${c.monthlyPremium}/mo</p>
                  </div>

                  {c.commissionEarned !== null && c.commissionEarned !== undefined && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 text-xs shrink-0">
                      +${c.commissionEarned.toFixed(0)}
                    </Badge>
                  )}

                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className={`h-7 text-xs shrink-0 ${
                      isSelected
                        ? "bg-violet-600 hover:bg-violet-700 text-white"
                        : c.workflowStatus === 'completed'
                        ? "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        : "text-violet-600 border-violet-200 hover:bg-violet-50"
                    }`}
                    style={{ borderRadius: RADIUS.button }}
                    onClick={() => isSelected ? onSelectLead('') : onSelectLead(c.id)}
                  >
                    {isSelected ? (
                      <>Close</>
                    ) : c.workflowStatus === 'completed' ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" /> Done
                      </>
                    ) : (
                      <>
                        Continue <ArrowRight className="w-3 h-3 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
            {items.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Trophy className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No closings in the last 30 days</p>
              </div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-500" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
              </Button>
              <span className="text-xs text-gray-400">{page + 1} / {totalPages}</span>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-gray-500" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatusDot({ done, label, icon: Icon }: { done?: boolean; label: string; icon: any }) {
  return (
    <div
      title={`${label}: ${done ? "Complete" : "Pending"}`}
      className={`w-5 h-5 rounded-full flex items-center justify-center ${
        done ? "bg-emerald-500" : "bg-gray-200"
      }`}
    >
      <Icon className={`w-2.5 h-2.5 ${done ? "text-white" : "text-gray-400"}`} />
    </div>
  );
}
