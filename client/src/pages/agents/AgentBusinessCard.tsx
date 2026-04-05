import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AgentLoungeLayout } from "@/components/agent/AgentLoungeLayout";
import { AgentPageHero } from "@/components/agent/primitives";
import { BusinessCard3D } from "@/components/agent/BusinessCard3D";
import { RADIUS, SHADOW, fadeInUp, staggerContainer } from "@/lib/heritageDesignSystem";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Edit3, Share2, Mail, MessageSquare, Copy, Check, Loader2,
  Linkedin, Instagram, Facebook, Twitter, Globe, Building2, Award, Save,
  Phone, User, MapPin, AtSign, ExternalLink, Link2, Camera, Shield, X, Plus, Smile, Share
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length === 0) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function stripPhone(value: string): string {
  return value.replace(/\D/g, "");
}

export default function AgentBusinessCard() {
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: cardResponse, isLoading } = useQuery<{ success: boolean; data: any }>({
    queryKey: ["/api/business-card/my-card"],
  });
  const cardData = cardResponse?.data;

  // Handle Bitmoji OAuth callback result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bitmojiStatus = params.get("bitmoji");
    if (bitmojiStatus) {
      // Clean the URL
      window.history.replaceState({}, "", window.location.pathname);
      if (bitmojiStatus === "success") {
        toast.success("Bitmoji avatar connected!");
        queryClient.invalidateQueries({ queryKey: ["/api/business-card/my-card"] });
      } else if (bitmojiStatus === "no-avatar") {
        toast.error("No Bitmoji avatar found. Make sure you have a Bitmoji linked to your Snapchat account.");
      } else {
        toast.error("Failed to connect Bitmoji. Please try again.");
      }
    }
  }, [queryClient]);

  const handleConnectBitmoji = useCallback(() => {
    // Open Snap Kit OAuth in a popup
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    const popup = window.open(
      "/api/auth/snapchat",
      "SnapchatLogin",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );

    // Listen for postMessage from the popup callback
    const handler = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== "bitmoji-auth") return;

      window.removeEventListener("message", handler);

      const status = event.data.status;
      if (status === "success") {
        toast.success("Bitmoji avatar connected!");
        queryClient.invalidateQueries({ queryKey: ["/api/business-card/my-card"] });
      } else if (status === "no-avatar") {
        toast.error("No Bitmoji avatar found. Make sure you have a Bitmoji linked to your Snapchat account.");
      } else {
        toast.error("Failed to connect Bitmoji. Please try again.");
      }
    };
    window.addEventListener("message", handler);

    // Cleanup if user closes popup manually
    const pollTimer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(pollTimer);
        window.removeEventListener("message", handler);
      }
    }, 1000);
  }, [queryClient]);

  const [copied, setCopied] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    phone: "",
    email: "",
    title: "",
    companyName: "",
    websiteUrl: "",
    licenseNumber: "",
    npn: "",
    licensedStates: [] as string[],
    linkedinUrl: "",
    instagramUrl: "",
    facebookUrl: "",
    twitterUrl: "",
  });
  // stateInput removed — using selectable grid instead

  // Avatar upload mutation
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/business-card/my-card/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Upload failed");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/business-card/my-card"] });
      toast.success("Profile photo updated!");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to upload photo");
    },
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    avatarMutation.mutate(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  // Populate edit form when card data loads
  useEffect(() => {
    if (cardData) {
      setEditData({
        phone: cardData.phone || "",
        email: cardData.email || "",
        title: cardData.title || "Licensed Insurance Agent",
        companyName: cardData.companyName || "Heritage Life Solutions",
        websiteUrl: cardData.websiteUrl || "",
        licenseNumber: cardData.licenseNumber || "",
        npn: cardData.npn || "",
        licensedStates: cardData.licensedStates || [],
        linkedinUrl: cardData.linkedinUrl || "",
        instagramUrl: cardData.instagramUrl || "",
        facebookUrl: cardData.facebookUrl || "",
        twitterUrl: cardData.twitterUrl || "",
      });
    }
  }, [cardData]);

  const shareUrl = `${window.location.origin}/card/${cardData?.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(
      `${cardData?.firstName} ${cardData?.lastName} — Digital Business Card`
    );
    const body = encodeURIComponent(
      `Hi,\n\nHere's my digital business card:\n${shareUrl}\n\nBest regards,\n${cardData?.firstName} ${cardData?.lastName}\n${cardData?.companyName}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleShareSMS = () => {
    const text = encodeURIComponent(
      `Here's my digital business card: ${shareUrl} — ${cardData?.firstName} ${cardData?.lastName}, ${cardData?.companyName}`
    );
    window.open(`sms:?body=${text}`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiRequest("PATCH", "/api/business-card/my-card", editData);
      await queryClient.refetchQueries({ queryKey: ["/api/business-card/my-card"] });
      toast.success("Business card updated!");
      setShowEditDialog(false);
    } catch (err) {
      toast.error("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleNativeShare = useCallback(async () => {
    const url = `${window.location.origin}/card/${cardData?.id}`;
    const shareData = {
      title: `${cardData?.firstName} ${cardData?.lastName} — Digital Business Card`,
      text: `Check out my digital business card — ${cardData?.firstName} ${cardData?.lastName}, ${cardData?.title || "Licensed Insurance Agent"} at ${cardData?.companyName || "Heritage Life Solutions"}`,
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        // User cancelled share — not an error
        if (err?.name !== "AbortError") {
          toast.error("Sharing failed");
        }
      }
    } else {
      // Fallback: copy link
      navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  }, [cardData]);

  const socialLinks = [
    { url: cardData?.linkedinUrl, icon: Linkedin, label: "LinkedIn", color: "#0077B5" },
    { url: cardData?.instagramUrl, icon: Instagram, label: "Instagram", color: "#E4405F" },
    { url: cardData?.facebookUrl, icon: Facebook, label: "Facebook", color: "#1877F2" },
    { url: cardData?.twitterUrl, icon: Twitter, label: "Twitter/X", color: "#1DA1F2" },
  ].filter((s) => s.url);

  return (
    <AgentLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ═══ HERO ═══ */}
        <AgentPageHero
          icon={CreditCard}
          title="Business Card"
          subtitle="Your digital business card — customize it and share it anywhere"
        />

        {/* ═══ CARD PREVIEW ═══ */}
        <motion.div variants={fadeInUp} className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              <p className="text-gray-500 text-sm">Loading your business card...</p>
            </div>
          ) : cardData ? (
            <>
              <BusinessCard3D
                data={{
                  firstName: cardData.firstName || "",
                  lastName: cardData.lastName || "",
                  title: cardData.title || "Licensed Insurance Agent",
                  companyName: cardData.companyName || "Heritage Life Solutions",
                  email: cardData.email || "",
                  phone: cardData.phone || "",
                  websiteUrl: cardData.websiteUrl || "",
                  avatarUrl: cardData.avatarUrl,
                  licenseNumber: cardData.licenseNumber,
                  npn: cardData.npn,
                  licensedStates: cardData.licensedStates,
                  linkedinUrl: cardData.linkedinUrl,
                  instagramUrl: cardData.instagramUrl,
                  facebookUrl: cardData.facebookUrl,
                  twitterUrl: cardData.twitterUrl,
                }}
              />

              {/* Action buttons */}
              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                <Button
                  onClick={handleNativeShare}
                  variant="outline"
                  className="gap-2"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Share className="w-4 h-4" /> Share
                </Button>
                <Button
                  onClick={() => setShowEditDialog(true)}
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <Edit3 className="w-4 h-4" /> Edit Card
                </Button>
              </div>
            </>
          ) : isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
              <p className="text-gray-500 text-sm">Loading your business card...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <CreditCard className="w-12 h-12 text-violet-300" />
              <p className="text-gray-700 font-medium">Your business card is ready</p>
              <p className="text-gray-500 text-sm text-center max-w-xs">
                Tap Edit Card to add your phone, license info, and social links to personalize it.
              </p>
              <Button
                onClick={() => setShowEditDialog(true)}
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white mt-2"
                style={{ borderRadius: RADIUS.button }}
              >
                <Edit3 className="w-4 h-4" /> Edit Card
              </Button>
            </div>
          )}
        </motion.div>

        {cardData && (
          <>
            {/* ═══ SECTION 1: PROFILE & IDENTITY ═══ */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                      <User className="w-4 h-4 text-violet-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Profile & Identity
                    </h2>
                  </div>

                  <div className="flex items-start gap-5">
                    {/* Tap-to-upload Avatar */}
                    <div className="shrink-0">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handleAvatarSelect}
                        className="hidden"
                        aria-hidden="true"
                      />
                      <div className="relative group">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="relative block rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 transition-all"
                          disabled={avatarMutation.isPending}
                        >
                          {cardData.avatarUrl ? (
                            <img
                              src={cardData.avatarUrl}
                              alt=""
                              className="w-20 h-20 rounded-2xl object-cover border-2 border-violet-100 shadow-sm"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-sm">
                              {cardData.firstName?.[0]}
                              {cardData.lastName?.[0]}
                            </div>
                          )}
                          {/* Hover overlay */}
                          <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                            {avatarMutation.isPending ? (
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                              <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="text-[10px] text-violet-600 hover:text-violet-700 font-medium"
                        >
                          Upload Photo
                        </button>
                        <span className="text-[10px] text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={handleConnectBitmoji}
                          className="text-[10px] text-amber-600 hover:text-amber-700 font-medium flex items-center gap-0.5"
                        >
                          <Smile className="w-3 h-3" />
                          Bitmoji
                        </button>
                      </div>
                    </div>

                    {/* Name, Title, Agency */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {cardData.firstName} {cardData.lastName}
                        </h3>
                        <p className="text-sm text-violet-600 font-semibold mt-0.5">
                          {cardData.title || "Licensed Insurance Agent"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="text-sm font-medium">
                          {cardData.companyName || "Heritage Life Solutions"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══ SECTION 2: CONTACT INFORMATION ═══ */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Contact Information
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {cardData.phone && (
                      <a
                        href={`tel:${cardData.phone}`}
                        className="flex items-center gap-3 p-3 bg-gray-50/80 hover:bg-gray-100 transition-colors"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                          <Phone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                            Phone
                          </p>
                          <p className="text-sm font-medium text-gray-800">{formatPhone(cardData.phone)}</p>
                        </div>
                      </a>
                    )}

                    {cardData.email && (
                      <a
                        href={`mailto:${cardData.email}`}
                        className="flex items-center gap-3 p-3 bg-gray-50/80 hover:bg-gray-100 transition-colors"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                            Email
                          </p>
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {cardData.email}
                          </p>
                        </div>
                      </a>
                    )}

                    {cardData.websiteUrl && (
                      <a
                        href={
                          cardData.websiteUrl.startsWith("http")
                            ? cardData.websiteUrl
                            : `https://${cardData.websiteUrl}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50/80 hover:bg-gray-100 transition-colors"
                        style={{ borderRadius: RADIUS.input }}
                      >
                        <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
                          <Globe className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                            Website
                          </p>
                          <p className="text-sm font-medium text-violet-600 truncate">
                            {cardData.websiteUrl.replace(/^https?:\/\//, "")}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══ SECTION 3: CREDENTIALS & LICENSING ═══ */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Award className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Credentials & Licensing
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3.5 bg-gray-50/80" style={{ borderRadius: RADIUS.input }}>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        License #
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        {cardData.licenseNumber || "—"}
                      </p>
                    </div>
                    <div className="p-3.5 bg-gray-50/80" style={{ borderRadius: RADIUS.input }}>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        NPN
                      </p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">
                        {cardData.npn || "—"}
                      </p>
                    </div>
                  </div>

                  {/* Licensed States */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                        Licensed States
                      </p>
                    </div>
                    {cardData.licensedStates?.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {cardData.licensedStates.map((state: string) => (
                          <Badge
                            key={state}
                            variant="secondary"
                            className="text-[10px] bg-violet-50 text-violet-700 font-semibold"
                            style={{ borderRadius: RADIUS.pill }}
                          >
                            {state}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No states listed</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══ SECTION 4: SOCIAL MEDIA ═══ */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center">
                      <AtSign className="w-4 h-4 text-sky-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Social Media
                    </h2>
                  </div>

                  {socialLinks.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {socialLinks.map(({ url, icon: Icon, label, color }) => (
                        <a
                          key={label}
                          href={url!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-gray-50/80 hover:bg-gray-100 transition-colors"
                          style={{ borderRadius: RADIUS.input }}
                        >
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${color}12` }}
                          >
                            <Icon className="w-4 h-4" style={{ color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                              {label}
                            </p>
                            <p className="text-sm font-medium text-gray-700 truncate">
                              {url!.replace(/^https?:\/\/(www\.)?/, "")}
                            </p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">
                      No social links added yet. Click "Edit Card" above to add your profiles.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* ═══ SECTION 5: SHARE YOUR CARD ═══ */}
            <motion.div variants={fadeInUp}>
              <Card className="border-0" style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Share Your Card
                    </h2>
                  </div>

                  <p className="text-sm text-gray-500 mb-4">
                    Send your digital business card to prospects and clients via email, text, or copy the
                    link to share anywhere.
                  </p>

                  {/* Share link display */}
                  <div
                    className="flex items-center gap-2 p-3 bg-gray-50/80 mb-5"
                    style={{ borderRadius: RADIUS.input }}
                  >
                    <Link2 className="w-4 h-4 text-gray-400 shrink-0" />
                    <code className="text-xs text-gray-600 flex-1 truncate">{shareUrl}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs shrink-0 gap-1.5"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copy
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Share action buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="gap-2 h-11"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Copy Link
                    </Button>
                    <Button
                      onClick={handleShareEmail}
                      variant="outline"
                      className="gap-2 h-11"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <Mail className="w-4 h-4" /> Email
                    </Button>
                    <Button
                      onClick={handleShareSMS}
                      variant="outline"
                      className="gap-2 h-11"
                      style={{ borderRadius: RADIUS.button }}
                    >
                      <MessageSquare className="w-4 h-4" /> Text
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}

        {/* ═══ EDIT CARD DIALOG ═══ */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent
            className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
            style={{ borderRadius: RADIUS.card }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <Edit3 className="w-5 h-5 text-violet-600" />
                Edit Business Card
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-2">
              {/* ── Profile & Identity ── */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-violet-500" />
                  Profile & Identity
                </h4>
                <p className="text-xs text-gray-400 -mt-2">
                  To change your photo, tap the avatar on your profile card above.
                </p>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-title" className="text-sm text-gray-600">
                      Title / Role
                    </Label>
                    <Input
                      id="edit-title"
                      value={editData.title}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      placeholder="Licensed Insurance Agent"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-company" className="text-sm text-gray-600">
                      <Building2 className="w-3.5 h-3.5 inline mr-1.5" />
                      Agency Name
                    </Label>
                    <Input
                      id="edit-company"
                      value={editData.companyName}
                      onChange={(e) => setEditData({ ...editData, companyName: e.target.value })}
                      placeholder="Heritage Life Solutions"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Contact Information ── */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" />
                  Contact Information
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-phone" className="text-sm text-gray-600">
                      <Phone className="w-3.5 h-3.5 inline mr-1.5" />
                      Phone Number
                    </Label>
                    <Input
                      id="edit-phone"
                      type="tel"
                      value={formatPhone(editData.phone)}
                      onChange={(e) => setEditData({ ...editData, phone: stripPhone(e.target.value) })}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email" className="text-sm text-gray-600">
                      <Mail className="w-3.5 h-3.5 inline mr-1.5" />
                      Email Address
                    </Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="agent@heritagels.org"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-website" className="text-sm text-gray-600">
                      <Globe className="w-3.5 h-3.5 inline mr-1.5" />
                      Website URL
                    </Label>
                    <Input
                      id="edit-website"
                      value={editData.websiteUrl}
                      onChange={(e) => setEditData({ ...editData, websiteUrl: e.target.value })}
                      placeholder="https://heritagels.org/agent/your-name"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Credentials & Licensing ── */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-500" />
                  Credentials & Licensing
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-license" className="text-sm text-gray-600">
                        License #
                      </Label>
                      <Input
                        id="edit-license"
                        value={editData.licenseNumber}
                        onChange={(e) => setEditData({ ...editData, licenseNumber: e.target.value })}
                        placeholder="e.g. 0H12345"
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-npn" className="text-sm text-gray-600">
                        NPN
                      </Label>
                      <Input
                        id="edit-npn"
                        value={editData.npn}
                        onChange={(e) => setEditData({ ...editData, npn: e.target.value.replace(/[^0-9]/g, "") })}
                        placeholder="e.g. 12345678"
                        maxLength={10}
                        style={{ borderRadius: RADIUS.input }}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 mb-2 block">
                      <MapPin className="w-3.5 h-3.5 inline mr-1.5" />
                      Licensed States
                      {editData.licensedStates.length > 0 && (
                        <span className="text-violet-600 ml-1.5">({editData.licensedStates.length} selected)</span>
                      )}
                    </Label>
                    <div
                      className="grid grid-cols-8 gap-1 max-h-[200px] overflow-y-auto p-2 bg-gray-50/80"
                      style={{ borderRadius: RADIUS.input }}
                    >
                      {US_STATES.map((st) => {
                        const selected = editData.licensedStates.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              setEditData({
                                ...editData,
                                licensedStates: selected
                                  ? editData.licensedStates.filter((s) => s !== st)
                                  : [...editData.licensedStates, st],
                              });
                            }}
                            className={`py-1.5 text-[11px] font-semibold rounded-lg transition-all ${
                              selected
                                ? "bg-violet-600 text-white shadow-sm"
                                : "bg-white text-gray-600 hover:bg-violet-50 hover:text-violet-700 border border-gray-200"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">Tap states to select or deselect</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* ── Social Media ── */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.1em] flex items-center gap-2">
                  <AtSign className="w-3.5 h-3.5 text-sky-500" />
                  Social Media
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-linkedin" className="text-sm text-gray-600">
                      <Linkedin className="w-3.5 h-3.5 inline mr-1.5" style={{ color: "#0077B5" }} />
                      LinkedIn
                    </Label>
                    <Input
                      id="edit-linkedin"
                      value={editData.linkedinUrl}
                      onChange={(e) => setEditData({ ...editData, linkedinUrl: e.target.value })}
                      placeholder="https://linkedin.com/in/your-profile"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-instagram" className="text-sm text-gray-600">
                      <Instagram className="w-3.5 h-3.5 inline mr-1.5" style={{ color: "#E4405F" }} />
                      Instagram
                    </Label>
                    <Input
                      id="edit-instagram"
                      value={editData.instagramUrl}
                      onChange={(e) => setEditData({ ...editData, instagramUrl: e.target.value })}
                      placeholder="https://instagram.com/your-handle"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-facebook" className="text-sm text-gray-600">
                      <Facebook className="w-3.5 h-3.5 inline mr-1.5" style={{ color: "#1877F2" }} />
                      Facebook
                    </Label>
                    <Input
                      id="edit-facebook"
                      value={editData.facebookUrl}
                      onChange={(e) => setEditData({ ...editData, facebookUrl: e.target.value })}
                      placeholder="https://facebook.com/your-page"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-twitter" className="text-sm text-gray-600">
                      <Twitter className="w-3.5 h-3.5 inline mr-1.5" style={{ color: "#1DA1F2" }} />
                      Twitter / X
                    </Label>
                    <Input
                      id="edit-twitter"
                      value={editData.twitterUrl}
                      onChange={(e) => setEditData({ ...editData, twitterUrl: e.target.value })}
                      placeholder="https://x.com/your-handle"
                      style={{ borderRadius: RADIUS.input }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                style={{ borderRadius: RADIUS.button }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-violet-600 hover:bg-violet-700 text-white"
                style={{ borderRadius: RADIUS.button }}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AgentLoungeLayout>
  );
}
