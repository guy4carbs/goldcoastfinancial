import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Video,
  FileText,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  Shield,
  Target,
  Sparkles,
  Lightbulb,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Volume2,
  Maximize2,
  SkipBack,
  SkipForward,
  Download,
  Lock,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainingModuleData, ModuleSection } from "@/lib/trainingData";

interface InstitutionalModuleViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: TrainingModuleData;
  completedSections: string[];
  onCompleteSection: (sectionId: string) => void;
  onCompleteModule: () => void;
  onStartAssessment?: () => void;
}

const categoryConfig: Record<string, {
  gradient: string;
  accent: string;
  badge: string;
  icon: string;
}> = {
  onboarding: {
    gradient: 'from-cyan-500 to-cyan-600',
    accent: 'text-cyan-600',
    badge: 'bg-cyan-100 text-cyan-700',
    icon: 'bg-cyan-100'
  },
  doctrine: {
    gradient: 'from-purple-500 to-purple-600',
    accent: 'text-purple-600',
    badge: 'bg-purple-100 text-purple-700',
    icon: 'bg-purple-100'
  },
  compliance: {
    gradient: 'from-slate-500 to-slate-600',
    accent: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    icon: 'bg-slate-100'
  },
  methodology: {
    gradient: 'from-blue-500 to-blue-600',
    accent: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-100'
  },
  product: {
    gradient: 'from-emerald-500 to-emerald-600',
    accent: 'text-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    icon: 'bg-emerald-100'
  },
  sales: {
    gradient: 'from-blue-500 to-indigo-500',
    accent: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    icon: 'bg-blue-100'
  },
  objection_handling: {
    gradient: 'from-amber-500 to-orange-500',
    accent: 'text-amber-600',
    badge: 'bg-amber-100 text-amber-700',
    icon: 'bg-amber-100'
  },
  client_scenarios: {
    gradient: 'from-teal-500 to-teal-600',
    accent: 'text-teal-600',
    badge: 'bg-teal-100 text-teal-700',
    icon: 'bg-teal-100'
  },
  client_facilitation: {
    gradient: 'from-indigo-500 to-indigo-600',
    accent: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    icon: 'bg-indigo-100'
  },
  state_specific: {
    gradient: 'from-violet-500 to-purple-500',
    accent: 'text-violet-600',
    badge: 'bg-violet-100 text-violet-700',
    icon: 'bg-violet-100'
  },
  ongoing_compliance: {
    gradient: 'from-slate-500 to-gray-600',
    accent: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    icon: 'bg-slate-100'
  }
};

export function InstitutionalModuleViewer({
  open,
  onOpenChange,
  module,
  completedSections,
  onCompleteSection,
  onCompleteModule,
  onStartAssessment
}: InstitutionalModuleViewerProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const currentSection = module.sections[currentSectionIndex];
  const isCurrentCompleted = completedSections.includes(currentSection?.id || '');
  const allSectionsCompleted = module.sections.every(s => completedSections.includes(s.id));
  const progress = (completedSections.length / module.sections.length) * 100;
  const config = categoryConfig[module.category] || categoryConfig.doctrine;

  useEffect(() => {
    setCurrentSectionIndex(0);
    setVideoProgress(0);
    setIsPlaying(false);
    // Scroll page to top when module opens
    window.scrollTo(0, 0);
  }, [module.id]);

  const handleCompleteSection = () => {
    if (!isCurrentCompleted) {
      onCompleteSection(currentSection.id);
    }
    if (currentSectionIndex < module.sections.length - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (!module.assessmentRequired && (allSectionsCompleted || (completedSections.length === module.sections.length - 1))) {
      // Only auto-complete if no assessment is required
      onCompleteModule();
    }
    // If assessment required, user must click "Start Assessment" in sidebar
  };

  const goToSection = (index: number) => {
    setCurrentSectionIndex(index);
    setVideoProgress(0);
    setIsPlaying(false);
  };

  const getSectionIcon = (section: ModuleSection, idx: number) => {
    const completed = completedSections.includes(section.id);
    const isCurrent = idx === currentSectionIndex;
    if (completed) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (isCurrent) return <Play className="w-4 h-4 text-violet-500" />;
    if (section.videoPlaceholder) return <Video className="w-4 h-4 text-gray-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
  };

  const formatContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, idx) => {
      if (para.match(/^[A-Z][A-Z\s&]+:$/m)) {
        const lines = para.split('\n');
        return (
          <div key={idx} className="mb-6">
            {lines.map((line, lineIdx) => {
              if (line.match(/^[A-Z][A-Z\s&]+:$/)) {
                return (
                  <h4 key={lineIdx} className="font-semibold text-gray-900 text-base mt-6 mb-3 flex items-center gap-2">
                    <div className={cn("w-1 h-5 rounded-full bg-gradient-to-b", config.gradient)} />
                    {line.replace(':', '')}
                  </h4>
                );
              }
              return <p key={lineIdx} className="text-[15px] text-gray-600 leading-relaxed">{line}</p>;
            })}
          </div>
        );
      }
      if (para.match(/^\d+\./m)) {
        const items = para.split(/(?=\d+\.)/);
        return (
          <ol key={idx} className="space-y-3 mb-6 ml-1">
            {items.filter(item => item.trim()).map((item, itemIdx) => {
              const text = item.replace(/^\d+\.\s*/, '');
              const num = item.match(/^(\d+)\./)?.[1];
              return (
                <li key={itemIdx} className="flex items-start gap-3">
                  <span className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold",
                    "bg-gradient-to-br", config.gradient, "text-white"
                  )}>{num}</span>
                  <div className="flex-1 pt-0.5">
                    <span className="text-[15px] text-gray-700 font-medium">{text.split('\n')[0]}</span>
                    {text.includes('\n') && (
                      <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{text.split('\n').slice(1).join('\n')}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        );
      }
      if (para.match(/^[•\-✓✗]/m)) {
        const items = para.split(/\n(?=[•\-✓✗])/);
        return (
          <ul key={idx} className="space-y-2.5 mb-6 ml-1">
            {items.map((item, itemIdx) => {
              const isPositive = item.startsWith('✓');
              const isNegative = item.startsWith('✗');
              return (
                <li key={itemIdx} className={cn(
                  "flex items-start gap-3 text-[15px]",
                  isPositive ? "text-emerald-700" : isNegative ? "text-red-600" : "text-gray-700"
                )}>
                  <span className={cn(
                    "mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full",
                    isPositive ? "bg-emerald-500" : isNegative ? "bg-red-500" : "bg-gray-400"
                  )} />
                  <span className="leading-relaxed">{item.replace(/^[•\-✓✗]\s*/, '')}</span>
                </li>
              );
            })}
          </ul>
        );
      }
      return (
        <p key={idx} className="text-[15px] text-gray-600 leading-[1.8] mb-5">{para}</p>
      );
    });
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 pb-20 lg:pb-0"
    >
      {/* Header */}
      <div>
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <BookOpen className="w-4 h-4" />
              <span>Heritage Life Training</span>
              <Badge className={cn("text-[10px] border-0 font-medium", config.badge)}>
                {module.category.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold text-primary">{module.title}</h1>
          </div>
          <div className="text-right hidden sm:block">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Clock className="w-4 h-4" />
              <span>{module.duration} min total</span>
            </div>
            <p className="text-sm text-gray-500">{module.code}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Course Progress</span>
              <span className="text-sm text-gray-500">{completedSections.length} of {module.sections.length} sections</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-2">
              {Math.round(progress)}% complete · {module.sections.length - completedSections.length} sections remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: 2/3 + 1/3 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video Player / Content Area */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            {/* Video Player */}
            {currentSection?.videoPlaceholder ? (
              <div className="relative bg-gray-900 aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto cursor-pointer hover:bg-white/20 transition-all border border-white/20"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="w-10 h-10 text-white" />
                      ) : (
                        <Play className="w-10 h-10 text-white ml-1" />
                      )}
                    </motion.div>
                    <h3 className="text-xl font-semibold">{currentSection.title}</h3>
                    <p className="text-white/60 text-sm mt-1">{currentSection.videoPlaceholder}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <div className="mb-2">
                    <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-violet-500 transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <SkipBack className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <SkipForward className="w-4 h-4" />
                      </Button>
                      <span className="text-sm">0:00 / {currentSection.duration} min</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Volume2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Reading / text content header area */
              <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b">
                <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                  <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
                    Section {currentSectionIndex + 1} of {module.sections.length}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {currentSection?.duration} min read
                  </span>
                  {isCurrentCompleted && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{currentSection?.title}</h3>
              </div>
            )}

            {/* Written content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSection?.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {currentSection?.videoPlaceholder && (
                    <div className="mb-4">
                      <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium">
                          Section {currentSectionIndex + 1} of {module.sections.length}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {currentSection.duration} min
                        </span>
                        {isCurrentCompleted && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[10px]">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{currentSection.title}</h3>
                    </div>
                  )}

                  <div className="prose prose-gray max-w-none">
                    {currentSection && formatContent(currentSection.content)}
                  </div>

                  {/* Key Points */}
                  {currentSection?.keyPoints && currentSection.keyPoints.length > 0 && (
                    <Card className="mt-8 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200/50 shadow-sm overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-emerald-400 to-teal-400" />
                      <CardContent className="p-5">
                        <h4 className="text-sm font-semibold text-emerald-800 mb-4 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Lightbulb className="w-4 h-4 text-emerald-600" />
                          </div>
                          Key Takeaways
                        </h4>
                        <ul className="space-y-3">
                          {currentSection.keyPoints.map((point, pidx) => (
                            <li key={pidx} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-emerald-800 leading-relaxed">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Compliance Notes */}
                  {currentSection?.complianceNotes && currentSection.complianceNotes.length > 0 && (
                    <Card className="mt-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50 shadow-sm overflow-hidden">
                      <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
                      <CardContent className="p-5">
                        <h4 className="text-sm font-semibold text-amber-800 mb-4 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                          </div>
                          Compliance Notes
                        </h4>
                        <ul className="space-y-3">
                          {currentSection.complianceNotes.map((note, nidx) => (
                            <li key={nidx} className="flex items-start gap-3">
                              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-amber-800 leading-relaxed">{note}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom action bar */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{currentSection?.title}</h4>
                  <p className="text-sm text-gray-500">{module.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  {currentSection?.videoPlaceholder && (
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="w-4 h-4" />
                      Resources
                    </Button>
                  )}
                  {isCurrentCompleted ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-0 font-medium px-3 py-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                      Completed
                    </Badge>
                  ) : (
                    <Button size="sm" onClick={handleCompleteSection} className="gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* About This Module */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Module</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">{module.description}</p>

              {/* Learning Objectives */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className={cn("w-4 h-4", config.accent)} />
                  Learning Objectives
                </h4>
                <ul className="space-y-2">
                  {module.learningObjectives.map((obj, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 className={cn("w-3.5 h-3.5 mt-0.5 flex-shrink-0", config.accent)} />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{module.sections.length}</p>
                  <p className="text-xs text-gray-500">Sections</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{module.duration}</p>
                  <p className="text-xs text-gray-500">Minutes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{completedSections.length}</p>
                  <p className="text-xs text-gray-500">Completed</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{Math.round(progress)}%</p>
                  <p className="text-xs text-gray-500">Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Outline Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Course Content</CardTitle>
              <CardDescription>
                {module.sections.length} sections · {module.duration} min
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  {module.sections.map((section, idx) => {
                    const completed = completedSections.includes(section.id);
                    const isCurrent = idx === currentSectionIndex;

                    return (
                      <button
                        key={section.id}
                        onClick={() => goToSection(idx)}
                        className={cn(
                          "w-full p-3 pl-4 text-left transition-colors flex items-center gap-3",
                          isCurrent
                            ? "bg-violet-50 border-l-2 border-violet-500"
                            : "hover:bg-gray-50"
                        )}
                      >
                        {getSectionIcon(section, idx)}
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-sm truncate",
                            isCurrent ? "font-medium text-violet-700" : completed ? "text-gray-500" : "text-gray-700"
                          )}>
                            {section.title}
                          </p>
                          <p className="text-xs text-gray-400">{section.duration} min</p>
                        </div>
                        {completed && !isCurrent && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Assessment info */}
                {module.assessmentRequired && (
                  <div className="p-4 border-t bg-gradient-to-br from-amber-50 to-orange-50">
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-800">Assessment Required</span>
                    </div>
                    <p className="text-[11px] text-amber-700 leading-relaxed mb-2">
                      Complete all sections to unlock the certification assessment.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 bg-amber-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-amber-600">{Math.round(progress)}%</span>
                    </div>
                    {allSectionsCompleted && onStartAssessment && (
                      <Button
                        size="sm"
                        onClick={onStartAssessment}
                        className={cn("w-full mt-3 gap-2 bg-gradient-to-r", config.gradient, "hover:opacity-90")}
                      >
                        Start Assessment
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                )}

                {/* Complete Module button */}
                {allSectionsCompleted && !module.assessmentRequired && (
                  <div className="p-4 border-t">
                    <Button
                      onClick={() => {
                        onCompleteModule();
                        onOpenChange(false);
                      }}
                      className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                    >
                      <Sparkles className="w-4 h-4" />
                      Complete Module
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
