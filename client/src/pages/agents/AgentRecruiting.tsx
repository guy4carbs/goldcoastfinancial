import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { useAgentStore, type RecruitingStage } from "@/lib/agentStore";
import { RecruitingFlowDialog } from "@/components/agent/RecruitingFlowDialog";
import { ReferralLinkCard } from "@/components/agent/recruiting/ReferralLinkCard";
import { RecruitingFunnel } from "@/components/agent/recruiting/RecruitingFunnel";
import { DownlineTable } from "@/components/agent/recruiting/DownlineTable";
import { AutomationFlow } from "@/components/agent/recruiting/AutomationFlow";
import { toast } from "sonner";
import {
  RADIUS, SHADOW, TYPE, COLORS,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import { AgentPageHero, AgentStatCard, AgentStatCardGrid } from "@/components/agent/primitives";
import {
  UserPlus, Users, Clock, CheckCircle, DollarSign, TrendingUp,
  Copy, Eye, Send, Calendar, ArrowRight, Share2, Mail,
  ExternalLink, Download, Palette, Save, Loader2, MessageSquare,
  HelpCircle, ListOrdered, User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const SERIF = "'Playfair Display', serif";

const stageConfig: Record<RecruitingStage, { label: string; color: string; bg: string }> = {
  prospect: { label: 'Prospect', color: 'text-gray-600', bg: 'bg-gray-100' },
  contacted: { label: 'Contacted', color: 'text-blue-600', bg: 'bg-blue-100' },
  applied: { label: 'Applied', color: 'text-violet-600', bg: 'bg-violet-100' },
  interviewing: { label: 'Interviewing', color: 'text-amber-600', bg: 'bg-amber-100' },
  onboarding: { label: 'Onboarding', color: 'text-purple-600', bg: 'bg-purple-100' },
  active: { label: 'Active', color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

const SECTION_TOGGLES = [
  { key: "showTestimonials" as const, label: "Testimonials", icon: MessageSquare, desc: "Agent success stories and earnings" },
  { key: "showFaq" as const, label: "FAQ Section", icon: HelpCircle, desc: "Frequently asked questions" },
  { key: "showCommissionTable" as const, label: "Commission Table", icon: DollarSign, desc: "Commission rates by product" },
  { key: "showSteps" as const, label: "How It Works", icon: ListOrdered, desc: "3-step application process" },
];

export default function AgentRecruiting() {
  const {
    currentUser,
    referralLink,
    downlineAgents,
    funnelData,
    automationSteps,
    recruitProspects,
    addRecruitProspect,
    getRecruitingOverviewStats,
    getRecruitingFunnelStats,
    getAutomationStats,
    recruitingSettings,
    updateRecruitingSettings,
    saveRecruitingSettings,
    fetchRecruitingSettings,
    recruitingStats,
    fetchRecruitingStats,
  } = useAgentStore();

  const agentName = currentUser?.name || 'Agent';
  const agentSlug = useMemo(() =>
    agentName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, ''),
    [agentName]
  );
  const recruitUrl = useMemo(() =>
    `${window.location.origin}/recruit/agent-${agentSlug}`,
    [agentSlug]
  );
  const qrUrl = useMemo(() =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(recruitUrl)}&size=200x200&color=292966&bgcolor=ffffff&format=png`,
    [recruitUrl]
  );

  const [showRecruitFlow, setShowRecruitFlow] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Landing page tab state
  const [headline, setHeadline] = useState(recruitingSettings.headline || "");
  const [subheadline, setSubheadline] = useState(recruitingSettings.subheadline || "");
  const [showTestimonials, setShowTestimonials] = useState(recruitingSettings.showTestimonials !== false);
  const [showFaq, setShowFaq] = useState(recruitingSettings.showFaq !== false);
  const [showCommissionTable, setShowCommissionTable] = useState(recruitingSettings.showCommissionTable !== false);
  const [showSteps, setShowSteps] = useState(recruitingSettings.showSteps !== false);
  const [isSaving, setIsSaving] = useState(false);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailName, setEmailName] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch settings + stats on mount
  useEffect(() => {
    if (agentSlug) {
      fetchRecruitingSettings(agentSlug);
      fetchRecruitingStats(agentSlug);
    }
  }, [agentSlug]);

  // Sync form state when recruitingSettings changes
  useEffect(() => {
    setHeadline(recruitingSettings.headline || "");
    setSubheadline(recruitingSettings.subheadline || "");
    setShowTestimonials(recruitingSettings.showTestimonials !== false);
    setShowFaq(recruitingSettings.showFaq !== false);
    setShowCommissionTable(recruitingSettings.showCommissionTable !== false);
    setShowSteps(recruitingSettings.showSteps !== false);
  }, [recruitingSettings]);

  const overviewStats = getRecruitingOverviewStats();
  const funnelStats = getRecruitingFunnelStats();
  const automationStats = getAutomationStats();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(recruitUrl);
    setCopiedLink(true);
    toast.success('Recruiting link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Heritage Life Solutions with ${agentName}`,
          text: `Build a six-figure career helping families. Apply now — it's free!`,
          url: recruitUrl,
        });
      } catch (err: any) {
        if (err?.name !== "AbortError") handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const openPage = () => window.open(recruitUrl, "_blank");

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `heritage-recruit-${agentSlug}-qr.png`;
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const settings = {
      headline: headline.trim() || undefined,
      subheadline: subheadline.trim() || undefined,
      showTestimonials,
      showFaq,
      showCommissionTable,
      showSteps,
    };
    updateRecruitingSettings(settings);
    await saveRecruitingSettings(agentSlug, settings);
    setIsSaving(false);
    toast.success("Recruiting page settings saved!");
  };

  const handleSendEmail = async () => {
    if (!emailTo.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTo.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch("/api/share-website-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName: emailName.trim() || "there",
          recipientEmail: emailTo.trim(),
          personalMessage: emailMessage.trim() || `I'd love to tell you about an opportunity to build a rewarding career in life insurance with Heritage Life Solutions. Check out our recruiting page to learn more!`,
          websiteUrl: recruitUrl,
          agentName,
        }),
      });
      if (res.status === 401) {
        toast.error("Please log in to send emails.");
        return;
      }
      if (res.status === 429) {
        toast.error("You've sent too many emails. Please try again later.");
        return;
      }
      if (!res.ok) throw new Error("Failed to send");
      toast.success(`Email sent to ${emailTo.trim()}!`);
      setEmailModalOpen(false);
      setEmailTo("");
      setEmailName("");
      setEmailMessage("");
    } catch {
      toast.error("Failed to send email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const sectionStates: Record<string, boolean> = { showTestimonials, showFaq, showCommissionTable, showSteps };
  const sectionSetters: Record<string, (v: boolean) => void> = {
    showTestimonials: setShowTestimonials, showFaq: setShowFaq,
    showCommissionTable: setShowCommissionTable, showSteps: setShowSteps,
  };

  const recentActivity = [...recruitProspects]
    .sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime())
    .slice(0, 10);

  const statCards = [
    { label: 'Total Recruits', value: overviewStats.totalRecruits, icon: Users, gradient: 'from-violet-500 to-purple-600' },
    { label: 'Pending Applications', value: overviewStats.pendingApplications, icon: Clock, gradient: 'from-amber-500 to-orange-600' },
    { label: 'Approved Agents', value: overviewStats.approvedAgents, icon: CheckCircle, gradient: 'from-emerald-500 to-green-600' },
    { label: 'Override Earnings', value: `$${overviewStats.monthlyOverrideEarnings.toLocaleString()}`, icon: DollarSign, gradient: 'from-emerald-600 to-teal-600' },
    { label: 'Downline Volume', value: `$${overviewStats.totalDownlineVolume.toLocaleString()}`, icon: TrendingUp, gradient: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <AgentLoungeLayout>
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6 p-6">
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <AgentPageHero
            icon={UserPlus}
            title="Recruit New Agents"
            subtitle="Build your team, grow your downline, and earn override commissions"
          >
            <Button
              onClick={handleCopyLink}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
            >
              {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedLink ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button
              onClick={() => setShowRecruitFlow(true)}
              className="gap-2 text-white border-0 backdrop-blur-sm hover:scale-105 transition-transform"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: RADIUS.button }}
            >
              <Send className="w-4 h-4" /> Send Invite
            </Button>
          </AgentPageHero>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeInUp}>
          <AgentStatCardGrid className="grid-cols-2 lg:grid-cols-5">
            {statCards.map((stat) => (
              <AgentStatCard key={stat.label} icon={stat.icon} value={stat.value} label={stat.label} gradient={stat.gradient} />
            ))}
          </AgentStatCardGrid>
        </motion.div>

        {/* 5-Tab Layout */}
        <motion.div variants={fadeInUp}>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList
              className="bg-gray-100 border-0 p-1 gap-1"
              style={{ borderRadius: RADIUS.button }}
            >
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="funnel"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                Funnel
              </TabsTrigger>
              <TabsTrigger
                value="downline"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                Downline
              </TabsTrigger>
              <TabsTrigger
                value="automation"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                Automation
              </TabsTrigger>
              <TabsTrigger
                value="landing"
                className="data-[state=active]:bg-white data-[state=active]:text-violet-700 data-[state=active]:shadow-sm"
                style={{ borderRadius: RADIUS.button - 2 }}
              >
                Landing Page
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <ReferralLinkCard referralLink={referralLink} agentName={agentName} />

              {/* Recent Recruiting Activity */}
              <div
                className="bg-white/80 backdrop-blur-xl border border-gray-100 overflow-hidden"
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}
              >
                <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2" style={{ fontSize: TYPE.title }}>
                    <Calendar className="w-5 h-5 text-violet-600" />
                    Recent Recruiting Activity
                  </h3>
                  <Button
                    onClick={() => setShowRecruitFlow(true)}
                    className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                    style={{ borderRadius: RADIUS.button }}
                    size="sm"
                  >
                    <UserPlus className="w-4 h-4" /> Add Prospect
                  </Button>
                </div>
                <div className="divide-y divide-gray-50">
                  {recentActivity.length > 0 ? recentActivity.map(p => {
                    const cfg = stageConfig[p.stage];
                    return (
                      <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/60 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                          {p.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{p.name}</p>
                          <p className="text-xs text-gray-400">
                            Added {new Date(p.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {p.source && ` via ${p.source}`}
                          </p>
                        </div>
                        <Badge variant="secondary" className={`${cfg.bg} ${cfg.color} text-xs`} style={{ borderRadius: RADIUS.pill }}>
                          {cfg.label}
                        </Badge>
                        {p.nextStepDate && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                            <ArrowRight className="w-3 h-3" />
                            <span>{new Date(p.nextStepDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center py-12 text-gray-400">
                      <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No prospects yet</p>
                      <p className="text-xs">Click "Add Prospect" to get started!</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Funnel Tab */}
            <TabsContent value="funnel">
              <RecruitingFunnel
                funnelData={funnelData}
                stats={{
                  dropOffRate: funnelStats.dropOffRate,
                  avgTimeToActivation: funnelStats.avgTimeToActivation,
                  topSource: funnelStats.topSource,
                }}
              />
            </TabsContent>

            {/* Downline Tab */}
            <TabsContent value="downline">
              <DownlineTable agents={downlineAgents} />
            </TabsContent>

            {/* Automation Tab */}
            <TabsContent value="automation">
              <AutomationFlow
                steps={automationSteps}
                stats={{
                  automationRate: automationStats.automationRate,
                  manualSteps: automationStats.manualSteps,
                  timeSaved: automationStats.timeSaved,
                }}
              />
            </TabsContent>

            {/* ═══ LANDING PAGE TAB ═══ */}
            <TabsContent value="landing" className="space-y-6">

              {/* ─── SHARE CARD ─── */}
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                      <Share2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Share Your Recruiting Link</h3>
                      <p className="text-sm text-gray-500">Send this link to potential recruits &mdash; all applications come directly to you</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Input
                          value={recruitUrl}
                          readOnly
                          className="font-mono text-sm bg-gray-50 text-gray-700"
                          style={{ borderRadius: RADIUS.input }}
                          onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <Button onClick={handleCopyLink} variant="outline" size="icon"
                          className="shrink-0 border-violet-200 text-violet-700 hover:bg-violet-50"
                          style={{ borderRadius: RADIUS.input }}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button onClick={shareLink} variant="default"
                          className="bg-gray-900 hover:bg-gray-800 text-white"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Share2 className="w-4 h-4 mr-2" /> Share Link
                        </Button>
                        <Button onClick={() => setEmailModalOpen(true)} variant="outline"
                          className="border-gray-200 text-gray-700"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <Mail className="w-4 h-4 mr-2" /> Email to Prospect
                        </Button>
                        <Button onClick={openPage} variant="outline"
                          className="border-gray-200 text-gray-700"
                          style={{ borderRadius: RADIUS.button }}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" /> Open Page
                        </Button>
                      </div>

                      <p className="text-xs text-gray-400">
                        Share this link on social media, business cards, email signatures, or text it directly to prospects.
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-white border border-gray-200 rounded-xl" style={{ boxShadow: SHADOW.level1 }}>
                        <img src={qrUrl} alt="QR Code" width={160} height={160} className="rounded-lg" />
                      </div>
                      <Button onClick={downloadQr} variant="outline" size="sm"
                        className="text-gray-600 border-gray-200"
                        style={{ borderRadius: RADIUS.button }}
                      >
                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download QR
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* ─── LIVE PREVIEW ─── */}
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <Eye className="w-5 h-5 text-violet-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Preview</h3>
                    </div>
                    <Button onClick={() => window.open(recruitUrl, "_blank")} variant="outline" size="sm"
                      className="text-violet-600 border-violet-200 hover:bg-violet-50 cursor-pointer"
                      style={{ borderRadius: RADIUS.button, position: "relative", zIndex: 10 }}
                    >
                      View Full Page <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>

                  <div style={{
                    borderRadius: RADIUS.card, border: "1px solid #e5e7eb",
                    overflow: "hidden", height: 500, background: "#f9fafb",
                  }}>
                    <iframe
                      src={`/recruit/agent-${agentSlug}`}
                      title="Recruiting Page Preview"
                      style={{ width: "100%", height: "100%", border: "none" }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* ─── CUSTOMIZATION ─── */}
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                      <Palette className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Customize Your Recruiting Page</h3>
                      <p className="text-sm text-gray-500">Personalize your page to attract the right recruits</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="recruit-headline" className="text-gray-900 font-semibold">
                        Custom Headline
                      </Label>
                      <Input
                        id="recruit-headline"
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        placeholder="Build a Six-Figure Career Helping Families"
                        style={{ borderRadius: RADIUS.input }}
                      />
                      <p className="text-xs text-gray-400">Leave blank for the default headline</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="recruit-subheadline" className="text-gray-900 font-semibold">
                        Custom Subheadline
                      </Label>
                      <Input
                        id="recruit-subheadline"
                        value={subheadline}
                        onChange={e => setSubheadline(e.target.value)}
                        placeholder="Join 500+ Heritage agents earning $127K+ in their first year."
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-gray-900 font-semibold">Visible Sections</Label>
                      <div className="space-y-3">
                        {SECTION_TOGGLES.map(s => (
                          <div key={s.key} className="flex items-center justify-between py-2 px-3 rounded-xl border border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                              <s.icon size={16} className="text-gray-400" />
                              <div>
                                <div className="text-sm font-medium text-gray-800">{s.label}</div>
                                <div className="text-xs text-gray-400">{s.desc}</div>
                              </div>
                            </div>
                            <Switch
                              checked={sectionStates[s.key]}
                              onCheckedChange={(v) => sectionSetters[s.key](v)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button onClick={handleSave} disabled={isSaving}
                      className="w-full sm:w-auto"
                      style={{
                        background: COLORS.gradients.hero, color: "white",
                        borderRadius: RADIUS.button, boxShadow: SHADOW.glow.violet,
                      }}
                    >
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Changes</>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* ─── PERFORMANCE ─── */}
              <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                        <TrendingUp className="w-5 h-5 text-violet-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">Recruiting Page Performance</h3>
                        <p className="text-sm text-gray-500">Track how your recruiting page is performing</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Page Views", value: recruitingStats?.pageViews ?? 0 },
                      { label: "Applications", value: recruitingStats?.applications ?? 0 },
                      { label: "Conversion Rate", value: `${recruitingStats?.conversionRate ?? 0}%` },
                    ].map(stat => (
                      <div key={stat.label} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: SERIF }}>{stat.value}</div>
                        <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>

      {/* Email Modal */}
      <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4 font-serif">
              <div
                className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30"
                style={{ borderRadius: RADIUS.button }}
              >
                <Mail className="w-5 h-5 text-white" />
              </div>
              Email Your Recruiting Link
            </DialogTitle>
            <DialogDescription>
              Send a branded email with your recruiting page link directly to a potential recruit.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="recruit-email-name" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <User className="w-3 h-3 text-violet-500" /> Recipient Name
              </Label>
              <Input
                id="recruit-email-name"
                value={emailName}
                onChange={e => setEmailName(e.target.value)}
                placeholder="John Smith"
                className="h-9"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>

            <div>
              <Label htmlFor="recruit-email-to" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <Mail className="w-3 h-3 text-violet-500" /> Email Address *
              </Label>
              <Input
                id="recruit-email-to"
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder="john@example.com"
                className="h-9"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>

            <div>
              <Label htmlFor="recruit-email-message" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="w-3 h-3 text-violet-500" /> Personal Message
                <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="recruit-email-message"
                value={emailMessage}
                onChange={e => setEmailMessage(e.target.value)}
                placeholder="I'd love to tell you about an opportunity to build a rewarding career in life insurance..."
                rows={3}
                style={{ borderRadius: RADIUS.input }}
              />
            </div>

            <div className="p-3 bg-violet-50/50 border border-violet-100 text-xs text-violet-600" style={{ borderRadius: RADIUS.input }}>
              A branded Heritage Life Solutions email will be sent with your recruiting link and an "Apply Now" button.
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEmailModalOpen(false)}
              disabled={isSendingEmail}
              style={{ borderRadius: RADIUS.button }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailTo.trim()}
              className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:opacity-90"
              style={{ borderRadius: RADIUS.button }}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <RecruitingFlowDialog
        open={showRecruitFlow}
        onOpenChange={setShowRecruitFlow}
        agent={{
          name: currentUser?.name || 'Agent',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
        }}
        onComplete={(prospect) => {
          addRecruitProspect(prospect);
          toast.success(`${prospect.name} added to pipeline!`);
        }}
      />
    </AgentLoungeLayout>
  );
}
