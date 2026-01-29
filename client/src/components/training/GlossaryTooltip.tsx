/**
 * GlossaryTooltip - Displays term definitions on hover/click
 *
 * Used throughout training content to provide instant access to
 * term definitions without leaving the current context.
 */

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  AlertTriangle,
  Info,
  ChevronRight,
  ExternalLink,
  Search,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  GlossaryTerm,
  getGlossaryTerm,
  TermCategory,
  searchGlossary,
  getTermsForModule,
  GLOSSARY_TERMS
} from "@/lib/trainingInfrastructure";

interface GlossaryTooltipProps {
  termId: string;
  children: React.ReactNode;
  variant?: "inline" | "highlight" | "underline";
  showIcon?: boolean;
  expandable?: boolean;
}

const categoryColors: Record<TermCategory, string> = {
  product: "bg-emerald-100 text-emerald-700",
  compliance: "bg-red-100 text-red-700",
  underwriting: "bg-blue-100 text-blue-700",
  sales: "bg-orange-100 text-orange-700",
  regulatory: "bg-purple-100 text-purple-700",
  financial: "bg-amber-100 text-amber-700",
  company: "bg-cyan-100 text-cyan-700"
};

const importanceIcons: Record<string, React.ReactElement | null> = {
  critical: <AlertTriangle className="w-3 h-3 text-red-500" />,
  important: <Info className="w-3 h-3 text-amber-500" />,
  helpful: <BookOpen className="w-3 h-3 text-blue-500" />,
  standard: null
};

export function GlossaryTooltip({
  termId,
  children,
  variant = "underline",
  showIcon = false,
  expandable = true
}: GlossaryTooltipProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const term = getGlossaryTerm(termId);

  if (!term) {
    // If term not found, just render children without tooltip
    return <>{children}</>;
  }

  const triggerClassName = cn(
    "cursor-help transition-colors",
    variant === "underline" && "border-b border-dashed border-gray-400 hover:border-violet-500",
    variant === "highlight" && "bg-yellow-100/50 hover:bg-yellow-100 px-0.5 rounded",
    variant === "inline" && "text-violet-500 hover:text-primary"
  );

  // Simple tooltip for non-expandable
  if (!expandable) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={triggerClassName}>
            {children}
            {showIcon && <BookOpen className="w-3 h-3 inline ml-1 opacity-50" />}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="font-semibold text-sm">{term.term}</p>
          <p className="text-xs text-gray-600">{term.shortDefinition}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expandable popover with full details
  return (
    <Popover open={isExpanded} onOpenChange={setIsExpanded}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <span className={triggerClassName}>
              {children}
              {showIcon && <BookOpen className="w-3 h-3 inline ml-1 opacity-50" />}
            </span>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-xs">{term.shortDefinition}</p>
          <p className="text-[10px] text-gray-400 mt-1">Click for more details</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-semibold text-primary">{term.term}</h4>
              <Badge
                variant="secondary"
                className={cn("text-[10px] mt-1", categoryColors[term.category])}
              >
                {term.category}
              </Badge>
            </div>
            {term.complianceImportance && importanceIcons[term.complianceImportance]}
          </div>

          {/* Definition */}
          <p className="text-sm text-gray-700 mb-3">{term.fullDefinition}</p>

          {/* Examples */}
          {term.examples && term.examples.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Example:</p>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600 italic">"{term.examples[0].usage}"</p>
              </div>
            </div>
          )}

          {/* Compliance Note */}
          {term.complianceNote && (
            <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">{term.complianceNote}</p>
              </div>
            </div>
          )}

          {/* Common Mistakes */}
          {term.commonMistakes && term.commonMistakes.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-red-600 mb-1">Common Mistakes:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {term.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-red-400">•</span>
                    {mistake}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Related Terms */}
          {term.relatedTerms && term.relatedTerms.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Related terms:</p>
              <div className="flex flex-wrap gap-1">
                {term.relatedTerms.slice(0, 4).map(relatedId => {
                  const related = getGlossaryTerm(relatedId);
                  return related ? (
                    <Badge key={relatedId} variant="outline" className="text-[10px]">
                      {related.term}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/**
 * GlossarySearch - Search component for finding terms with built-in detail view
 */
interface GlossarySearchProps {
  onSelect?: (term: GlossaryTerm) => void;
  className?: string;
}

export function GlossarySearch({ onSelect, className }: GlossarySearchProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const results: GlossaryTerm[] = query.length >= 2 ? searchGlossary(query) : [];

  const handleSelectTerm = (term: GlossaryTerm) => {
    setSelectedTerm(term);
    setIsOpen(false);
    setQuery("");
    onSelect?.(term);
  };

  return (
    <>
      <div className={cn("relative", className)}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search glossary terms..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(e.target.value.length >= 2);
            }}
            onFocus={() => query.length >= 2 && setIsOpen(true)}
            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {isOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
            {results.map(term => (
              <button
                key={term.id}
                onClick={() => handleSelectTerm(term)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-primary">{term.term}</span>
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px]", categoryColors[term.category])}
                  >
                    {term.category}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  {term.shortDefinition}
                </p>
              </button>
            ))}
          </div>
        )}

        {isOpen && query.length >= 2 && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
            <p className="text-sm text-gray-500 text-center">No terms found for "{query}"</p>
          </div>
        )}
      </div>

      {/* Term Detail Dialog */}
      <Dialog open={!!selectedTerm} onOpenChange={() => setSelectedTerm(null)}>
        <DialogContent className="sm:max-w-lg">
          {selectedTerm && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    categoryColors[selectedTerm.category]?.split(' ')[0] || "bg-gray-100"
                  )}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">{selectedTerm.term}</DialogTitle>
                    <Badge
                      variant="secondary"
                      className={cn("text-[10px] mt-1", categoryColors[selectedTerm.category])}
                    >
                      {selectedTerm.category}
                    </Badge>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedTerm.fullDefinition}
                  </p>
                </div>

                {selectedTerm.complianceImportance && selectedTerm.complianceImportance !== 'standard' && (
                  <div className={cn(
                    "flex items-start gap-2 p-3 rounded-lg",
                    selectedTerm.complianceImportance === 'critical'
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  )}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p className="text-xs">
                      {selectedTerm.complianceImportance === 'critical'
                        ? "This is a critical compliance term. Misunderstanding or misuse could result in regulatory action."
                        : "This is an important compliance-related term to understand."}
                    </p>
                  </div>
                )}

                {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Related Terms</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTerm.relatedTerms.map(relatedId => {
                        const relatedTerm = getGlossaryTerm(relatedId);
                        return relatedTerm ? (
                          <Button
                            key={relatedId}
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => setSelectedTerm(relatedTerm)}
                          >
                            {relatedTerm.term}
                            <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * GlossaryPanel - Full glossary panel for sidebar or modal
 */
interface GlossaryPanelProps {
  moduleId?: string;
  className?: string;
}

export function GlossaryPanel({ moduleId, className }: GlossaryPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<TermCategory | "all">("all");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const terms: GlossaryTerm[] = moduleId
    ? getTermsForModule(moduleId)
    : GLOSSARY_TERMS;

  const filteredTerms = selectedCategory === "all"
    ? terms
    : terms.filter((t: GlossaryTerm) => t.category === selectedCategory);

  const categories: TermCategory[] = [
    "product", "compliance", "underwriting", "sales", "regulatory", "financial", "company"
  ];

  return (
    <div className={cn("bg-white rounded-lg border border-gray-200", className)}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-violet-500" />
          <h3 className="font-semibold text-primary">Glossary</h3>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          <Badge
            variant={selectedCategory === "all" ? "default" : "outline"}
            className="cursor-pointer text-xs"
            onClick={() => setSelectedCategory("all")}
          >
            All
          </Badge>
          {categories.map(cat => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-xs capitalize",
                selectedCategory === cat && categoryColors[cat]
              )}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Terms List */}
      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
        {filteredTerms.map((term: GlossaryTerm) => (
          <button
            key={term.id}
            onClick={() => setSelectedTerm(selectedTerm?.id === term.id ? null : term)}
            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-primary">{term.term}</span>
              <ChevronRight
                className={cn(
                  "w-4 h-4 text-gray-400 transition-transform",
                  selectedTerm?.id === term.id && "rotate-90"
                )}
              />
            </div>

            {selectedTerm?.id === term.id && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-700">{term.fullDefinition}</p>
                {term.complianceNote && (
                  <div className="mt-2 flex items-start gap-1 text-xs text-amber-700">
                    <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{term.complianceNote}</span>
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
