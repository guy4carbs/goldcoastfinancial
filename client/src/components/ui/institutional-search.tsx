import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, FileText, Users, Building2, Newspaper } from "lucide-react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";

interface SearchResult {
  title: string;
  description: string;
  path: string;
  category: "page" | "content" | "news" | "document";
  icon: typeof FileText;
}

// Searchable content index
const searchIndex: SearchResult[] = [
  {
    title: "Overview",
    description: "Gold Coast Financial holding company overview and mission",
    path: "/goldcoastfinancial2",
    category: "page",
    icon: Building2,
  },
  {
    title: "About Us",
    description: "Leadership team, company history, and values",
    path: "/goldcoastfinancial2/about",
    category: "page",
    icon: Users,
  },
  {
    title: "Portfolio Companies",
    description: "Heritage Life Solutions and portfolio expansion plans",
    path: "/goldcoastfinancial2/portfolio",
    category: "page",
    icon: Building2,
  },
  {
    title: "Contact",
    description: "Corporate inquiries, partnership opportunities, meeting scheduling",
    path: "/goldcoastfinancial2/contact",
    category: "page",
    icon: FileText,
  },
  {
    title: "News & Updates",
    description: "Corporate announcements and company milestones",
    path: "/goldcoastfinancial2/news",
    category: "news",
    icon: Newspaper,
  },
  {
    title: "Investor Relations",
    description: "Capital philosophy, metrics, and partnership opportunities",
    path: "/goldcoastfinancial2/investors",
    category: "page",
    icon: Building2,
  },
  {
    title: "Careers",
    description: "Job opportunities and company culture",
    path: "/goldcoastfinancial2/careers",
    category: "page",
    icon: Users,
  },
  {
    title: "Blog & Insights",
    description: "Industry perspectives and thought leadership",
    path: "/goldcoastfinancial2/blog",
    category: "content",
    icon: FileText,
  },
  {
    title: "Media Center",
    description: "Press resources, brand assets, and media contact",
    path: "/goldcoastfinancial2/media",
    category: "content",
    icon: FileText,
  },
  {
    title: "Privacy Policy",
    description: "Data protection and privacy practices",
    path: "/goldcoastfinancial2/privacy",
    category: "document",
    icon: FileText,
  },
  {
    title: "Terms of Use",
    description: "Website terms and conditions",
    path: "/goldcoastfinancial2/terms",
    category: "document",
    icon: FileText,
  },
  {
    title: "Heritage Life Solutions",
    description: "Independent life insurance brokerage subsidiary",
    path: "/heritage",
    category: "page",
    icon: Building2,
  },
];

interface InstitutionalSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstitutionalSearch({ isOpen, onClose }: InstitutionalSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(" ");
    const filtered = searchIndex.filter((item) => {
      const searchText = `${item.title} ${item.description}`.toLowerCase();
      return searchTerms.every((term) => searchText.includes(term));
    });

    setResults(filtered);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleResultClick = () => {
    setQuery("");
    onClose();
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "page": return "Page";
      case "content": return "Content";
      case "news": return "News";
      case "document": return "Document";
      default: return "Result";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Search Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl mx-auto z-50 px-4"
          >
            <div className="bg-white rounded-lg shadow-2xl border border-border/60 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center border-b border-border/60 px-4">
                <Search className="w-5 h-5 text-muted-foreground shrink-0" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search pages, content, documents..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-lg py-4"
                  aria-label="Search"
                />
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded-sm transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() && results.length === 0 && (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No results found for "{query}"</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try searching for pages, topics, or documents
                    </p>
                  </div>
                )}

                {results.length > 0 && (
                  <ul className="py-2">
                    {results.map((result, index) => (
                      <li key={result.path}>
                        <Link
                          href={result.path}
                          onClick={handleResultClick}
                          className="flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-sm bg-[hsl(348,65%,20%)]/5 flex items-center justify-center shrink-0">
                            <result.icon className="w-5 h-5 text-[hsl(348,65%,25%)]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-primary truncate">{result.title}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {getCategoryLabel(result.category)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{result.description}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {!query.trim() && (
                  <div className="p-6">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Quick Links</p>
                    <div className="grid grid-cols-2 gap-2">
                      {searchIndex.slice(0, 6).map((item) => (
                        <Link
                          key={item.path}
                          href={item.path}
                          onClick={handleResultClick}
                          className="flex items-center gap-2 p-2 rounded-sm hover:bg-muted/50 transition-colors text-sm text-muted-foreground hover:text-primary"
                        >
                          <item.icon className="w-4 h-4" />
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-border/60 px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">ESC</kbd>
                    to close
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">↵</kbd>
                    to select
                  </span>
                </div>
                <span>Gold Coast Financial Search</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Search trigger button component
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-primary border border-border/60 rounded-sm hover:border-primary/30 transition-all"
      aria-label="Open search"
    >
      <Search className="w-4 h-4" />
      <span className="hidden sm:inline">Search</span>
      <kbd className="hidden sm:inline px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono ml-2">⌘K</kbd>
    </button>
  );
}
