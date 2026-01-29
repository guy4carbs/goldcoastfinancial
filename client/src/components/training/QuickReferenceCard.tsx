/**
 * QuickReferenceCard - Displays downloadable quick reference cards
 *
 * Provides at-a-glance summaries of key module content including
 * do's/don'ts, key reminders, and compliance warnings.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  FileText,
  Download,
  Check,
  X,
  AlertTriangle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
  Printer
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  QuickReferenceCard as QRCType,
  QuickReferenceSection,
  getQuickReferenceCard,
  getQuickReferenceForModule,
  QUICK_REFERENCE_CARDS
} from "@/lib/trainingInfrastructure";

interface QuickReferenceCardProps {
  cardId?: string;
  moduleId?: string;
  variant?: "compact" | "full" | "sheet";
  className?: string;
}

export function QuickReferenceCard({
  cardId,
  moduleId,
  variant = "full",
  className
}: QuickReferenceCardProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Get card data
  const card = cardId
    ? getQuickReferenceCard(cardId)
    : moduleId
      ? getQuickReferenceForModule(moduleId)
      : undefined;

  if (!card) {
    return null;
  }

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(s => s !== title)
        : [...prev, title]
    );
  };

  // Compact variant - just a button that opens full card
  if (variant === "sheet") {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className={cn("gap-2", className)}>
            <FileText className="w-4 h-4" />
            Quick Reference
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              {card.title}
            </SheetTitle>
          </SheetHeader>
          <QuickReferenceCardContent card={card} />
        </SheetContent>
      </Sheet>
    );
  }

  // Compact variant - collapsible card
  if (variant === "compact") {
    return (
      <Card className={cn("border-violet-500/20", className)}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              {card.title}
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-gray-500 mb-3">{card.description}</p>

          {/* Collapsible sections */}
          {card.sections.slice(0, 2).map((section, idx) => (
            <div key={idx} className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full flex items-center justify-between py-1 text-left"
              >
                <span className="text-xs font-medium text-primary">
                  {section.title}
                </span>
                {expandedSections.includes(section.title) ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              <AnimatePresence>
                {expandedSections.includes(section.title) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-1 pb-2 space-y-1">
                      {section.items.slice(0, 4).map((item, itemIdx) => (
                        <div key={itemIdx} className="flex items-start gap-2 text-xs">
                          <span className="text-gray-400">•</span>
                          <span>
                            <strong>{item.label}:</strong> {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
            View full reference
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <Card className={cn("border-violet-500/20", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-violet-500" />
              {card.title}
            </CardTitle>
            {card.subtitle && (
              <p className="text-sm text-gray-500">{card.subtitle}</p>
            )}
          </div>
          <div className="flex gap-2">
            {card.downloadable && (
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="w-4 h-4" />
                PDF
              </Button>
            )}
            <Button variant="ghost" size="sm" className="gap-1">
              <Printer className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{card.description}</p>
      </CardHeader>
      <CardContent>
        <QuickReferenceCardContent card={card} />
      </CardContent>
    </Card>
  );
}

/**
 * Inner content component used by both full card and sheet
 */
function QuickReferenceCardContent({ card }: { card: QRCType }) {
  return (
    <div className="space-y-6">
      {/* Main Sections */}
      {card.sections.map((section, idx) => (
        <div key={idx}>
          <h4 className="font-semibold text-primary text-sm mb-3 pb-1 border-b border-gray-100">
            {section.title}
          </h4>
          <div className="space-y-2">
            {section.items.map((item, itemIdx) => (
              <div
                key={itemIdx}
                className={cn(
                  "flex items-start gap-3 p-2 rounded",
                  item.isHighlighted && "bg-violet-500/5 border-l-2 border-violet-500"
                )}
              >
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                  <p className="text-sm text-gray-600">{item.value}</p>
                </div>
                {item.isHighlighted && (
                  <Badge variant="secondary" className="text-[10px] bg-violet-500/10 text-violet-500">
                    Key
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Do's and Don'ts */}
      {(card.doList || card.dontList) && (
        <div className="grid md:grid-cols-2 gap-4">
          {card.doList && card.doList.length > 0 && (
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 text-sm mb-3 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Do
              </h4>
              <ul className="space-y-2">
                {card.doList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-green-700">
                    <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {card.dontList && card.dontList.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h4 className="font-semibold text-red-800 text-sm mb-3 flex items-center gap-2">
                <X className="w-4 h-4" />
                Don't
              </h4>
              <ul className="space-y-2">
                {card.dontList.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-red-700">
                    <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Key Reminders */}
      {card.keyReminders && card.keyReminders.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Key Reminders
          </h4>
          <ul className="space-y-2">
            {card.keyReminders.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-blue-700">
                <span className="text-blue-400 mt-1">•</span>
                <span className="font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Compliance Warnings */}
      {card.complianceWarnings && card.complianceWarnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 text-sm mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Compliance Warnings
          </h4>
          <ul className="space-y-2">
            {card.complianceWarnings.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          <span>From: {card.moduleName}</span>
        </div>
        <span>Updated: {card.lastUpdated}</span>
      </div>
    </div>
  );
}

/**
 * QuickReferenceButton - Floating action button to access quick reference
 */
interface QuickReferenceButtonProps {
  moduleId: string;
  position?: "bottom-right" | "bottom-left";
}

export function QuickReferenceButton({
  moduleId,
  position = "bottom-right"
}: QuickReferenceButtonProps) {
  const card = getQuickReferenceForModule(moduleId);

  if (!card) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 z-40",
        position === "bottom-right" ? "right-6" : "left-6"
      )}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button
            size="lg"
            className="rounded-full shadow-lg gap-2 bg-violet-500 text-primary hover:bg-violet-500/90"
          >
            <FileText className="w-5 h-5" />
            Quick Reference
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" />
              {card.title}
            </SheetTitle>
          </SheetHeader>
          <QuickReferenceCardContent card={card} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

/**
 * QuickReferenceList - List all available quick reference cards
 */
interface QuickReferenceListProps {
  className?: string;
}

export function QuickReferenceList({ className }: QuickReferenceListProps) {
  return (
    <div className={cn("grid md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
      {QUICK_REFERENCE_CARDS.map((card: QRCType) => (
        <Card
          key={card.id}
          className="hover:shadow-md transition-shadow cursor-pointer group"
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <FileText className="w-5 h-5 text-violet-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-primary truncate">
                  {card.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                  {card.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px]">
                    {card.moduleName}
                  </Badge>
                  {card.downloadable && (
                    <Badge variant="secondary" className="text-[10px]">
                      <Download className="w-2 h-2 mr-1" />
                      PDF
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
