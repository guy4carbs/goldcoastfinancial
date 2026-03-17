import { useState, useMemo, useEffect } from "react";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { useAgentStore } from "@/lib/agentStore";
import { generateAgentSlug, getAgentWebsiteUrl } from "@/lib/agentSlugUtils";
import { toast } from "sonner";
import {
  Globe, Copy, ExternalLink, Download, Share2, Mail, Send, User,
  Eye, Palette, CheckCircle, Shield, Lock, TrendingUp,
  Heart, DollarSign, MessageSquare, HelpCircle, Building2,
  Phone as PhoneIcon, Save, Loader2,
} from "lucide-react";
import { RADIUS, SHADOW, COLORS } from "@/lib/heritageDesignSystem";

const SERIF = "'Playfair Display', serif";

const PRODUCT_OPTIONS = [
  { id: "term_life", label: "Term Life", icon: Shield },
  { id: "whole_life", label: "Whole Life", icon: Lock },
  { id: "iul", label: "IUL", icon: TrendingUp },
  { id: "final_expense", label: "Final Expense", icon: Heart },
  { id: "annuities", label: "Annuities", icon: DollarSign },
];

const SECTION_TOGGLES = [
  { key: "showTestimonials" as const, label: "Testimonials", icon: MessageSquare, desc: "Client reviews and star ratings" },
  { key: "showFaq" as const, label: "FAQ Section", icon: HelpCircle, desc: "Frequently asked questions" },
  { key: "showCarriers" as const, label: "Carrier Partners", icon: Building2, desc: "Carrier logos strip" },
  { key: "showScheduleCall" as const, label: "Schedule a Call", icon: PhoneIcon, desc: "Contact form with agent info" },
];

export default function AgentWebsite() {
  const { currentUser, websiteSettings, updateWebsiteSettings, saveWebsiteSettings, fetchWebsiteSettings, websiteStats, fetchWebsiteStats } = useAgentStore();
  const agentName = currentUser?.name || "Agent";

  const websiteUrl = useMemo(() => getAgentWebsiteUrl(agentName), [agentName]);
  const agentSlug = useMemo(() => generateAgentSlug(agentName), [agentName]);
  const qrUrl = useMemo(() =>
    `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(websiteUrl)}&size=200x200&color=292966&bgcolor=ffffff&format=png`,
    [websiteUrl]
  );

  // Local form state for customization
  const [headline, setHeadline] = useState(websiteSettings.headline || "");
  const [bio, setBio] = useState(websiteSettings.bio || "");
  const [tagline, setTagline] = useState(websiteSettings.tagline || "");
  const [featuredProducts, setFeaturedProducts] = useState<string[]>(
    websiteSettings.featuredProducts || PRODUCT_OPTIONS.map(p => p.id)
  );
  const [showTestimonials, setShowTestimonials] = useState(websiteSettings.showTestimonials !== false);
  const [showFaq, setShowFaq] = useState(websiteSettings.showFaq !== false);
  const [showCarriers, setShowCarriers] = useState(websiteSettings.showCarriers !== false);
  const [showScheduleCall, setShowScheduleCall] = useState(websiteSettings.showScheduleCall !== false);
  const [isSaving, setIsSaving] = useState(false);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailName, setEmailName] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // Fetch settings from server + stats on mount
  useEffect(() => {
    if (agentSlug) {
      fetchWebsiteSettings(agentSlug);
      fetchWebsiteStats(agentSlug);
    }
  }, [agentSlug]);

  // Sync form state when websiteSettings changes (e.g. after fetch)
  useEffect(() => {
    setHeadline(websiteSettings.headline || "");
    setBio(websiteSettings.bio || "");
    setTagline(websiteSettings.tagline || "");
    setFeaturedProducts(websiteSettings.featuredProducts || PRODUCT_OPTIONS.map(p => p.id));
    setShowTestimonials(websiteSettings.showTestimonials !== false);
    setShowFaq(websiteSettings.showFaq !== false);
    setShowCarriers(websiteSettings.showCarriers !== false);
    setShowScheduleCall(websiteSettings.showScheduleCall !== false);
  }, [websiteSettings]);

  const copyLink = () => {
    navigator.clipboard.writeText(websiteUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Get a Free Life Insurance Quote from ${agentName}`,
          text: `Visit my personal Heritage Life Solutions website to get a free, no-obligation quote.`,
          url: websiteUrl,
        });
      } catch (err: any) {
        // User cancelled share — ignore
        if (err?.name !== "AbortError") {
          copyLink();
        }
      }
    } else {
      copyLink();
    }
  };

  const openSite = () => {
    window.open(websiteUrl, "_blank");
  };

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `heritage-${agentSlug}-qr.png`;
    link.click();
    toast.success("QR code downloaded!");
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
          personalMessage: emailMessage.trim() || undefined,
          websiteUrl,
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

  const toggleProduct = (productId: string) => {
    setFeaturedProducts(prev =>
      prev.includes(productId) ? prev.filter(p => p !== productId) : [...prev, productId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const settings = {
      headline: headline.trim() || undefined,
      bio: bio.trim() || undefined,
      tagline: tagline.trim() || undefined,
      featuredProducts,
      showTestimonials,
      showFaq,
      showCarriers,
      showScheduleCall,
    };
    updateWebsiteSettings(settings);
    await saveWebsiteSettings(agentSlug, settings);
    setIsSaving(false);
    toast.success("Website settings saved!");
  };

  const sectionStates: Record<string, boolean> = { showTestimonials, showFaq, showCarriers, showScheduleCall };
  const sectionSetters: Record<string, (v: boolean) => void> = {
    showTestimonials: setShowTestimonials, showFaq: setShowFaq,
    showCarriers: setShowCarriers, showScheduleCall: setShowScheduleCall,
  };

  return (
    <AgentLoungeLayout>
      <div className="space-y-6">
        {/* ─── HERO ─── */}
        <AgentPageHero
          icon={Globe}
          title="Your Website"
          subtitle="Your personal Heritage Life Solutions website. Share it with friends, family, and prospects to generate leads."
        >
          <div className="flex items-center gap-3">
            <Button
              onClick={openSite}
              className="bg-white/20 hover:bg-white/30 text-white border-0"
              style={{ borderRadius: RADIUS.button }}
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Open Website
            </Button>
            <Button
              onClick={copyLink}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              style={{ borderRadius: RADIUS.button }}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>
        </AgentPageHero>

        {/* ─── SHARE & QR CODE ─── */}
        <Card style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                <Share2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Share Your Website</h3>
                <p className="text-sm text-gray-500">Send this link to clients — all leads come directly to you</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6">
              {/* URL + Actions */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={websiteUrl}
                    readOnly
                    className="font-mono text-sm bg-gray-50 text-gray-700"
                    style={{ borderRadius: RADIUS.input }}
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                  <Button onClick={copyLink} variant="outline" size="icon"
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
                    <Mail className="w-4 h-4 mr-2" /> Email to Client
                  </Button>
                  <Button onClick={openSite} variant="outline"
                    className="border-gray-200 text-gray-700"
                    style={{ borderRadius: RADIUS.button }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Open Website
                  </Button>
                </div>

                <p className="text-xs text-gray-400">
                  Share this link on social media, business cards, email signatures, or text it directly to prospects.
                </p>
              </div>

              {/* QR Code */}
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
              <Button onClick={() => window.open(websiteUrl, "_blank")} variant="outline" size="sm"
                className="text-violet-600 border-violet-200 hover:bg-violet-50 cursor-pointer"
                style={{ borderRadius: RADIUS.button, position: "relative", zIndex: 10 }}
              >
                View Full Site <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>

            <div style={{
              borderRadius: RADIUS.card, border: "1px solid #e5e7eb",
              overflow: "hidden", height: 500, background: "#f9fafb",
            }}>
              <iframe
                src={`/a/${agentSlug}`}
                title="Website Preview"
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
                <h3 className="text-lg font-bold text-gray-900">Customize Your Website</h3>
                <p className="text-sm text-gray-500">Personalize your site to make it yours</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Headline */}
              <div className="space-y-2">
                <Label htmlFor="headline" className="text-gray-900 font-semibold">
                  Custom Headline
                </Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  placeholder={`Protect your family's future with ${agentName}`}
                  style={{ borderRadius: RADIUS.input }}
                />
                <p className="text-xs text-gray-400">Leave blank for the default headline</p>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline" className="text-gray-900 font-semibold">
                  Tagline
                </Label>
                <Input
                  id="tagline"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Licensed Insurance Professional"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-gray-900 font-semibold">
                  About You
                </Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell prospects about yourself, your experience, and why they should work with you..."
                  rows={3}
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              {/* Featured Products */}
              <div className="space-y-3">
                <Label className="text-gray-900 font-semibold">Featured Products</Label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRODUCT_OPTIONS.map(p => {
                    const active = featuredProducts.includes(p.id);
                    return (
                      <button key={p.id}
                        onClick={() => toggleProduct(p.id)}
                        className="flex flex-col items-center gap-2 p-3 border transition-all"
                        style={{
                          borderRadius: RADIUS.button,
                          borderColor: active ? "#7c3aed" : "#e5e7eb",
                          background: active ? "rgba(124,58,237,0.06)" : "white",
                          cursor: "pointer",
                        }}
                      >
                        <p.icon size={20} color={active ? "#7c3aed" : "#9ca3af"} />
                        <span className="text-xs font-medium" style={{ color: active ? "#7c3aed" : "#6b7280" }}>
                          {p.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Toggles */}
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

              {/* Save */}
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
                  <h3 className="text-lg font-bold text-gray-900">Website Performance</h3>
                  <p className="text-sm text-gray-500">Track how your website is performing</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Page Views", value: websiteStats?.pageViews ?? 0 },
                { label: "Leads Generated", value: websiteStats?.leadsGenerated ?? 0 },
                { label: "Conversion Rate", value: `${websiteStats?.conversionRate ?? 0}%` },
              ].map(stat => (
                <div key={stat.label} className="text-center p-4 rounded-xl bg-gray-50 border border-gray-100">
                  <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: SERIF }}>{stat.value}</div>
                  <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ─── EMAIL MODAL ─── */}
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
                Email Your Website
              </DialogTitle>
              <DialogDescription>
                Send a branded email with your website link directly to a client or prospect.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div>
                <Label htmlFor="email-name" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <User className="w-3 h-3 text-violet-500" /> Recipient Name
                </Label>
                <Input
                  id="email-name"
                  value={emailName}
                  onChange={e => setEmailName(e.target.value)}
                  placeholder="John Smith"
                  className="h-9"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              <div>
                <Label htmlFor="email-to" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <Mail className="w-3 h-3 text-violet-500" /> Email Address *
                </Label>
                <Input
                  id="email-to"
                  type="email"
                  value={emailTo}
                  onChange={e => setEmailTo(e.target.value)}
                  placeholder="john@example.com"
                  className="h-9"
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              <div>
                <Label htmlFor="email-message" className="text-xs font-medium flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="w-3 h-3 text-violet-500" /> Personal Message
                  <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="email-message"
                  value={emailMessage}
                  onChange={e => setEmailMessage(e.target.value)}
                  placeholder="I'd love to help you find the right life insurance coverage..."
                  rows={3}
                  style={{ borderRadius: RADIUS.input }}
                />
              </div>

              <div className="p-3 bg-violet-50/50 border border-violet-100 text-xs text-violet-600" style={{ borderRadius: RADIUS.input }}>
                A branded Heritage Life Solutions email will be sent with your website link and a "Get My Free Quote" button.
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
      </div>
    </AgentLoungeLayout>
  );
}
