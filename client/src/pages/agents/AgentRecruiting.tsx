import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { useAgentStore, type RecruitingStage, type RecruitProspect } from "@/lib/agentStore";
import { RecruitingFlowDialog } from "@/components/agent/RecruitingFlowDialog";
import { toast } from "sonner";
import {
  RADIUS, SHADOW, TYPE, COLORS,
  fadeInUp, staggerContainer, scaleIn
} from '@/lib/heritageDesignSystem';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import {
  UserPlus, Users, Network, Clock, TrendingUp,
  Search, Phone, Mail, MessageSquare, Calendar,
  ChevronRight, Copy, CheckCircle, Link, MoreHorizontal,
  Trash2, ArrowRight, ExternalLink, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const stageConfig: Record<RecruitingStage, { label: string; color: string; bg: string; order: number }> = {
  prospect: { label: 'Prospect', color: 'text-gray-600', bg: 'bg-gray-100', order: 0 },
  contacted: { label: 'Contacted', color: 'text-blue-600', bg: 'bg-blue-100', order: 1 },
  applied: { label: 'Applied', color: 'text-violet-600', bg: 'bg-violet-100', order: 2 },
  interviewing: { label: 'Interviewing', color: 'text-amber-600', bg: 'bg-amber-100', order: 3 },
  onboarding: { label: 'Onboarding', color: 'text-purple-600', bg: 'bg-purple-100', order: 4 },
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-100', order: 5 },
};

const stageOrder: RecruitingStage[] = ['prospect', 'contacted', 'applied', 'interviewing', 'onboarding', 'active'];

export default function AgentRecruiting() {
  const { recruitProspects, referralLink, getRecruitingStats, addRecruitProspect, updateRecruitStage, deleteRecruitProspect } = useAgentStore();
  const [showRecruitFlow, setShowRecruitFlow] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<RecruitingStage | 'all'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const stats = getRecruitingStats();

  const filteredProspects = useMemo(() => {
    let result = [...recruitProspects];
    if (searchQuery) result = result.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    if (filterStage !== 'all') result = result.filter(p => p.stage === filterStage);
    result.sort((a, b) => stageConfig[b.stage].order - stageConfig[a.stage].order || new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
    return result;
  }, [recruitProspects, searchQuery, filterStage]);

  const prospectsByStage = useMemo(() => {
    const grouped: Record<RecruitingStage, RecruitProspect[]> = { prospect: [], contacted: [], applied: [], interviewing: [], onboarding: [], active: [] };
    recruitProspects.forEach(p => grouped[p.stage].push(p));
    return grouped;
  }, [recruitProspects]);

  const getNextStage = (current: RecruitingStage): RecruitingStage | null => {
    const idx = stageOrder.indexOf(current);
    return idx < stageOrder.length - 1 ? stageOrder[idx + 1] : null;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink.url);
    setCopiedLink(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAdvanceStage = (prospect: RecruitProspect) => {
    const next = getNextStage(prospect.stage);
    if (next) {
      updateRecruitStage(prospect.id, next);
      toast.success(`${prospect.name} moved to ${stageConfig[next].label}`);
    }
  };

  const statCards = [
    { label: 'Total Recruited', value: stats.totalRecruited, icon: Users, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Active Downlines', value: stats.activeDownlines, icon: Network, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending Apps', value: stats.pendingApplications, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
    { label: 'In Pipeline', value: stats.pipelineCount, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 p-6">
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={UserPlus}
            title="Recruiting Center"
            subtitle="Grow your team and build your downline"
          >
            <Button
              onClick={() => setShowRecruitFlow(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
            >
              <UserPlus className="w-4 h-4" /> Add Prospect
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid>
            {statCards.map((stat) => (
              <AgentStatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} gradient={stat.gradient} />
            ))}
          </AgentStatCardGrid>
        </motion.div>

        {/* Referral Link */}
        <motion.div variants={fadeInUp} className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl p-5 text-white" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level3 }}>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Link className="w-5 h-5" />
              <div>
                <p className="font-semibold">Your Referral Link</p>
                <p className="text-white/70 text-sm">Share this link to recruit new agents</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 rounded-xl px-4 py-2 text-sm font-mono backdrop-blur-sm">{referralLink.code}</div>
              <Button onClick={handleCopyLink} variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 gap-2" style={{ borderRadius: RADIUS.pill }}>
                {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div><span className="text-white/60">Clicks</span><p className="font-bold text-lg">{referralLink.clicks}</p></div>
            <div><span className="text-white/60">Conversions</span><p className="font-bold text-lg">{referralLink.conversions}</p></div>
            <div><span className="text-white/60">Conversion Rate</span><p className="font-bold text-lg">{referralLink.clicks > 0 ? ((referralLink.conversions / referralLink.clicks) * 100).toFixed(1) : 0}%</p></div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="pipeline" className="space-y-4">
            <TabsList className="bg-gray-100" style={{ borderRadius: RADIUS.pill }}>
              <TabsTrigger value="pipeline" style={{ borderRadius: RADIUS.pill }}>Pipeline</TabsTrigger>
              <TabsTrigger value="team" style={{ borderRadius: RADIUS.pill }}>Team Growth</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline" className="space-y-4">
              {/* Pipeline Filters */}
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search prospects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" style={{ borderRadius: RADIUS.input }} />
                </div>
                <Select value={filterStage} onValueChange={(v) => setFilterStage(v as RecruitingStage | 'all')}>
                  <SelectTrigger className="w-[160px]" style={{ borderRadius: RADIUS.input }}><SelectValue placeholder="Stage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stages</SelectItem>
                    {stageOrder.map(s => <SelectItem key={s} value={s}>{stageConfig[s].label} ({prospectsByStage[s].length})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {/* Pipeline Columns (horizontal scroll on mobile) */}
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
                {stageOrder.map(stage => {
                  const cfg = stageConfig[stage];
                  const prospects = filterStage === 'all' ? prospectsByStage[stage] : filteredProspects.filter(p => p.stage === stage);
                  return (
                    <div key={stage} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={`${cfg.bg} ${cfg.color}`} style={{ borderRadius: RADIUS.pill }}>{cfg.label}</Badge>
                          <span className="text-xs text-gray-400">{prospects.length}</span>
                        </div>
                      </div>
                      <div className="space-y-2 min-h-[100px]">
                        {prospects.map(prospect => (
                          <motion.div key={prospect.id} layout className="bg-white rounded-xl p-3 border border-gray-100 hover:border-violet-200 transition-all" style={{ boxShadow: SHADOW.level1, borderRadius: RADIUS.button }}>
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold text-sm truncate">{prospect.name}</p>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6"><MoreHorizontal className="w-3 h-3" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem className="gap-2"><Phone className="w-3 h-3" /> Call</DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2"><MessageSquare className="w-3 h-3" /> Text</DropdownMenuItem>
                                  <DropdownMenuItem className="gap-2"><Mail className="w-3 h-3" /> Email</DropdownMenuItem>
                                  {getNextStage(prospect.stage) && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleAdvanceStage(prospect)} className="gap-2 text-violet-600"><ArrowRight className="w-3 h-3" /> Advance to {stageConfig[getNextStage(prospect.stage)!].label}</DropdownMenuItem>
                                    </>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => { deleteRecruitProspect(prospect.id); toast.success('Prospect removed'); }} className="gap-2 text-red-600"><Trash2 className="w-3 h-3" /> Remove</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{prospect.email}</p>
                            {prospect.lastContactDate && <p className="text-xs text-gray-400 mt-1">Last contact: {new Date(prospect.lastContactDate).toLocaleDateString()}</p>}
                            {prospect.nextStepDate && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-violet-600">
                                <Calendar className="w-3 h-3" />
                                <span>{prospect.nextStepDescription || 'Follow up'} — {new Date(prospect.nextStepDate).toLocaleDateString()}</span>
                              </div>
                            )}
                            {getNextStage(prospect.stage) && (
                              <Button variant="ghost" size="sm" onClick={() => handleAdvanceStage(prospect)} className="w-full mt-2 text-xs text-violet-600 hover:bg-violet-50 gap-1 h-7" style={{ borderRadius: RADIUS.pill }}>
                                <ArrowRight className="w-3 h-3" /> Move to {stageConfig[getNextStage(prospect.stage)!].label}
                              </Button>
                            )}
                          </motion.div>
                        ))}
                        {prospects.length === 0 && <div className="text-center py-6 text-xs text-gray-300">No prospects</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              {/* Active Downlines */}
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden" style={{ boxShadow: SHADOW.level2, borderRadius: RADIUS.card }}>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold flex items-center gap-2"><Network className="w-4 h-4 text-violet-600" /> Active Downlines</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {recruitProspects.filter(p => p.stage === 'active').length > 0 ? recruitProspects.filter(p => p.stage === 'active').map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-semibold text-sm">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{member.name}</p>
                          <p className="text-xs text-gray-400">Joined {new Date(member.stageHistory.find(h => h.to === 'active')?.date || member.addedDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-600" style={{ borderRadius: RADIUS.pill }}>Active</Badge>
                    </div>
                  )) : (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No active downlines yet</p>
                      <p className="text-xs">Start recruiting to build your team!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recruiting Timeline */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4" style={{ boxShadow: SHADOW.level2, borderRadius: RADIUS.card }}>
                <h3 className="font-semibold flex items-center gap-2 mb-4"><BarChart3 className="w-4 h-4 text-violet-600" /> Recruiting Activity</h3>
                <div className="space-y-3">
                  {recruitProspects.slice(0, 8).sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()).map(p => {
                    const cfg = stageConfig[p.stage];
                    return (
                      <div key={p.id} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="font-medium">{p.name}</span>
                          <span className="text-gray-400"> — added {new Date(p.addedDate).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="secondary" className={`${cfg.bg} ${cfg.color} text-xs`} style={{ borderRadius: RADIUS.pill }}>{cfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      <RecruitingFlowDialog open={showRecruitFlow} onOpenChange={setShowRecruitFlow} onComplete={(prospect) => {
        addRecruitProspect(prospect);
        toast.success(`${prospect.name} added to pipeline!`);
      }} />
    </AgentLoungeLayout>
  );
}
