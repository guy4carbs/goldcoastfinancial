/**
 * Module Viewer Enhancements - Phase 3.4
 *
 * Enhanced learning experience features:
 * - Progress bar within module (section X of Y)
 * - Estimated time remaining
 * - Bookmark/save for later review
 * - Note-taking sidebar
 * - Highlight text capability
 * - "Mark as reviewed" for sections
 * - Knowledge check micro-quizzes every 3-5 minutes
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import {
  Bookmark,
  BookmarkCheck,
  Clock,
  Edit3,
  Save,
  Trash2,
  CheckCircle2,
  Circle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  X,
  FileText,
  PenLine,
  StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// MODULE PROGRESS BAR
// ============================================================================

interface ModuleProgressBarProps {
  currentSection: number;
  totalSections: number;
  sectionTitle: string;
  estimatedTimeRemaining: number; // minutes
  className?: string;
}

export function ModuleProgressBar({
  currentSection,
  totalSections,
  sectionTitle,
  estimatedTimeRemaining,
  className
}: ModuleProgressBarProps) {
  const progress = ((currentSection + 1) / totalSections) * 100;
  const progressLabel = `Module progress: Section ${currentSection + 1} of ${totalSections}, ${Math.round(progress)}% complete`;

  return (
    <div
      className={cn("space-y-2", className)}
      role="region"
      aria-label="Module progress"
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            Section {currentSection + 1} of {totalSections}
          </Badge>
          <span className="text-gray-600 font-medium truncate max-w-[200px]">
            {sectionTitle}
          </span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <Clock className="w-3.5 h-3.5" aria-hidden="true" />
          <span className="text-xs">{estimatedTimeRemaining} min remaining</span>
        </div>
      </div>
      <Progress
        value={progress}
        className="h-2"
        aria-label={progressLabel}
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />
      <span className="sr-only">{progressLabel}</span>
    </div>
  );
}

// ============================================================================
// BOOKMARK BUTTON
// ============================================================================

interface BookmarkButtonProps {
  isBookmarked: boolean;
  onToggle: () => void;
  className?: string;
}

export function BookmarkButton({
  isBookmarked,
  onToggle,
  className
}: BookmarkButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "gap-2",
              isBookmarked && "text-amber-600",
              className
            )}
            onClick={onToggle}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
            {isBookmarked ? "Bookmarked" : "Bookmark"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isBookmarked ? "Remove bookmark" : "Save for later review"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ============================================================================
// NOTE-TAKING SIDEBAR
// ============================================================================

interface Note {
  id: string;
  sectionId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NoteTakingSidebarProps {
  moduleId: string;
  sectionId: string;
  notes: Note[];
  onSaveNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (noteId: string, content: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export function NoteTakingSidebar({
  moduleId,
  sectionId,
  notes,
  onSaveNote,
  onUpdateNote,
  onDeleteNote
}: NoteTakingSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const sectionNotes = notes.filter(n => n.sectionId === sectionId);
  const allModuleNotes = notes.filter(n => n.sectionId !== sectionId);

  const handleSave = () => {
    if (newNote.trim()) {
      onSaveNote({ sectionId, content: newNote.trim() });
      setNewNote("");
    }
  };

  const startEdit = (note: Note) => {
    setEditingNote(note.id);
    setEditContent(note.content);
  };

  const saveEdit = (noteId: string) => {
    if (editContent.trim()) {
      onUpdateNote(noteId, editContent.trim());
    }
    setEditingNote(null);
    setEditContent("");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <StickyNote className="w-4 h-4" />
          Notes
          {notes.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {notes.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <PenLine className="w-5 h-5 text-violet-500" />
            My Notes
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* New Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Add note for this section
            </label>
            <Textarea
              placeholder="Write your notes here..."
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!newNote.trim()}
              className="w-full"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Note
            </Button>
          </div>

          <Separator />

          {/* Section Notes */}
          {sectionNotes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                This Section ({sectionNotes.length})
              </h4>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2">
                  {sectionNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isEditing={editingNote === note.id}
                      editContent={editContent}
                      onEditContentChange={setEditContent}
                      onStartEdit={() => startEdit(note)}
                      onSaveEdit={() => saveEdit(note.id)}
                      onCancelEdit={() => setEditingNote(null)}
                      onDelete={() => onDeleteNote(note.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Other Notes in Module */}
          {allModuleNotes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">
                Other Sections ({allModuleNotes.length})
              </h4>
              <ScrollArea className="max-h-[200px]">
                <div className="space-y-2 opacity-75">
                  {allModuleNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      isEditing={editingNote === note.id}
                      editContent={editContent}
                      onEditContentChange={setEditContent}
                      onStartEdit={() => startEdit(note)}
                      onSaveEdit={() => saveEdit(note.id)}
                      onCancelEdit={() => setEditingNote(null)}
                      onDelete={() => onDeleteNote(note.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {notes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notes yet</p>
              <p className="text-xs">Add notes to help you remember key points</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  editContent: string;
  onEditContentChange: (content: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}

function NoteCard({
  note,
  isEditing,
  editContent,
  onEditContentChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete
}: NoteCardProps) {
  return (
    <Card className="bg-amber-50/50">
      <CardContent className="p-3">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editContent}
              onChange={e => onEditContentChange(e.target.value)}
              className="min-h-[80px] resize-none text-sm"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={onSaveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={onCancelEdit}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <span className="text-[10px] text-gray-400">
                {note.updatedAt.toLocaleDateString()}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onStartEdit}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                  onClick={onDelete}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// MARK AS REVIEWED BUTTON
// ============================================================================

interface MarkAsReviewedProps {
  isReviewed: boolean;
  onToggle: () => void;
  className?: string;
}

export function MarkAsReviewedButton({
  isReviewed,
  onToggle,
  className
}: MarkAsReviewedProps) {
  return (
    <Button
      variant={isReviewed ? "default" : "outline"}
      size="sm"
      className={cn(
        "gap-2",
        isReviewed && "bg-green-600 hover:bg-green-700",
        className
      )}
      onClick={onToggle}
    >
      {isReviewed ? (
        <>
          <CheckCircle2 className="w-4 h-4" />
          Reviewed
        </>
      ) : (
        <>
          <Circle className="w-4 h-4" />
          Mark as Reviewed
        </>
      )}
    </Button>
  );
}

// ============================================================================
// MICRO-QUIZ COMPONENT
// ============================================================================

interface MicroQuizQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

interface MicroQuizProps {
  show: boolean;
  question: MicroQuizQuestion;
  onAnswer: (correct: boolean) => void;
  onSkip: () => void;
}

export function MicroQuiz({
  show,
  question,
  onAnswer,
  onSkip
}: MicroQuizProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (optionId: string) => {
    if (showResult) return;
    setSelectedOption(optionId);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    const correct = question.options.find(o => o.id === selectedOption)?.isCorrect || false;
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleContinue = () => {
    onAnswer(isCorrect);
    setSelectedOption(null);
    setShowResult(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  <span className="font-semibold">Quick Check</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:text-white/80 hover:bg-white/20 h-8 w-8 p-0"
                  onClick={onSkip}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="font-medium text-gray-900 mb-4">{question.question}</p>

              <div className="space-y-2">
                {question.options.map(option => {
                  const isSelected = selectedOption === option.id;
                  const showCorrect = showResult && option.isCorrect;
                  const showIncorrect = showResult && isSelected && !option.isCorrect;

                  return (
                    <button
                      key={option.id}
                      className={cn(
                        "w-full p-3 rounded-lg border-2 text-left transition-all",
                        !showResult && "hover:border-blue-300 hover:bg-blue-50",
                        isSelected && !showResult && "border-blue-500 bg-blue-50",
                        showCorrect && "border-green-500 bg-green-50",
                        showIncorrect && "border-red-500 bg-red-50",
                        showResult && !showCorrect && !showIncorrect && "opacity-50"
                      )}
                      onClick={() => handleSelect(option.id)}
                      disabled={showResult}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                          isSelected && !showResult && "border-blue-500 bg-blue-500",
                          showCorrect && "border-green-500 bg-green-500",
                          showIncorrect && "border-red-500 bg-red-500",
                          !isSelected && !showResult && "border-gray-300"
                        )}>
                          {(isSelected || showCorrect || showIncorrect) && (
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="text-sm">{option.text}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Result */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4"
                  >
                    <div className={cn(
                      "p-4 rounded-lg",
                      isCorrect ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
                    )}>
                      <p className={cn(
                        "font-medium mb-1",
                        isCorrect ? "text-green-800" : "text-amber-800"
                      )}>
                        {isCorrect ? "Correct!" : "Not quite right"}
                      </p>
                      <p className="text-sm text-gray-600">{question.explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 flex justify-end gap-2">
              {!showResult ? (
                <>
                  <Button variant="ghost" onClick={onSkip}>
                    Skip
                  </Button>
                  <Button onClick={handleSubmit} disabled={!selectedOption}>
                    Check Answer
                  </Button>
                </>
              ) : (
                <Button onClick={handleContinue}>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// READING PROGRESS INDICATOR (Floating)
// ============================================================================

interface ReadingProgressProps {
  progress: number; // 0-100
  className?: string;
}

export function ReadingProgressIndicator({
  progress,
  className
}: ReadingProgressProps) {
  return (
    <div className={cn("fixed top-0 left-0 right-0 z-40", className)}>
      <motion.div
        className="h-1 bg-violet-500"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ ease: "easeOut" }}
      />
    </div>
  );
}

// ============================================================================
// SECTION NAVIGATION (Bottom Bar)
// ============================================================================

interface SectionNavigationProps {
  currentIndex: number;
  totalSections: number;
  canGoBack: boolean;
  canGoForward: boolean;
  isCurrentCompleted: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  className?: string;
}

export function SectionNavigation({
  currentIndex,
  totalSections,
  canGoBack,
  canGoForward,
  isCurrentCompleted,
  onPrevious,
  onNext,
  onComplete,
  className
}: SectionNavigationProps) {
  const isLastSection = currentIndex === totalSections - 1;

  return (
    <div className={cn(
      "flex items-center justify-between p-4 border-t bg-white",
      className
    )}>
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={!canGoBack}
      >
        <ChevronLeft className="w-4 h-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalSections }).map((_, idx) => (
          <div
            key={idx}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              idx === currentIndex
                ? "bg-violet-500"
                : idx < currentIndex
                  ? "bg-green-500"
                  : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {isLastSection ? (
        <Button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700"
        >
          Complete Module
          <CheckCircle2 className="w-4 h-4 ml-1" />
        </Button>
      ) : (
        <Button onClick={isCurrentCompleted ? onNext : onComplete}>
          {isCurrentCompleted ? (
            <>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Mark Complete & Continue
              <ChevronRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      )}
    </div>
  );
}
