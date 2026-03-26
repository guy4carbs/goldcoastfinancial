import { motion, AnimatePresence } from "framer-motion";
import {
  PhoneCall, PhoneOff, PhoneMissed, Voicemail,
  ArrowUpRight, ArrowDownLeft, ChevronDown, Mic,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";
import { Pagination } from "@/components/agent/primitives/Pagination";
import { AudioPlayer } from "./AudioPlayer";

interface Recording {
  id: string;
  leadName: string | null;
  agentName?: string | null;
  phoneNumber: string;
  direction: string;
  duration: number;
  status: string;
  recordingUrl: boolean;
  disposition: string | null;
  sentiment: string | null;
  calledAt: string;
}

interface RecordingsListProps {
  recordings: Recording[];
  totalCount: number;
  page: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
  detailPanel?: React.ReactNode;
}

const STATUS_CONFIG: Record<string, { icon: any; bg: string; text: string }> = {
  connected: { icon: PhoneCall, bg: "bg-violet-100", text: "text-violet-600" },
  completed: { icon: PhoneCall, bg: "bg-violet-100", text: "text-violet-600" },
  voicemail: { icon: Voicemail, bg: "bg-amber-100", text: "text-amber-600" },
  no_answer: { icon: PhoneMissed, bg: "bg-red-50", text: "text-red-500" },
  busy: { icon: PhoneOff, bg: "bg-orange-50", text: "text-orange-500" },
  failed: { icon: PhoneOff, bg: "bg-gray-100", text: "text-gray-500" },
};

const SENTIMENT_CONFIG: Record<string, { label: string; cls: string }> = {
  positive: { label: "Positive", cls: "text-emerald-600 border-emerald-200 bg-emerald-50" },
  neutral: { label: "Neutral", cls: "text-gray-600 border-gray-200 bg-gray-50" },
  negative: { label: "Negative", cls: "text-red-600 border-red-200 bg-red-50" },
};

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11 && digits[0] === "1") {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

function formatCallTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (date >= today) return `Today ${time}`;
  if (date >= yesterday) return `Yesterday ${time}`;
  return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`;
}

function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function RecordingsList({
  recordings, totalCount, page, itemsPerPage,
  onPageChange, onItemsPerPageChange,
  selectedId, onSelect, isLoading, detailPanel,
}: RecordingsListProps) {
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Mic className="w-5 h-5 text-violet-500" />
              Call Recordings
            </h2>
            {totalCount > 0 && (
              <Badge variant="outline" className="text-violet-600 border-violet-200">
                {totalCount} recording{totalCount !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          <div className="space-y-2">
            {isLoading && recordings.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <div className="w-6 h-6 border-2 border-violet-300 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-sm">Loading recordings...</p>
              </div>
            )}

            {!isLoading && recordings.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Mic className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No recordings found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            )}

            {recordings.map((rec) => {
              const statusCfg = STATUS_CONFIG[rec.status] || STATUS_CONFIG.failed;
              const StatusIcon = statusCfg.icon;
              const isSelected = selectedId === rec.id;

              return (
                <div key={rec.id}>
                  <div
                    className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-violet-50 ring-1 ring-violet-300"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    style={{ borderRadius: isSelected ? `${RADIUS.input}px ${RADIUS.input}px 0 0` : RADIUS.input }}
                    onClick={() => onSelect(rec.id)}
                  >
                    {/* Status icon */}
                    <div className={`w-9 h-9 rounded-full ${statusCfg.bg} flex items-center justify-center shrink-0`}>
                      <StatusIcon className={`w-4 h-4 ${statusCfg.text}`} />
                    </div>

                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {rec.leadName || formatPhone(rec.phoneNumber)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {rec.agentName && (
                          <span className="text-indigo-500 font-medium">{rec.agentName}</span>
                        )}
                        {rec.direction === "inbound" ? (
                          <span className="flex items-center gap-0.5 text-blue-500">
                            <ArrowDownLeft className="w-3 h-3" /> In
                          </span>
                        ) : (
                          <span className="flex items-center gap-0.5 text-violet-500">
                            <ArrowUpRight className="w-3 h-3" /> Out
                          </span>
                        )}
                        {rec.disposition && (
                          <span className="text-gray-400">
                            {rec.disposition.replace(/_/g, " ")}
                          </span>
                        )}
                        <span>{formatCallTime(rec.calledAt)}</span>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-gray-900 tabular-nums">
                        {formatDuration(rec.duration)}
                      </p>
                      {rec.recordingUrl && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-violet-500 border-violet-200">
                          recorded
                        </Badge>
                      )}
                    </div>

                    {/* Compact player */}
                    {rec.recordingUrl && (
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        <AudioPlayer recordingId={rec.id} duration={rec.duration} mode="compact" />
                      </div>
                    )}

                    {/* Sentiment */}
                    {rec.sentiment && SENTIMENT_CONFIG[rec.sentiment] && (
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${SENTIMENT_CONFIG[rec.sentiment].cls}`}
                      >
                        {SENTIMENT_CONFIG[rec.sentiment].label}
                      </Badge>
                    )}

                    {/* Chevron */}
                    <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                      isSelected ? "text-violet-500 rotate-180" : "text-gray-300"
                    }`} />
                  </div>

                  {/* Inline detail panel dropdown */}
                  <AnimatePresence>
                    {isSelected && detailPanel && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div
                          className="bg-white border border-t-0 border-violet-200 p-4"
                          style={{ borderRadius: `0 0 ${RADIUS.input}px ${RADIUS.input}px` }}
                        >
                          {detailPanel}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={onPageChange}
                onItemsPerPageChange={onItemsPerPageChange}
                showItemsPerPage
                showTotalItems
                itemsPerPageOptions={[10, 15, 25, 50]}
                size="sm"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
