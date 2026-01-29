import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Award,
  Lock,
  ChevronRight,
  Star,
  Users,
  FileText,
  Download,
  Volume2,
  Maximize2,
  SkipBack,
  SkipForward,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz';
  completed: boolean;
  locked: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

const COURSE_MODULES: Module[] = [
  {
    id: 'mod-1',
    title: 'Introduction to Life Insurance',
    description: 'Understanding the basics of life insurance and why it matters',
    lessons: [
      { id: 'les-1-1', title: 'What is Life Insurance?', duration: '8:32', type: 'video', completed: true, locked: false },
      { id: 'les-1-2', title: 'The History of Life Insurance', duration: '6:15', type: 'video', completed: true, locked: false },
      { id: 'les-1-3', title: 'Why Families Need Protection', duration: '10:45', type: 'video', completed: false, locked: false },
      { id: 'les-1-4', title: 'Key Terms & Definitions', duration: '5 min read', type: 'reading', completed: false, locked: false },
      { id: 'les-1-5', title: 'Module 1 Quiz', duration: '10 questions', type: 'quiz', completed: false, locked: false },
    ]
  },
  {
    id: 'mod-2',
    title: 'Types of Life Insurance',
    description: 'Deep dive into term, whole, universal, and other policy types',
    lessons: [
      { id: 'les-2-1', title: 'Term Life Insurance Explained', duration: '12:20', type: 'video', completed: false, locked: false },
      { id: 'les-2-2', title: 'Whole Life Insurance Benefits', duration: '15:08', type: 'video', completed: false, locked: false },
      { id: 'les-2-3', title: 'Universal Life & IUL', duration: '18:45', type: 'video', completed: false, locked: true },
      { id: 'les-2-4', title: 'Final Expense Insurance', duration: '9:30', type: 'video', completed: false, locked: true },
      { id: 'les-2-5', title: 'Comparing Policy Types', duration: '8 min read', type: 'reading', completed: false, locked: true },
      { id: 'les-2-6', title: 'Module 2 Quiz', duration: '15 questions', type: 'quiz', completed: false, locked: true },
    ]
  },
  {
    id: 'mod-3',
    title: 'The Application Process',
    description: 'Learn how to complete applications accurately and efficiently',
    lessons: [
      { id: 'les-3-1', title: 'Gathering Client Information', duration: '11:15', type: 'video', completed: false, locked: true },
      { id: 'les-3-2', title: 'Medical Underwriting Basics', duration: '14:22', type: 'video', completed: false, locked: true },
      { id: 'les-3-3', title: 'Non-Medical Underwriting', duration: '8:55', type: 'video', completed: false, locked: true },
      { id: 'les-3-4', title: 'Common Application Mistakes', duration: '6 min read', type: 'reading', completed: false, locked: true },
      { id: 'les-3-5', title: 'Module 3 Quiz', duration: '12 questions', type: 'quiz', completed: false, locked: true },
    ]
  },
  {
    id: 'mod-4',
    title: 'Policy Provisions & Riders',
    description: 'Understanding policy features, exclusions, and add-ons',
    lessons: [
      { id: 'les-4-1', title: 'Standard Policy Provisions', duration: '13:40', type: 'video', completed: false, locked: true },
      { id: 'les-4-2', title: 'Common Exclusions', duration: '7:25', type: 'video', completed: false, locked: true },
      { id: 'les-4-3', title: 'Popular Riders Explained', duration: '16:18', type: 'video', completed: false, locked: true },
      { id: 'les-4-4', title: 'Living Benefits Overview', duration: '10:50', type: 'video', completed: false, locked: true },
      { id: 'les-4-5', title: 'Module 4 Quiz', duration: '15 questions', type: 'quiz', completed: false, locked: true },
    ]
  },
  {
    id: 'mod-5',
    title: 'Ethics & Compliance',
    description: 'Maintaining integrity and following regulations',
    lessons: [
      { id: 'les-5-1', title: 'Agent Responsibilities', duration: '9:30', type: 'video', completed: false, locked: true },
      { id: 'les-5-2', title: 'Suitability Requirements', duration: '11:15', type: 'video', completed: false, locked: true },
      { id: 'les-5-3', title: 'Replacement Regulations', duration: '8:45', type: 'video', completed: false, locked: true },
      { id: 'les-5-4', title: 'Privacy & Data Protection', duration: '7 min read', type: 'reading', completed: false, locked: true },
      { id: 'les-5-5', title: 'Final Exam', duration: '25 questions', type: 'quiz', completed: false, locked: true },
    ]
  }
];

export default function AgentStudyFundamentals() {
  const [modules, setModules] = useState(COURSE_MODULES);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(modules[0].lessons[2]);
  const [activeModule, setActiveModule] = useState<Module | null>(modules[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['mod-1']));

  // Calculate progress
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.completed).length, 0);
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const handleLessonClick = (module: Module, lesson: Lesson) => {
    if (lesson.locked) {
      toast.error('Complete previous lessons to unlock');
      return;
    }
    setActiveModule(module);
    setActiveLesson(lesson);
    setVideoProgress(0);
    setIsPlaying(false);
  };

  const handleMarkComplete = () => {
    if (!activeLesson || !activeModule) return;

    setModules(prev => prev.map(m => {
      if (m.id === activeModule.id) {
        return {
          ...m,
          lessons: m.lessons.map(l =>
            l.id === activeLesson.id ? { ...l, completed: true } : l
          )
        };
      }
      return m;
    }));

    toast.success('Lesson completed!', { description: '+50 XP earned' });
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.completed) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (lesson.locked) return <Lock className="w-4 h-4 text-gray-400" />;
    if (lesson.type === 'video') return <Play className="w-4 h-4 text-violet-500" />;
    if (lesson.type === 'reading') return <FileText className="w-4 h-4 text-blue-500" />;
    if (lesson.type === 'quiz') return <Award className="w-4 h-4 text-amber-500" />;
    return <Circle className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Header */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center gap-4 mb-4">
            <Link href="/agents/getting-started">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <BookOpen className="w-4 h-4" />
                <span>Heritage Life Academy</span>
                <Badge className="bg-green-100 text-green-700">Free</Badge>
              </div>
              <h1 className="text-2xl font-bold text-primary">Life Insurance Fundamentals</h1>
            </div>
            <div className="text-right hidden sm:block">
              <div className="flex items-center gap-1 text-amber-500 mb-1">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-medium">4.8</span>
                <span className="text-gray-400 text-sm">(1,240 enrolled)</span>
              </div>
              <p className="text-sm text-gray-500">6 hours total</p>
            </div>
          </div>

          {/* Progress Bar */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Course Progress</span>
                <span className="text-sm text-gray-500">{completedLessons} of {totalLessons} lessons</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
              <p className="text-xs text-gray-500 mt-2">
                {overallProgress}% complete · {totalLessons - completedLessons} lessons remaining
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div variants={fadeInUp} className="grid lg:grid-cols-3 gap-6">
          {/* Video Player / Content Area */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              {activeLesson?.type === 'video' ? (
                <>
                  {/* Video Player */}
                  <div className="relative bg-gray-900 aspect-video">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4 mx-auto">
                          {isPlaying ? (
                            <Pause className="w-10 h-10 text-white" />
                          ) : (
                            <Play className="w-10 h-10 text-white ml-1" />
                          )}
                        </div>
                        <h3 className="text-xl font-semibold">{activeLesson?.title}</h3>
                        <p className="text-white/60 text-sm mt-1">{activeModule?.title}</p>
                      </div>
                    </div>

                    {/* Video Controls */}
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
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-white hover:bg-white/20"
                            onClick={() => setIsPlaying(!isPlaying)}
                          >
                            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <SkipBack className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <SkipForward className="w-4 h-4" />
                          </Button>
                          <span className="text-sm">3:25 / {activeLesson?.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                            <Maximize2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeLesson?.type === 'reading' ? (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4">{activeLesson?.title}</h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-600 mb-4">
                      Understanding key life insurance terminology is essential for passing your state exam
                      and communicating effectively with clients. This reading covers the most important
                      terms you'll encounter in your career.
                    </p>
                    <h4 className="font-semibold text-primary mt-6 mb-2">Premium</h4>
                    <p className="text-gray-600 mb-4">
                      The amount paid by the policyholder to maintain coverage. Premiums can be paid monthly,
                      quarterly, semi-annually, or annually.
                    </p>
                    <h4 className="font-semibold text-primary mt-6 mb-2">Death Benefit</h4>
                    <p className="text-gray-600 mb-4">
                      The amount paid to beneficiaries upon the death of the insured. This is the core
                      purpose of life insurance protection.
                    </p>
                    <h4 className="font-semibold text-primary mt-6 mb-2">Beneficiary</h4>
                    <p className="text-gray-600 mb-4">
                      The person or entity designated to receive the death benefit. Policies can have
                      primary and contingent beneficiaries.
                    </p>
                    <h4 className="font-semibold text-primary mt-6 mb-2">Cash Value</h4>
                    <p className="text-gray-600 mb-4">
                      A savings component in permanent life insurance policies that grows over time
                      and can be accessed by the policyholder.
                    </p>
                  </div>
                </div>
              ) : activeLesson?.type === 'quiz' ? (
                <div className="p-6 text-center">
                  <Award className="w-16 h-16 text-amber-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{activeLesson?.title}</h3>
                  <p className="text-gray-600 mb-6">
                    Test your knowledge from this module. You need 80% to pass.
                  </p>
                  <Button size="lg" className="gap-2">
                    Start Quiz
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Select a lesson to begin</p>
                </div>
              )}

              {/* Lesson Info & Actions */}
              {activeLesson && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{activeLesson.title}</h4>
                      <p className="text-sm text-gray-500">{activeModule?.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {activeLesson.type === 'video' && (
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Resources
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={handleMarkComplete}
                        disabled={activeLesson.completed}
                        className="gap-2"
                      >
                        {activeLesson.completed ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Completed
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Complete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Course Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">About This Course</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  This comprehensive course covers everything you need to know about life insurance
                  fundamentals. Perfect for new agents preparing for their state licensing exam or
                  experienced agents looking to refresh their knowledge.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-xs text-gray-500">Modules</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">26</p>
                    <p className="text-xs text-gray-500">Lessons</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">6</p>
                    <p className="text-xs text-gray-500">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">5</p>
                    <p className="text-xs text-gray-500">Quizzes</p>
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
                  {modules.length} modules · {totalLessons} lessons
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="divide-y">
                    {modules.map((module, moduleIndex) => {
                      const moduleCompleted = module.lessons.filter(l => l.completed).length;
                      const moduleTotal = module.lessons.length;
                      const isExpanded = expandedModules.has(module.id);

                      return (
                        <div key={module.id}>
                          {/* Module Header */}
                          <button
                            onClick={() => toggleModule(module.id)}
                            className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Module {moduleIndex + 1}</p>
                                <h4 className="font-medium text-sm">{module.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  {moduleCompleted}/{moduleTotal} complete
                                </p>
                              </div>
                              <ChevronRight className={cn(
                                "w-4 h-4 text-gray-400 transition-transform",
                                isExpanded && "rotate-90"
                              )} />
                            </div>
                            <Progress
                              value={(moduleCompleted / moduleTotal) * 100}
                              className="h-1 mt-2"
                            />
                          </button>

                          {/* Lessons */}
                          {isExpanded && (
                            <div className="bg-gray-50 divide-y divide-gray-100">
                              {module.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => handleLessonClick(module, lesson)}
                                  disabled={lesson.locked}
                                  className={cn(
                                    "w-full p-3 pl-6 text-left transition-colors flex items-center gap-3",
                                    lesson.locked
                                      ? "opacity-50 cursor-not-allowed"
                                      : "hover:bg-gray-100",
                                    activeLesson?.id === lesson.id && "bg-violet-50 border-l-2 border-violet-500"
                                  )}
                                >
                                  {getLessonIcon(lesson)}
                                  <div className="flex-1 min-w-0">
                                    <p className={cn(
                                      "text-sm truncate",
                                      lesson.completed && "text-gray-500"
                                    )}>
                                      {lesson.title}
                                    </p>
                                    <p className="text-xs text-gray-400">{lesson.duration}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AgentLoungeLayout>
  );
}
