import { useState, useMemo } from "react";
import {
  FileText, StickyNote, User, ArrowUpRight, ArrowDownLeft,
  Star, MessageSquare, Lightbulb, Clock, ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { RADIUS, SHADOW, GRID, TYPE } from "@/lib/heritageDesignSystem";
import { AudioPlayer } from "./AudioPlayer";

interface Recording {
  id: string;
  leadId: string | null;
  leadName: string | null;
  leadCoverageType: string | null;
  phoneNumber: string;
  direction: string;
  duration: number;
  status: string;
  recordingUrl: boolean;
  transcription: string | null;
  disposition: string | null;
  notes: string | null;
  sentiment: string | null;
  isAnalyzed: boolean;
  calledAt: string;
}

interface Analysis {
  overallScore: number | null;
  rapportScore: number | null;
  discoveryScore: number | null;
  presentationScore: number | null;
  closingScore: number | null;
  summary: string | null;
  keyMoments: Array<{ timestamp: number; type: string; description: string }>;
  suggestions: string[];
}

interface RecordingDetailPanelProps {
  recording: Recording;
  analysis?: Analysis | null;
  onClose: () => void;
  onNotesUpdate: (id: string, notes: string) => void;
  isSavingNotes?: boolean;
}

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

function formatDuration(seconds: number): string {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const value = score || 0;
  const color = value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// Parse flat transcript text into speaker segments
// Supports patterns like "Speaker 1:", "Agent:", "Customer:", or sentence-by-sentence alternation
interface TranscriptSegment {
  speaker: string;
  text: string;
}

function parseTranscript(raw: string): TranscriptSegment[] {
  // Try speaker-labeled format: "Speaker 1: ...", "Agent: ...", "Customer: ..."
  const labeledPattern = /^(Speaker\s*\d+|Agent|Customer|Caller|Rep|Representative|Operator):\s*/im;
  const lines = raw.split(/\n/).filter((l) => l.trim());

  // Check if any line has speaker labels
  const hasLabels = lines.some((l) => labeledPattern.test(l.trim()));

  if (hasLabels) {
    const segments: TranscriptSegment[] = [];
    let current: TranscriptSegment | null = null;
    for (const line of lines) {
      const match = line.trim().match(/^(Speaker\s*\d+|Agent|Customer|Caller|Rep|Representative|Operator):\s*(.*)/i);
      if (match) {
        if (current) segments.push(current);
        current = { speaker: match[1], text: match[2] };
      } else if (current) {
        current.text += " " + line.trim();
      } else {
        current = { speaker: "Speaker", text: line.trim() };
      }
    }
    if (current) segments.push(current);
    return segments;
  }

  // Fallback: split by sentences and alternate speakers
  const sentences = raw.match(/[^.!?]+[.!?]+/g) || [raw];
  const segments: TranscriptSegment[] = [];
  let currentSpeaker = "Agent";
  let currentText = "";

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i].trim();
    if (!sentence) continue;

    // Heuristic: switch speaker on question/answer patterns or every 1-2 sentences
    const isQuestion = sentence.endsWith("?");
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon)/i.test(sentence);
    const shouldSwitch =
      (i > 0 && isGreeting) ||
      (i > 0 && segments.length > 0 && isQuestion !== (segments[segments.length - 1]?.text.endsWith("?") ?? false));

    if (shouldSwitch && currentText) {
      segments.push({ speaker: currentSpeaker, text: currentText.trim() });
      currentSpeaker = currentSpeaker === "Agent" ? "Customer" : "Agent";
      currentText = sentence;
    } else {
      currentText += (currentText ? " " : "") + sentence;
    }
  }
  if (currentText) {
    segments.push({ speaker: currentSpeaker, text: currentText.trim() });
  }

  return segments;
}

const SPEAKER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Agent: { bg: "bg-violet-50", text: "text-violet-600", border: "rgba(139, 92, 246, 0.15)" },
  Rep: { bg: "bg-violet-50", text: "text-violet-600", border: "rgba(139, 92, 246, 0.15)" },
  Representative: { bg: "bg-violet-50", text: "text-violet-600", border: "rgba(139, 92, 246, 0.15)" },
  Operator: { bg: "bg-violet-50", text: "text-violet-600", border: "rgba(139, 92, 246, 0.15)" },
  Customer: { bg: "bg-blue-50", text: "text-blue-600", border: "rgba(59, 130, 246, 0.15)" },
  Caller: { bg: "bg-blue-50", text: "text-blue-600", border: "rgba(59, 130, 246, 0.15)" },
};

function getSpeakerStyle(speaker: string) {
  const normalized = speaker.replace(/\s*\d+/, "");
  if (SPEAKER_COLORS[normalized]) return SPEAKER_COLORS[normalized];
  if (/1/.test(speaker)) return SPEAKER_COLORS.Agent;
  if (/2/.test(speaker)) return SPEAKER_COLORS.Customer;
  return { bg: "bg-gray-50", text: "text-gray-600", border: "rgba(0, 0, 0, 0.06)" };
}

function TranscriptBubbles({ segments }: { segments: TranscriptSegment[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: GRID.spacing.sm }}>
      {segments.map((seg, i) => {
        const style = getSpeakerStyle(seg.speaker);
        const isAgent = ["Agent", "Rep", "Representative", "Operator", "Speaker 1"].some(
          (s) => seg.speaker.toLowerCase() === s.toLowerCase()
        );
        return (
          <div key={i} className={`flex ${isAgent ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[80%] ${isAgent ? "" : "text-right"}`}>
              <span
                className={`font-semibold uppercase tracking-wider ${style.text} block`}
                style={{ fontSize: TYPE.micro, marginBottom: 4 }}
              >
                {seg.speaker}
              </span>
              <div
                className={`${style.bg} text-gray-800`}
                style={{
                  padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                  borderRadius: RADIUS.button,
                  ...(isAgent
                    ? { borderTopLeftRadius: 4 }
                    : { borderTopRightRadius: 4 }),
                  fontSize: TYPE.meta,
                  lineHeight: TYPE.lineHeight,
                  boxShadow: SHADOW.level1,
                  border: `1px solid ${style.border}`,
                }}
              >
                {seg.text}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const COLLAPSED_LINES = 5;

export function RecordingDetailPanel({
  recording, analysis, onClose, onNotesUpdate, isSavingNotes,
}: RecordingDetailPanelProps) {
  const [notes, setNotes] = useState(recording.notes || "");
  const [showFullTranscript, setShowFullTranscript] = useState(false);

  const transcriptSegments = useMemo(
    () => (recording.transcription ? parseTranscript(recording.transcription) : []),
    [recording.transcription],
  );

  // Check if transcript exceeds collapsed height
  const transcriptLines = recording.transcription?.split(/\n/).filter((l) => l.trim()) || [];
  const isLong = transcriptLines.length > COLLAPSED_LINES || (recording.transcription?.length || 0) > 400;

  const overallScore = analysis?.overallScore;
  const scoreColor = overallScore
    ? overallScore >= 80 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : overallScore >= 50 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200"
    : "";

  return (
    <div>
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Column 1: Player + Transcription + Notes */}
            <div className="lg:col-span-2 space-y-4">
              {/* Audio Player */}
              {recording.recordingUrl && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <AudioPlayer recordingId={recording.id} duration={recording.duration} mode="full" />
                </div>
              )}

              {/* Call Info */}
              <div className="flex flex-wrap items-center gap-2">
                {recording.direction === "inbound" ? (
                  <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
                    <ArrowDownLeft className="w-3 h-3 mr-1" /> Inbound
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-violet-600 border-violet-200 bg-violet-50">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> Outbound
                  </Badge>
                )}
                <span className="text-sm text-gray-600">{formatPhone(recording.phoneNumber)}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-600">{formatDuration(recording.duration)}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">{formatDate(recording.calledAt)}</span>
                {recording.disposition && (
                  <Badge variant="outline" className="text-xs">
                    {recording.disposition.replace(/_/g, " ")}
                  </Badge>
                )}
                {recording.sentiment && (
                  <Badge variant="outline" className={`text-xs ${
                    recording.sentiment === "positive" ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                    : recording.sentiment === "negative" ? "text-red-600 border-red-200 bg-red-50"
                    : "text-gray-600 border-gray-200"
                  }`}>
                    {recording.sentiment}
                  </Badge>
                )}
              </div>

              {/* Transcription */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  Transcription
                </h4>
                {recording.transcription ? (
                  <>
                    <div className="relative">
                      <div
                        className="text-gray-600 bg-gray-50 overflow-hidden whitespace-pre-wrap"
                        style={{
                          borderRadius: RADIUS.input,
                          padding: `${GRID.spacing.xs + 4}px ${GRID.spacing.sm}px`,
                          fontSize: TYPE.meta,
                          lineHeight: TYPE.lineHeight,
                          maxHeight: isLong ? "7.5rem" : undefined,
                          border: "1px solid rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        {recording.transcription}
                      </div>
                      {isLong && (
                        <div
                          className="absolute bottom-0 left-0 right-0 pointer-events-none"
                          style={{
                            height: GRID.spacing.xxl,
                            borderRadius: `0 0 ${RADIUS.input}px ${RADIUS.input}px`,
                            background: "linear-gradient(to bottom, transparent, rgb(249 250 251 / 0.4) 30%, rgb(249 250 251) 100%)",
                          }}
                        />
                      )}
                    </div>
                    {isLong && (
                      <button
                        onClick={() => setShowFullTranscript(true)}
                        className="flex items-center text-violet-600 hover:text-violet-700 transition-colors"
                        style={{
                          marginTop: GRID.spacing.xs,
                          gap: 4,
                          fontSize: TYPE.meta,
                          fontWeight: 500,
                        }}
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                        View full transcript
                      </button>
                    )}

                    {/* Full transcript modal */}
                    <Dialog open={showFullTranscript} onOpenChange={setShowFullTranscript}>
                      <DialogContent
                        className="flex flex-col p-0 gap-0"
                        style={{
                          borderRadius: RADIUS.hero,
                          boxShadow: SHADOW.hero,
                          width: "90vw",
                          maxWidth: 600,
                          height: 600,
                          maxHeight: "90vh",
                        }}
                      >
                        <DialogHeader
                          className="shrink-0"
                          style={{
                            padding: `${GRID.spacing.md}px ${GRID.spacing.lg}px`,
                            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
                          }}
                        >
                          <DialogTitle
                            className="flex items-center gap-2 text-gray-900"
                            style={{ fontSize: TYPE.title }}
                          >
                            <FileText className="w-5 h-5 text-violet-500" />
                            Call Transcript
                          </DialogTitle>
                          <DialogDescription style={{ fontSize: TYPE.meta }} className="text-gray-500">
                            {recording.leadName || formatPhone(recording.phoneNumber)} — {formatDate(recording.calledAt)}
                          </DialogDescription>
                        </DialogHeader>
                        <div
                          className="flex-1 overflow-y-auto"
                          style={{ padding: `${GRID.spacing.md}px ${GRID.spacing.lg}px` }}
                        >
                          <TranscriptBubbles segments={transcriptSegments} />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No transcription available</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-gray-400" />
                    Notes
                  </h4>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={notes === (recording.notes || "") || isSavingNotes}
                    onClick={() => onNotesUpdate(recording.id, notes)}
                  >
                    {isSavingNotes ? "Saving..." : "Save"}
                  </Button>
                </div>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this call..."
                  className="min-h-[80px] text-sm resize-none"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>
            </div>

            {/* Column 2: Lead Info + AI Analysis */}
            <div className="space-y-5">
              {/* Lead Info */}
              {recording.leadName && (
                <div className="p-4 bg-gray-50 rounded-lg" style={{ borderRadius: RADIUS.input }}>
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-gray-400" />
                    Lead Info
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>{" "}
                      <span className="font-medium text-gray-900">{recording.leadName}</span>
                    </div>
                    {recording.leadCoverageType && (
                      <div>
                        <span className="text-gray-500">Coverage:</span>{" "}
                        <span className="font-medium text-gray-900">{recording.leadCoverageType}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="font-medium text-gray-900">{formatPhone(recording.phoneNumber)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis */}
              {recording.isAnalyzed && analysis ? (
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    AI Analysis
                  </h4>

                  {/* Overall Score */}
                  {overallScore !== null && overallScore !== undefined && (
                    <div className="flex items-center gap-3">
                      <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center font-bold text-lg ${scoreColor}`}>
                        {overallScore}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Overall Score</p>
                        <p className="text-xs text-gray-500">
                          {overallScore >= 80 ? "Excellent" : overallScore >= 50 ? "Average" : "Needs Improvement"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Sub-scores */}
                  <div className="space-y-2.5">
                    <ScoreBar label="Rapport" score={analysis.rapportScore} />
                    <ScoreBar label="Discovery" score={analysis.discoveryScore} />
                    <ScoreBar label="Presentation" score={analysis.presentationScore} />
                    <ScoreBar label="Closing" score={analysis.closingScore} />
                  </div>

                  {/* Summary */}
                  {analysis.summary && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                        <MessageSquare className="w-3 h-3" /> Summary
                      </h5>
                      <p className="text-xs text-gray-600 leading-relaxed">{analysis.summary}</p>
                    </div>
                  )}

                  {/* Key Moments */}
                  {analysis.keyMoments && analysis.keyMoments.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                        <Clock className="w-3 h-3" /> Key Moments
                      </h5>
                      <div className="space-y-1">
                        {analysis.keyMoments.map((km, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs">
                            <span className="text-violet-500 font-mono shrink-0">
                              {formatDuration(km.timestamp)}
                            </span>
                            <span className="text-gray-600">{km.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {analysis.suggestions && analysis.suggestions.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                        <Lightbulb className="w-3 h-3" /> Coaching Tips
                      </h5>
                      <ul className="space-y-1">
                        {analysis.suggestions.map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                            <span className="text-violet-400 mt-0.5">-</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <Star className="w-6 h-6 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">AI analysis not yet available</p>
                </div>
              )}
            </div>
          </div>
    </div>
  );
}
