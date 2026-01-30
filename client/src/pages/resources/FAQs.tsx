import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TrustIndicators, { CarrierStrip } from "@/components/TrustIndicators";
import { useAnalytics, useScrollTracking } from "@/hooks/useAnalytics";
import {
  HelpCircle,
  Search,
  ChevronDown,
  Shield,
  DollarSign,
  FileText,
  Clock,
  Heart,
  Phone,
  ArrowRight,
  MessageCircle,
  Users,
  Stethoscope,
  BadgeCheck,
  Scale,
  Sparkles,
  History
} from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Popular search terms for FAQ
const popularSearchTerms = [
  "term vs whole life",
  "how much coverage",
  "medical exam",
  "cost",
  "beneficiary",
  "claims"
];

export default function FAQs() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Analytics tracking
  const { trackFAQExpanded } = useAnalytics();
  useScrollTracking();

  // Fetch FAQs from API with fallback to hardcoded data
  const { data: apiFaqs } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const res = await fetch("/api/content/faqs");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false,
  });

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const categories = [
    { id: "all", name: "All Questions", icon: HelpCircle },
    { id: "basics", name: "Basics", icon: FileText },
    { id: "types", name: "Policy Types", icon: Scale },
    { id: "cost", name: "Cost & Pricing", icon: DollarSign },
    { id: "coverage", name: "Coverage", icon: Shield },
    { id: "health", name: "Health & Medical", icon: Stethoscope },
    { id: "process", name: "Application", icon: Clock },
    { id: "beneficiaries", name: "Beneficiaries", icon: Users },
    { id: "claims", name: "Claims", icon: BadgeCheck }
  ];

  const faqs = [
    // ==================== BASICS ====================
    {
      id: 1,
      category: "basics",
      question: "What is life insurance?",
      answer: "Life insurance pays a tax-free lump sum to your beneficiaries when you die. It replaces your income, pays off debts, and keeps your family financially secure."
    },
    {
      id: 2,
      category: "basics",
      question: "Do I really need life insurance?",
      answer: "If anyone depends on your income—spouse, children, aging parents—yes. It ensures they can pay the mortgage, cover daily expenses, and maintain their lifestyle without your paycheck."
    },
    {
      id: 3,
      category: "basics",
      question: "When should I buy life insurance?",
      answer: "As soon as possible. Rates increase 8-10% every year you age. A policy at 30 costs about half what it costs at 40. Plus, health issues can make coverage expensive or unavailable."
    },
    {
      id: 4,
      category: "basics",
      question: "Do I need life insurance if I'm single with no kids?",
      answer: "Maybe not much, but consider: Do you have co-signed loans? Aging parents you support? Want to lock in low rates for future needs? Even a small policy now can be smart planning."
    },
    {
      id: 5,
      category: "basics",
      question: "Is employer life insurance enough?",
      answer: "Usually not. Most employer policies only cover 1-2x your salary, and you lose it if you leave. Get your own policy that stays with you regardless of job changes."
    },
    {
      id: 6,
      category: "basics",
      question: "What's a beneficiary?",
      answer: "The person or entity who receives your death benefit. You name primary beneficiaries (first in line) and contingent beneficiaries (backup). You can name multiple people with percentage splits."
    },

    // ==================== POLICY TYPES ====================
    {
      id: 7,
      category: "types",
      question: "What's the difference between term and whole life?",
      answer: "Term = temporary coverage (10-30 years), lower cost, no cash value. Whole life = lifetime coverage, builds cash value, costs 5-10x more. Most families start with term."
    },
    {
      id: 8,
      category: "types",
      question: "What is term life insurance?",
      answer: "Pure protection for a set period (10, 20, or 30 years). If you die during the term, beneficiaries get the payout. If you outlive it, coverage ends. Most affordable option."
    },
    {
      id: 9,
      category: "types",
      question: "What is whole life insurance?",
      answer: "Permanent coverage that lasts your entire life. Part of your premium builds cash value you can borrow against. Higher cost but guaranteed payout whenever you die."
    },
    {
      id: 10,
      category: "types",
      question: "What is universal life insurance?",
      answer: "Permanent coverage with flexible premiums and death benefits. You can adjust payments and coverage as your needs change. More complex than term or whole life."
    },
    {
      id: 11,
      category: "types",
      question: "What is IUL (Indexed Universal Life)?",
      answer: "Universal life where cash value growth is tied to a stock market index (like S&P 500). Has caps and floors—you won't lose money but gains are limited. Good for tax-advantaged savings."
    },
    {
      id: 12,
      category: "types",
      question: "What is final expense insurance?",
      answer: "Small whole life policy ($5K-$50K) designed to cover funeral costs and end-of-life expenses. Easier to qualify for, popular with seniors."
    },
    {
      id: 13,
      category: "types",
      question: "Which type should I choose?",
      answer: "Most people: term life (affordable, covers key years). High earners who've maxed 401k/IRA: consider adding whole/IUL for tax benefits. Seniors: final expense. We can help you decide."
    },

    // ==================== COST & PRICING ====================
    {
      id: 14,
      category: "cost",
      question: "How much does life insurance cost?",
      answer: "Healthy 30-year-old: ~$25/month for $500K term. Healthy 40-year-old: ~$40/month. Rates vary by health, tobacco use, and coverage amount. Whole life costs 5-10x more than term."
    },
    {
      id: 15,
      category: "cost",
      question: "What factors affect my premium?",
      answer: "Age (biggest factor), health conditions, tobacco use, coverage amount, term length, gender, occupation, and hobbies. Each year you wait adds 8-10% to your rate."
    },
    {
      id: 16,
      category: "cost",
      question: "Can I lock in my rate?",
      answer: "Yes! Term life rates are locked for the entire term (10, 20, or 30 years). Even if your health declines, your rate stays the same."
    },
    {
      id: 17,
      category: "cost",
      question: "Do rates ever increase?",
      answer: "Not during your term period. After a term policy expires, you can usually renew but at much higher rates. Whole life rates are typically level for life."
    },
    {
      id: 18,
      category: "cost",
      question: "How do I pay for life insurance?",
      answer: "Monthly automatic bank draft is most common. You can also pay quarterly, semi-annually, or annually. Annual payments often get a 2-5% discount."
    },
    {
      id: 19,
      category: "cost",
      question: "What if I can't afford my payments?",
      answer: "Contact your insurer immediately. Options include reducing coverage, switching to a cheaper policy, or using cash value (if whole life) to cover premiums. Don't let it lapse."
    },

    // ==================== COVERAGE ====================
    {
      id: 20,
      category: "coverage",
      question: "How much coverage do I need?",
      answer: "Quick rule: 10-12x your annual income. Better method: Add up debts + income replacement (10-15 years) + future expenses (college) - existing savings. We have a calculator to help."
    },
    {
      id: 21,
      category: "coverage",
      question: "Can I have multiple life insurance policies?",
      answer: "Yes, and it's common. Many people \"ladder\" policies—like a 30-year term for the mortgage + 20-year for income replacement. There's no limit to how many you can own."
    },
    {
      id: 22,
      category: "coverage",
      question: "Can I increase my coverage later?",
      answer: "With a guaranteed insurability rider, yes—at certain life events (marriage, baby) without a new exam. Otherwise, you'd apply for a new policy and go through underwriting again."
    },
    {
      id: 23,
      category: "coverage",
      question: "Can I decrease my coverage?",
      answer: "Yes. You can reduce your death benefit to lower premiums. Contact your insurer to make the change. With term, you can also let the policy lapse and get a smaller new one."
    },
    {
      id: 24,
      category: "coverage",
      question: "What's NOT covered by life insurance?",
      answer: "Suicide within first 2 years, death during illegal activity, fraud on application. Some policies exclude extreme sports unless disclosed. Most natural and accidental deaths are covered."
    },
    {
      id: 25,
      category: "coverage",
      question: "What are riders?",
      answer: "Optional add-ons for extra protection. Common ones: accelerated death benefit (access funds if terminally ill), waiver of premium (if disabled), child rider (covers your kids)."
    },

    // ==================== HEALTH & MEDICAL ====================
    {
      id: 26,
      category: "health",
      question: "Can I get life insurance with health problems?",
      answer: "Usually yes. Many conditions (diabetes, high blood pressure, etc.) are insurable at higher rates. Some companies specialize in certain conditions. Guaranteed issue requires no health questions."
    },
    {
      id: 27,
      category: "health",
      question: "What's the medical exam like?",
      answer: "A paramedical professional comes to your home/office. Takes 20-30 minutes: blood draw, urine sample, blood pressure, height/weight, health questions. Results go to the insurer."
    },
    {
      id: 28,
      category: "health",
      question: "Can I get life insurance without a medical exam?",
      answer: "Yes. No-exam options: Accelerated underwriting (data-based, for healthy people), Simplified issue (health questions only), Guaranteed issue (no questions, auto-approval). Higher premiums."
    },
    {
      id: 29,
      category: "health",
      question: "How does tobacco use affect my rate?",
      answer: "Smokers pay 2-3x more. Most insurers require 12 months tobacco-free for non-smoker rates. This includes cigarettes, cigars, vaping, nicotine patches, and chewing tobacco."
    },
    {
      id: 30,
      category: "health",
      question: "Do I have to disclose my medical history?",
      answer: "Yes, be 100% honest. Insurers verify through medical records, prescription databases, and the MIB. Lying can void your policy and result in denied claims."
    },
    {
      id: 31,
      category: "health",
      question: "What are rate classes?",
      answer: "Categories based on health: Preferred Plus (best rates, excellent health), Preferred (very good), Standard (average), Substandard (health issues). Better class = lower premium."
    },

    // ==================== APPLICATION PROCESS ====================
    {
      id: 32,
      category: "process",
      question: "How do I apply for life insurance?",
      answer: "Start with quotes to compare rates. Choose a policy, complete the application (online or with an agent), do medical exam if required, wait for underwriting, then sign and pay."
    },
    {
      id: 33,
      category: "process",
      question: "How long does approval take?",
      answer: "No-exam policies: days to 1 week. Accelerated underwriting: 1-2 weeks. Traditional with exam: 3-6 weeks. Complex health history: 6-8 weeks."
    },
    {
      id: 34,
      category: "process",
      question: "What if I'm declined?",
      answer: "One company's decline doesn't mean all will. Different insurers have different guidelines. We work with many carriers and can often find coverage elsewhere. Guaranteed issue is always available."
    },
    {
      id: 35,
      category: "process",
      question: "What's underwriting?",
      answer: "The process where insurers evaluate your risk. They review your application, medical exam, health records, prescription history, driving record, and more to determine your rate class."
    },
    {
      id: 36,
      category: "process",
      question: "When does coverage start?",
      answer: "Once your policy is issued and you pay the first premium. Some policies offer temporary coverage during the application process for an additional fee."
    },
    {
      id: 37,
      category: "process",
      question: "What's the free look period?",
      answer: "10-30 days (varies by state) after receiving your policy where you can cancel for a full refund, no questions asked. Review your policy carefully during this time."
    },

    // ==================== BENEFICIARIES ====================
    {
      id: 38,
      category: "beneficiaries",
      question: "Who can I name as a beneficiary?",
      answer: "Anyone: spouse, children, parents, friends, trusts, charities, your estate. You can name multiple beneficiaries with percentage splits (e.g., spouse 60%, kids 40%)."
    },
    {
      id: 39,
      category: "beneficiaries",
      question: "What's a contingent beneficiary?",
      answer: "Your backup. If your primary beneficiary dies before you or can't be found, the contingent beneficiary receives the death benefit. Always name one to avoid probate."
    },
    {
      id: 40,
      category: "beneficiaries",
      question: "Can I name a minor child as beneficiary?",
      answer: "Technically yes, but don't. Minors can't legally receive funds, so courts appoint a guardian—costly and time-consuming. Instead, set up a trust or name an adult custodian."
    },
    {
      id: 41,
      category: "beneficiaries",
      question: "How often should I update my beneficiaries?",
      answer: "Review annually and after major life events: marriage, divorce, birth of a child, death of a beneficiary. Outdated designations override your will—your ex could get the money."
    },
    {
      id: 42,
      category: "beneficiaries",
      question: "Can I change my beneficiary?",
      answer: "Yes, anytime (unless it's an irrevocable beneficiary, which is rare). Contact your insurer or log into your account to make changes. No fee or health questions required."
    },

    // ==================== CLAIMS ====================
    {
      id: 43,
      category: "claims",
      question: "How do beneficiaries file a claim?",
      answer: "Call the insurance company with the policy number. Submit a death certificate (certified copy) and completed claim form. Most claims are paid within 1-2 weeks."
    },
    {
      id: 44,
      category: "claims",
      question: "Is the death benefit taxable?",
      answer: "No. Life insurance death benefits are income tax-free for beneficiaries. Estate taxes may apply for very large estates (over $12M), but this doesn't affect most families."
    },
    {
      id: 45,
      category: "claims",
      question: "Can a claim be denied?",
      answer: "Rarely, but yes: for lying on the application, death during the contestability period (first 2 years) with fraud, policy lapse from non-payment, or excluded activities."
    },
    {
      id: 46,
      category: "claims",
      question: "What's the contestability period?",
      answer: "The first 2 years of your policy. During this time, insurers can investigate claims more thoroughly and deny for material misrepresentation. After 2 years, it's much harder to deny."
    },
    {
      id: 47,
      category: "claims",
      question: "How is the death benefit paid?",
      answer: "Beneficiaries choose: lump sum (most common), installments over time, or left with the insurer in an interest-bearing account. Lump sum is usually best for flexibility."
    },
    {
      id: 48,
      category: "claims",
      question: "What if there's no beneficiary named?",
      answer: "The death benefit goes to your estate and through probate—slow, public, and potentially costly. Always name primary AND contingent beneficiaries to avoid this."
    }
  ];

  // Use API data if available, otherwise fall back to hardcoded data
  const activeFaqs = useMemo(() => {
    if (apiFaqs && apiFaqs.length > 0) {
      return apiFaqs.map((faq: any, index: number) => ({
        id: faq.id || index + 1,
        category: faq.category,
        question: faq.question,
        answer: faq.answer,
      }));
    }
    return faqs;
  }, [apiFaqs, faqs]);

  const filteredFaqs = activeFaqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || id;

  // Get search suggestions based on current query
  const getSearchSuggestions = () => {
    if (!searchQuery.trim()) {
      return popularSearchTerms.map(term => ({
        type: "term" as const,
        text: term,
        id: 0,
        category: ""
      }));
    }

    const query = searchQuery.toLowerCase();
    const matchingFaqs = activeFaqs
      .filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
      .slice(0, 5)
      .map(faq => ({
        type: "faq" as const,
        text: faq.question,
        id: faq.id,
        category: faq.category
      }));

    const matchingTerms = popularSearchTerms
      .filter(term => term.toLowerCase().includes(query) && term.toLowerCase() !== query)
      .slice(0, 2)
      .map(term => ({
        type: "term" as const,
        text: term,
        id: 0,
        category: ""
      }));

    return [...matchingFaqs, ...matchingTerms];
  };

  const searchSuggestions = getSearchSuggestions();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || searchSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < searchSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : searchSuggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < searchSuggestions.length) {
          const suggestion = searchSuggestions[highlightedIndex];
          if (suggestion.type === "faq") {
            setSearchQuery(suggestion.text);
            setOpenFaq(suggestion.id);
          } else {
            setSearchQuery(suggestion.text);
          }
          setIsSearchFocused(false);
          setHighlightedIndex(-1);
        }
        break;
      case "Escape":
        setIsSearchFocused(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: { type: "faq" | "term"; text: string; id: number }) => {
    if (suggestion.type === "faq") {
      setSearchQuery(suggestion.text);
      setOpenFaq(suggestion.id);
    } else {
      setSearchQuery(suggestion.text);
      inputRef.current?.focus();
    }
    setIsSearchFocused(false);
    setHighlightedIndex(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#fffaf3] via-white to-[#f5f0e8] pt-24 pb-24 overflow-visible">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HelpCircle className="w-4 h-4" />
              Help Center
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6 text-balance">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Find answers to common questions about life insurance.
            </p>

            {/* Search Bar with Suggestions */}
            <div ref={searchRef} className="relative w-full max-w-xl mx-auto z-[100]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />

              {/* Search Suggestions Dropdown */}
              <AnimatePresence>
                {isSearchFocused && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[200]"
                  >
                    {/* Header label */}
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                      <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                        {searchQuery.trim() ? (
                          <>
                            <Search className="w-3 h-3" />
                            Suggestions
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3" />
                            Popular Searches
                          </>
                        )}
                      </span>
                    </div>

                    {/* Suggestions list */}
                    <div className="max-h-80 overflow-y-auto">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.type}-${suggestion.text}`}
                          onClick={() => handleSuggestionClick(suggestion)}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                            highlightedIndex === index
                              ? "bg-primary/5"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {suggestion.type === "faq" ? (
                            <>
                              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                <HelpCircle className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {suggestion.text}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {getCategoryName(suggestion.category)}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            </>
                          ) : (
                            <>
                              <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
                                <History className="w-4 h-4 text-gray-500" />
                              </div>
                              <span className="text-sm text-gray-700 flex-1">
                                {suggestion.text}
                              </span>
                              <span className="text-xs text-gray-400">Search term</span>
                            </>
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Keyboard hint */}
                    <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↑</kbd>
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↓</kbd>
                        to navigate
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">↵</kbd>
                        to select
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-200 rounded text-gray-600 font-mono">esc</kbd>
                        to close
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <TrustIndicators variant="inline" />

      {/* Categories */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            key={`${selectedCategory}-${searchQuery}`}
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="max-w-4xl mx-auto space-y-4"
          >
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                variants={fadeInUp}
                className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200"
              >
                <button
                  onClick={() => {
                    const isOpening = openFaq !== faq.id;
                    setOpenFaq(isOpening ? faq.id : null);
                    if (isOpening) {
                      trackFAQExpanded(faq.question, faq.category);
                    }
                  }}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-200 ${
                      openFaq === faq.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="px-6 pb-6 text-gray-600 leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No questions found matching your search.</p>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Carrier Partners */}
      <CarrierStrip />

      {/* Still Have Questions CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-primary rounded-2xl p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-4">
                    Still Have Questions?
                  </h2>
                  <p className="text-white/80 mb-6">
                    Our team is here to help. Get personalized answers from a licensed insurance professional.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <a href="tel:6307780800">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto bg-white text-primary px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                      >
                        <Phone className="w-5 h-5" /> (630) 778-0800
                      </motion.button>
                    </a>
                    <Link href="/contact">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto bg-white/10 text-white border border-white/30 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" /> Send a Message
                      </motion.button>
                    </Link>
                  </div>
                </div>
                <div className="hidden md:flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 bg-violet-500/20 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">?</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-[#fffaf3]">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-balance">
              Helpful Resources
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-gray-600">
              Learn more about life insurance with these guides.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto"
          >
            {[
              { title: "Life Insurance 101", description: "Complete beginner's guide", href: "/resources/life-insurance-101", icon: FileText },
              { title: "Coverage Calculator", description: "Find your ideal coverage", href: "/resources/calculators", icon: DollarSign },
              { title: "Get a Quote", description: "See your rates in minutes", href: "/quote", icon: ArrowRight }
            ].map((link, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Link href={link.href}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer"
                  >
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                      <link.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{link.title}</h3>
                    <p className="text-gray-600 text-sm">{link.description}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
