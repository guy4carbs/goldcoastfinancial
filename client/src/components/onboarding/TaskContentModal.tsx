/**
 * TaskContentModal - Premium onboarding task interaction system
 *
 * Enhanced with:
 * - Rich Heritage brand styling
 * - Sophisticated animations and transitions
 * - Interactive progress tracking
 * - Intelligent roleplay AI
 * - Comprehensive module viewer with learning features
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  X,
  CheckCircle2,
  Play,
  BookOpen,
  GraduationCap,
  Target,
  Mic,
  Award,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Trophy,
  ArrowRight,
  Lightbulb,
  Star,
  Zap,
  MessageCircle,
  User,
  Brain,
  Heart,
  AlertCircle,
  ThumbsUp,
  Send,
  RotateCcw,
  Volume2,
  PauseCircle,
  CheckCheck,
  Bookmark,
  FileText,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  MOTION,
  COLORS,
} from "@/lib/onboardingDesignSystem";

// Import content components
import { VideoPlayer, type TrainingVideo } from "@/components/training/VideoPlayer";
import { TrainingAssessment, type AssessmentResult } from "@/components/agent/TrainingAssessment";
import { CallSimulator, type SimulationResult } from "@/components/training/CallSimulator";

// Import content types
import type { Assessment } from "@/lib/trainingData";
import type { SimulationScenario } from "@/lib/trainingInfrastructure";
import type { ModuleContent, RoleplayConfig } from "@/data/onboardingTaskContent";

// ============================================================================
// TYPES
// ============================================================================

interface Task {
  id: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  xp: number;
  completed: boolean;
  required: boolean;
  day: number;
}

// Extended content types - form, action, read map to module viewer
type ContentType = "video" | "module" | "quiz" | "simulation" | "roleplay" | "celebration" | "form" | "action" | "read" | "practice" | "call" | "review" | "planning";

interface TaskContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  task: Task | null;
  content: {
    type: ContentType;
    content: TrainingVideo | ModuleContent | Assessment | SimulationScenario | RoleplayConfig | { id: string; title: string };
  } | null;
}

// ============================================================================
// SHIMMER LOADING EFFECT COMPONENT
// ============================================================================

function ShimmerEffect({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200/50 via-gray-100/50 to-gray-200/50">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ============================================================================
// GRADIENT RING DECORATION
// ============================================================================

function GradientRing({ size = 200, className }: { size?: number; className?: string }) {
  return (
    <motion.div
      className={cn("absolute rounded-full pointer-events-none", className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(from 180deg, ${COLORS.primary.violet[500]}, ${COLORS.primary.purple[500]}, ${COLORS.accent.amber[500]}, ${COLORS.primary.violet[500]})`,
        opacity: 0.1,
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ============================================================================
// PULSE DOT INDICATOR
// ============================================================================

function PulseDot({ color = "violet", size = 8, delay = 0 }: { color?: string; size?: number; delay?: number }) {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-500",
    purple: "bg-purple-500",
    amber: "bg-amber-500",
    green: "bg-emerald-500",
  };

  return (
    <motion.span
      className={cn("rounded-full inline-block", colorMap[color] || colorMap.violet)}
      style={{ width: size, height: size }}
      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
      transition={{ duration: 1.5, delay, repeat: Infinity }}
    />
  );
}

// ============================================================================
// PROGRESS RING (SVG CIRCULAR)
// ============================================================================

function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 3,
  className
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className={className}>
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-gray-200"
      />
      {/* Progress circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.primary.violet[500]} />
          <stop offset="50%" stopColor={COLORS.primary.purple[500]} />
          <stop offset="100%" stopColor={COLORS.accent.amber[500]} />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ============================================================================
// FLOATING PARTICLES COMPONENT
// ============================================================================

function FloatingParticles({ count = 6, colors = ["violet", "purple", "amber"] }: { count?: number; colors?: string[] }) {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-400/20",
    purple: "bg-purple-400/20",
    amber: "bg-amber-400/20",
    white: "bg-white/30",
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const color = colors[i % colors.length];
        const size = 4 + Math.random() * 8;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;

        return (
          <motion.div
            key={i}
            className={cn("absolute rounded-full", colorMap[color] || colorMap.violet)}
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ============================================================================
// ENHANCED MODULE VIEWER COMPONENT
// ============================================================================

interface ModuleViewerProps {
  module: ModuleContent;
  onComplete: () => void;
  onClose: () => void;
}

function ModuleViewer({ module, onComplete, onClose }: ModuleViewerProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [completedSections, setCompletedSections] = useState<Set<number>>(new Set());
  const [readingProgress, setReadingProgress] = useState(0);
  const [showObjectives, setShowObjectives] = useState(true);
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const section = module.sections[currentSection];
  const progress = ((completedSections.size) / module.sections.length) * 100;
  const allComplete = completedSections.size === module.sections.length;
  const totalDuration = module.sections.reduce((sum, s) => sum + s.duration, 0);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const scrollPercent = scrollHeight > clientHeight
          ? (scrollTop / (scrollHeight - clientHeight)) * 100
          : 100;
        setReadingProgress(Math.min(100, scrollPercent));
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [currentSection]);

  const markSectionComplete = () => {
    setCompletedSections(prev => new Set(Array.from(prev).concat([currentSection])));
  };

  const goToNextSection = () => {
    markSectionComplete();
    setReadingProgress(0);
    if (currentSection < module.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setShowObjectives(false);
    }
  };

  const goToPrevSection = () => {
    setReadingProgress(0);
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Learning Objectives Overlay
  if (showObjectives && currentSection === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white p-8 rounded-t-2xl overflow-hidden">
          {/* Close button */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-white/20 transition-colors group"
          >
            <X className="w-5 h-5 text-white" />
          </motion.button>

          <FloatingParticles count={8} colors={["white", "white", "amber"]} />

          <div className="relative z-10">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <BookOpen className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl mb-2 text-white"
              style={{ fontWeight: 700, fontStyle: 'normal' }}
            >
              {module.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-4"
              style={{ fontStyle: 'normal', fontWeight: 400, color: 'rgba(255,255,255,0.9)' }}
            >
              {module.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Badge className="bg-white/20 text-white border-0">
                <Clock className="w-3 h-3 mr-1" />
                {totalDuration} min
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <FileText className="w-3 h-3 mr-1" />
                {module.sections.length} sections
              </Badge>
              <Badge className="bg-white/20 text-white border-0">
                <Target className="w-3 h-3 mr-1" />
                {module.learningObjectives.length} objectives
              </Badge>
            </motion.div>
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="flex-1 overflow-auto px-6 pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2" style={{ fontSize: TYPE.body }}>
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Learning Objectives
          </h3>

          <div className="space-y-3 mb-6">
            {module.learningObjectives.map((objective, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="flex items-start gap-3 p-3 bg-violet-50/50 rounded-xl border border-violet-100"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>
                  {objective}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Section Overview */}
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2" style={{ fontSize: TYPE.body }}>
            <ListChecks className="w-5 h-5 text-violet-500" />
            Module Sections
          </h3>

          <div className="space-y-2 mb-6">
            {module.sections.map((sec, i) => (
              <motion.div
                key={sec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium">{i + 1}</span>
                  </div>
                  <span className="text-gray-700 font-medium" style={{ fontSize: TYPE.meta }}>
                    {sec.title}
                  </span>
                </div>
                <Badge variant="outline" className="text-gray-500">
                  {sec.duration} min
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="flex-shrink-0 pt-4 px-6 pb-6 border-t border-gray-100">
          <Button
            onClick={() => setShowObjectives(false)}
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white hover:opacity-90"
            style={{ borderRadius: RADIUS.button, height: 48 }}
          >
            <Play className="w-5 h-5 mr-2" />
            Begin Module
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header with Progress */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500 flex items-center justify-center relative"
              style={{ boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)' }}
            >
              <BookOpen className="w-6 h-6 text-white" />
              {/* Completion checkmark */}
              {completedSections.has(currentSection) && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                {module.title}
              </h3>
              <div className="flex items-center gap-2 text-gray-500" style={{ fontSize: TYPE.meta }}>
                <span>Section {currentSection + 1} of {module.sections.length}</span>
                <span className="text-gray-300">|</span>
                <span className="text-violet-600 font-medium">{Math.round(progress)}% complete</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotes(!showNotes)}
              className={cn(
                "text-gray-500 hover:text-violet-600",
                showNotes && "bg-violet-50 text-violet-600"
              )}
            >
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Section Progress Bar */}
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          {/* Overall progress */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gray-200"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
          {/* Reading progress for current section */}
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 via-purple-500 to-amber-500"
            style={{ width: `${(progress + (readingProgress / module.sections.length))}%` }}
          />
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1.5 mt-4 overflow-x-auto pb-1">
          {module.sections.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentSection(i);
                setReadingProgress(0);
              }}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                i === currentSection
                  ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/25"
                  : completedSections.has(i)
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {completedSections.has(i) && i !== currentSection && (
                <CheckCircle2 className="w-3 h-3 inline mr-1" />
              )}
              {i + 1}. {s.title.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Section Content */}
        <ScrollArea ref={scrollRef} className="flex-1 py-4 pr-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                <div
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"
                  style={{ boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}
                >
                  <span className="text-white font-bold text-lg">{currentSection + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                    {section.title}
                  </h4>
                  <div className="flex items-center gap-3 text-gray-500" style={{ fontSize: TYPE.caption }}>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {section.duration} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      {section.keyPoints.length} key points
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div
                className="prose prose-sm max-w-none text-gray-700 mb-8"
                style={{ fontSize: TYPE.body, lineHeight: 1.7 }}
              >
                {section.content.split('\n\n').map((paragraph, i) => {
                  // Check if it's a header (all caps or ends with :)
                  if (paragraph === paragraph.toUpperCase() || paragraph.endsWith(':')) {
                    return (
                      <h5 key={i} className="font-bold text-gray-900 mt-6 mb-3 flex items-center gap-2">
                        <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full" />
                        {paragraph}
                      </h5>
                    );
                  }
                  // Check if it's a bullet list
                  if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
                    const items = paragraph.split('\n').filter(Boolean);
                    return (
                      <ul key={i} className="space-y-2 my-4">
                        {items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-gray-700">
                            <ChevronRight className="w-4 h-4 mt-0.5 text-violet-500 flex-shrink-0" />
                            <span>{item.replace(/^[•\-]\s*/, '')}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={i} className="mb-4 leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>

              {/* Key Points Card */}
              {section.keyPoints.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 relative overflow-hidden"
                >
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-200/30 to-transparent rounded-bl-full" />

                  <div className="flex items-center gap-2 mb-4 relative">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    <h5 className="font-bold text-violet-800" style={{ fontSize: TYPE.body }}>
                      Key Takeaways
                    </h5>
                  </div>

                  <ul className="space-y-3 relative">
                    {section.keyPoints.map((point, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCheck className="w-3.5 h-3.5 text-amber-600" />
                        </div>
                        <span className="text-amber-900" style={{ fontSize: TYPE.meta }}>
                          {point}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Section Complete Indicator */}
              {readingProgress > 80 && !completedSections.has(currentSection) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-200 flex items-center gap-3"
                >
                  <ThumbsUp className="w-5 h-5 text-violet-600" />
                  <span className="text-violet-700 font-medium" style={{ fontSize: TYPE.meta }}>
                    Great progress! Click "Next Section" when ready to continue.
                  </span>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </ScrollArea>

        {/* Notes Panel */}
        <AnimatePresence>
          {showNotes && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-gray-100 pl-4 flex flex-col"
            >
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2" style={{ fontSize: TYPE.meta }}>
                <Bookmark className="w-4 h-4" />
                My Notes
              </h4>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Take notes as you learn..."
                className="flex-1 resize-none text-sm"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPrevSection}
            disabled={currentSection === 0}
            style={{ borderRadius: RADIUS.button }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {/* Completion indicators */}
            <div className="flex gap-1">
              {module.sections.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === currentSection
                      ? "bg-violet-500"
                      : completedSections.has(i)
                      ? "bg-amber-400"
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
          </div>

          {currentSection === module.sections.length - 1 ? (
            <Button
              onClick={() => {
                markSectionComplete();
                onComplete();
              }}
              className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white hover:opacity-90"
              style={{ borderRadius: RADIUS.button }}
            >
              Complete Module
              <Award className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={goToNextSection}
              className="bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
              style={{ borderRadius: RADIUS.button }}
            >
              Next Section
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCED ROLEPLAY VIEWER COMPONENT
// ============================================================================

interface RoleplayViewerProps {
  config: RoleplayConfig;
  onComplete: () => void;
}

interface RoleplayMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  feedback?: {
    type: "positive" | "neutral" | "improvement";
    text: string;
  };
}

function RoleplayViewer({ config, onComplete }: RoleplayViewerProps) {
  const [isStarted, setIsStarted] = useState(false);
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [objectivesCompleted, setObjectivesCompleted] = useState<Set<number>>(new Set());
  const [showFeedback, setShowFeedback] = useState(true);
  const [conversationScore, setConversationScore] = useState(0);
  const [suggestedResponses, setSuggestedResponses] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate suggested responses based on conversation context
  const generateSuggestions = useCallback((lastClientMessage: string): string[] => {
    const { clientPersona } = config;

    // Context-aware suggestions
    if (lastClientMessage.toLowerCase().includes("expensive") || lastClientMessage.toLowerCase().includes("cost")) {
      return [
        "I understand budget is important. Can you help me understand what you're currently spending on protection?",
        "Let's look at what coverage level fits your budget while still meeting your family's needs.",
        "Many families find that the peace of mind is worth prioritizing. What would make this feel like a good investment?",
      ];
    }

    if (lastClientMessage.toLowerCase().includes("think about it") || lastClientMessage.toLowerCase().includes("not sure")) {
      return [
        "Of course. What specific aspects would you like to think through?",
        "That's completely reasonable. Is there anything I can clarify to help with your decision?",
        "I appreciate your thoughtfulness. What questions do you still have?",
      ];
    }

    if (lastClientMessage.toLowerCase().includes("work") || lastClientMessage.toLowerCase().includes("employer")) {
      return [
        "That's a great start. Do you know if that coverage is portable if you change jobs?",
        "Employer coverage is valuable. How much is the death benefit, and do you feel it's enough for your family?",
        "Many people don't realize employer coverage typically ends when employment ends. Have you considered that?",
      ];
    }

    // Default suggestions based on personality
    const personalitySuggestions: Record<string, string[]> = {
      skeptical: [
        "I hear your concern. Let me share some facts that might address that.",
        "That's a fair point. Here's what makes Heritage different...",
        "I appreciate your directness. Can I share some client experiences?",
      ],
      busy: [
        "I'll keep this brief. Here are the key points you need to know.",
        "Let me give you the bottom line quickly.",
        "I respect your time. The most important thing to understand is...",
      ],
      analytical: [
        "Let me walk you through the numbers.",
        "Here's the data behind our recommendation.",
        "I can show you exactly how this calculation works.",
      ],
      agreeable: [
        "That's a great point. Building on that...",
        "I'm glad that resonates. Let me add...",
        "Exactly right. And here's how we can help further.",
      ],
      emotional: [
        "I can see how much you care about your family's security.",
        "It's clear protecting your loved ones is your priority.",
        "Your concern for your family really shows. Let's make sure they're protected.",
      ],
    };

    return personalitySuggestions[clientPersona.personality] || [
      "Tell me more about your situation.",
      "What's most important to you when it comes to protection?",
      "How can I help address your concerns?",
    ];
  }, [config]);

  // Enhanced AI response logic
  const getAIResponse = useCallback((userMessage: string): { content: string; feedback?: RoleplayMessage["feedback"] } => {
    const { clientPersona } = config;
    const lowerMessage = userMessage.toLowerCase();

    // Analyze message quality and provide feedback
    let feedback: RoleplayMessage["feedback"] | undefined;

    // Check for good practices
    if (lowerMessage.includes("tell me") || lowerMessage.includes("help me understand") || lowerMessage.includes("can you share")) {
      feedback = {
        type: "positive",
        text: "Great open-ended question! This encourages the client to share more.",
      };
      setConversationScore(prev => prev + 10);
    } else if (lowerMessage.includes("i understand") || lowerMessage.includes("i hear you") || lowerMessage.includes("that makes sense")) {
      feedback = {
        type: "positive",
        text: "Excellent acknowledgment. You're showing active listening.",
      };
      setConversationScore(prev => prev + 8);
    } else if (lowerMessage.length < 20) {
      feedback = {
        type: "improvement",
        text: "Try to be more thorough in your responses to build rapport.",
      };
    }

    // Check for objective completion
    config.objectives.forEach((obj, i) => {
      if (!objectivesCompleted.has(i)) {
        const objLower = obj.toLowerCase();
        if (
          (objLower.includes("rapport") && (lowerMessage.includes("how are you") || lowerMessage.includes("nice to meet"))) ||
          (objLower.includes("discovery") && (lowerMessage.includes("tell me") || lowerMessage.includes("what"))) ||
          (objLower.includes("explain") && (lowerMessage.includes("let me explain") || lowerMessage.includes("here's how")))
        ) {
          setObjectivesCompleted(prev => new Set(Array.from(prev).concat([i])));
        }
      }
    });

    // Generate contextual response based on message content
    let responseContent: string;

    // Detailed response logic based on keywords and persona
    if (lowerMessage.includes("tell me about") || lowerMessage.includes("your situation") || lowerMessage.includes("what brings you")) {
      responseContent = `Well, ${clientPersona.situation}. ${clientPersona.concerns[0]}`;
    } else if (lowerMessage.includes("family") || lowerMessage.includes("children") || lowerMessage.includes("spouse")) {
      responseContent = "Family is very important to me. That's exactly why I'm looking into this - I want to make sure they're taken care of no matter what happens.";
    } else if (lowerMessage.includes("coverage") || lowerMessage.includes("insurance") || lowerMessage.includes("protection")) {
      responseContent = clientPersona.objections[Math.floor(Math.random() * clientPersona.objections.length)];
    } else if (lowerMessage.includes("budget") || lowerMessage.includes("afford") || lowerMessage.includes("cost") || lowerMessage.includes("expensive")) {
      responseContent = "That's definitely a concern. I want to make sure I'm getting good value. What would I be looking at monthly?";
    } else if (lowerMessage.includes("understand") || lowerMessage.includes("help") || lowerMessage.includes("explain")) {
      responseContent = `I appreciate that. ${clientPersona.concerns[Math.floor(Math.random() * clientPersona.concerns.length)]}`;
    } else if (lowerMessage.includes("work") || lowerMessage.includes("employer") || lowerMessage.includes("job")) {
      responseContent = "I do have some coverage through work, but honestly I'm not sure of the details. I think it's maybe one times my salary?";
    } else {
      // Personality-based default responses
      const personalityResponses: Record<string, string[]> = {
        skeptical: [
          "I've heard that before from other salespeople...",
          "How is Heritage any different from the others?",
          "I'm still not fully convinced. What proof do you have?",
          "That sounds good in theory, but what's the catch?",
        ],
        busy: [
          "Can we speed this up a bit? I have a meeting in 20 minutes.",
          "Just give me the bottom line - what do I need and what will it cost?",
          "Look, I appreciate the thoroughness, but I need the short version.",
          "Time is money. What's the most important thing I need to know?",
        ],
        analytical: [
          "Can you show me the actual numbers behind that?",
          "What's the mathematical basis for that recommendation?",
          "I'd like to see the data that supports this approach.",
          "Let me run some calculations. What are the exact figures?",
        ],
        agreeable: [
          "That makes a lot of sense when you put it that way.",
          "I can see why that would be important.",
          "You make a good point. Tell me more about that.",
          "I hadn't thought of it like that before. Interesting.",
        ],
        emotional: [
          "I just keep thinking about what would happen to my family...",
          "This is really bringing up a lot of feelings for me.",
          "My parents didn't have proper coverage and it was devastating.",
          "I want to do right by my kids, you know?",
        ],
      };

      const responses = personalityResponses[clientPersona.personality] || personalityResponses.agreeable;
      responseContent = responses[Math.floor(Math.random() * responses.length)];
    }

    // Generate new suggestions for next turn
    setTimeout(() => {
      setSuggestedResponses(generateSuggestions(responseContent));
    }, 500);

    return { content: responseContent, feedback };
  }, [config, objectivesCompleted, generateSuggestions]);

  const sendMessage = useCallback((messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: RoleplayMessage = {
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setSuggestedResponses([]);

    // Simulate AI typing delay
    const delay = 800 + Math.random() * 1200;
    setTimeout(() => {
      const { content, feedback } = getAIResponse(text);
      const assistantMessage: RoleplayMessage = {
        role: "assistant",
        content,
        timestamp: new Date(),
        feedback: showFeedback ? feedback : undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, delay);
  }, [input, getAIResponse, showFeedback]);

  // Start screen
  if (!isStarted) {
    return (
      <div className="flex flex-col h-full">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white p-8 -mx-6 -mt-6 mb-6 overflow-hidden">
          <FloatingParticles count={10} colors={["white", "white", "amber"]} />

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            >
              <Mic className="w-10 h-10 text-white" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold mb-2"
            >
              {config.title}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 max-w-md mx-auto"
            >
              {config.description}
            </motion.p>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-2 space-y-6">
          {/* Client Persona Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-violet-100 overflow-hidden">
              <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-4 border-b border-violet-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{config.clientPersona.name}</h4>
                    <p className="text-gray-500 text-sm">{config.clientPersona.occupation}, {config.clientPersona.age} years old</p>
                  </div>
                  <Badge className={cn(
                    "ml-auto",
                    config.clientPersona.personality === "skeptical" ? "bg-orange-100 text-orange-700" :
                    config.clientPersona.personality === "busy" ? "bg-red-100 text-red-700" :
                    config.clientPersona.personality === "analytical" ? "bg-blue-100 text-blue-700" :
                    config.clientPersona.personality === "emotional" ? "bg-pink-100 text-pink-700" :
                    "bg-green-100 text-green-700"
                  )}>
                    {config.clientPersona.personality}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4 space-y-3">
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Situation</span>
                  <p className="text-gray-700 text-sm">{config.clientPersona.situation}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wider">Key Concerns</span>
                  <ul className="mt-1 space-y-1">
                    {config.clientPersona.concerns.map((concern, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700 text-sm">
                        <AlertCircle className="w-3 h-3 text-amber-500" />
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Your Objectives */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-violet-500" />
              Your Objectives
            </h4>
            <div className="space-y-2">
              {config.objectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-violet-50/50 rounded-xl border border-violet-100"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
                    <span className="text-violet-600 text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-gray-700 text-sm flex-1">{obj}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="p-4 bg-amber-50 rounded-xl border border-amber-200"
          >
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="font-semibold text-amber-800 mb-1">Pro Tips</h5>
                <ul className="text-amber-700 text-sm space-y-1">
                  <li>• Use open-ended questions to discover needs</li>
                  <li>• Acknowledge concerns before addressing them</li>
                  <li>• Adapt your pace to match the client's personality</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Start Button */}
        <div className="flex-shrink-0 pt-4 border-t border-gray-100">
          <Button
            onClick={() => {
              setIsStarted(true);
              setSuggestedResponses([
                `Hi ${config.clientPersona.name}, thanks for taking the time to meet with me today.`,
                "Hello! I appreciate you reaching out. I'd love to learn more about your situation.",
                "Great to meet you. Before we dive in, can you tell me a bit about yourself?",
              ]);
            }}
            className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white hover:opacity-90"
            style={{ borderRadius: RADIUS.button, height: 48 }}
          >
            <Play className="w-5 h-5 mr-2" />
            Start Conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {config.clientPersona.name.charAt(0)}
                </span>
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{config.clientPersona.name}</h4>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>{config.clientPersona.occupation}</span>
                <span className="text-gray-300">|</span>
                <Badge variant="outline" className="text-xs py-0">
                  {config.clientPersona.personality}
                </Badge>
              </div>
            </div>
          </div>

          {/* Score & Objectives */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="flex items-center gap-1 text-amber-600 font-semibold">
                <Zap className="w-4 h-4" />
                {conversationScore}
              </div>
              <span className="text-gray-400 text-xs">Score</span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-right">
              <div className="text-violet-600 font-semibold">
                {objectivesCompleted.size}/{config.objectives.length}
              </div>
              <span className="text-gray-400 text-xs">Objectives</span>
            </div>
          </div>
        </div>

        {/* Objectives Progress */}
        <div className="flex gap-1 mt-3">
          {config.objectives.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                objectivesCompleted.has(i) ? "bg-amber-400" : "bg-gray-200"
              )}
            />
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 py-4">
        <div className="space-y-4">
          {/* Initial greeting from client */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
              <span className="text-violet-600 font-semibold text-sm">
                {config.clientPersona.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                <p className="text-gray-700" style={{ fontSize: TYPE.body }}>
                  Hi, thanks for meeting with me. {config.clientPersona.concerns[0]}
                </p>
              </div>
              <span className="text-gray-400 text-xs mt-1 ml-2">Just now</span>
            </div>
          </motion.div>

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-500 to-amber-500"
                    : "bg-violet-100"
                )}
              >
                <span
                  className={cn(
                    "font-semibold text-sm",
                    msg.role === "user" ? "text-white" : "text-violet-600"
                  )}
                >
                  {msg.role === "user" ? "Y" : config.clientPersona.name.charAt(0)}
                </span>
              </div>
              <div className={cn("flex-1", msg.role === "user" && "flex flex-col items-end")}>
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 max-w-[85%]",
                    msg.role === "user"
                      ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-tr-md"
                      : "bg-gray-100 rounded-tl-md"
                  )}
                >
                  <p style={{ fontSize: TYPE.body }}>
                    {msg.content}
                  </p>
                </div>

                {/* Feedback */}
                {msg.feedback && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "mt-2 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 max-w-[85%]",
                      msg.feedback.type === "positive"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : msg.feedback.type === "improvement"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200"
                    )}
                  >
                    {msg.feedback.type === "positive" ? (
                      <ThumbsUp className="w-3 h-3" />
                    ) : (
                      <Lightbulb className="w-3 h-3" />
                    )}
                    {msg.feedback.text}
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0">
                <span className="text-violet-600 font-semibold text-sm">
                  {config.clientPersona.name.charAt(0)}
                </span>
              </div>
              <div className="bg-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex gap-1.5">
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                  />
                  <motion.span
                    className="w-2 h-2 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Suggested Responses */}
      <AnimatePresence>
        {suggestedResponses.length > 0 && !isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 py-3 border-t border-gray-100"
          >
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Suggested responses:
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedResponses.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(suggestion)}
                  className="px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-lg text-sm transition-colors border border-violet-200 max-w-full text-left"
                >
                  {suggestion.length > 60 ? suggestion.slice(0, 60) + "..." : suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex-shrink-0 pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your response..."
              className="resize-none pr-12"
              style={{ fontSize: TYPE.body, minHeight: 50 }}
              rows={1}
            />
            <Button
              size="sm"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700"
              style={{ borderRadius: RADIUS.button }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showFeedback}
              onChange={(e) => setShowFeedback(e.target.checked)}
              className="rounded text-violet-600"
            />
            Show coaching feedback
          </label>

          <Button
            variant="outline"
            onClick={onComplete}
            className="text-amber-600 border-amber-200 hover:bg-amber-50"
            style={{ borderRadius: RADIUS.button }}
          >
            End & Complete
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCED CELEBRATION COMPONENT
// ============================================================================

interface CelebrationViewerProps {
  onComplete: () => void;
}

function CelebrationViewer({ onComplete }: CelebrationViewerProps) {
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center relative overflow-hidden">
      {/* Background particles */}
      <FloatingParticles count={20} colors={["violet", "purple", "amber", "white"]} />

      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-violet-100/50 via-transparent to-transparent" />

      {/* Trophy with animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 150, damping: 15, delay: 0.2 }}
        className="relative z-10 mb-8"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500 rounded-full blur-2xl opacity-40 scale-150" />

        <div
          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500 flex items-center justify-center"
          style={{ boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)' }}
        >
          <Trophy className="w-16 h-16 text-amber-300" />
        </div>

        {/* Sparkles around trophy */}
        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${angle}deg) translateY(-80px)`,
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
          </motion.div>
        ))}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="relative z-10 text-3xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 bg-clip-text text-transparent mb-3"
      >
        Week 1 Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 text-gray-600 mb-8 max-w-md"
        style={{ fontSize: TYPE.body }}
      >
        Congratulations! You've completed all 35 tasks across 5 days. You've mastered products, sales, compliance, and communication.
      </motion.p>

      {/* Stats */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex gap-6 mb-8"
          >
            {[
              { label: "XP Earned", value: "6,850", icon: Zap, color: "text-amber-500" },
              { label: "Tasks Done", value: "35", icon: CheckCircle2, color: "text-violet-500" },
              { label: "Days", value: "5", icon: Award, color: "text-purple-500" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100"
              >
                <stat.icon className={cn("w-6 h-6 mx-auto mb-2", stat.color)} />
                <div className="font-bold text-2xl text-gray-900">{stat.value}</div>
                <div className="text-gray-500 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 mb-8 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl border border-violet-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-violet-800">Week 1 Graduate</div>
            <div className="text-violet-600 text-sm">Achievement Unlocked</div>
          </div>
        </div>
      </motion.div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="relative z-10"
      >
        <Button
          onClick={onComplete}
          className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white hover:opacity-90 shadow-lg shadow-violet-500/25"
          style={{ borderRadius: RADIUS.button, padding: "14px 36px", height: "auto" }}
        >
          <span className="text-lg font-semibold">Continue to Days 8-30</span>
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

export function TaskContentModal({
  isOpen,
  onClose,
  onComplete,
  task,
  content,
}: TaskContentModalProps) {
  const [assessmentAttempt, setAssessmentAttempt] = useState(1);

  const handleComplete = useCallback(() => {
    if (task) {
      onComplete(task.id);
    }
    onClose();
  }, [task, onComplete, onClose]);

  const handleAssessmentComplete = useCallback((result: AssessmentResult) => {
    if (result.passed && task) {
      onComplete(task.id);
    }
    onClose();
  }, [task, onComplete, onClose]);

  const handleSimulationComplete = useCallback((result: SimulationResult) => {
    if (result.passed && task) {
      onComplete(task.id);
    }
    onClose();
  }, [task, onComplete, onClose]);

  if (!task) return null;

  // Show fallback UI when content is not available
  if (!content) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className="p-0 gap-0 overflow-hidden border-0 [&>button]:hidden max-w-lg"
          style={{
            borderRadius: RADIUS.hero,
            boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
          }}
        >
          <div className="p-8 text-center">
            {/* Hero Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500 flex items-center justify-center"
              style={{ boxShadow: '0 8px 32px rgba(139, 92, 246, 0.3)' }}
            >
              <AlertCircle className="w-10 h-10 text-white" />
            </motion.div>

            {/* Title */}
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-gray-900 mb-2"
            >
              {task.title}
            </motion.h3>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 mb-6"
            >
              {task.description}
            </motion.p>

            {/* Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-violet-50 border border-violet-100 rounded-xl p-4 mb-6"
            >
              <p className="text-violet-700 text-sm">
                This task requires action in the app. Please complete the steps described above and return here to mark it complete.
              </p>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3 justify-center"
            >
              <Button
                variant="outline"
                onClick={onClose}
                style={{ borderRadius: RADIUS.button }}
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  onComplete(task.id);
                  onClose();
                }}
                className="bg-gradient-to-r from-violet-600 via-purple-600 to-amber-500 text-white hover:opacity-90"
                style={{ borderRadius: RADIUS.button }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Determine modal size based on content type
  const getModalSize = () => {
    switch (content.type) {
      case "video":
        return "max-w-5xl";
      case "simulation":
      case "call":
        return "max-w-6xl";
      case "quiz":
        return "max-w-3xl";
      case "roleplay":
        return "max-w-3xl";
      case "celebration":
        return "max-w-2xl";
      case "form":
      case "action":
      case "read":
      case "module":
      case "practice":
      case "review":
      case "planning":
      default:
        return "max-w-4xl";
    }
  };

  // Get type icon
  const getTypeIcon = () => {
    switch (content.type) {
      case "video":
        return <Play className="w-5 h-5" />;
      case "module":
      case "read":
        return <BookOpen className="w-5 h-5" />;
      case "quiz":
        return <GraduationCap className="w-5 h-5" />;
      case "simulation":
      case "call":
        return <Target className="w-5 h-5" />;
      case "roleplay":
        return <Mic className="w-5 h-5" />;
      case "celebration":
        return <Trophy className="w-5 h-5" />;
      case "form":
        return <FileText className="w-5 h-5" />;
      case "action":
        return <CheckCircle2 className="w-5 h-5" />;
      case "practice":
        return <Target className="w-5 h-5" />;
      case "review":
        return <ListChecks className="w-5 h-5" />;
      case "planning":
        return <Lightbulb className="w-5 h-5" />;
      default:
        return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden border-0 [&>button]:hidden",
          getModalSize(),
          content.type === "celebration" && "bg-gradient-to-br from-violet-50 via-purple-50 to-amber-50"
        )}
        style={{
          borderRadius: RADIUS.hero,
          maxHeight: "90vh",
          boxShadow: '0 25px 80px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header - Enhanced with Rich Styling */}
        {/* Hide header for types that have their own headers (quiz, celebration, module-based, video) */}
        {content.type !== "celebration" && content.type !== "quiz" && content.type !== "module" &&
         content.type !== "video" && content.type !== "form" && content.type !== "action" &&
         content.type !== "read" && content.type !== "practice" && content.type !== "call" &&
         content.type !== "review" && content.type !== "planning" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-6 py-4 border-b border-gray-100/80 bg-white relative overflow-hidden"
          >
            {/* Animated gradient background */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-violet-100/40 via-purple-50/20 to-amber-100/40"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ backgroundSize: "200% 200%" }}
            />

            {/* Subtle mesh pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(${COLORS.primary.violet[600]} 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            />

            {/* Decorative corner accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-bl from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-4 relative z-10">
              {/* Animated icon container with ring */}
              <div className="relative">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-amber-500 flex items-center justify-center text-white relative"
                  style={{ boxShadow: '0 4px 16px rgba(139, 92, 246, 0.3)' }}
                >
                  {getTypeIcon()}

                  {/* Animated ring */}
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-violet-400/50"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>

                {/* Task type badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
                >
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500" />
                </motion.div>
              </div>

              <div>
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-bold text-gray-900"
                  style={{ fontSize: TYPE.body }}
                >
                  {task.title}
                </motion.h3>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3 text-gray-500"
                  style={{ fontSize: TYPE.meta }}
                >
                  <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-600">{task.duration}</span>
                  </span>
                  <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-amber-600 font-semibold">+{task.xp} XP</span>
                  </span>
                  {task.required && (
                    <Badge className="bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200/50 text-xs font-medium">
                      Required
                    </Badge>
                  )}
                </motion.div>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.05, backgroundColor: "rgba(243,244,246,1)" }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10 p-2.5 rounded-xl bg-gray-50 transition-colors group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </motion.button>
          </motion.div>
        )}

        {/* Content */}
        <div
          className={cn(
            "overflow-auto",
            (content.type === "celebration" || content.type === "quiz" || content.type === "module" ||
             content.type === "video" || content.type === "form" || content.type === "action" ||
             content.type === "read" || content.type === "practice" || content.type === "call" ||
             content.type === "review" || content.type === "planning") ? "h-[85vh]" : "h-[calc(90vh-80px)]"
          )}
          style={{ padding: (content.type === "video" || content.type === "quiz" || content.type === "module" ||
                            content.type === "form" || content.type === "action" || content.type === "read" ||
                            content.type === "practice" || content.type === "call" || content.type === "review" ||
                            content.type === "planning") ? 0 : GRID.spacing.md }}
        >
          {/* Video Player - Enhanced with Hero Header */}
          {content.type === "video" && (
            <div className="flex flex-col h-full">
              {/* Hero Header - Matching Module Viewer Style */}
              <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-amber-500 text-white p-6 overflow-hidden flex-shrink-0">
                {/* Close button */}
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="absolute top-4 right-4 z-20 p-2.5 rounded-xl bg-white/20 transition-colors group"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>

                {/* Floating particles */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full"
                    style={{
                      width: 4 + (i % 3) * 2,
                      height: 4 + (i % 3) * 2,
                      background: i % 2 === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(251,191,36,0.4)',
                      top: `${10 + (i * 12) % 80}%`,
                      left: `${8 + (i * 14) % 84}%`,
                    }}
                    animate={{
                      y: [0, -10, 0],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2 + (i * 0.3),
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}

                <div className="relative z-10">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4"
                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
                  >
                    <Play className="w-7 h-7 text-white" />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold mb-2 text-white pr-12"
                  >
                    {(content.content as TrainingVideo).title}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-white/90 text-sm mb-3 pr-12"
                  >
                    {(content.content as TrainingVideo).description}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-2"
                  >
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {Math.floor((content.content as TrainingVideo).duration / 60)} min
                    </Badge>
                    <Badge className="bg-white/20 text-white border-0 text-xs">
                      <Play className="w-3 h-3 mr-1" />
                      Video Training
                    </Badge>
                    {task?.required && (
                      <Badge className="bg-amber-400/30 text-white border-0 text-xs">
                        Required
                      </Badge>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Video Player Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="flex-1 relative bg-gray-900"
              >
                <VideoPlayer
                  video={content.content as TrainingVideo}
                  onComplete={handleComplete}
                />
              </motion.div>
            </div>
          )}

          {/* Module Viewer - handles module, form, action, read, practice, call, review, planning types */}
          {(content.type === "module" || content.type === "form" || content.type === "action" ||
            content.type === "read" || content.type === "practice" || content.type === "call" ||
            content.type === "review" || content.type === "planning") && (
            <ModuleViewer
              module={content.content as ModuleContent}
              onComplete={handleComplete}
              onClose={onClose}
            />
          )}

          {/* Quiz/Assessment - Inline Mode */}
          {content.type === "quiz" && (
            <div className="h-full">
              <TrainingAssessment
                open={true}
                onOpenChange={(open) => !open && onClose()}
                assessment={content.content as Assessment}
                onComplete={handleAssessmentComplete}
                attemptNumber={assessmentAttempt}
                inline={true}
              />
            </div>
          )}

          {/* Simulation - Enhanced */}
          {content.type === "simulation" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="relative h-full"
            >
              {/* Immersive background gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-transparent to-amber-50/50 rounded-3xl pointer-events-none" />

              {/* Scenario intro banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-violet-700 text-white relative overflow-hidden"
              >
                {/* Shimmer overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
                <div className="relative flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold">Live Simulation Mode</div>
                    <div className="text-white/80 text-sm">Make decisions that impact the outcome</div>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <PulseDot color="amber" delay={0} />
                    <PulseDot color="amber" delay={0.2} />
                    <PulseDot color="amber" delay={0.4} />
                  </div>
                </div>
              </motion.div>

              {/* Simulator */}
              <div className="relative z-10">
                <CallSimulator
                  scenario={content.content as SimulationScenario}
                  onComplete={handleSimulationComplete}
                  onExit={onClose}
                />
              </div>
            </motion.div>
          )}

          {/* Roleplay */}
          {content.type === "roleplay" && (
            <RoleplayViewer
              config={content.content as RoleplayConfig}
              onComplete={handleComplete}
            />
          )}

          {/* Celebration */}
          {content.type === "celebration" && (
            <CelebrationViewer onComplete={handleComplete} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TaskContentModal;
