import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, FileText, BookOpen, Calculator, HelpCircle, Users, Briefcase } from "lucide-react";
import { useLocation } from "wouter";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  title: string;
  description: string;
  href: string;
  category: string;
  icon: React.ElementType;
}

const searchablePages: SearchResult[] = [
  // Products
  { title: "Term Life Insurance", description: "Affordable coverage for a specific period", href: "/life-insurance/term", category: "Products", icon: FileText },
  { title: "Whole Life Insurance", description: "Permanent coverage with cash value growth", href: "/life-insurance/whole", category: "Products", icon: FileText },
  { title: "Indexed Universal Life (IUL)", description: "Flexible coverage with market-linked growth", href: "/life-insurance/iul", category: "Products", icon: FileText },
  { title: "Final Expense Insurance", description: "Coverage for end-of-life costs", href: "/life-insurance/final-expense", category: "Products", icon: FileText },
  { title: "Mortgage Protection", description: "Protect your home and family", href: "/life-insurance/mortgage-protection", category: "Products", icon: FileText },
  { title: "Fixed Annuities", description: "Guaranteed interest rates for retirement", href: "/annuities/fixed", category: "Products", icon: FileText },
  { title: "Indexed Annuities", description: "Market-linked growth with protection", href: "/annuities/indexed", category: "Products", icon: FileText },
  { title: "All Products", description: "Browse all insurance products", href: "/products", category: "Products", icon: FileText },

  // Resources
  { title: "Life Insurance 101", description: "Learn the basics of life insurance", href: "/resources/life-insurance-101", category: "Resources", icon: BookOpen },
  { title: "Blog", description: "Articles and insights on insurance", href: "/resources/blog", category: "Resources", icon: BookOpen },
  { title: "FAQs", description: "Frequently asked questions", href: "/resources/faqs", category: "Resources", icon: HelpCircle },
  { title: "Calculators", description: "Coverage and premium calculators", href: "/resources/calculators", category: "Resources", icon: Calculator },
  { title: "Risk Strategy", description: "Our approach to protecting your future", href: "/risk-strategy", category: "Resources", icon: FileText },

  // Company
  { title: "About Us", description: "Learn about Heritage Life Solutions", href: "/about", category: "Company", icon: Users },
  { title: "Meet the Founders", description: "Get to know our leadership team", href: "/about/founders", category: "Company", icon: Users },
  { title: "Careers", description: "Join our team", href: "/careers", category: "Company", icon: Briefcase },
  { title: "Contact Us", description: "Get in touch with us", href: "/contact", category: "Company", icon: Users },
  { title: "Become an Agent", description: "Partner with Heritage Life Solutions", href: "/agents/become-an-agent", category: "Company", icon: Briefcase },

  // Tools
  { title: "Get a Quote", description: "Get your free insurance quote", href: "/quote", category: "Tools", icon: Calculator },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().split(" ");
    const filtered = searchablePages.filter((page) => {
      const searchText = `${page.title} ${page.description} ${page.category}`.toLowerCase();
      return searchTerms.every((term) => searchText.includes(term));
    });

    setResults(filtered.slice(0, 8));
  }, [query]);

  const handleSelect = (href: string) => {
    setLocation(href);
    setQuery("");
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Group results by category
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for products, resources, pages..."
                  className="flex-1 text-lg outline-none placeholder-gray-400"
                />
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {query.trim() === "" ? (
                  <div className="p-6 text-center text-gray-500">
                    <Search className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Start typing to search...</p>
                    <p className="text-sm mt-1">Search products, resources, and more</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <p>No results found for "{query}"</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {Object.entries(groupedResults).map(([category, items]) => (
                      <div key={category} className="mb-4">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                          {category}
                        </p>
                        {items.map((result) => (
                          <button
                            key={result.href}
                            onClick={() => handleSelect(result.href)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group"
                          >
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <result.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{result.title}</p>
                              <p className="text-sm text-gray-500 truncate">{result.description}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">↵</kbd> to select</span>
                  <span><kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-200">esc</kbd> to close</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
