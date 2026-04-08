/**
 * ClientReferral — Refer a Friend Page
 * Heritage Design System — Violet-to-amber theme
 *
 * How it works steps, referral link sharing with personal message modal,
 * points balance + tier badge, referral history (live), and points activity log.
 *
 * Governance: Nova (UI) + Lumen (share flow) + Axiom (UX simplicity) + Sentinel (input validation) + Helix (compliance)
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ClientLoungeLayout } from './ClientLoungeLayout';
import { RADIUS, SHADOW, MOTION, TYPE, fadeInUp, staggerContainer, GRID } from '@/lib/heritageDesignSystem';
import { CLIENT_GRADIENT_CSS, glassCard } from './clientConstants';
import { useAuth } from '@/contexts/AuthContext';
import {
  Gift, Copy, Share2, Users, CheckCircle, Heart, Shield, Star, Trophy, Award,
  Mail, MessageSquare, Pen, Loader2, Quote, Zap,
} from 'lucide-react';

// ─── DEFAULT MESSAGE TEMPLATE ───
const DEFAULT_REFERRAL_MESSAGE = `I'm sharing this with you because I care about you and your family. Working with my Heritage advisor gave me real peace of mind — and I want the same for you. No pressure, just a conversation.`;

// ─── STATUS COLORS ───
const REFERRAL_STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  contacted: { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
  converted: { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  declined: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
};

// ─── TIER CONFIG ───
const TIER_CONFIG: Record<string, { icon: typeof Star; color: string; bg: string; gradient: string }> = {
  Bronze: { icon: Award, color: 'text-amber-700', bg: 'bg-amber-100', gradient: 'from-amber-600 to-amber-800' },
  Silver: { icon: Shield, color: 'text-gray-500', bg: 'bg-gray-100', gradient: 'from-gray-400 to-gray-600' },
  Gold: { icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-100', gradient: 'from-yellow-500 to-amber-500' },
  Platinum: { icon: Trophy, color: 'text-violet-600', bg: 'bg-violet-100', gradient: 'from-violet-500 to-purple-600' },
};

// ─── HOW IT WORKS STEPS ───
const STEPS = [
  { step: 1, icon: Share2, title: 'Share Your Link', description: 'Send your unique referral link to friends and family', color: 'text-violet-600', bg: 'bg-violet-100' },
  { step: 2, icon: Shield, title: 'They Get Protected', description: 'Your referral connects with a Heritage advisor', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { step: 3, icon: Zap, title: 'Earn Points', description: 'Earn 100 points per referral — redeem for rewards', color: 'text-amber-600', bg: 'bg-amber-100' },
];

// ─── TYPES ───
interface PointsData {
  balance: number;
  tier: string;
  tierProgress: { current: number; nextTier: string | null; nextTierAt: number | null };
  history: { id: string; amount: number; reason: string; sourceType: string; createdAt: string }[];
  stats: { totalReferrals: number; convertedReferrals: number; lifetimePoints: number };
}

interface MyReferral {
  id: string;
  referredName: string;
  status: string;
  relationship: string | null;
  createdAt: string;
}

export default function ClientReferral() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Personal message state
  const [referralMessage, setReferralMessage] = useState('');
  const [messageLoaded, setMessageLoaded] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [pendingShareAction, setPendingShareAction] = useState<'email' | 'text' | 'more' | null>(null);

  // Live data state
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [myReferrals, setMyReferrals] = useState<MyReferral[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const referralUrl = `https://heritagels.org/refer/${user?.id || ''}`;

  // Fetch all data on mount
  useEffect(() => {
    const fetchWithLog = async (url: string) => {
      const r = await fetch(url, { credentials: 'include' });
      if (!r.ok) {
        console.warn(`[Referral] ${url} returned ${r.status}`);
        return null;
      }
      return r.json();
    };

    Promise.all([
      fetchWithLog('/api/referrals/message'),
      fetchWithLog('/api/referrals/points'),
      fetchWithLog('/api/referrals/mine'),
    ])
      .then(([msgData, ptsData, refData]) => {
        console.log('[Referral] Data loaded:', { msgData, ptsData, refCount: refData?.referrals?.length });
        if (msgData?.referralMessage) setReferralMessage(msgData.referralMessage);
        setMessageLoaded(true);
        if (ptsData) setPointsData(ptsData);
        if (refData?.referrals) setMyReferrals(refData.referrals);
        setDataLoaded(true);
      })
      .catch((err) => {
        console.error('[Referral] Fetch error:', err);
        setMessageLoaded(true);
        setDataLoaded(true);
      });
  }, []);

  // ─── SHARE HANDLERS ───

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareClick = (action: 'email' | 'text' | 'more') => {
    if (!referralMessage && messageLoaded) setReferralMessage(DEFAULT_REFERRAL_MESSAGE);
    setSaveError('');
    setPendingShareAction(action);
    setShowMessageModal(true);
  };

  const executeShare = (action: string) => {
    const msg = referralMessage || DEFAULT_REFERRAL_MESSAGE;
    switch (action) {
      case 'email': {
        const subject = encodeURIComponent('Protect your family with Heritage Life Solutions');
        const body = encodeURIComponent(`${msg}\n\nLearn more here: ${referralUrl}`);
        window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
        break;
      }
      case 'text': {
        const text = encodeURIComponent(`${msg}\n\n${referralUrl}`);
        window.open(`sms:?body=${text}`, '_blank');
        break;
      }
      case 'more': {
        if (navigator.share) {
          navigator.share({ title: 'Heritage Life Solutions', text: msg, url: referralUrl }).catch(() => {});
        }
        break;
      }
    }
  };

  const handleSaveAndShare = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/referrals/message', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ referralMessage: referralMessage.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error || 'Failed to save message');
        setSaving(false);
        return;
      }
      if (pendingShareAction) executeShare(pendingShareAction);
      setShowMessageModal(false);
      setPendingShareAction(null);
    } catch {
      setSaveError('Failed to save message. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    if (pendingShareAction) executeShare(pendingShareAction);
    setShowMessageModal(false);
    setPendingShareAction(null);
  };

  // ─── COMPUTED ───
  const tier = pointsData ? (TIER_CONFIG[pointsData.tier] || TIER_CONFIG.Bronze) : TIER_CONFIG.Bronze;
  const TierIcon = tier.icon;
  const stats = pointsData?.stats || { totalReferrals: 0, convertedReferrals: 0, lifetimePoints: 0 };
  const tierProgress = pointsData?.tierProgress;
  const progressPercent = tierProgress?.nextTierAt
    ? Math.min(100, Math.round(((tierProgress.current - (tierProgress.nextTierAt - (tierProgress.nextTierAt === 500 ? 500 : tierProgress.nextTierAt === 1500 ? 1000 : tierProgress.nextTierAt === 5000 ? 3500 : 500))) / (tierProgress.nextTierAt - (tierProgress.nextTierAt === 500 ? 0 : tierProgress.nextTierAt === 1500 ? 500 : tierProgress.nextTierAt === 5000 ? 1500 : 0))) * 100))
    : 100;

  const statCards = [
    { icon: Users, label: 'Total Referrals', value: String(stats.totalReferrals), color: 'text-violet-600', bg: 'bg-violet-100' },
    { icon: CheckCircle, label: 'Consultations', value: String(stats.convertedReferrals), color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { icon: Zap, label: 'Points Balance', value: stats.lifetimePoints.toLocaleString(), color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  return (
    <ClientLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* ─── HERO ─── */}
        <motion.div
          variants={fadeInUp}
          className="relative overflow-hidden"
          style={{
            background: CLIENT_GRADIENT_CSS,
            borderRadius: RADIUS.hero,
            boxShadow: SHADOW.hero,
            padding: GRID.spacing.lg,
          }}
        >
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm pointer-events-none" style={{ width: 356, height: 356, borderRadius: RADIUS.pill }} />
          <div className="absolute top-1/2 right-1/4 bg-amber-400/15 blur-sm pointer-events-none" style={{ width: 136, height: 136, borderRadius: RADIUS.pill }} />

          <div className="relative z-10 flex items-start gap-4">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.2 }}
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: GRID.spacing.xxxxl,
                height: GRID.spacing.xxxxl,
                borderRadius: RADIUS.card,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.05)',
                border: '1px solid rgba(255,255,255,0.25)',
              }}
            >
              <Gift className="text-amber-200 drop-shadow-sm" style={{ width: GRID.spacing.xl, height: GRID.spacing.xl }} aria-hidden="true" />
            </motion.div>

            <div className="flex-1">
              <h1 className="font-bold tracking-tight text-white font-serif" style={{ fontSize: TYPE.display, marginBottom: GRID.spacing.xs, lineHeight: 1.1 }}>
                Refer a Friend
              </h1>
              <p className="text-white/90 max-w-xl" style={{ fontSize: TYPE.body, lineHeight: 1.5 }}>
                Share the gift of financial protection — earn points for every referral
              </p>

              {/* Tier Badge */}
              {dataLoaded && pointsData && (
                <div className="flex items-center gap-3 mt-3">
                  <div className={cn('flex items-center gap-1.5 px-3 py-1 font-semibold text-white', `bg-gradient-to-r ${tier.gradient}`)} style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}>
                    <TierIcon size={14} />
                    {pointsData.tier}
                  </div>
                  {tierProgress?.nextTier && (
                    <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                      <div className="flex-1 h-2 bg-white/20 overflow-hidden" style={{ borderRadius: RADIUS.pill }}>
                        <div className="h-full bg-amber-300 transition-all duration-1000" style={{ width: `${progressPercent}%`, borderRadius: RADIUS.pill }} />
                      </div>
                      <span className="text-white/70 flex-shrink-0" style={{ fontSize: TYPE.micro }}>
                        {tierProgress.nextTier}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ─── HOW IT WORKS ─── */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3" style={{ gap: GRID.spacing.sm }}>
          {STEPS.map((step) => (
            <motion.div key={step.step} whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}>
              <Card className="border-0 overflow-hidden h-full" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.md }}>
                  <div className="flex flex-col items-center text-center" style={{ gap: GRID.spacing.sm }}>
                    <div className="relative">
                      <div className={cn('flex items-center justify-center', step.bg)} style={{ width: 56, height: 56, borderRadius: RADIUS.pill }}>
                        <step.icon className={step.color} size={26} />
                      </div>
                      <div className="absolute -top-1 -right-1 flex items-center justify-center bg-violet-600 text-white font-bold" style={{ width: 22, height: 22, borderRadius: RADIUS.pill, fontSize: TYPE.micro, border: '2px solid white' }}>
                        {step.step}
                      </div>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1" style={{ fontSize: TYPE.body }}>{step.title}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{step.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── YOUR REFERRAL LINK ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                <div className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <Share2 className="text-amber-200" size={20} />
                </div>
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div className="flex items-center gap-3 mb-4" style={{ backgroundColor: '#f9fafb', borderRadius: RADIUS.button, padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px` }}>
                <p className="flex-1 font-mono text-violet-700 truncate select-all" style={{ fontSize: TYPE.meta }}>{referralUrl}</p>
                <Button onClick={handleCopy} variant="outline" size="sm" className={cn('font-medium gap-1.5 flex-shrink-0 transition-all', copied ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'text-violet-600 border-violet-200 hover:bg-violet-50')} style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}>
                  {copied ? <><CheckCircle size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                </Button>
              </div>

              {messageLoaded && referralMessage && (
                <div className="flex items-start gap-2 mb-4" style={{ backgroundColor: '#f5f3ff', border: '1px solid #ede9fe', borderRadius: RADIUS.button, padding: GRID.spacing.sm }}>
                  <Quote size={14} className="text-violet-400 flex-shrink-0 mt-0.5" />
                  <p className="flex-1 min-w-0 text-gray-600 italic line-clamp-2" style={{ fontSize: TYPE.caption }}>"{referralMessage}"</p>
                  <button onClick={() => { setPendingShareAction(null); setSaveError(''); setShowMessageModal(true); }} className="text-violet-600 hover:text-violet-700 flex-shrink-0 p-1">
                    <Pen size={14} />
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>Share via:</p>
                {(['email', 'text', 'more'] as const).map((action) => (
                  <Button key={action} variant="outline" size="sm" className="text-gray-600 hover:text-violet-700 hover:border-violet-300 gap-1.5" style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }} onClick={() => handleShareClick(action)}>
                    {action === 'email' && <><Mail size={14} /> Email</>}
                    {action === 'text' && <><MessageSquare size={14} /> Text</>}
                    {action === 'more' && <><Share2 size={14} /> More</>}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── STATS ─── */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: GRID.spacing.sm }}>
          {statCards.map((stat) => (
            <motion.div key={stat.label} whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }} transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}>
              <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.md }}>
                  <div className="flex items-center gap-3">
                    <div className={cn('flex items-center justify-center flex-shrink-0', stat.bg)} style={{ width: 48, height: 48, borderRadius: RADIUS.pill }}>
                      <stat.icon className={stat.color} size={24} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>{stat.value}</p>
                      <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── REFERRAL HISTORY (LIVE) ─── */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
            <CardHeader className="pb-3">
              <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                <div className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg shadow-violet-500/20" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                  <Heart className="text-amber-200" size={20} />
                </div>
                Referral History
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {myReferrals.length === 0 && dataLoaded && (
                  <div className="text-center py-8">
                    <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    <p className="text-gray-500 font-medium" style={{ fontSize: TYPE.meta }}>No referrals yet</p>
                    <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>Share your link above to get started</p>
                  </div>
                )}
                {myReferrals.map((referral) => {
                  const statusColors = REFERRAL_STATUS_COLORS[referral.status] || REFERRAL_STATUS_COLORS.pending;
                  const initials = (referral.referredName || '??').split(' ').map((n) => n[0]).join('').slice(0, 2);
                  const date = referral.createdAt ? new Date(referral.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                  return (
                    <div key={referral.id} className="flex items-center transition-colors duration-200 hover:bg-gray-200/60" style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: '#f9fafb' }}>
                      <div className="flex items-center justify-center bg-gradient-to-br from-violet-400 to-purple-500 text-white font-bold flex-shrink-0" style={{ width: 40, height: 40, borderRadius: RADIUS.pill, fontSize: TYPE.meta }}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{referral.referredName}</p>
                        <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                          {date}{referral.relationship ? ` · ${referral.relationship}` : ''}
                        </p>
                      </div>
                      <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 font-medium flex-shrink-0', statusColors.bg, statusColors.text)} style={{ borderRadius: RADIUS.pill, fontSize: TYPE.micro }}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', statusColors.dot)} />
                        {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* ─── POINTS ACTIVITY ─── */}
        {dataLoaded && pointsData && pointsData.history.length > 0 && (
          <motion.div variants={fadeInUp}>
            <Card className="border-0 overflow-hidden" style={{ ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
              <CardHeader className="pb-3">
                <CardTitle className="font-semibold flex items-center gap-3 text-gray-900" style={{ fontSize: TYPE.title }}>
                  <div className="flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20" style={{ width: 40, height: 40, borderRadius: RADIUS.button }}>
                    <Zap className="text-white" size={20} />
                  </div>
                  Points Activity
                </CardTitle>
              </CardHeader>
              <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                  {pointsData.history.slice(0, 10).map((entry) => {
                    const date = new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    const isMilestone = entry.sourceType === 'milestone';
                    return (
                      <div key={entry.id} className="flex items-center" style={{ gap: GRID.spacing.sm, padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: isMilestone ? '#fef3c7' : '#f9fafb' }}>
                        <div className={cn('flex items-center justify-center flex-shrink-0', isMilestone ? 'bg-amber-200' : 'bg-violet-100')} style={{ width: 36, height: 36, borderRadius: RADIUS.pill }}>
                          {isMilestone ? <Trophy size={18} className="text-amber-700" /> : <Zap size={18} className="text-violet-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{entry.reason}</p>
                          <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{date}</p>
                        </div>
                        <span className={cn('font-bold flex-shrink-0', entry.amount > 0 ? 'text-emerald-600' : 'text-red-600')} style={{ fontSize: TYPE.meta }}>
                          {entry.amount > 0 ? '+' : ''}{entry.amount}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* ─── PERSONAL MESSAGE MODAL ─── */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="sm:max-w-md" style={{ borderRadius: RADIUS.card }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-900" style={{ fontSize: TYPE.title }}>
              <div className="flex items-center justify-center bg-gradient-to-br from-violet-500 to-violet-700" style={{ width: 32, height: 32, borderRadius: RADIUS.button }}>
                <Pen className="text-amber-200" size={16} />
              </div>
              Your Personal Message
            </DialogTitle>
            <DialogDescription style={{ fontSize: TYPE.caption }}>
              This message appears on your referral page when someone opens your link. Make it personal — it helps build trust.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              value={referralMessage}
              onChange={(e) => { setReferralMessage(e.target.value.slice(0, 500)); setSaveError(''); }}
              placeholder="Write a personal message to the people you refer..."
              rows={5}
              className="resize-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              style={{ borderRadius: RADIUS.input, fontSize: TYPE.meta }}
            />
            <div className="flex items-center justify-between">
              <p className={cn('text-gray-400', referralMessage.length > 450 && 'text-amber-600', referralMessage.length >= 500 && 'text-red-500')} style={{ fontSize: TYPE.micro }}>
                {referralMessage.length}/500
              </p>
              {referralMessage.length > 0 && referralMessage !== DEFAULT_REFERRAL_MESSAGE && (
                <button onClick={() => setReferralMessage(DEFAULT_REFERRAL_MESSAGE)} className="text-violet-600 hover:text-violet-700 font-medium" style={{ fontSize: TYPE.micro }}>
                  Reset to default
                </button>
              )}
            </div>
            {saveError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2" style={{ borderRadius: RADIUS.input }}>{saveError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={handleSkip} style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}>Skip</Button>
            <Button onClick={handleSaveAndShare} disabled={saving} className="bg-violet-600 hover:bg-violet-500 text-white gap-1.5" style={{ borderRadius: RADIUS.button, fontSize: TYPE.caption }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : 'Save & Share'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ClientLoungeLayout>
  );
}
