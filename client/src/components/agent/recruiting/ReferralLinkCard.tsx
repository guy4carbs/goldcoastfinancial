import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Copy,
  Check,
  QrCode,
  Mail,
  MessageSquare,
  Link,
  MousePointerClick,
  Users,
  X,
  Download,
} from "lucide-react";
import { RADIUS, SHADOW, GRID, TYPE, COLORS, fadeInUp } from "@/lib/heritageDesignSystem";
import type { ReferralLink } from "@/lib/agentStore";
import { toast } from "sonner";

interface ReferralLinkCardProps {
  referralLink: ReferralLink;
  agentName: string;
}

function generateAgentSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
}

function getPersonalReferralUrl(agentName: string): string {
  const slug = generateAgentSlug(agentName);
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://heritagels.org';
  return `${origin}/recruit/agent-${slug}`;
}

export function ReferralLinkCard({ referralLink, agentName }: ReferralLinkCardProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const personalUrl = useMemo(() => getPersonalReferralUrl(agentName), [agentName]);
  const agentSlug = useMemo(() => generateAgentSlug(agentName), [agentName]);
  const qrCodeUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(personalUrl)}&color=6d28d9&bgcolor=FFFFFF&margin=16`,
    [personalUrl]
  );

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(personalUrl);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = personalUrl;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    }
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  }, [personalUrl]);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(`Join Heritage Life Solutions — Invited by ${agentName}`);
    const body = encodeURIComponent(
      `Hi!\n\n` +
      `I'd love for you to join our team at Heritage Life Solutions. We offer competitive commissions, comprehensive training, and a flexible schedule.\n\n` +
      `Apply using my personal link:\n${personalUrl}\n\n` +
      `Let me know if you have any questions!\n\n` +
      `Best,\n${agentName}\nHeritage Life Solutions`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
    toast.success('Email client opened');
  }, [agentName, personalUrl]);

  const handleSMS = useCallback(() => {
    const body = encodeURIComponent(
      `Hey! I'm looking for driven individuals to join my team at Heritage Life Solutions. ` +
      `We offer great commissions and full training. Check it out: ${personalUrl} — ${agentName}`
    );
    window.open(`sms:?&body=${body}`, '_self');
    toast.success('SMS app opened');
  }, [agentName, personalUrl]);

  const handleDownloadQR = useCallback(() => {
    const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(personalUrl)}&color=6d28d9&bgcolor=FFFFFF&margin=24&format=png`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `heritage-referral-${agentSlug}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloading');
  }, [personalUrl, agentSlug]);

  const conversionRate =
    referralLink.clicks > 0
      ? ((referralLink.conversions / referralLink.clicks) * 100).toFixed(1)
      : "0.0";

  return (
    <>
      <motion.div variants={fadeInUp} initial="hidden" animate="visible">
        <Card
          className="bg-white/80 backdrop-blur-xl border border-gray-100 overflow-hidden"
          style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.level2 }}
        >
          <CardContent className="p-0" style={{ padding: GRID.spacing.md }}>
            {/* Title */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                <Link className="w-4.5 h-4.5 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.section }}>
                  Your Referral Link
                </h3>
                <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                  Personal link for {agentName}
                </p>
              </div>
            </div>

            {/* URL Display */}
            <div
              className="bg-gray-50 border border-gray-200 px-4 py-3 font-mono text-sm text-gray-700 truncate mb-5"
              style={{ borderRadius: RADIUS.input }}
            >
              {personalUrl}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <Button
                onClick={handleCopyLink}
                className={`flex-1 text-sm font-medium transition-all duration-200 ${
                  copied
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                    : "bg-violet-600 hover:bg-violet-700 text-white"
                }`}
                style={{ borderRadius: RADIUS.button }}
              >
                {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowQR(true)}
                className="flex-1 text-sm font-medium text-gray-700 border-gray-200 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200"
                style={{ borderRadius: RADIUS.button }}
              >
                <QrCode className="w-4 h-4 mr-1.5" />
                QR Code
              </Button>

              <Button
                variant="outline"
                onClick={handleEmail}
                className="flex-1 text-sm font-medium text-gray-700 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                style={{ borderRadius: RADIUS.button }}
              >
                <Mail className="w-4 h-4 mr-1.5" />
                Email
              </Button>

              <Button
                variant="outline"
                onClick={handleSMS}
                className="flex-1 text-sm font-medium text-gray-700 border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                style={{ borderRadius: RADIUS.button }}
              >
                <MessageSquare className="w-4 h-4 mr-1.5" />
                SMS
              </Button>
            </div>

            {/* Stats Row */}
            <div
              className="grid grid-cols-3 gap-4 pt-5 border-t border-gray-100"
              style={{ gap: GRID.spacing.sm }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <MousePointerClick className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>
                    Clicks
                  </span>
                </div>
                <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                  {referralLink.clicks.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>
                    Conversions
                  </span>
                </div>
                <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                  {referralLink.conversions.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Link className="w-3.5 h-3.5 text-violet-500" />
                  <span className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>
                    Conv. Rate
                  </span>
                </div>
                <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                  {conversionRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* QR Code Dialog */}
      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent
          className="sm:max-w-md bg-white"
          style={{ borderRadius: RADIUS.card }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ fontSize: TYPE.title }}>
              <QrCode className="w-5 h-5 text-violet-600" />
              Your Referral QR Code
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div
              className="bg-white border border-gray-200 p-4"
              style={{ borderRadius: RADIUS.card }}
            >
              <img
                src={qrCodeUrl}
                alt={`QR Code for ${agentName}'s referral link`}
                width={280}
                height={280}
                className="block"
                style={{ borderRadius: RADIUS.input }}
              />
            </div>
            <p className="text-center text-gray-500" style={{ fontSize: TYPE.caption }}>
              Scan to visit {agentName}'s recruiting page
            </p>
            <p
              className="text-center font-mono text-violet-600 break-all px-4"
              style={{ fontSize: TYPE.caption }}
            >
              {personalUrl}
            </p>
            <div className="flex gap-3 w-full">
              <Button
                onClick={handleDownloadQR}
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white gap-2"
                style={{ borderRadius: RADIUS.button }}
              >
                <Download className="w-4 h-4" />
                Download PNG
              </Button>
              <Button
                onClick={() => {
                  handleCopyLink();
                  setShowQR(false);
                }}
                variant="outline"
                className="flex-1 gap-2"
                style={{ borderRadius: RADIUS.button }}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
