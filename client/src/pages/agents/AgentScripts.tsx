import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Star,
  StarOff,
  Phone,
  BookOpen,
  Clock,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState, AgentPageHero } from "@/components/agent/primitives";
import { RADIUS, SHADOW, MOTION, TYPE, COLORS, fadeInUp, staggerContainer, scaleIn, spacing } from '@/lib/heritageDesignSystem';

interface Script {
  id: string;
  title: string;
  category: ScriptCategory;
  description: string;
  pdfUrl?: string; // Will be populated with actual PDF URLs later
  isFavorite: boolean;
  usageCount: number;
  lastUsed: string;
}

type ScriptCategory = 'phone';

const categoryConfig: Record<ScriptCategory, { label: string; icon: typeof Phone; color: string; gradient: string }> = {
  phone: { label: 'Phone Script', icon: Phone, color: 'bg-violet-500/10 text-violet-600', gradient: 'from-violet-400 to-violet-500' },
};

// Company-wide sales scripts — provided by Heritage Life Solutions
const COMPANY_SCRIPTS: Script[] = [
  {
    id: 'cold-call-intro',
    title: 'Cold Call — Initial Contact',
    category: 'phone',
    description: 'Opening script for first-time cold calls to new leads. Establishes rapport and qualifies interest.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'warm-follow-up',
    title: 'Warm Follow-Up Call',
    category: 'phone',
    description: 'Script for following up with leads who previously showed interest or requested information.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'appointment-setting',
    title: 'Appointment Setting',
    category: 'phone',
    description: 'Script to convert an interested lead into a scheduled appointment for a needs analysis.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'needs-analysis',
    title: 'Needs Analysis & Fact-Finding',
    category: 'phone',
    description: 'Guided questions to uncover the prospect\'s financial situation, family needs, and coverage gaps.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'product-presentation',
    title: 'Product Presentation — Life Insurance',
    category: 'phone',
    description: 'Structured presentation for term life, whole life, IUL, and final expense products.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'objection-handling',
    title: 'Objection Handling',
    category: 'phone',
    description: 'Responses to common objections: "I need to think about it," "I can\'t afford it," "I already have coverage."',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'closing-script',
    title: 'Closing & Application',
    category: 'phone',
    description: 'Trial closes, assumptive closes, and transition into the application process.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'referral-request',
    title: 'Referral Request',
    category: 'phone',
    description: 'Post-sale script to ask for warm referrals from satisfied clients.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'annual-review',
    title: 'Annual Policy Review Call',
    category: 'phone',
    description: 'Script for reaching out to existing clients for their annual policy review and cross-sell opportunities.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
  {
    id: 'recruiting-call',
    title: 'Recruiting — Agent Opportunity Call',
    category: 'phone',
    description: 'Script for recruiting potential agents into your downline. Covers the Heritage opportunity and compensation.',
    isFavorite: false,
    usageCount: 0,
    lastUsed: '',
  },
];

function formatRelativeLastUsed(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function AgentScripts() {
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(
    () => new Set(COMPANY_SCRIPTS.filter(s => s.isFavorite).map(s => s.id))
  );
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const filteredScripts = useMemo(() => COMPANY_SCRIPTS.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }), [searchQuery]);

  const stats = useMemo(() => ({
    total: filteredScripts.length,
    favorites: filteredScripts.filter(s => favorites.has(s.id)).length,
  }), [filteredScripts, favorites]);

  return (
    <AgentLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="space-y-6 pb-20 lg:pb-0"
      >
        {/* Hero Card */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={FileText}
            title="Sales Scripts"
            subtitle="Proven scripts to help you close more deals"
          />
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {[
            { label: 'Total Scripts', value: stats.total, icon: BookOpen },
            { label: 'Favorites', value: stats.favorites, icon: Star },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
              transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
            >
              <Card
                className="border-0 transition-all overflow-hidden"
                style={{
                  borderRadius: RADIUS.card,
                  boxShadow: SHADOW.card,
                  background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #f59e0b 100%)",
                }}
              >
                <CardContent className="p-4 relative">
                  {/* Background pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px)`,
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div className="relative flex items-center gap-3">
                    <div
                      className="w-10 h-10 bg-white/20 backdrop-blur-sm flex items-center justify-center"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <stat.icon className="w-5 h-5 text-white" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-xs text-white/80">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeInUp}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <Input
              placeholder="Search scripts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 border-gray-200 focus:border-violet-400 focus:ring-violet-400"
              style={{ borderRadius: RADIUS.input }}
              aria-label="Search scripts by title or description"
            />
          </div>
        </motion.div>

        {/* Scripts List */}
        <motion.div variants={fadeInUp} className="space-y-4">
          {filteredScripts.length === 0 ? (
            <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardContent className="p-0">
                {searchQuery ? (
                  <div className="text-center py-12">
                    <Inbox className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-600 font-medium">No scripts match your search</p>
                    <p className="text-sm text-gray-400 mt-1">Try a different search term</p>
                    <Button
                      variant="link"
                      className="mt-2 text-violet-600"
                      onClick={() => setSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  </div>
                ) : (
                  <EmptyState
                    icon={FileText}
                    title="No scripts found"
                    description="Scripts will appear here as they are added"
                    variant="card"
                  />
                )}
              </CardContent>
            </Card>
          ) : (
            filteredScripts.map((script) => {
              const category = categoryConfig[script.category];
              const CategoryIcon = category.icon;
              const isFav = favorites.has(script.id);
              return (
                <motion.div
                  key={script.id}
                  variants={fadeInUp}
                  whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                  transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
                >
                  <Card
                    className="border-0 transition-all cursor-pointer"
                    style={{
                      borderRadius: RADIUS.card,
                      boxShadow: SHADOW.card
                    }}
                    onClick={() => setSelectedScript(script)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-10 h-10 bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-md", category.gradient)} style={{ borderRadius: RADIUS.button }}>
                          <CategoryIcon className="w-5 h-5 text-white" aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-primary">{script.title}</h3>
                            <Badge className={cn("text-[10px]", category.color)}>
                              {category.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{script.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                              {script.usageCount} uses
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" aria-hidden="true" />
                              {formatRelativeLastUsed(script.lastUsed)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(script.id);
                          }}
                          aria-label={isFav ? `Remove ${script.title} from favorites` : `Add ${script.title} to favorites`}
                        >
                          {isFav ? (
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          ) : (
                            <StarOff className="w-4 h-4 text-gray-400" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </motion.div>

      {/* Script PDF Modal */}
      <Dialog open={!!selectedScript} onOpenChange={(open) => !open && setSelectedScript(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          {selectedScript && (() => {
            const cat = categoryConfig[selectedScript.category];
            const CatIcon = cat.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={cn("w-8 h-8 bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-md", cat.gradient)} style={{ borderRadius: RADIUS.button }}>
                      <CatIcon className="w-4 h-4 text-white" aria-hidden="true" />
                    </div>
                    <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{selectedScript.title}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={cn("text-xs", cat.color)}>{cat.label}</Badge>
                      <span className="text-xs text-gray-500">{selectedScript.description}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedScript.id)}
                      aria-label={favorites.has(selectedScript.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      {favorites.has(selectedScript.id) ? (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ) : (
                        <StarOff className="w-4 h-4 text-gray-400" />
                      )}
                    </Button>
                  </div>

                  {/* PDF Viewer Area */}
                  <div
                    className="bg-gray-100 flex items-center justify-center"
                    style={{
                      borderRadius: RADIUS.card,
                      height: '60vh',
                      minHeight: '400px',
                    }}
                  >
                    {selectedScript.pdfUrl ? (
                      <iframe
                        src={selectedScript.pdfUrl}
                        className="w-full h-full"
                        style={{ borderRadius: RADIUS.card }}
                        title={selectedScript.title}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <FileText className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">PDF Coming Soon</p>
                        <p className="text-xs mt-1">Script content will be available here</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </AgentLoungeLayout>
  );
}
