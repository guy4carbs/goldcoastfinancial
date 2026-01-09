import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  GraduationCap, Play, CheckCircle2, Clock, Award, 
  ChevronLeft, ChevronRight, BookOpen, Video, FileText,
  Star, Zap, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TrainingCourse, TrainingModule } from "@/lib/agentStore";

interface TrainingModuleViewerProps {
  course: TrainingCourse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompleteModule: (courseId: string, moduleId: string) => void;
}

export function TrainingModuleViewer({ 
  course, 
  open, 
  onOpenChange,
  onCompleteModule 
}: TrainingModuleViewerProps) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  if (!course) return null;

  const completedCount = course.modules.filter(m => m.completed).length;
  const progress = Math.round((completedCount / course.modules.length) * 100);
  const activeModule = course.modules[activeModuleIndex];
  const isCompleted = activeModule?.completed;

  const handleComplete = () => {
    if (activeModule && !activeModule.completed) {
      onCompleteModule(course.id, activeModule.id);
    }
  };

  const handleNext = () => {
    if (activeModuleIndex < course.modules.length - 1) {
      setActiveModuleIndex(activeModuleIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeModuleIndex > 0) {
      setActiveModuleIndex(activeModuleIndex - 1);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl font-serif">{course.title}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  {course.modules.length} modules
                </div>
                {course.required && (
                  <Badge variant="outline" className="text-secondary border-secondary/50 text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Course Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </SheetHeader>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-64 border-r bg-muted/30 p-4 hidden md:block">
            <h4 className="text-sm font-medium mb-3">Modules</h4>
            <ScrollArea className="h-full">
              <div className="space-y-1 pr-4">
                {course.modules.map((module, idx) => (
                  <button
                    key={module.id}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all flex items-center gap-3",
                      activeModuleIndex === idx 
                        ? "bg-secondary/10 border border-secondary/30" 
                        : "hover:bg-muted"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                      module.completed 
                        ? "bg-secondary text-white" 
                        : activeModuleIndex === idx 
                          ? "bg-primary text-white"
                          : "bg-muted-foreground/20 text-muted-foreground"
                    )}>
                      {module.completed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        module.completed && "line-through opacity-70"
                      )}>
                        {module.title}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{module.duration}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeModule?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">
                      Module {activeModuleIndex + 1} of {course.modules.length}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {activeModule?.duration}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold mb-4">{activeModule?.title}</h3>

                  <div className="flex-1 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5 border flex items-center justify-center min-h-[200px]">
                    {isCompleted ? (
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300 }}
                        >
                          <CheckCircle2 className="w-16 h-16 text-secondary mx-auto mb-3" />
                        </motion.div>
                        <p className="font-medium text-secondary">Module Completed!</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          You've earned +50 XP
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <Video className="w-10 h-10 text-primary" />
                        </div>
                        <p className="text-muted-foreground text-sm mb-4">
                          Training content would appear here
                        </p>
                        <Button 
                          className="gap-2 bg-primary hover:bg-primary/90"
                          size="lg"
                        >
                          <Play className="w-4 h-4" fill="currentColor" />
                          Start Module
                        </Button>
                      </div>
                    )}
                  </div>

                  {progress === 100 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 rounded-lg bg-gradient-to-r from-secondary/10 to-yellow-500/10 border border-secondary/30 text-center"
                    >
                      <Trophy className="w-8 h-8 text-secondary mx-auto mb-2" />
                      <p className="font-semibold text-secondary">Course Complete!</p>
                      <p className="text-sm text-muted-foreground">You've earned a certificate</p>
                      <Button variant="outline" className="mt-3 gap-2">
                        <Award className="w-4 h-4" />
                        Download Certificate
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="border-t p-4 flex items-center justify-between gap-4">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={activeModuleIndex === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                {course.modules.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveModuleIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === activeModuleIndex 
                        ? "bg-secondary w-4" 
                        : course.modules[idx].completed 
                          ? "bg-secondary/50"
                          : "bg-muted-foreground/30"
                    )}
                  />
                ))}
              </div>

              {!isCompleted ? (
                <Button 
                  onClick={handleComplete}
                  className="gap-2 bg-secondary hover:bg-secondary/90"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Mark Complete
                </Button>
              ) : activeModuleIndex < course.modules.length - 1 ? (
                <Button 
                  onClick={handleNext}
                  className="gap-2"
                >
                  Next Module
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="outline" className="gap-2">
                  <Star className="w-4 h-4" fill="currentColor" />
                  Finished
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
