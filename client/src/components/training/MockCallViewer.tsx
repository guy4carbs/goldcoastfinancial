/**
 * MockCallViewer - Interactive mock call transcript viewer
 *
 * Displays mock call transcripts with annotations, rubric scoring,
 * compliance highlighting, and section navigation for training purposes.
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Phone,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Users,
  Star,
  BookOpen,
  Target,
  Flag,
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MockCallTranscript,
  CallTranscriptSection,
  CallTranscriptLine,
  getMockCallById,
  getMockCallsForModule,
  CallRating,
  MOCK_CALL_TRANSCRIPTS
} from "@/lib/trainingInfrastructure";

interface MockCallViewerProps {
  callId?: string;
  moduleId?: string;
  showRubric?: boolean;
  autoPlay?: boolean;
  className?: string;
}

const ratingColors: Record<CallRating, string> = {
  excellent: "text-green-600 bg-green-50 border-green-200",
  good: "text-blue-600 bg-blue-50 border-blue-200",
  satisfactory: "text-teal-600 bg-teal-50 border-teal-200",
  acceptable: "text-cyan-600 bg-cyan-50 border-cyan-200",
  needs_improvement: "text-amber-600 bg-amber-50 border-amber-200",
  poor: "text-red-600 bg-red-50 border-red-200",
  failing: "text-red-700 bg-red-100 border-red-300"
};

const ratingLabels: Record<CallRating, string> = {
  excellent: "Excellent",
  good: "Good",
  satisfactory: "Satisfactory",
  acceptable: "Acceptable",
  needs_improvement: "Needs Improvement",
  poor: "Poor",
  failing: "Failing"
};

const ratingIcons: Record<CallRating, React.ReactNode> = {
  excellent: <Star className="w-4 h-4 fill-current" />,
  good: <ThumbsUp className="w-4 h-4" />,
  satisfactory: <CheckCircle className="w-4 h-4" />,
  acceptable: <CheckCircle className="w-4 h-4" />,
  needs_improvement: <Info className="w-4 h-4" />,
  poor: <ThumbsDown className="w-4 h-4" />,
  failing: <XCircle className="w-4 h-4" />
};

const annotationColors = {
  excellent: "bg-green-50 border-green-400 text-green-700",
  acceptable: "bg-blue-50 border-blue-400 text-blue-700",
  tip: "bg-cyan-50 border-cyan-400 text-cyan-700",
  warning: "bg-amber-50 border-amber-400 text-amber-700",
  violation: "bg-red-50 border-red-400 text-red-700"
};

const annotationIcons = {
  excellent: <CheckCircle className="w-3 h-3" />,
  acceptable: <ThumbsUp className="w-3 h-3" />,
  tip: <Lightbulb className="w-3 h-3" />,
  warning: <AlertTriangle className="w-3 h-3" />,
  violation: <XCircle className="w-3 h-3" />
};

export function MockCallViewer({
  callId,
  moduleId,
  showRubric = true,
  autoPlay = false,
  className
}: MockCallViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("transcript");
  const transcriptRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get call data
  const call = callId
    ? getMockCallById(callId)
    : moduleId
      ? getMockCallsForModule(moduleId)[0]
      : undefined;

  // Auto-scroll to current line
  useEffect(() => {
    if (isPlaying && call) {
      const currentSection = call.sections[currentSectionIndex];
      if (currentSection) {
        const lineKey = `${currentSectionIndex}-${currentLineIndex}`;
        const lineEl = lineRefs.current.get(lineKey);
        if (lineEl) {
          lineEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    }
  }, [currentLineIndex, currentSectionIndex, isPlaying, call]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying || !call) return;

    const currentSection = call.sections[currentSectionIndex];
    if (!currentSection) {
      setIsPlaying(false);
      return;
    }

    const currentLine = currentSection.lines[currentLineIndex];
    if (!currentLine) {
      // Move to next section
      if (currentSectionIndex < call.sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentLineIndex(0);
      } else {
        setIsPlaying(false);
      }
      return;
    }

    // Calculate delay based on content length and playback speed
    const baseDelay = Math.max(1500, currentLine.content.length * 30);
    const delay = baseDelay / playbackSpeed;

    const timer = setTimeout(() => {
      if (currentLineIndex < currentSection.lines.length - 1) {
        setCurrentLineIndex(prev => prev + 1);
      } else if (currentSectionIndex < call.sections.length - 1) {
        setCurrentSectionIndex(prev => prev + 1);
        setCurrentLineIndex(0);
      } else {
        setIsPlaying(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentLineIndex, currentSectionIndex, playbackSpeed, call]);

  if (!call) {
    return (
      <Card className={cn("border-gray-200", className)}>
        <CardContent className="p-8 text-center text-gray-500">
          <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No mock call transcript available</p>
        </CardContent>
      </Card>
    );
  }

  const jumpToSection = (index: number) => {
    setCurrentSectionIndex(index);
    setCurrentLineIndex(0);
  };

  const totalLines = call.sections.reduce((acc, s) => acc + s.lines.length, 0);
  const currentTotalLine = call.sections
    .slice(0, currentSectionIndex)
    .reduce((acc, s) => acc + s.lines.length, 0) + currentLineIndex;
  const progress = (currentTotalLine / totalLines) * 100;

  const getOutcomeLabel = (outcome: string) => {
    const labels: Record<string, string> = {
      application_submitted: "Application Submitted",
      scheduled_followup: "Follow-up Scheduled",
      client_declined: "Client Declined",
      compliance_concern: "Compliance Concern",
      needs_more_info: "Needs More Information"
    };
    return labels[outcome] || outcome.replace(/_/g, " ");
  };

  return (
    <Card className={cn("border-violet-500/20 overflow-hidden", className)}>
      <CardHeader className="pb-4 bg-gradient-to-r from-violet-500/5 to-transparent">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Phone className="w-5 h-5 text-violet-500" />
              {call.title}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">{call.description}</p>
          </div>
          <Badge className={cn("border ml-4", ratingColors[call.rating])}>
            {ratingIcons[call.rating]}
            <span className="ml-1">{ratingLabels[call.rating]}</span>
          </Badge>
        </div>

        {/* Call metadata */}
        <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>{call.context.advisorName}</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="w-4 h-4" />
            <span className="capitalize">{call.context.callType.replace(/_/g, " ")}</span>
          </div>
          {call.context.clientProfile && (
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{call.context.clientProfile.name}, {call.context.clientProfile.age}</span>
            </div>
          )}
          {call.overallScore && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{call.overallScore.percentage}% ({call.overallScore.earned}/{call.overallScore.possible})</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="transcript">Transcript</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              {showRubric && <TabsTrigger value="rubric">Scoring</TabsTrigger>}
            </TabsList>
          </div>

          {/* Transcript Tab */}
          <TabsContent value="transcript" className="px-6 pb-6 mt-4">
            {/* Playback Controls */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentSectionIndex(0);
                      setCurrentLineIndex(0);
                    }}
                  >
                    <SkipBack className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={isPlaying ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={isPlaying ? "bg-violet-500 hover:bg-violet-500/90" : ""}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (currentSectionIndex < call.sections.length - 1) {
                        setCurrentSectionIndex(prev => prev + 1);
                        setCurrentLineIndex(0);
                      }
                    }}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Speed:</span>
                    {[0.5, 1, 1.5, 2].map(speed => (
                      <Button
                        key={speed}
                        variant={playbackSpeed === speed ? "default" : "ghost"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setPlaybackSpeed(speed)}
                      >
                        {speed}x
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant={showAnnotations ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setShowAnnotations(!showAnnotations)}
                    className="gap-1"
                  >
                    <Lightbulb className="w-4 h-4" />
                    Notes
                  </Button>
                </div>
              </div>

              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-1 text-xs text-gray-500">
                <span>Line {currentTotalLine + 1} of {totalLines}</span>
                <span>{call.sections[currentSectionIndex]?.title || "Complete"}</span>
              </div>
            </div>

            {/* Transcript Content */}
            <div
              ref={transcriptRef}
              className="max-h-[500px] overflow-y-auto space-y-6 pr-2"
            >
              {call.sections.map((section, sectionIdx) => (
                <div key={sectionIdx} className="border-b border-gray-100 pb-4 last:border-0">
                  <button
                    onClick={() => jumpToSection(sectionIdx)}
                    className={cn(
                      "w-full flex items-center justify-between py-2 px-3 rounded-lg transition-colors text-left",
                      currentSectionIndex === sectionIdx
                        ? "bg-violet-500/10"
                        : "hover:bg-gray-50"
                    )}
                  >
                    <div>
                      <span className="font-medium text-sm text-primary">
                        {section.title}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">
                        {section.startTimestamp} - {section.endTimestamp}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {section.score && (
                        <Badge variant="outline" className="text-xs">
                          {section.score.earned}/{section.score.possible} pts
                        </Badge>
                      )}
                    </div>
                  </button>

                  <div className="mt-3 space-y-3">
                    {section.lines.map((line, lineIdx) => {
                      const lineKey = `${sectionIdx}-${lineIdx}`;
                      const isCurrentLine =
                        currentSectionIndex === sectionIdx &&
                        currentLineIndex === lineIdx;
                      const isPastLine =
                        sectionIdx < currentSectionIndex ||
                        (sectionIdx === currentSectionIndex && lineIdx < currentLineIndex);

                      const isViolation = line.annotation?.type === 'violation';
                      const highlightClass = line.isHighlighted
                        ? line.highlightColor === 'green' ? 'border-l-green-500 bg-green-50/50'
                        : line.highlightColor === 'red' ? 'border-l-red-500 bg-red-50/50'
                        : line.highlightColor === 'yellow' ? 'border-l-amber-500 bg-amber-50/50'
                        : line.highlightColor === 'blue' ? 'border-l-blue-500 bg-blue-50/50'
                        : ''
                        : '';

                      return (
                        <div
                          key={lineIdx}
                          ref={el => {
                            if (el) lineRefs.current.set(lineKey, el);
                          }}
                          className={cn(
                            "pl-4 py-2 rounded-r transition-all border-l-2",
                            isCurrentLine && "bg-violet-500/10 border-l-violet-500",
                            !isCurrentLine && highlightClass,
                            !isCurrentLine && !highlightClass && "border-l-transparent",
                            isPastLine && !isCurrentLine && "opacity-70",
                            !isPastLine && !isCurrentLine && "opacity-90"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "flex-shrink-0 w-20 text-xs font-medium",
                              line.speaker === "advisor" ? "text-blue-600" : "text-emerald-600"
                            )}>
                              <div>{line.speakerName || (line.speaker === "advisor" ? "Advisor" : "Client")}</div>
                              <div className="text-gray-400 font-normal">{line.timestamp}</div>
                            </div>
                            <div className="flex-1">
                              <p className={cn(
                                "text-sm leading-relaxed",
                                isViolation && "text-red-700"
                              )}>
                                {line.content}
                              </p>

                              {/* Annotation */}
                              {showAnnotations && line.annotation && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className={cn(
                                    "mt-2 p-2 rounded text-xs border-l-2",
                                    annotationColors[line.annotation.type]
                                  )}
                                >
                                  <div className="flex items-start gap-2">
                                    {annotationIcons[line.annotation.type]}
                                    <div>
                                      <span className="font-medium">{line.annotation.text}</span>
                                      {line.annotation.rubricReference && (
                                        <span className="text-gray-500 ml-2">
                                          [{line.annotation.rubricReference}]
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="px-6 pb-6 mt-4">
            <div className="space-y-6">
              {/* Client Context */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Client Profile
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <span className="ml-2 font-medium">{call.context.clientProfile.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Age:</span>
                    <span className="ml-2 font-medium">{call.context.clientProfile.age}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <span className="ml-2 font-medium">{call.context.clientProfile.maritalStatus}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Occupation:</span>
                    <span className="ml-2 font-medium">{call.context.clientProfile.occupation}</span>
                  </div>
                  {call.context.clientProfile.income && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Income:</span>
                      <span className="ml-2 font-medium">{call.context.clientProfile.income}</span>
                    </div>
                  )}
                  <div className="col-span-2">
                    <span className="text-gray-500">Primary Concern:</span>
                    <span className="ml-2 font-medium">{call.context.clientProfile.primaryConcern}</span>
                  </div>
                </div>
              </div>

              {/* What Went Well */}
              {call.summary?.whatWentWell && call.summary.whatWentWell.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    What Went Well
                  </h4>
                  <ul className="space-y-2">
                    {call.summary.whatWentWell.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Areas for Improvement */}
              {call.summary?.areasForImprovement && call.summary.areasForImprovement.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-4 h-4" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {call.summary.areasForImprovement.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Key Takeaways */}
              {call.summary?.keyTakeaways && call.summary.keyTakeaways.length > 0 && (
                <div>
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-blue-700">
                    <Lightbulb className="w-4 h-4" />
                    Key Takeaways
                  </h4>
                  <ul className="space-y-2">
                    {call.summary.keyTakeaways.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Compliance Notes */}
              {call.summary?.complianceNotes && call.summary.complianceNotes.length > 0 && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-red-700">
                    <Flag className="w-4 h-4" />
                    Compliance Notes
                  </h4>
                  <ul className="space-y-2">
                    {call.summary.complianceNotes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                        <Flag className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Rubric/Scoring Tab */}
          {showRubric && (
            <TabsContent value="rubric" className="px-6 pb-6 mt-4">
              <div className="space-y-4">
                {/* Overall Score */}
                <Card className={cn("border-2", ratingColors[call.rating])}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Overall Performance</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Outcome: {getOutcomeLabel(call.outcome)}
                        </p>
                      </div>
                      <div className="text-right">
                        {call.overallScore && (
                          <div className="text-3xl font-bold text-primary">
                            {call.overallScore.percentage}%
                          </div>
                        )}
                        <div className="text-sm capitalize text-gray-600">
                          {ratingLabels[call.rating]}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Section Scores */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Section Breakdown</h4>
                  {call.sections.map((section, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">{section.title}</p>
                        {section.rubricCategory && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {section.rubricCategory}
                          </p>
                        )}
                      </div>
                      {section.score && (
                        <div className="flex items-center gap-3">
                          <Progress
                            value={(section.score.earned / section.score.possible) * 100}
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-medium w-16 text-right">
                            {section.score.earned}/{section.score.possible}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// MockCallList - Grid of call cards for selection
// ---------------------------------------------------------------------------

interface MockCallListProps {
  moduleId?: string;
  rating?: CallRating;
  onSelect?: (callId: string) => void;
  className?: string;
}

export function MockCallList({ moduleId, rating, onSelect, className }: MockCallListProps) {
  let calls: MockCallTranscript[] = moduleId
    ? getMockCallsForModule(moduleId)
    : MOCK_CALL_TRANSCRIPTS;

  if (rating) {
    calls = calls.filter((c: MockCallTranscript) => c.rating === rating);
  }

  if (calls.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="py-8 text-center text-gray-500">
          <Phone className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No mock calls available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2", className)}>
      {calls.map((call: MockCallTranscript) => (
        <Card
          key={call.id}
          className={cn(
            "cursor-pointer hover:shadow-md transition-all hover:border-violet-500/50",
            onSelect && "hover:scale-[1.01]"
          )}
          onClick={() => onSelect?.(call.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-sm text-primary line-clamp-1">
                {call.title}
              </h4>
              <Badge className={cn("border text-xs ml-2 flex-shrink-0", ratingColors[call.rating])}>
                {ratingLabels[call.rating]}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
              {call.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {call.context.advisorName}
              </span>
              {call.overallScore && (
                <span className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {call.overallScore.percentage}%
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// MockCallCompact - Minimal card for inline display
// ---------------------------------------------------------------------------

interface MockCallCompactProps {
  callId: string;
  onClick?: () => void;
  className?: string;
}

export function MockCallCompact({ callId, onClick, className }: MockCallCompactProps) {
  const call = getMockCallById(callId);

  if (!call) {
    return null;
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-violet-500/50 hover:bg-gray-50 transition-colors text-left",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
        <Phone className="w-5 h-5 text-violet-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-primary truncate">{call.title}</p>
        <p className="text-xs text-gray-500">{call.context.advisorName}</p>
      </div>
      <Badge className={cn("border text-xs", ratingColors[call.rating])}>
        {ratingLabels[call.rating]}
      </Badge>
    </button>
  );
}
