import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { User, ArrowLeftRight, Plus } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { Avatar } from "@/lib/avatarCouncilStore";
import { avatarSignatures, type AvatarSignature } from "./AvatarCard";

// =============================================================================
// Types
// =============================================================================

interface AvatarArrivalProps {
  question: string;
  avatar: Avatar | null;
  rationale: string;
  onConfirm: () => void;
  onSwitch: () => void;
  onAddAdvisor: () => void;
  isVisible: boolean;
}

type ArrivalPhase =
  | "idle"
  | "capture"           // 0-150ms: Query acknowledgment
  | "intelligence"      // 150-800ms: Parse animation
  | "determination"     // 800-1200ms: Signature + title reveal
  | "arrival"           // 1200-2400ms: Portrait resolves
  | "credibility"       // 2400-3200ms: Rationale appears
  | "ready";            // 3200ms+: Awaiting action

// =============================================================================
// Timing Constants (from spec)
// =============================================================================

const TIMING = {
  capture: 150,
  intelligenceStart: 150,
  intelligenceEnd: 800,
  determinationStart: 800,
  determinationEnd: 1200,
  arrivalStart: 1200,
  arrivalEnd: 2400,
  credibilityStart: 2400,
  credibilityEnd: 3200,

  // Sub-timings
  wordPulseDuration: 200,
  signatureLineReveal: 200,
  titleTypeSpeed: 40,      // ms per character
  portraitResolveDuration: 600,
  nameRevealDelay: 200,
  nameRevealDuration: 300,
  rationaleTypeSpeed: 30,  // ms per character
  cornerMarkerGrow: 300,
} as const;

// =============================================================================
// Helper: Extract key phrases from question
// =============================================================================

function extractKeyPhrases(question: string): { word: string; isKey: boolean }[] {
  // Common objection/sales keywords that should highlight
  const keyPatterns = [
    /think about it/gi,
    /not interested/gi,
    /call back/gi,
    /too expensive/gi,
    /can't afford/gi,
    /need to talk/gi,
    /spouse|wife|husband/gi,
    /handle|overcome|respond/gi,
    /objection/gi,
    /close|closing/gi,
    /client|prospect/gi,
    /policy|coverage|premium/gi,
    /confidence|motivation|fear/gi,
    /compliance|legal|regulation/gi,
  ];

  const words = question.split(/\s+/);
  const result: { word: string; isKey: boolean }[] = [];

  let i = 0;
  while (i < words.length) {
    // Check for multi-word phrases
    let matched = false;
    for (const pattern of keyPatterns) {
      // Try matching 2-4 word phrases
      for (let len = 4; len >= 1; len--) {
        const phrase = words.slice(i, i + len).join(" ");
        if (pattern.test(phrase)) {
          result.push({ word: phrase, isKey: true });
          i += len;
          matched = true;
          break;
        }
      }
      if (matched) break;
    }

    if (!matched) {
      result.push({ word: words[i], isKey: false });
      i++;
    }
  }

  return result;
}

// =============================================================================
// Sub-Components
// =============================================================================

// Parse Animation - words illuminate in sequence
interface ParseAnimationProps {
  question: string;
  signatureColor: string;
  isActive: boolean;
  reducedMotion: boolean;
}

function ParseAnimation({ question, signatureColor, isActive, reducedMotion }: ParseAnimationProps) {
  const phrases = useMemo(() => extractKeyPhrases(question), [question]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive || reducedMotion) {
      setActiveIndex(-1);
      setProgress(0);
      return;
    }

    // Find key phrase indices
    const keyIndices = phrases
      .map((p, i) => p.isKey ? i : -1)
      .filter(i => i !== -1)
      .slice(0, 3); // Max 3 highlights

    // Animate through key phrases
    const timings = [100, 300, 500]; // When each highlight occurs
    const timers: NodeJS.Timeout[] = [];

    keyIndices.forEach((phraseIdx, i) => {
      timers.push(setTimeout(() => {
        setActiveIndex(phraseIdx);
        setTimeout(() => setActiveIndex(-1), TIMING.wordPulseDuration);
      }, timings[i] || timings[0] + i * 200));
    });

    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 2, 100));
    }, 14); // ~700ms to complete

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(progressInterval);
    };
  }, [isActive, phrases, reducedMotion]);

  return (
    <div className="relative max-w-lg mx-auto text-center">
      {/* Question text with highlights */}
      <p className="font-mono text-lg leading-relaxed text-gray-400">
        "
        {phrases.map((phrase, i) => (
          <motion.span
            key={i}
            className="inline"
            animate={{
              opacity: activeIndex === i ? 1 : 0.6,
              textShadow: activeIndex === i
                ? `0 0 20px ${phrase.isKey ? signatureColor : 'white'}`
                : 'none',
            }}
            transition={{ duration: 0.15 }}
            style={{
              color: activeIndex === i
                ? (phrase.isKey ? signatureColor : 'white')
                : undefined,
            }}
          >
            {phrase.word}
            {i < phrases.length - 1 ? " " : ""}
          </motion.span>
        ))}
        "
      </p>

      {/* Progress line */}
      <div className="mt-6 h-[2px] bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: progress >= 100
              ? `linear-gradient(90deg, ${signatureColor}80, ${signatureColor})`
              : 'rgba(255,255,255,0.3)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </div>
  );
}

// Typing Text - types out character by character
interface TypingTextProps {
  text: string;
  speed: number;
  isActive: boolean;
  className?: string;
  onComplete?: () => void;
}

function TypingText({ text, speed, isActive, className, onComplete }: TypingTextProps) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!isActive) {
      setDisplayText("");
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isActive, text, speed, onComplete]);

  return (
    <span className={className}>
      {displayText}
      {isActive && displayText.length < text.length && (
        <motion.span
          className="inline-block w-[2px] h-[1em] bg-current ml-[2px] align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </span>
  );
}

// Portrait with resolve effect
interface PortraitResolveProps {
  avatar: Avatar;
  signature: AvatarSignature;
  isActive: boolean;
  reducedMotion: boolean;
}

function PortraitResolve({ avatar, signature, isActive, reducedMotion }: PortraitResolveProps) {
  return (
    <div className="relative w-48 h-64 mx-auto">
      {/* Corner markers */}
      {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
        <div key={i} className={cn("absolute z-10", pos)}>
          <motion.div
            className="absolute"
            style={{
              backgroundColor: signature.primary,
              [pos.includes('top') ? 'top' : 'bottom']: 0,
              [pos.includes('left') ? 'left' : 'right']: 0,
            }}
            initial={{ width: 0, height: 2 }}
            animate={isActive ? { width: 20, height: 2 } : { width: 0, height: 2 }}
            transition={{ duration: TIMING.cornerMarkerGrow / 1000, delay: 0.3, ease: "easeOut" }}
          />
          <motion.div
            className="absolute"
            style={{
              backgroundColor: signature.primary,
              [pos.includes('top') ? 'top' : 'bottom']: 0,
              [pos.includes('left') ? 'left' : 'right']: 0,
            }}
            initial={{ width: 2, height: 0 }}
            animate={isActive ? { width: 2, height: 20 } : { width: 2, height: 0 }}
            transition={{ duration: TIMING.cornerMarkerGrow / 1000, delay: 0.3, ease: "easeOut" }}
          />
        </div>
      ))}

      {/* Portrait image with resolve effect */}
      <motion.div
        className="w-full h-full rounded-xl overflow-hidden bg-[#12121a]"
        initial={{ filter: "blur(20px) saturate(0)", scale: 1.05 }}
        animate={isActive
          ? { filter: "blur(0px) saturate(0.9)", scale: 1 }
          : { filter: "blur(20px) saturate(0)", scale: 1.05 }
        }
        transition={{
          duration: reducedMotion ? 0 : TIMING.portraitResolveDuration / 1000,
          ease: [0.25, 0.46, 0.45, 0.94], // ease-out-quart
        }}
      >
        {avatar.avatarImageUrl ? (
          <img
            src={avatar.avatarImageUrl}
            alt={avatar.name}
            className="w-full h-full object-cover object-[center_20%]"
          />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center", signature.bg)}>
            <User className={cn("w-20 h-20 opacity-40", signature.text)} />
          </div>
        )}
      </motion.div>

      {/* Subtle glow behind */}
      <motion.div
        className="absolute -inset-4 rounded-2xl -z-10"
        style={{
          background: `radial-gradient(ellipse at center, ${signature.primary}15 0%, transparent 70%)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: isActive ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function AvatarArrival({
  question,
  avatar,
  rationale,
  onConfirm,
  onSwitch,
  onAddAdvisor,
  isVisible,
}: AvatarArrivalProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [phase, setPhase] = useState<ArrivalPhase>("idle");
  const [titleComplete, setTitleComplete] = useState(false);
  const [rationaleComplete, setRationaleComplete] = useState(false);

  // Get avatar signature
  const signature = useMemo(() => {
    if (!avatar) return null;
    return avatarSignatures[avatar.slug] || avatarSignatures["insurance-expert"];
  }, [avatar]);

  const legacyTitle = avatar?.legacyTitle || signature?.legacyTitle || "ADVISOR";

  // Phase progression
  useEffect(() => {
    if (!isVisible || !avatar) {
      setPhase("idle");
      setTitleComplete(false);
      setRationaleComplete(false);
      return;
    }

    if (reducedMotion) {
      // Skip to ready immediately for reduced motion
      setPhase("ready");
      setTitleComplete(true);
      setRationaleComplete(true);
      return;
    }

    // Progress through phases
    const timers: NodeJS.Timeout[] = [];

    timers.push(setTimeout(() => setPhase("capture"), 0));
    timers.push(setTimeout(() => setPhase("intelligence"), TIMING.capture));
    timers.push(setTimeout(() => setPhase("determination"), TIMING.intelligenceEnd));
    timers.push(setTimeout(() => setPhase("arrival"), TIMING.determinationEnd));
    timers.push(setTimeout(() => setPhase("credibility"), TIMING.arrivalEnd));
    timers.push(setTimeout(() => setPhase("ready"), TIMING.credibilityEnd));

    return () => timers.forEach(clearTimeout);
  }, [isVisible, avatar, reducedMotion]);

  // Keyboard shortcut to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && phase !== "idle" && phase !== "ready") {
        setPhase("ready");
        setTitleComplete(true);
        setRationaleComplete(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase]);

  if (!isVisible || !avatar || !signature) return null;

  const showQuestion = phase !== "idle";
  const showParse = phase === "intelligence";
  const showSignatureLine = ["determination", "arrival", "credibility", "ready"].includes(phase);
  const showTitle = ["determination", "arrival", "credibility", "ready"].includes(phase);
  const showPortrait = ["arrival", "credibility", "ready"].includes(phase);
  const showName = ["credibility", "ready"].includes(phase);
  const showRationale = ["credibility", "ready"].includes(phase);
  const showActions = phase === "ready";

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#08080c]" />

      {/* Content container */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        <div className="flex flex-col items-center">

          {/* Question display */}
          <AnimatePresence mode="wait">
            {showQuestion && (
              <motion.div
                key="question"
                className="mb-8 w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: showParse ? 1 : 0.4,
                  y: 0,
                }}
                transition={{ duration: 0.3 }}
              >
                {showParse ? (
                  <ParseAnimation
                    question={question}
                    signatureColor={signature.primary}
                    isActive={showParse}
                    reducedMotion={reducedMotion}
                  />
                ) : (
                  <p className="font-mono text-lg text-center text-gray-500 max-w-lg mx-auto">
                    "{question}"
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Signature line + Legacy title */}
          <AnimatePresence>
            {showSignatureLine && (
              <motion.div
                key="signature"
                className="flex flex-col items-center mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: TIMING.signatureLineReveal / 1000 }}
              >
                {/* Top line */}
                <motion.div
                  className="h-[1px] mb-3"
                  style={{ backgroundColor: signature.primary }}
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />

                {/* Legacy title */}
                {showTitle && (
                  <div className="h-6 flex items-center">
                    <TypingText
                      text={legacyTitle}
                      speed={TIMING.titleTypeSpeed}
                      isActive={showTitle && !titleComplete}
                      className={cn(
                        "font-mono text-[11px] tracking-[0.3em] uppercase",
                        signature.text
                      )}
                      onComplete={() => setTitleComplete(true)}
                    />
                    {titleComplete && (
                      <span className={cn(
                        "font-mono text-[11px] tracking-[0.3em] uppercase",
                        signature.text
                      )}>
                        {legacyTitle}
                      </span>
                    )}
                  </div>
                )}

                {/* Bottom line */}
                <motion.div
                  className="h-[1px] mt-3"
                  style={{ backgroundColor: signature.primary }}
                  initial={{ width: 0 }}
                  animate={{ width: 120 }}
                  transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Portrait */}
          <AnimatePresence>
            {showPortrait && (
              <motion.div
                key="portrait"
                className="mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <PortraitResolve
                  avatar={avatar}
                  signature={signature}
                  isActive={showPortrait}
                  reducedMotion={reducedMotion}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name + Match badge */}
          <AnimatePresence>
            {showName && (
              <motion.div
                key="name"
                className="flex items-center gap-3 mb-4"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: TIMING.nameRevealDuration / 1000,
                  delay: reducedMotion ? 0 : TIMING.nameRevealDelay / 1000,
                }}
              >
                <h2 className="text-2xl font-bold text-white">
                  {avatar.name}
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30">
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase">
                    Best Match
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rationale */}
          <AnimatePresence>
            {showRationale && (
              <motion.div
                key="rationale"
                className="mb-8 h-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {!rationaleComplete ? (
                  <TypingText
                    text={`"${rationale}"`}
                    speed={TIMING.rationaleTypeSpeed}
                    isActive={showRationale}
                    className="text-sm text-gray-400 italic"
                    onComplete={() => setRationaleComplete(true)}
                  />
                ) : (
                  <span className="text-sm text-gray-400 italic">
                    "{rationale}"
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                key="actions"
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={onConfirm}
                  size="lg"
                  className={cn(
                    "min-w-[280px] h-12 text-base font-medium",
                    "bg-gradient-to-r border-0",
                    signature.gradient,
                    "hover:brightness-110 transition-all",
                    "shadow-lg"
                  )}
                  style={{
                    boxShadow: `0 4px 20px ${signature.primary}40`,
                  }}
                  autoFocus
                >
                  Begin Consultation
                </Button>

                <div className="flex items-center gap-6">
                  <button
                    onClick={onSwitch}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Switch advisor
                  </button>
                  <button
                    onClick={onAddAdvisor}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add second advisor
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Skip hint */}
          {phase !== "idle" && phase !== "ready" && (
            <motion.p
              className="fixed bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Press Enter to skip
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default AvatarArrival;
