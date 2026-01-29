/**
 * CallSimulator - Interactive call simulation exercise
 *
 * Features:
 * - Split-screen: client avatar + conversation history
 * - Decision buttons when agent must respond
 * - Real-time score tracking
 * - Inline feedback after each choice
 * - Audio recording option (future)
 * - Progress indicator showing call phase
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  User,
  MessageCircle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  Award,
  Target,
  TrendingUp,
  Clock,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SimulationScenario,
  SimulationNode,
  SimulationChoice,
  SimulationSession,
  ClientProfile,
  CallOutcome,
  CallRating
} from "@/lib/trainingInfrastructure";

interface CallSimulatorProps {
  scenario: SimulationScenario;
  onComplete: (result: SimulationResult) => void;
  onExit?: () => void;
  className?: string;
}

export interface SimulationResult {
  scenarioId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  scoreBreakdown: Record<string, { earned: number; max: number }>;
  pathTaken: string[];
  feedback: { nodeId: string; text: string; type: 'positive' | 'negative' | 'tip' }[];
  timeSpentMinutes: number;
  outcome?: CallOutcome;
  rating?: CallRating;
}

interface ConversationMessage {
  id: string;
  speaker: 'advisor' | 'client' | 'system';
  speakerName?: string;
  content: string;
  timestamp: Date;
  feedback?: {
    text: string;
    type: 'positive' | 'negative' | 'tip';
  };
}

export function CallSimulator({
  scenario,
  onComplete,
  onExit,
  className
}: CallSimulatorProps) {
  // State
  const [session, setSession] = useState<SimulationSession>({
    scenarioId: scenario.id,
    currentNodeId: scenario.startNodeId,
    pathTaken: [scenario.startNodeId],
    score: {},
    startTime: new Date(),
    feedback: [],
    isRecording: false
  });

  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showScorePanel, setShowScorePanel] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Get current node
  const currentNode = scenario.nodes.find(n => n.id === session.currentNodeId);

  // Calculate progress
  const progress = (session.pathTaken.length / scenario.nodes.length) * 100;

  // Calculate current scores
  const calculateScores = useCallback(() => {
    const breakdown: Record<string, { earned: number; max: number }> = {};

    scenario.scoringRubric.categories.forEach(cat => {
      breakdown[cat.name] = {
        earned: session.score[cat.name] || 0,
        max: cat.maxPoints
      };
    });

    const totalEarned = Object.values(session.score).reduce((a, b) => a + b, 0);
    const totalMax = scenario.scoringRubric.categories.reduce((a, b) => a + b.maxPoints, 0);

    return { breakdown, totalEarned, totalMax };
  }, [session.score, scenario.scoringRubric]);

  // Initialize conversation with first node
  useEffect(() => {
    const firstNode = scenario.nodes.find(n => n.id === scenario.startNodeId);
    if (firstNode && conversation.length === 0) {
      processNode(firstNode);
    }
  }, []);

  // Auto-scroll conversation
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation]);

  // Process a node and add to conversation
  const processNode = useCallback((node: SimulationNode) => {
    if (node.type === 'end') {
      // Calculate final result
      const { breakdown, totalEarned, totalMax } = calculateScores();
      const percentage = Math.round((totalEarned / totalMax) * 100);
      const passed = percentage >= scenario.scoringRubric.passingScore;

      const finalResult: SimulationResult = {
        scenarioId: scenario.id,
        totalScore: totalEarned,
        maxScore: totalMax,
        percentage,
        passed,
        scoreBreakdown: breakdown,
        pathTaken: session.pathTaken,
        feedback: session.feedback,
        timeSpentMinutes: Math.round((Date.now() - session.startTime.getTime()) / 60000),
        outcome: node.outcome,
        rating: node.finalRating
      };

      setResult(finalResult);
      setShowResults(true);
      return;
    }

    // Add message to conversation
    const message: ConversationMessage = {
      id: node.id,
      speaker: node.speaker === 'advisor' ? 'advisor' : node.speaker === 'client' ? 'client' : 'system',
      speakerName: node.speakerName,
      content: node.content,
      timestamp: new Date()
    };

    setConversation(prev => [...prev, message]);

    // If not a decision point, auto-advance after delay
    if (node.type !== 'decision_point' && node.nextNodeId) {
      setIsProcessing(true);
      setTimeout(() => {
        const nextNode = scenario.nodes.find(n => n.id === node.nextNodeId);
        if (nextNode) {
          setSession(prev => ({
            ...prev,
            currentNodeId: node.nextNodeId!,
            pathTaken: [...prev.pathTaken, node.nextNodeId!]
          }));
          processNode(nextNode);
        }
        setIsProcessing(false);
      }, node.speaker === 'client' ? 2000 : 1000);
    }
  }, [scenario, session, calculateScores]);

  // Handle user choice
  const handleChoice = useCallback((choice: SimulationChoice) => {
    // Add advisor response to conversation
    const advisorMessage: ConversationMessage = {
      id: `choice-${choice.id}`,
      speaker: 'advisor',
      speakerName: 'You',
      content: choice.text,
      timestamp: new Date()
    };

    // Add feedback if present
    if (choice.feedback) {
      advisorMessage.feedback = {
        text: choice.feedback,
        type: choice.isCompliant ? 'positive' : 'negative'
      };
    }

    setConversation(prev => [...prev, advisorMessage]);

    // Update score
    if (choice.scoreImpact) {
      setSession(prev => ({
        ...prev,
        score: {
          ...prev.score,
          [choice.scoreImpact.category]:
            (prev.score[choice.scoreImpact.category] || 0) + choice.scoreImpact.points
        },
        feedback: choice.feedback
          ? [
              ...prev.feedback,
              {
                nodeId: currentNode?.id || '',
                text: choice.feedback,
                type: choice.isCompliant ? 'positive' : 'negative'
              }
            ]
          : prev.feedback
      }));
    }

    // Advance to next node
    setIsProcessing(true);
    setTimeout(() => {
      const nextNode = scenario.nodes.find(n => n.id === choice.nextNodeId);
      if (nextNode) {
        setSession(prev => ({
          ...prev,
          currentNodeId: choice.nextNodeId,
          pathTaken: [...prev.pathTaken, choice.nextNodeId]
        }));
        processNode(nextNode);
      }
      setIsProcessing(false);
    }, 1500);
  }, [currentNode, processNode, scenario]);

  // Handle complete
  const handleComplete = useCallback(() => {
    if (result) {
      onComplete(result);
    }
  }, [result, onComplete]);

  // Handle restart
  const handleRestart = useCallback(() => {
    setSession({
      scenarioId: scenario.id,
      currentNodeId: scenario.startNodeId,
      pathTaken: [scenario.startNodeId],
      score: {},
      startTime: new Date(),
      feedback: [],
      isRecording: false
    });
    setConversation([]);
    setShowResults(false);
    setResult(null);

    const firstNode = scenario.nodes.find(n => n.id === scenario.startNodeId);
    if (firstNode) {
      processNode(firstNode);
    }
  }, [scenario, processNode]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <Phone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="font-semibold text-primary">{scenario.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px]",
                  scenario.difficulty === 'beginner' && "border-green-300 text-green-700",
                  scenario.difficulty === 'intermediate' && "border-amber-300 text-amber-700",
                  scenario.difficulty === 'advanced' && "border-red-300 text-red-700"
                )}
              >
                {scenario.difficulty}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{scenario.estimatedMinutes} min
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowScorePanel(!showScorePanel)}
          >
            <TrendingUp className="w-4 h-4 mr-1" />
            Score
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
            onClick={() => setShowExitConfirm(true)}
          >
            <PhoneOff className="w-4 h-4 mr-1" />
            End Call
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-50 border-b">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Call Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversation area */}
        <div className="flex-1 flex flex-col">
          {/* Client info card */}
          <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-violet-500/5">
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 border-2 border-white shadow">
                <AvatarFallback className="bg-primary text-white text-lg">
                  {scenario.clientProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{scenario.clientProfile.name}</h3>
                <p className="text-sm text-gray-600">
                  {scenario.clientProfile.age} • {scenario.clientProfile.occupation}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {scenario.clientProfile.primaryConcern}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {conversation.map((msg, idx) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex",
                      msg.speaker === 'advisor' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-xl p-3",
                        msg.speaker === 'advisor'
                          ? "bg-primary text-white rounded-br-sm"
                          : msg.speaker === 'client'
                          ? "bg-white border border-gray-200 rounded-bl-sm"
                          : "bg-gray-100 text-gray-600 text-sm"
                      )}
                    >
                      {msg.speaker !== 'system' && (
                        <p className={cn(
                          "text-[10px] font-medium mb-1",
                          msg.speaker === 'advisor' ? "text-white/70" : "text-gray-500"
                        )}>
                          {msg.speaker === 'advisor' ? 'You' : msg.speakerName || scenario.clientProfile.name}
                        </p>
                      )}
                      <p className="text-sm">{msg.content}</p>

                      {/* Inline feedback */}
                      {msg.feedback && (
                        <div
                          className={cn(
                            "mt-2 pt-2 border-t text-xs flex items-start gap-1",
                            msg.speaker === 'advisor'
                              ? "border-white/20"
                              : "border-gray-200"
                          )}
                        >
                          {msg.feedback.type === 'positive' ? (
                            <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                          ) : msg.feedback.type === 'negative' ? (
                            <XCircle className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                          ) : (
                            <Lightbulb className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                          )}
                          <span className={cn(
                            msg.speaker === 'advisor' ? "text-white/80" : "text-gray-600"
                          )}>
                            {msg.feedback.text}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 rounded-xl px-4 py-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-gray-400 rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </ScrollArea>

          {/* Choice buttons */}
          {currentNode?.type === 'decision_point' && currentNode.choices && !isProcessing && (
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 mb-3">Choose your response:</p>
              <div className="space-y-2">
                {currentNode.choices.map(choice => (
                  <Button
                    key={choice.id}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4"
                    onClick={() => handleChoice(choice)}
                  >
                    <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="text-sm">{choice.text}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Score panel (collapsible) */}
        <AnimatePresence>
          {showScorePanel && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l bg-white overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-violet-500" />
                  Score Tracking
                </h3>

                <div className="space-y-3">
                  {scenario.scoringRubric.categories.map(cat => {
                    const earned = session.score[cat.name] || 0;
                    const percentage = Math.round((earned / cat.maxPoints) * 100);

                    return (
                      <div key={cat.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-600">{cat.name}</span>
                          <span className="font-medium">
                            {earned}/{cat.maxPoints}
                          </span>
                        </div>
                        <Progress
                          value={percentage}
                          className={cn(
                            "h-1.5",
                            percentage >= 70 && "[&>div]:bg-green-500",
                            percentage < 70 && percentage >= 50 && "[&>div]:bg-amber-500",
                            percentage < 50 && "[&>div]:bg-red-500"
                          )}
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Passing Score</span>
                    <Badge variant="outline">
                      {scenario.scoringRubric.passingScore}%
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit confirmation dialog */}
      <Dialog open={showExitConfirm} onOpenChange={setShowExitConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Call Simulation?</DialogTitle>
            <DialogDescription>
              Your progress will not be saved. Are you sure you want to exit?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExitConfirm(false)}>
              Continue Call
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowExitConfirm(false);
                onExit?.();
              }}
            >
              End Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Results dialog */}
      <Dialog open={showResults} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg">
          {result && (
            <SimulationResults
              result={result}
              scenario={scenario}
              onRetry={handleRestart}
              onComplete={handleComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * SimulationResults - Shows final results after completing simulation
 */
interface SimulationResultsProps {
  result: SimulationResult;
  scenario: SimulationScenario;
  onRetry: () => void;
  onComplete: () => void;
}

function SimulationResults({
  result,
  scenario,
  onRetry,
  onComplete
}: SimulationResultsProps) {
  return (
    <div className="py-4">
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className={cn(
            "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4",
            result.passed ? "bg-green-100" : "bg-amber-100"
          )}
        >
          {result.passed ? (
            <Award className="w-8 h-8 text-green-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          )}
        </motion.div>

        <h2 className={cn(
          "text-xl font-bold",
          result.passed ? "text-green-700" : "text-amber-700"
        )}>
          {result.passed ? "Call Completed Successfully!" : "Call Needs Improvement"}
        </h2>

        <p className="text-sm text-gray-600 mt-1">
          {scenario.title}
        </p>
      </div>

      {/* Score */}
      <div className="text-center mb-6 p-4 bg-gray-50 rounded-xl">
        <div className="text-4xl font-bold text-primary">
          {result.percentage}%
        </div>
        <p className="text-sm text-gray-500">
          {result.totalScore} of {result.maxScore} points
        </p>
        <Badge
          className={cn(
            "mt-2",
            result.passed
              ? "bg-green-100 text-green-700"
              : "bg-amber-100 text-amber-700"
          )}
        >
          Passing: {scenario.scoringRubric.passingScore}%
        </Badge>
      </div>

      {/* Category breakdown */}
      <div className="space-y-3 mb-6">
        <h3 className="text-sm font-medium text-gray-700">Score Breakdown</h3>
        {Object.entries(result.scoreBreakdown).map(([category, data]) => {
          const percentage = Math.round((data.earned / data.max) * 100);
          return (
            <div key={category}>
              <div className="flex justify-between text-xs mb-1">
                <span>{category}</span>
                <span className="font-medium">
                  {data.earned}/{data.max} ({percentage}%)
                </span>
              </div>
              <Progress
                value={percentage}
                className={cn(
                  "h-2",
                  percentage >= 70 && "[&>div]:bg-green-500",
                  percentage < 70 && percentage >= 50 && "[&>div]:bg-amber-500",
                  percentage < 50 && "[&>div]:bg-red-500"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Time */}
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
        <Clock className="w-4 h-4" />
        <span>Completed in {result.timeSpentMinutes} minutes</span>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
        <Button className="flex-1" onClick={onComplete}>
          {result.passed ? "Continue" : "Review & Exit"}
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
