/**
 * Manager Live Activity Page
 * Real-time team activity and engagement tracking
 * Heritage Design System — Emerald theme
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { toast } from 'sonner';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState } from './primitives';
import {
  MANAGER_ICON_GRADIENT,
  DEMO_AGENT_ACTIVITY,
  ACTIVITY_STATUS_COLORS,
  DEMO_LIVE_FEED,
  DEMO_ACTIVITY_HEATMAP,
} from './managerConstants';
import type { AgentActivityStatus } from './managerConstants';
import {
  RADIUS,
  TYPE,
  GRID,
  LAYOUT,
  SHADOW,
  MOTION,
  COLORS,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import { GLASS } from '@/lib/heritageDesignSystem';
import {
  Activity,
  Phone,
  Mail,
  Calendar,
  Clock,
  Users,
  X,
  Target,
  DollarSign,
  Flame,
  GraduationCap,
  Eye,
  ChevronRight,
  ChevronLeft,
  Zap,
  Play,
  Pause,
  PhoneIncoming,
  PhoneOutgoing,
  Video,
  MapPin,
  CheckCircle2,
  MessageSquare,
  PhoneOff,
  Search,
  Send,
  Headphones,
  Download,
} from 'lucide-react';

// ─── STATUS FILTER OPTIONS ───
type FilterStatus = 'all' | AgentActivityStatus;

const STATUS_FILTERS: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'on_call', label: 'On Call' },
  { key: 'available', label: 'Available' },
  { key: 'meeting', label: 'In Meeting' },
  { key: 'break', label: 'On Break' },
  { key: 'offline', label: 'Offline' },
];

// ─── HEATMAP CONSTANTS ───
const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HEATMAP_HOURS = ['8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm'];

// ─── STATUS FILTER BG COLORS (inline CSS) ───
const STATUS_BG_COLORS: Record<string, string> = {
  on_call: '#059669',
  available: '#3b82f6',
  meeting: '#7c3aed',
  break: '#f59e0b',
  offline: '#6b7280',
};

// ─── LIVE FEED TYPE COLORS ───
const FEED_TYPE_COLORS: Record<string, string> = {
  call: 'bg-emerald-500',
  close: 'bg-amber-500',
  email: 'bg-blue-500',
  appointment: 'bg-violet-500',
  update: 'bg-gray-400',
};

// ─── SPARKLINE DATA (7-day call trends) ───
const SPARKLINE_DATA: Record<string, number[]> = {
  '1': [8, 10, 9, 12, 11, 14, 12],
  '2': [6, 7, 8, 7, 9, 8, 9],
  '3': [5, 6, 4, 7, 5, 6, 6],
  '4': [7, 6, 5, 4, 4, 3, 5],
  '5': [3, 4, 5, 5, 6, 7, 7],
  '6': [7, 8, 9, 8, 10, 9, 11],
  '7': [9, 10, 11, 12, 11, 13, 14],
  '8': [4, 3, 2, 3, 2, 1, 2],
  '9': [2, 2, 3, 2, 1, 0, 0],
  '10': [5, 6, 5, 7, 6, 6, 6],
  '11': [7, 8, 9, 8, 10, 9, 10],
  '12': [1, 1, 0, 0, 0, 0, 0],
};

function Sparkline({ data, width = 48, height = 16 }: { data: number[]; width?: number; height?: number }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const trending = data[data.length - 1] >= data[0];
  const strokeColor = trending ? '#10b981' : '#f43f5e';
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} className="flex-shrink-0">
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {(() => {
        const lastX = width;
        const lastY = height - ((data[data.length - 1] - min) / range) * (height - 4) - 2;
        return <circle cx={lastX} cy={lastY} r={2} fill={strokeColor} />;
      })()}
    </svg>
  );
}

// ─── TIME RANGE STAT VALUES ───
export type TimeRange = 'today' | 'week' | 'month';
const STAT_VALUES: Record<TimeRange, { calls: string; emails: string; appointments: string; avgTime: string }> = {
  today: { calls: '285', emails: '94', appointments: '18', avgTime: '6.2 hrs' },
  week: { calls: '1,842', emails: '612', appointments: '87', avgTime: '6.8 hrs' },
  month: { calls: '7,215', emails: '2,340', appointments: '342', avgTime: '6.5 hrs' },
};

// ─── HEATMAP → AGENT ACTIVITY MAPPING ───
// Maps each heatmap cell to which agents were active (by ID)
const HEATMAP_AGENTS: Record<string, string[]> = {
  '0-0': ['1','2','6','7'], '0-1': ['1','2','3','5','6','7','10','11'], '0-2': ['1','2','3','5','6','7','10','11'],
  '0-3': ['1','2','3','5','6','7','10','11'], '0-4': ['1','3','5','6','7','10','11'], '0-5': ['1','2','5','6','7'],
  '0-6': ['1','2','3','5','6','7','10','11'], '0-7': ['1','2','3','5','6','7','10','11'], '0-8': ['1','5','6','7','10'], '0-9': ['1','7'],
  '1-0': ['2','6','10'], '1-1': ['1','2','3','5','6','7','10','11'], '1-2': ['1','2','3','5','6','7','10','11'],
  '1-3': ['1','2','3','5','6','7','10','11'], '1-4': ['1','2','3','5','6','7','10','11'], '1-5': ['1','2','3','5','6'],
  '1-6': ['1','2','3','5','6','7','10','11'], '1-7': ['1','2','5','6','7','10','11'], '1-8': ['1','5','6','7'], '1-9': ['1','7'],
  '2-0': ['1','6'], '2-1': ['1','2','3','6','7','10','11'], '2-2': ['1','2','3','5','6','7','10','11'],
  '2-3': ['1','2','3','5','6','7','10','11'], '2-4': ['1','2','3','5','6','7','10','11'], '2-5': ['1','2','5','6','7'],
  '2-6': ['1','2','3','5','6','7','10','11'], '2-7': ['1','2','3','5','6','7','10','11'], '2-8': ['1','5','7','10'], '2-9': ['7'],
  '3-0': ['2','7'], '3-1': ['1','2','3','5','6','7','10','11'], '3-2': ['1','2','3','5','6','7','10','11'],
  '3-3': ['1','2','3','5','6','7','10','11'], '3-4': ['1','2','3','5','6','7','10','11'], '3-5': ['1','5','6','7'],
  '3-6': ['1','2','3','5','6','7','10','11'], '3-7': ['1','2','5','6','7','10','11'], '3-8': ['1','5','7'], '3-9': ['1'],
  '4-0': ['1','2','6'], '4-1': ['1','2','3','5','6','7','10','11'], '4-2': ['1','2','3','5','6','7','10','11'],
  '4-3': ['1','2','3','5','6','7','10','11'], '4-4': ['1','2','3','5','6','7','10','11'], '4-5': ['1','2','5','6','7','10'],
  '4-6': ['1','2','3','5','6','7','10','11'], '4-7': ['1','2','3','5','6','7','10','11'], '4-8': ['1','5','6','7','10'], '4-9': ['1','7'],
};

// ─── ENRICHED AGENT PROFILES (for drawer popup) ───
const AGENT_PROFILES: Record<string, { role: string; quota: number; revenue: number; streak: number; recentActivity: string[] }> = {
  '1': { role: 'Senior Agent', quota: 112, revenue: 142000, streak: 14, recentActivity: ['Closed Thompson Estate — $28K', 'Follow-up call with Williams', 'Sent proposal to Park Group'] },
  '2': { role: 'Agent', quota: 87, revenue: 98000, streak: 7, recentActivity: ['Sent follow-up to Garcia', 'Updated CRM pipeline notes', 'Completed compliance training'] },
  '3': { role: 'Agent', quota: 74, revenue: 68000, streak: 3, recentActivity: ['Pipeline review with manager', 'Drafted proposal for Nguyen', 'Called 5 new leads'] },
  '4': { role: 'Junior Agent', quota: 62, revenue: 45000, streak: 0, recentActivity: ['Completed product quiz', 'Shadowed senior call', 'Updated lead statuses'] },
  '5': { role: 'Agent', quota: 95, revenue: 118000, streak: 11, recentActivity: ['On call with Patel Term', 'Closed deal: Kim Whole Life — $22K', 'Booked 3 appointments'] },
  '6': { role: 'Senior Agent', quota: 104, revenue: 135000, streak: 9, recentActivity: ['Updated CRM notes', 'Sent 4 proposals', 'Team training presentation'] },
  '7': { role: 'Top Producer', quota: 128, revenue: 178000, streak: 21, recentActivity: ['Closed Lee Estate Shield — $38K', 'Mentored junior agent', 'Pipeline at $95K pending'] },
  '8': { role: 'Agent', quota: 41, revenue: 32000, streak: 0, recentActivity: ['Left early — dentist appt', 'Made 2 calls before leaving', 'Needs coaching follow-up'] },
  '9': { role: 'Junior Agent', quota: 0, revenue: 0, streak: 0, recentActivity: ['Out of office — vacation', 'Returns next Monday'] },
  '10': { role: 'Agent', quota: 78, revenue: 82000, streak: 5, recentActivity: ['Reviewing 3 proposals', 'Called Brooks about IUL', 'Updated deal stages'] },
  '11': { role: 'Senior Agent', quota: 98, revenue: 126000, streak: 8, recentActivity: ['Client presentation — Kim Corp', 'Closed 2 deals this week', 'Coaching session tomorrow'] },
  '12': { role: 'Junior Agent', quota: 0, revenue: 0, streak: 0, recentActivity: ['Not logged in today', 'Last active: yesterday 4pm'] },
};

// ─── AGENT EMAILS (demo) ───
const AGENT_EMAILS: Record<string, Array<{ id: string; to: string; subject: string; preview: string; body: string; date: string; time: string; read: boolean }>> = {
  '1': [
    { id: 'e1', to: 'thompson@email.com', subject: 'Your Estate Shield Quote — Next Steps', preview: 'Hi Robert, following up on our call today regarding the Estate Shield policy...', body: 'Hi Robert,\n\nFollowing up on our call today regarding the Estate Shield policy. I wanted to share the details we discussed:\n\n• Coverage Amount: $1,000,000\n• Monthly Premium: $287/month\n• Policy Type: Universal Life with Estate Shield rider\n• Beneficiaries: As discussed (spouse primary, children contingent)\n\nThe underwriting process typically takes 2-3 weeks. I\'ll need the following documents from you:\n1. Completed application (attached)\n2. Last 2 years of tax returns\n3. Current physician contact information\n\nPlease review the attached illustration and let me know if you have any questions. I\'m available anytime this week for a follow-up call.\n\nBest regards,\nSarah Johnson\nSenior Agent, Heritage Life Solutions', date: 'Today', time: '2:15 PM', read: false },
    { id: 'e2', to: 'williams.j@gmail.com', subject: 'Policy Renewal Reminder — Term Life', preview: 'Dear Jennifer, your term life policy #TL-4892 is coming up for renewal on...', body: 'Dear Jennifer,\n\nYour term life policy #TL-4892 is coming up for renewal on April 15, 2026. I wanted to reach out early to discuss your options:\n\n1. Renew at current terms — Your premium will increase to $142/month based on your current age bracket.\n2. Convert to Whole Life — Lock in a permanent rate of $198/month with cash value accumulation.\n3. Increase coverage — Now is a great time to review if your current $500K coverage still meets your family\'s needs.\n\nI\'d love to schedule a 20-minute review call to walk through these options. Would next Tuesday or Wednesday work for you?\n\nWarm regards,\nSarah Johnson', date: 'Today', time: '10:30 AM', read: true },
    { id: 'e3', to: 'park.family@outlook.com', subject: 'Welcome to Heritage Life Solutions', preview: 'Welcome aboard! I\'m excited to be your dedicated agent. Here\'s what to expect...', body: 'Welcome aboard!\n\nI\'m excited to be your dedicated agent at Heritage Life Solutions. Here\'s what to expect in the coming days:\n\n• Within 24 hours: You\'ll receive your policy documents via email\n• Within 1 week: Your physical policy packet will arrive by mail\n• Within 30 days: I\'ll schedule our first policy review call\n\nAs your agent, I\'m here to help with any questions about your coverage, claims, or future planning needs. Don\'t hesitate to reach out anytime.\n\nLooking forward to working with your family!\n\nSarah Johnson\n(555) 234-5678', date: 'Yesterday', time: '4:45 PM', read: true },
    { id: 'e4', to: 'garcia.m@email.com', subject: 'Whole Life vs IUL — Comparison Sheet', preview: 'As discussed, I\'ve attached the comparison breakdown for both options...', body: 'Hi Maria,\n\nAs discussed on our call, I\'ve attached the comparison breakdown for both options:\n\nWhole Life:\n• Guaranteed cash value growth\n• Fixed premiums for life\n• Dividend potential (Heritage has paid dividends 47 consecutive years)\n• Premium: $245/month for $500K coverage\n\nIndexed Universal Life (IUL):\n• Cash value tied to S&P 500 performance (with floor protection)\n• Flexible premiums\n• Higher growth potential but not guaranteed\n• Premium: $198/month for $500K coverage\n\nBased on your goals of college funding + retirement supplement, I\'d recommend the IUL for its flexibility and growth potential. Happy to dive deeper on our next call.\n\nBest,\nSarah', date: 'Yesterday', time: '11:00 AM', read: true },
  ],
  '2': [
    { id: 'e1', to: 'garcia.family@email.com', subject: 'Follow-Up: Whole Life Application', preview: 'Hi Maria, just checking in on the application we discussed last week...', body: 'Hi Maria,\n\nJust checking in on the Whole Life application we discussed last week. I wanted to make sure you received the forms I sent over and see if you have any questions.\n\nAs a reminder, we need to complete the application by March 15th to lock in the current rate of $245/month.\n\nPlease let me know if there\'s anything I can help with!\n\nBest,\nMike Chen', date: 'Today', time: '11:45 AM', read: false },
    { id: 'e2', to: 'chen.r@gmail.com', subject: 'Annual Review Scheduling', preview: 'It\'s time for your annual policy review. I have availability next...', body: 'Hi there,\n\nIt\'s time for your annual policy review! I have availability next week on:\n\n• Tuesday 10:00 AM - 12:00 PM\n• Wednesday 2:00 PM - 4:00 PM\n• Thursday 9:00 AM - 11:00 AM\n\nThe review typically takes about 30 minutes and we\'ll cover:\n1. Current coverage adequacy\n2. Beneficiary updates\n3. Any life changes that may affect your policy\n4. Cash value growth (if applicable)\n\nPlease reply with your preferred time.\n\nMike Chen\nHeritage Life Solutions', date: 'Today', time: '9:00 AM', read: true },
    { id: 'e3', to: 'brooks.t@outlook.com', subject: 'IUL Performance Report — Q4', preview: 'Attached is your quarterly IUL performance report showing cash value growth...', body: 'Hi Tom,\n\nAttached is your quarterly IUL performance report. Key highlights:\n\n• Cash Value: $47,820 (+$3,200 this quarter)\n• Index Credit: 8.2% (S&P 500 annual point-to-point)\n• Floor Protection: 0% — not triggered this quarter\n• Death Benefit: $750,000 (unchanged)\n\nYour policy is performing well above the illustrated rate. Let me know if you\'d like to discuss adjusting your premium allocation strategy.\n\nBest,\nMike', date: 'Mar 3', time: '3:30 PM', read: true },
  ],
  '3': [
    { id: 'e1', to: 'nguyen.h@email.com', subject: 'Term Life Quote — $500K Coverage', preview: 'Hi Huy, per our conversation, here\'s the quote for $500K 20-year term...', body: 'Hi Huy,\n\nPer our conversation, here\'s the quote for $500K 20-year term life:\n\n• Monthly Premium: $42.50\n• Coverage: $500,000\n• Term: 20 years\n• Convertible to permanent coverage within first 15 years\n\nThis rate is based on preferred plus underwriting. We\'ll confirm after the medical exam.\n\nLet me know if you\'d like to proceed!\n\nEmily Davis', date: 'Today', time: '1:00 PM', read: false },
    { id: 'e2', to: 'davis.team@heritage.com', subject: 'Pipeline Review Notes', preview: 'Notes from today\'s pipeline review attached. Key action items...', body: 'Team,\n\nNotes from today\'s pipeline review:\n\n• 12 active leads in pipeline ($340K total)\n• 3 proposals pending client review\n• 2 applications in underwriting\n• Action: Follow up with Nguyen and Chen leads by EOW\n\nNext review: Friday 2pm.\n\nEmily', date: 'Today', time: '10:15 AM', read: true },
    { id: 'e3', to: 'lead-batch@heritage.com', subject: 'New Lead Introductions (5)', preview: 'Sent personalized intro emails to 5 new leads assigned today...', body: 'Sent personalized introduction emails to 5 new leads assigned today. Each email included:\n\n• Personal introduction\n• Heritage Life overview\n• Free consultation offer\n• Calendar link for scheduling\n\nWill follow up by phone within 48 hours if no response.\n\nEmily Davis', date: 'Yesterday', time: '2:00 PM', read: true },
  ],
  '5': [
    { id: 'e1', to: 'patel.s@email.com', subject: 'Term Life Premium Breakdown', preview: 'Hi Sanjay, here\'s the detailed premium breakdown we discussed on our call...', body: 'Hi Sanjay,\n\nHere\'s the detailed premium breakdown we discussed:\n\n$250K Term — 20 Year:\n• Preferred Plus: $28.50/month\n• Preferred: $34.00/month\n• Standard: $45.00/month\n\n$500K Term — 20 Year:\n• Preferred Plus: $42.50/month\n• Preferred: $52.00/month\n• Standard: $68.00/month\n\nBased on your health profile, I believe you\'ll qualify for Preferred Plus. Let\'s schedule the paramedical exam this week.\n\nLisa Park', date: 'Today', time: '3:00 PM', read: false },
    { id: 'e2', to: 'kim.family@gmail.com', subject: 'Congratulations — Policy Issued!', preview: 'Great news! Your Whole Life policy has been officially issued. Policy number...', body: 'Great news!\n\nYour Whole Life policy has been officially issued!\n\n• Policy Number: WL-2026-8847\n• Coverage: $350,000\n• Monthly Premium: $198.00\n• Effective Date: March 1, 2026\n\nYour physical policy documents will arrive within 7-10 business days. In the meantime, your coverage is fully active.\n\nCongratulations on taking this important step for your family!\n\nLisa Park\nHeritage Life Solutions', date: 'Today', time: '9:30 AM', read: true },
    { id: 'e3', to: 'johnson.m@outlook.com', subject: 'Beneficiary Update Confirmation', preview: 'This confirms the beneficiary changes to your policy have been processed...', body: 'Hi,\n\nThis confirms the beneficiary changes to your policy #TL-9021 have been processed:\n\n• Primary: Michael Johnson (spouse) — 100%\n• Contingent: Emma Johnson (daughter) — 50%, James Johnson (son) — 50%\n\nThese changes are effective immediately. No further action is needed.\n\nLisa Park', date: 'Mar 3', time: '4:00 PM', read: true },
  ],
  '6': [
    { id: 'e1', to: 'new.lead@email.com', subject: 'Heritage Life — Protecting What Matters', preview: 'Thank you for your interest in Heritage Life Solutions. I\'d love to schedule...', body: 'Thank you for your interest in Heritage Life Solutions!\n\nI\'d love to schedule a brief 15-minute call to learn about your family\'s needs and share how we can help protect what matters most.\n\nI specialize in:\n• Term Life Insurance\n• Whole Life & Universal Life\n• Estate Planning\n• Retirement Income Strategies\n\nWould any of these times work for a quick chat?\n• Tomorrow 10:00 AM\n• Tomorrow 2:00 PM\n• Friday 11:00 AM\n\nLooking forward to connecting!\n\nDavid Brown\nSenior Agent, Heritage Life Solutions', date: 'Today', time: '2:30 PM', read: false },
    { id: 'e2', to: 'team@heritage.com', subject: 'Training Presentation — Final Deck', preview: 'Attached is the final version of the product training deck for tomorrow...', body: 'Team,\n\nAttached is the final version of the product training deck for tomorrow\'s session.\n\nAgenda:\n1. New IUL product features (15 min)\n2. Competitive positioning vs. competitors (10 min)\n3. Objection handling practice (20 min)\n4. Q&A (15 min)\n\nPlease review slides 12-18 beforehand — we\'ll be doing role-play exercises on those scenarios.\n\nSee you at 10 AM!\n\nDavid', date: 'Today', time: '11:00 AM', read: true },
  ],
  '7': [
    { id: 'e1', to: 'lee.estate@email.com', subject: 'Estate Shield — Signed Documents', preview: 'Congratulations! Attached are the signed documents for your Estate Shield policy...', body: 'Congratulations!\n\nAttached are the signed documents for your Estate Shield policy. Here\'s a summary:\n\n• Policy: Estate Shield Universal Life\n• Face Amount: $2,000,000\n• Annual Premium: $12,400\n• Cash Value Projection (Year 10): ~$98,000\n\nYour policy is now fully active. I\'ll reach out in 30 days for our first review.\n\nThank you for trusting Heritage Life with your estate planning!\n\nRachel Green\nTop Producer, Heritage Life Solutions', date: 'Today', time: '1:30 PM', read: true },
    { id: 'e2', to: 'mentee.agent@heritage.com', subject: 'Script Tips & Objection Handling', preview: 'Great call shadowing today! Here are the key scripts and objection handling tips...', body: 'Great call shadowing today! Here are the key tips:\n\nObjection: "I need to think about it"\n→ Response: "Absolutely, this is an important decision. What specific questions can I answer to help you feel confident?"\n\nObjection: "It\'s too expensive"\n→ Response: "I understand budget is important. Let me show you how $X/month protects $Y in coverage — that\'s less than a daily coffee."\n\nObjection: "I already have coverage through work"\n→ Response: "That\'s great! But did you know employer coverage typically ends when you leave? Let me show you how personal coverage works alongside it."\n\nKeep practicing these — you\'re doing great!\n\nRachel', date: 'Today', time: '10:00 AM', read: true },
    { id: 'e3', to: 'pipeline.review@heritage.com', subject: 'Pipeline Update — $95K Pending', preview: 'Current pipeline status: 4 deals pending at $95K total. Expected close dates...', body: 'Pipeline Update:\n\n4 deals pending — $95K total annual premium\n\n1. Lee Estate Shield — $38K (closing this week)\n2. Martinez Whole Life — $24K (underwriting)\n3. Park IUL — $18K (proposal sent)\n4. Chen Term — $15K (application pending)\n\nExpected close rate: 75% ($71K)\n\nRachel Green', date: 'Yesterday', time: '5:00 PM', read: true },
  ],
  '10': [
    { id: 'e1', to: 'brooks.a@email.com', subject: 'IUL Illustration — Updated Projections', preview: 'Hi Alex, I\'ve updated the IUL illustration with the revised premium amount...', body: 'Hi Alex,\n\nI\'ve updated the IUL illustration with the revised premium amount of $300/month. Key projections:\n\n• Year 5 Cash Value: ~$14,200\n• Year 10 Cash Value: ~$38,500\n• Year 20 Cash Value: ~$112,000\n• Year 30 Cash Value: ~$245,000\n\nThese projections assume a 6.5% illustrated rate. With the 0% floor, your cash value is protected even in down markets.\n\nLet me know if you\'d like to adjust the premium or review different scenarios.\n\nTom Rodriguez', date: 'Today', time: '12:00 PM', read: false },
    { id: 'e2', to: 'proposals@heritage.com', subject: 'Proposal Review Request (3 pending)', preview: 'Please review the following 3 proposals before EOD. Attached are...', body: 'Please review the following 3 proposals before EOD:\n\n1. Brooks IUL — $300/month, $500K coverage\n2. Adams Term — $45/month, $250K coverage\n3. Rivera Whole Life — $175/month, $200K coverage\n\nAll applications are complete and ready for submission pending approval.\n\nTom Rodriguez', date: 'Today', time: '9:15 AM', read: true },
  ],
  '11': [
    { id: 'e1', to: 'kim.corp@email.com', subject: 'Group Life Benefits — Proposal', preview: 'Thank you for the opportunity to present Heritage Life group benefits...', body: 'Thank you for the opportunity to present Heritage Life group benefits to Kim Corp!\n\nProposal Summary:\n• Group Term Life: $50K per employee\n• AD&D Coverage included\n• Voluntary supplemental available up to 5x salary\n• Monthly cost: $4.20/employee\n• Minimum participation: 75%\n\nBenefits of Heritage Group Plans:\n✓ Guaranteed issue for new hires\n✓ Portable coverage option\n✓ Online enrollment portal\n✓ Dedicated account manager\n\nI\'d love to schedule a presentation for your HR team. Does next week work?\n\nJessica Lee\nSenior Agent, Heritage Life Solutions', date: 'Today', time: '11:30 AM', read: true },
    { id: 'e2', to: 'client.list@heritage.com', subject: 'Weekly Client Touchpoints Completed', preview: 'Completed all 8 scheduled client touchpoints this week. Summary attached...', body: 'Weekly touchpoint summary — all 8 completed:\n\n✓ Kim Corp — group benefits follow-up\n✓ Anderson Family — annual review\n✓ Taylor Estate — policy update\n✓ Brown — claim status check\n✓ Martinez — renewal discussion\n✓ Patel — new product intro\n✓ Wilson — beneficiary change\n✓ Lee — referral thank you\n\nNo issues flagged. 2 referrals received (Patel → Singh, Lee → Park).\n\nJessica Lee', date: 'Mar 3', time: '4:30 PM', read: true },
  ],
};

// ─── AGENT MEETINGS (demo) ───
const AGENT_MEETINGS: Record<string, Array<{ id: string; title: string; date: string; time: string; duration: string; type: 'call' | 'video' | 'in-person'; attendee: string }>> = {
  '1': [
    { id: 'm1', title: 'Policy Review', date: 'Today', time: '3:30 PM', duration: '30 min', type: 'call', attendee: 'Robert Thompson' },
    { id: 'm2', title: 'New Client Consultation', date: 'Tomorrow', time: '10:00 AM', duration: '1 hour', type: 'video', attendee: 'Park Family' },
    { id: 'm3', title: 'Team Huddle', date: 'Tomorrow', time: '2:00 PM', duration: '15 min', type: 'video', attendee: 'Sales Team' },
  ],
  '2': [
    { id: 'm1', title: 'Annual Review', date: 'Tomorrow', time: '11:00 AM', duration: '45 min', type: 'video', attendee: 'R. Chen' },
    { id: 'm2', title: 'Coaching Session', date: 'Mar 7', time: '9:00 AM', duration: '30 min', type: 'call', attendee: 'Manager' },
  ],
  '3': [
    { id: 'm1', title: 'Pipeline Review', date: 'Today', time: '2:00 PM', duration: '1 hour', type: 'video', attendee: 'Sales Team' },
    { id: 'm2', title: 'Client Discovery Call', date: 'Tomorrow', time: '10:30 AM', duration: '30 min', type: 'call', attendee: 'Huy Nguyen' },
    { id: 'm3', title: 'Office Hours', date: 'Mar 7', time: '3:00 PM', duration: '1 hour', type: 'in-person', attendee: 'Walk-ins' },
  ],
  '5': [
    { id: 'm1', title: 'Term Life Presentation', date: 'Today', time: '4:00 PM', duration: '45 min', type: 'call', attendee: 'Sanjay Patel' },
    { id: 'm2', title: 'Follow-Up: Kim Family', date: 'Tomorrow', time: '9:30 AM', duration: '20 min', type: 'call', attendee: 'Kim Family' },
  ],
  '6': [
    { id: 'm1', title: 'Product Training', date: 'Tomorrow', time: '10:00 AM', duration: '1 hour', type: 'video', attendee: 'All Agents' },
    { id: 'm2', title: 'New Lead Intro Call', date: 'Tomorrow', time: '1:00 PM', duration: '30 min', type: 'call', attendee: 'New Lead' },
  ],
  '7': [
    { id: 'm1', title: 'Mentoring Session', date: 'Tomorrow', time: '9:00 AM', duration: '30 min', type: 'video', attendee: 'Junior Agent' },
    { id: 'm2', title: 'Client Check-In', date: 'Mar 7', time: '2:00 PM', duration: '20 min', type: 'call', attendee: 'Lee Estate' },
  ],
  '11': [
    { id: 'm1', title: 'Client Presentation', date: 'Today', time: '1:00 PM', duration: '1 hour', type: 'video', attendee: 'Kim Corp' },
    { id: 'm2', title: 'Coaching Session', date: 'Tomorrow', time: '10:00 AM', duration: '30 min', type: 'call', attendee: 'Manager' },
    { id: 'm3', title: 'Quarterly Review', date: 'Mar 10', time: '11:00 AM', duration: '45 min', type: 'in-person', attendee: 'Director' },
  ],
};

// ─── AGENT CALLS (demo) ───
const AGENT_CALLS: Record<string, Array<{ id: string; contact: string; direction: 'inbound' | 'outbound'; outcome: 'connected' | 'voicemail' | 'no-answer'; duration: string; date: string; time: string; hasRecording: boolean }>> = {
  '1': [
    { id: 'c1', contact: 'Robert Thompson', direction: 'outbound', outcome: 'connected', duration: '18:42', date: 'Today', time: '2:05 PM', hasRecording: true },
    { id: 'c2', contact: 'Jennifer Williams', direction: 'outbound', outcome: 'connected', duration: '12:15', date: 'Today', time: '11:30 AM', hasRecording: true },
    { id: 'c3', contact: 'Park Family', direction: 'inbound', outcome: 'connected', duration: '8:30', date: 'Today', time: '10:00 AM', hasRecording: true },
    { id: 'c4', contact: 'Maria Garcia', direction: 'outbound', outcome: 'voicemail', duration: '0:45', date: 'Today', time: '9:15 AM', hasRecording: false },
    { id: 'c5', contact: 'New Lead #4521', direction: 'outbound', outcome: 'no-answer', duration: '0:00', date: 'Yesterday', time: '4:30 PM', hasRecording: false },
  ],
  '2': [
    { id: 'c1', contact: 'Maria Garcia', direction: 'outbound', outcome: 'connected', duration: '22:10', date: 'Today', time: '10:45 AM', hasRecording: true },
    { id: 'c2', contact: 'R. Chen', direction: 'inbound', outcome: 'connected', duration: '15:30', date: 'Today', time: '9:30 AM', hasRecording: true },
    { id: 'c3', contact: 'Tom Brooks', direction: 'outbound', outcome: 'voicemail', duration: '0:52', date: 'Today', time: '8:45 AM', hasRecording: false },
    { id: 'c4', contact: 'New Lead #4518', direction: 'outbound', outcome: 'no-answer', duration: '0:00', date: 'Yesterday', time: '3:15 PM', hasRecording: false },
  ],
  '3': [
    { id: 'c1', contact: 'Huy Nguyen', direction: 'outbound', outcome: 'connected', duration: '14:20', date: 'Today', time: '12:30 PM', hasRecording: true },
    { id: 'c2', contact: 'Lead #4510', direction: 'outbound', outcome: 'connected', duration: '6:45', date: 'Today', time: '11:00 AM', hasRecording: true },
    { id: 'c3', contact: 'Lead #4511', direction: 'outbound', outcome: 'no-answer', duration: '0:00', date: 'Today', time: '10:30 AM', hasRecording: false },
    { id: 'c4', contact: 'Lead #4512', direction: 'outbound', outcome: 'voicemail', duration: '0:38', date: 'Today', time: '10:15 AM', hasRecording: false },
    { id: 'c5', contact: 'Lead #4509', direction: 'outbound', outcome: 'connected', duration: '9:10', date: 'Today', time: '9:00 AM', hasRecording: true },
  ],
  '5': [
    { id: 'c1', contact: 'Sanjay Patel', direction: 'outbound', outcome: 'connected', duration: '25:00', date: 'Today', time: '1:00 PM', hasRecording: true },
    { id: 'c2', contact: 'Kim Family', direction: 'inbound', outcome: 'connected', duration: '10:15', date: 'Today', time: '10:00 AM', hasRecording: true },
    { id: 'c3', contact: 'New Lead #4520', direction: 'outbound', outcome: 'connected', duration: '8:40', date: 'Today', time: '9:00 AM', hasRecording: true },
  ],
  '6': [
    { id: 'c1', contact: 'New Lead', direction: 'inbound', outcome: 'connected', duration: '11:30', date: 'Today', time: '2:00 PM', hasRecording: true },
    { id: 'c2', contact: 'Training Dept', direction: 'outbound', outcome: 'connected', duration: '5:20', date: 'Today', time: '11:30 AM', hasRecording: false },
    { id: 'c3', contact: 'Lead #4515', direction: 'outbound', outcome: 'voicemail', duration: '0:40', date: 'Today', time: '10:00 AM', hasRecording: false },
  ],
  '7': [
    { id: 'c1', contact: 'Lee Estate', direction: 'outbound', outcome: 'connected', duration: '32:15', date: 'Today', time: '11:00 AM', hasRecording: true },
    { id: 'c2', contact: 'Junior Agent', direction: 'inbound', outcome: 'connected', duration: '15:00', date: 'Today', time: '9:30 AM', hasRecording: false },
    { id: 'c3', contact: 'Pipeline Lead', direction: 'outbound', outcome: 'connected', duration: '18:45', date: 'Today', time: '8:30 AM', hasRecording: true },
    { id: 'c4', contact: 'Lead #4519', direction: 'outbound', outcome: 'no-answer', duration: '0:00', date: 'Yesterday', time: '4:00 PM', hasRecording: false },
  ],
  '10': [
    { id: 'c1', contact: 'Alex Brooks', direction: 'outbound', outcome: 'connected', duration: '20:30', date: 'Today', time: '11:15 AM', hasRecording: true },
    { id: 'c2', contact: 'Proposal Client', direction: 'inbound', outcome: 'connected', duration: '8:00', date: 'Today', time: '10:00 AM', hasRecording: true },
    { id: 'c3', contact: 'Lead #4516', direction: 'outbound', outcome: 'voicemail', duration: '0:50', date: 'Today', time: '9:30 AM', hasRecording: false },
  ],
  '11': [
    { id: 'c1', contact: 'Kim Corp HR', direction: 'outbound', outcome: 'connected', duration: '28:00', date: 'Today', time: '10:30 AM', hasRecording: true },
    { id: 'c2', contact: 'Client Follow-Up', direction: 'outbound', outcome: 'connected', duration: '12:00', date: 'Today', time: '9:00 AM', hasRecording: true },
    { id: 'c3', contact: 'New Referral', direction: 'inbound', outcome: 'connected', duration: '6:30', date: 'Yesterday', time: '3:45 PM', hasRecording: true },
  ],
};

// ─── MEETING TYPE STYLES ───
const MEETING_TYPE_STYLES: Record<string, { bg: string; text: string; icon: typeof Phone }> = {
  call: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: Phone },
  video: { bg: 'bg-violet-100', text: 'text-violet-700', icon: Video },
  'in-person': { bg: 'bg-blue-100', text: 'text-blue-700', icon: MapPin },
};

// ─── CALL OUTCOME STYLES ───
const CALL_OUTCOME_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  connected: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Connected' },
  voicemail: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Voicemail' },
  'no-answer': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'No Answer' },
};

/* ── Extracted content component (used by ManagerTeam toggle) ── */
export function ActivityMonitorContent({ timeRange = 'today' as TimeRange }: { timeRange?: TimeRange } = {}) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [hoveredCell, setHoveredCell] = useState<{ day: number; hour: number } | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<typeof DEMO_AGENT_ACTIVITY[0] | null>(null);
  const [drawerView, setDrawerView] = useState<'overview' | 'emails' | 'meetings' | 'calls' | 'emailDetail'>('overview');
  const [playingCall, setPlayingCall] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [heatmapPopup, setHeatmapPopup] = useState<{ cellKey: string; day: number; hour: number; x: number; y: number } | null>(null);
  const [listeningTo, setListeningTo] = useState<string | null>(null);
  const [showAllAgents, setShowAllAgents] = useState(false);
  const [allAgentsSearch, setAllAgentsSearch] = useState('');

  const GRID_MAX = 9;

  // Filter agents by status and search
  const filteredAgents = useMemo(() => {
    let agents = activeFilter === 'all'
      ? DEMO_AGENT_ACTIVITY
      : DEMO_AGENT_ACTIVITY.filter((a) => a.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      agents = agents.filter((a) => a.name.toLowerCase().includes(q));
    }
    return agents;
  }, [activeFilter, searchQuery]);

  // Count agents by status for the team summary bar
  const statusCounts = DEMO_AGENT_ACTIVITY.reduce<Record<AgentActivityStatus, number>>(
    (acc, agent) => {
      acc[agent.status] = (acc[agent.status] || 0) + 1;
      return acc;
    },
    { on_call: 0, available: 0, meeting: 0, break: 0, offline: 0 },
  );
  const totalAgents = DEMO_AGENT_ACTIVITY.length;

  return (
    <>
        {/* ─── STAT CARDS ─── */}
        <motion.div variants={fadeInUp}>
          <motion.div variants={staggerCards} initial="hidden" animate="visible">
            <ManagerStatCardGrid>
              <ManagerStatCard icon={Phone} value={STAT_VALUES[timeRange].calls} label={timeRange === 'today' ? 'Calls Today' : timeRange === 'week' ? 'Calls This Week' : 'Calls This Month'} delta={12} deltaFormat="percent" periodLabel="vs avg" />
              <ManagerStatCard icon={Mail} value={STAT_VALUES[timeRange].emails} label="Emails Sent" delta={5} periodLabel="vs avg" />
              <ManagerStatCard icon={Calendar} value={STAT_VALUES[timeRange].appointments} label="Appointments" delta={2} periodLabel="vs avg" />
              <ManagerStatCard icon={Clock} value={STAT_VALUES[timeRange].avgTime} label="Avg Active Time" delta={8} deltaFormat="percent" periodLabel="vs avg" />
            </ManagerStatCardGrid>
          </motion.div>
        </motion.div>

        {/* ─── STATUS FILTER PILLS ─── */}
        <motion.div variants={fadeInUp}>
          <div className="flex items-center p-1 gap-1 w-fit" style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}>
            {STATUS_FILTERS.map(({ key, label }) => {
              const isActive = activeFilter === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`font-medium border-0 transition-all ${isActive ? 'bg-white text-emerald-700 shadow-sm' : 'bg-transparent text-gray-500 hover:text-gray-700'}`}
                  style={{
                    fontSize: TYPE.meta,
                    padding: '4px 12px',
                    borderRadius: RADIUS.button,
                    cursor: 'pointer',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {label}
                  {key !== 'all' && (
                    <span className="ml-1.5 h-5 px-1.5 text-[10px] bg-emerald-100 text-emerald-700 inline-flex items-center justify-center" style={{ borderRadius: RADIUS.pill, fontWeight: 700, minWidth: 18 }}>
                      {statusCounts[key as AgentActivityStatus] || 0}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ─── GOLDEN RATIO 2-COL GRID ─── */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-1 lg:grid-cols-[1.618fr_1fr]"
          style={{ gap: GRID.spacing.lg }}
        >
          {/* ═══ LEFT COLUMN (1.618fr) ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ─── AGENT ACTIVITY GRID ─── */}
            <div
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.sm }}>
                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                  <div
                    className={`bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex items-center justify-center`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: RADIUS.button,
                    }}
                  >
                    <Users className="text-amber-200" style={{ width: 20, height: 20 }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                      Agent Activity
                    </h3>
                    <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                      {filteredAgents.length} agents shown
                    </p>
                  </div>
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative" style={{ marginBottom: GRID.spacing.sm }}>
                <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Search agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  style={{
                    fontSize: TYPE.meta,
                    padding: '8px 12px 8px 36px',
                    borderRadius: RADIUS.pill,
                    border: `1px solid ${COLORS.gray[200]}`,
                    backgroundColor: 'white',
                  }}
                />
              </div>

              <AnimatePresence mode="wait">
                {filteredAgents.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ManagerEmptyState
                      icon={Users}
                      title="No agents in this status"
                      description="No team members currently match the selected filter."
                    />
                  </motion.div>
                ) : (
                <motion.div
                  key={activeFilter}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                  className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3"
                  style={{ gap: GRID.spacing.sm }}
                >
                  {filteredAgents.slice(0, GRID_MAX).map((agent) => {
                    const statusStyle = ACTIVITY_STATUS_COLORS[agent.status];
                    return (
                      <motion.div
                        key={agent.id}
                        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
                        transition={{ duration: MOTION.duration.hover }}
                        className="cursor-pointer relative"
                        onClick={() => { setSelectedAgent(agent); setDrawerView('overview'); setPlayingCall(null); }}
                        style={{
                          ...GLASS.css.light,
                          borderRadius: RADIUS.button,
                          boxShadow: SHADOW.card,
                          padding: GRID.spacing.sm,
                        }}
                      >
                        {/* Avatar + Name + Status */}
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                          {/* Avatar */}
                          <div
                            className="bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"
                            style={{
                              width: LAYOUT.icon.xxl,
                              height: LAYOUT.icon.xxl,
                              borderRadius: RADIUS.button,
                            }}
                          >
                            <span className="text-white font-bold" style={{ fontSize: TYPE.meta }}>
                              {agent.avatar}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>
                              {agent.name.split(' ')[0]}
                            </p>
                            <div className="flex items-center" style={{ gap: 4 }}>
                              {agent.status === 'on_call' ? (
                                <motion.div
                                  animate={{ scale: [1, 1.3, 1] }}
                                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                                  className={statusStyle.dot}
                                  style={{ width: 6, height: 6, borderRadius: RADIUS.pill }}
                                />
                              ) : (
                                <div
                                  className={statusStyle.dot}
                                  style={{ width: 6, height: 6, borderRadius: RADIUS.pill }}
                                />
                              )}
                              <span className={statusStyle.text} style={{ fontSize: TYPE.caption }}>
                                {statusStyle.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Micro-counts */}
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginBottom: 6 }}>
                          <div className="flex items-center" style={{ gap: 3 }}>
                            <Phone className="text-gray-400" style={{ width: 12, height: 12 }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>
                              {agent.calls}
                            </span>
                          </div>
                          <div className="flex items-center" style={{ gap: 3 }}>
                            <Mail className="text-gray-400" style={{ width: 12, height: 12 }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>
                              {agent.emails}
                            </span>
                          </div>
                          <div className="flex items-center" style={{ gap: 3 }}>
                            <Calendar className="text-gray-400" style={{ width: 12, height: 12 }} />
                            <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>
                              {agent.meetings}
                            </span>
                          </div>
                        </div>

                        {/* Last action */}
                        <p
                          className="text-gray-500 truncate"
                          style={{ fontSize: TYPE.caption }}
                        >
                          {agent.lastAction}
                        </p>
                      </motion.div>
                    );
                  })}
                </motion.div>
                )}
              </AnimatePresence>

              {/* View All button when agents exceed grid max */}
              {filteredAgents.length > GRID_MAX && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setShowAllAgents(true); setAllAgentsSearch(''); }}
                  className="flex items-center justify-center w-full font-semibold text-white border-0 bg-gradient-to-r from-emerald-500 to-teal-600"
                  style={{
                    gap: 6,
                    marginTop: GRID.spacing.sm,
                    padding: '10px 0',
                    borderRadius: RADIUS.pill,
                    fontSize: TYPE.meta,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                  }}
                >
                  <Users style={{ width: 16, height: 16 }} />
                  View All Agents ({filteredAgents.length})
                </motion.button>
              )}
            </div>

            {/* ─── ACTIVITY HEATMAP ─── */}
            <div
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                <div
                  className={`bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex items-center justify-center`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                  }}
                >
                  <Activity className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Activity Heatmap
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Team activity intensity by day and hour
                  </p>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <div style={{ minWidth: 400 }}>
                  {/* Hour labels */}
                  <div className="flex" style={{ paddingLeft: 40, marginBottom: 4 }}>
                    {HEATMAP_HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="text-center text-gray-400 font-medium"
                        style={{ flex: 1, fontSize: TYPE.micro }}
                      >
                        {hour}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  {DEMO_ACTIVITY_HEATMAP.map((row, dayIdx) => (
                    <div key={dayIdx} className="flex items-center" style={{ gap: 4, marginBottom: 4 }}>
                      {/* Day label */}
                      <div
                        className="text-gray-500 font-medium text-right flex-shrink-0"
                        style={{ width: 36, fontSize: TYPE.caption }}
                      >
                        {HEATMAP_DAYS[dayIdx]}
                      </div>
                      {/* Cells */}
                      <div className="flex flex-1" style={{ gap: 3 }}>
                        {row.map((value, hourIdx) => {
                          const cellKey = `${dayIdx}-${hourIdx}`;
                          const opacity = Math.max(0.08, value / 18);
                          const isHovered =
                            hoveredCell?.day === dayIdx && hoveredCell?.hour === hourIdx;
                          const isPopupOpen = heatmapPopup?.cellKey === cellKey;
                          return (
                            <div
                              key={hourIdx}
                              className="relative"
                              style={{ flex: 1 }}
                              onMouseEnter={() => setHoveredCell({ day: dayIdx, hour: hourIdx })}
                              onMouseLeave={() => setHoveredCell(null)}
                              onClick={(e) => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                setHeatmapPopup(isPopupOpen ? null : { cellKey, day: dayIdx, hour: hourIdx, x: rect.left + rect.width / 2, y: rect.top });
                              }}
                            >
                              <div
                                style={{
                                  width: '100%',
                                  paddingTop: '100%',
                                  borderRadius: 4,
                                  background: isPopupOpen
                                    ? 'rgba(5, 150, 105, 0.9)'
                                    : `rgba(16, 185, 129, ${opacity})`,
                                  border: isPopupOpen
                                    ? '2px solid #047857'
                                    : isHovered
                                    ? '2px solid #059669'
                                    : '1px solid rgba(0, 0, 0, 0.04)',
                                  cursor: 'pointer',
                                  transition: 'border 0.15s ease, background 0.15s ease',
                                }}
                              />
                              {/* Tooltip */}
                              {isHovered && (
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: '110%',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    background: COLORS.gray[800],
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: RADIUS.input,
                                    fontSize: TYPE.micro,
                                    whiteSpace: 'nowrap',
                                    zIndex: 10,
                                    pointerEvents: 'none',
                                    boxShadow: SHADOW.level3,
                                  }}
                                >
                                  {HEATMAP_DAYS[dayIdx]} {HEATMAP_HOURS[hourIdx]}: {value} activities{HEATMAP_AGENTS[cellKey] ? ` · ${HEATMAP_AGENTS[cellKey].length} agents` : ''}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div
                className="flex items-center justify-end"
                style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.sm }}
              >
                <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>Less</span>
                {[0.08, 0.2, 0.4, 0.6, 0.85].map((op, i) => (
                  <div
                    key={i}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: `rgba(16, 185, 129, ${op})`,
                      border: '1px solid rgba(0, 0, 0, 0.04)',
                    }}
                  />
                ))}
                <span className="text-gray-400" style={{ fontSize: TYPE.micro }}>More</span>
              </div>

              {/* Heatmap Agent Popup */}
              <AnimatePresence>
                {heatmapPopup && (() => {
                  const activeIds = HEATMAP_AGENTS[heatmapPopup.cellKey] || [];
                  const activeAgents = DEMO_AGENT_ACTIVITY.filter((a) => activeIds.includes(a.id));
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      style={{
                        marginTop: GRID.spacing.sm,
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: COLORS.gray[50],
                        border: `1px solid ${COLORS.gray[200]}`,
                      }}
                    >
                      <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                        <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                          {HEATMAP_DAYS[heatmapPopup.day]} at {HEATMAP_HOURS[heatmapPopup.hour]}
                        </p>
                        <motion.button
                          onClick={() => setHeatmapPopup(null)}
                          className="text-gray-400 hover:text-gray-600"
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <X style={{ width: 14, height: 14 }} />
                        </motion.button>
                      </div>
                      {activeAgents.length === 0 ? (
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption }}>No agents active</p>
                      ) : (
                        <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs }}>
                          {activeAgents.map((agent) => {
                            const st = ACTIVITY_STATUS_COLORS[agent.status];
                            return (
                              <div
                                key={agent.id}
                                className="flex items-center"
                                style={{
                                  gap: 6,
                                  padding: '4px 10px',
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: 'white',
                                  border: `1px solid ${COLORS.gray[200]}`,
                                }}
                              >
                                <div
                                  className="bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"
                                  style={{ width: 22, height: 22, borderRadius: RADIUS.button }}
                                >
                                  <span className="text-white font-bold" style={{ fontSize: 9 }}>{agent.avatar}</span>
                                </div>
                                <span className="font-medium text-gray-800" style={{ fontSize: TYPE.caption }}>{agent.name.split(' ')[0]}</span>
                                <div className={st.dot} style={{ width: 6, height: 6, borderRadius: RADIUS.pill }} />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>
          </div>

          {/* ═══ RIGHT COLUMN (1fr) ═══ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.lg }}>
            {/* ─── LIVE ACTIVITY FEED ─── */}
            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: RADIUS.hero,
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                boxShadow: SHADOW.hero,
                padding: GRID.spacing.md,
              }}
            >
              {/* Fibonacci blobs */}
              <div
                className="absolute bg-amber-400/15 blur-2xl"
                style={{ width: 89, height: 89, top: -20, right: -10, borderRadius: RADIUS.pill }}
              />
              <div
                className="absolute bg-white/10 blur-xl"
                style={{ width: 55, height: 55, bottom: 40, left: -15, borderRadius: RADIUS.pill }}
              />
              <div
                className="absolute bg-teal-300/15 blur-lg"
                style={{ width: 34, height: 34, top: '60%', right: '30%', borderRadius: RADIUS.pill }}
              />

              <div className="relative z-10">
                <div
                  className="flex items-center justify-between"
                  style={{ marginBottom: GRID.spacing.sm }}
                >
                  <h3 className="font-bold text-white" style={{ fontSize: TYPE.title }}>
                    Live Activity Feed
                  </h3>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: RADIUS.pill,
                      background: '#4ade80',
                      boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                  {DEMO_LIVE_FEED.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Number(item.id) * 0.06, duration: MOTION.duration.normal }}
                      className="flex items-start"
                      style={{ gap: GRID.spacing.xs }}
                    >
                      {/* Avatar */}
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: LAYOUT.icon.xxl,
                          height: LAYOUT.icon.xxl,
                          borderRadius: RADIUS.button,
                          background: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(8px)',
                        }}
                      >
                        <span className="text-white font-bold" style={{ fontSize: TYPE.caption }}>
                          {item.avatar}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className="text-white/95 leading-snug"
                          style={{ fontSize: TYPE.meta }}
                        >
                          <span className="font-semibold">{item.agent.split(' ')[0]}</span>{' '}
                          <span className="text-white/80">
                            {item.action.replace(item.agent, '').trim()}
                          </span>
                        </p>
                        <div
                          className="flex items-center"
                          style={{ gap: 6, marginTop: 2 }}
                        >
                          <div
                            className={FEED_TYPE_COLORS[item.type] || 'bg-gray-400'}
                            style={{ width: 6, height: 6, borderRadius: RADIUS.pill }}
                          />
                          <span className="text-white/60" style={{ fontSize: TYPE.caption }}>
                            {item.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── TEAM STATUS SUMMARY ─── */}
            <div
              className="overflow-hidden border-0"
              style={{
                ...GLASS.css.light,
                border: 'none',
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                <div
                  className={`bg-gradient-to-br ${MANAGER_ICON_GRADIENT} flex items-center justify-center`}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: RADIUS.button,
                  }}
                >
                  <Users className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Team Status Summary
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {totalAgents} team members
                  </p>
                </div>
              </div>

              {/* Stacked bar */}
              <div
                className="flex overflow-hidden"
                style={{
                  height: GRID.spacing.lg,
                  borderRadius: RADIUS.button,
                  marginBottom: GRID.spacing.sm,
                }}
              >
                {(Object.entries(statusCounts) as [AgentActivityStatus, number][]).map(
                  ([status, count]) => {
                    if (count === 0) return null;
                    const pct = (count / totalAgents) * 100;
                    const colors = ACTIVITY_STATUS_COLORS[status];
                    return (
                      <motion.div
                        key={status}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: MOTION.duration.slow, ease: MOTION.easing }}
                        className={`${colors.dot} relative group`}
                        style={{ height: '100%' }}
                        title={`${colors.label}: ${count}`}
                      >
                        {pct > 12 && (
                          <span
                            className="absolute inset-0 flex items-center justify-center text-white font-bold"
                            style={{ fontSize: TYPE.micro }}
                          >
                            {count}
                          </span>
                        )}
                      </motion.div>
                    );
                  },
                )}
              </div>

              {/* Legend */}
              <div
                className="grid grid-cols-2"
                style={{ gap: GRID.spacing.xs }}
              >
                {(Object.entries(statusCounts) as [AgentActivityStatus, number][]).map(
                  ([status, count]) => {
                    const colors = ACTIVITY_STATUS_COLORS[status];
                    return (
                      <div key={status} className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                        <div
                          className={colors.dot}
                          style={{ width: 10, height: 10, borderRadius: RADIUS.pill, flexShrink: 0 }}
                        />
                        <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>
                          {colors.label}
                        </span>
                        <span className="font-semibold text-gray-900 ml-auto" style={{ fontSize: TYPE.caption }}>
                          {count}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        </motion.div>

      {/* ─── AGENT PROFILE DRAWER ─── */}
      <AnimatePresence>
        {selectedAgent && (() => {
          const profile = AGENT_PROFILES[selectedAgent.id];
          const statusStyle = ACTIVITY_STATUS_COLORS[selectedAgent.status];
          return (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: MOTION.duration.transition }}
                className="fixed inset-0 z-50"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                }}
                onClick={() => { setSelectedAgent(null); setPlayingCall(null); setDrawerView('overview'); }}
              />

              {/* Drawer Panel */}
              <motion.div
                initial={{ x: 480 }}
                animate={{ x: 0 }}
                exit={{ x: 480 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed right-0 top-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: 480,
                  maxWidth: '100vw',
                  backgroundColor: '#ffffff',
                  boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.15)',
                }}
              >
                {/* Gradient Header */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                    padding: GRID.spacing.md,
                  }}
                >
                  {/* Fibonacci blobs */}
                  <div style={{ width: 120, height: 120, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" />
                  <div style={{ width: 80, height: 80, borderRadius: RADIUS.pill }} className="absolute bottom-0 left-0 bg-amber-400/15 translate-y-1/2 -translate-x-1/4 blur-md" />

                  {/* Close button */}
                  <motion.button
                    onClick={() => { setSelectedAgent(null); setPlayingCall(null); setDrawerView('overview'); }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="absolute flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                    style={{
                      top: GRID.spacing.sm,
                      right: GRID.spacing.sm,
                      width: LAYOUT.icon.xl,
                      height: LAYOUT.icon.xl,
                      borderRadius: RADIUS.button,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <X style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                  </motion.button>

                  {/* Agent header */}
                  <div className="relative z-10 flex items-center" style={{ gap: GRID.spacing.md }}>
                    <div
                      className="flex items-center justify-center text-white font-bold bg-white/20 backdrop-blur flex-shrink-0"
                      style={{
                        width: GRID.spacing.xxxl,
                        height: GRID.spacing.xxxl,
                        borderRadius: RADIUS.card,
                        fontSize: TYPE.title,
                        border: '1px solid rgba(255,255,255,0.25)',
                      }}
                    >
                      {selectedAgent.avatar}
                    </div>
                    <div>
                      <h2 className="font-bold text-white" style={{ fontSize: TYPE.section }}>
                        {selectedAgent.name}
                      </h2>
                      <p className="text-white/80" style={{ fontSize: TYPE.meta }}>
                        {profile?.role || 'Agent'}
                      </p>
                      <div className="flex items-center mt-1" style={{ gap: GRID.spacing.xs }}>
                        {selectedAgent.status === 'on_call' ? (
                          <motion.div
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                            className={statusStyle.dot}
                            style={{ width: 8, height: 8, borderRadius: RADIUS.pill }}
                          />
                        ) : (
                          <div
                            className={statusStyle.dot}
                            style={{ width: 8, height: 8, borderRadius: RADIUS.pill }}
                          />
                        )}
                        <span className="text-white/70" style={{ fontSize: TYPE.caption }}>
                          {statusStyle.label}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Drawer Content — Drill-down views */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <AnimatePresence mode="wait">
                    {drawerView === 'overview' ? (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        transition={{ duration: 0.2, ease: MOTION.easing }}
                        style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
                      >
                        {/* KPI Summary Row */}
                        <div className="grid grid-cols-4" style={{ gap: GRID.spacing.xs }}>
                          {[
                            { icon: Phone, label: 'Calls', value: String(selectedAgent.calls) },
                            { icon: Mail, label: 'Emails', value: String(selectedAgent.emails) },
                            { icon: Calendar, label: 'Meetings', value: String(selectedAgent.meetings) },
                            { icon: Target, label: 'Quota', value: `${profile?.quota || 0}%` },
                          ].map((kpi) => {
                            const KpiIcon = kpi.icon;
                            return (
                              <div key={kpi.label} className="text-center" style={{ padding: `${GRID.spacing.xs}px 0` }}>
                                <KpiIcon className="text-gray-400 mx-auto" style={{ width: 14, height: 14, marginBottom: 2 }} />
                                <p className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>{kpi.value}</p>
                                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>{kpi.label}</p>
                              </div>
                            );
                          })}
                        </div>

                        {/* Gradient Pill Buttons — view details */}
                        <div className="flex flex-wrap" style={{ gap: GRID.spacing.xs }}>
                          {[
                            { icon: Phone, label: 'View Calls', view: 'calls' as const },
                            { icon: Mail, label: 'View Emails', view: 'emails' as const },
                            { icon: Calendar, label: 'View Meetings', view: 'meetings' as const },
                          ].map((btn) => {
                            const BtnIcon = btn.icon;
                            return (
                              <motion.button
                                key={btn.label}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => { setDrawerView(btn.view); setPlayingCall(null); setSelectedEmail(null); }}
                                className="flex items-center font-semibold text-white border-0 bg-gradient-to-r from-emerald-500 to-teal-600"
                                style={{
                                  gap: 6,
                                  padding: '6px 16px',
                                  borderRadius: RADIUS.pill,
                                  fontSize: TYPE.caption,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 8px rgba(5, 150, 105, 0.3)',
                                }}
                              >
                                <BtnIcon style={{ width: 13, height: 13 }} />
                                {btn.label}
                              </motion.button>
                            );
                          })}
                        </div>

                        {/* Revenue & Streak row */}
                        <div className="flex" style={{ gap: GRID.spacing.sm }}>
                          <div className="flex-1" style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[50] }}>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2, marginBottom: 4 }}>
                              <DollarSign className="text-gray-400" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>Revenue</span>
                            </div>
                            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.title }}>${((profile?.revenue || 0) / 1000).toFixed(0)}K</p>
                          </div>
                          <div className="flex-1" style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[50] }}>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2, marginBottom: 4 }}>
                              <Flame className="text-gray-400" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>Streak</span>
                            </div>
                            <p className={`font-bold ${(profile?.streak || 0) >= 5 ? 'text-emerald-600' : 'text-gray-900'}`} style={{ fontSize: TYPE.title }}>{profile?.streak || 0} days</p>
                          </div>
                        </div>

                        {/* Current Activity */}
                        <div style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[50] }}>
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs / 2, marginBottom: 4 }}>
                            <Activity className="text-gray-400" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                            <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>Current Activity</span>
                          </div>
                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{selectedAgent.lastAction}</p>
                        </div>

                        {/* Live Call Listen-In */}
                        {selectedAgent.status === 'on_call' && (
                          <div
                            style={{
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              border: listeningTo === selectedAgent.id ? '1px solid #059669' : '1px solid #e5e7eb',
                              backgroundColor: listeningTo === selectedAgent.id ? '#ecfdf5' : 'white',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                {listeningTo === selectedAgent.id ? (
                                  <motion.div
                                    animate={{ scale: [1, 1.15, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                  >
                                    <Headphones className="text-emerald-600" style={{ width: 18, height: 18 }} />
                                  </motion.div>
                                ) : (
                                  <Headphones className="text-gray-400" style={{ width: 18, height: 18 }} />
                                )}
                                <div>
                                  <p className={`font-semibold ${listeningTo === selectedAgent.id ? 'text-emerald-700' : 'text-gray-700'}`} style={{ fontSize: TYPE.meta }}>
                                    {listeningTo === selectedAgent.id ? 'Listening to live call...' : 'Live call in progress'}
                                  </p>
                                  {listeningTo === selectedAgent.id && (
                                    <div className="flex items-center" style={{ gap: 4, marginTop: 2 }}>
                                      {[0, 1, 2, 3, 4].map((i) => (
                                        <motion.div
                                          key={i}
                                          animate={{ height: [3, 10 + Math.random() * 6, 3] }}
                                          transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.1 }}
                                          className="bg-emerald-500"
                                          style={{ width: 3, borderRadius: 2 }}
                                        />
                                      ))}
                                      <span className="text-emerald-600 ml-1 font-mono" style={{ fontSize: TYPE.micro }}>Live</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => {
                                  if (listeningTo === selectedAgent.id) {
                                    setListeningTo(null);
                                    toast('Stopped listening', { description: `Disconnected from ${selectedAgent.name}'s call.` });
                                  } else {
                                    setListeningTo(selectedAgent.id);
                                    toast.success('Connected', { description: `Now listening to ${selectedAgent.name}'s live call.` });
                                  }
                                }}
                                className={`flex items-center font-semibold border-0 ${listeningTo === selectedAgent.id ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'}`}
                                style={{
                                  gap: 6,
                                  padding: '6px 14px',
                                  borderRadius: RADIUS.pill,
                                  fontSize: TYPE.caption,
                                  cursor: 'pointer',
                                  boxShadow: listeningTo === selectedAgent.id ? 'none' : '0 2px 8px rgba(5, 150, 105, 0.3)',
                                }}
                              >
                                {listeningTo === selectedAgent.id ? (
                                  <>
                                    <PhoneOff style={{ width: 13, height: 13 }} />
                                    Disconnect
                                  </>
                                ) : (
                                  <>
                                    <Headphones style={{ width: 13, height: 13 }} />
                                    Listen In
                                  </>
                                )}
                              </motion.button>
                            </div>
                          </div>
                        )}

                        {/* Recent Activity */}
                        {profile?.recentActivity && (
                          <div>
                            <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.sm }}>
                              <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700" style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}>
                                <Zap className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                              </div>
                              <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Recent Activity</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                              {profile.recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-start" style={{ gap: GRID.spacing.xs, padding: `${GRID.spacing.xs}px 0` }}>
                                  <div className="bg-emerald-500 flex-shrink-0" style={{ width: 6, height: 6, borderRadius: RADIUS.pill, marginTop: 6 }} />
                                  <p className="text-gray-700" style={{ fontSize: TYPE.meta }}>{activity}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="flex flex-col" style={{ gap: GRID.spacing.xs }}>
                          <motion.button
                            className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-r from-blue-500 to-indigo-600 w-full"
                            style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.pill, cursor: 'pointer', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toast.success(`Message sent to ${selectedAgent.name}`, { description: 'They\'ll receive it in their inbox.' })}
                          >
                            <Send style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            Send Message
                          </motion.button>
                          <Link href="/manager/development">
                            <motion.button
                              className="flex items-center justify-center font-semibold text-white border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 w-full"
                              style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, cursor: 'pointer' }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <GraduationCap style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              Schedule Coaching Session
                            </motion.button>
                          </Link>
                          <Link href={`/manager/scorecard/${selectedAgent.id}`}>
                            <motion.button
                              className="flex items-center justify-center font-semibold text-gray-700 border w-full"
                              style={{ fontSize: TYPE.meta, gap: GRID.spacing.xs, padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`, borderRadius: RADIUS.button, borderColor: COLORS.gray[200], backgroundColor: 'white', cursor: 'pointer' }}
                              whileHover={{ scale: 1.02, backgroundColor: COLORS.gray[50] }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Eye style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                              View Full Scorecard
                              <ChevronRight style={{ width: LAYOUT.icon.sm, height: LAYOUT.icon.sm }} />
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key={drawerView + (selectedEmail || '')}
                        initial={{ x: 200, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 200, opacity: 0 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        style={{ padding: GRID.spacing.md }}
                      >
                        {/* Back button */}
                        <motion.button
                          onClick={() => {
                            if (drawerView === 'emailDetail') { setDrawerView('emails'); setSelectedEmail(null); }
                            else { setDrawerView('overview'); setPlayingCall(null); setSelectedEmail(null); }
                          }}
                          className="flex items-center text-gray-500 hover:text-emerald-600"
                          style={{ gap: 4, fontSize: TYPE.meta, marginBottom: GRID.spacing.md, cursor: 'pointer', border: 'none', background: 'none', padding: 0 }}
                          whileHover={{ x: -2 }}
                        >
                          <ChevronLeft style={{ width: 16, height: 16 }} />
                          {drawerView === 'emailDetail' ? 'Back to Emails' : 'Back to Overview'}
                        </motion.button>

                        {/* ═══ EMAILS LIST ═══ */}
                        {drawerView === 'emails' && (() => {
                          const emails = AGENT_EMAILS[selectedAgent.id];
                          return (
                            <>
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                                <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700" style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}>
                                  <Mail className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Sent Emails</p>
                                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{emails?.length || 0} emails</p>
                                </div>
                              </div>
                              {!emails || emails.length === 0 ? (
                                <ManagerEmptyState icon={Mail} title="No emails sent" description="This agent hasn't sent any emails through the internal system today." />
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                                  {emails.map((email) => (
                                    <motion.div
                                      key={email.id}
                                      whileHover={{ backgroundColor: COLORS.gray[50] }}
                                      onClick={() => { setSelectedEmail(email.id); setDrawerView('emailDetail'); }}
                                      style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, borderBottom: `1px solid ${COLORS.gray[100]}`, cursor: 'pointer' }}
                                    >
                                      <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                                        <div className="flex-shrink-0 mt-2">
                                          {!email.read ? (
                                            <div className="bg-emerald-500" style={{ width: 8, height: 8, borderRadius: RADIUS.pill }} />
                                          ) : (
                                            <div style={{ width: 8, height: 8 }} />
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
                                            <p className={`truncate ${!email.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`} style={{ fontSize: TYPE.meta }}>
                                              {email.subject}
                                            </p>
                                            <ChevronRight className="text-gray-300 flex-shrink-0 ml-2" style={{ width: 14, height: 14 }} />
                                          </div>
                                          <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: 4 }}>
                                            <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>To:</span>
                                            <span className="text-gray-600 truncate" style={{ fontSize: TYPE.caption }}>{email.to}</span>
                                            <span className="text-gray-300 ml-auto flex-shrink-0" style={{ fontSize: TYPE.caption }}>{email.date} {email.time}</span>
                                          </div>
                                          <p className="text-gray-500 truncate" style={{ fontSize: TYPE.caption }}>{email.preview}</p>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* ═══ EMAIL DETAIL ═══ */}
                        {drawerView === 'emailDetail' && (() => {
                          const emails = AGENT_EMAILS[selectedAgent.id];
                          const email = emails?.find((e) => e.id === selectedEmail);
                          if (!email) return null;
                          return (
                            <>
                              <h3 className="font-bold text-gray-900" style={{ fontSize: TYPE.body, marginBottom: GRID.spacing.sm }}>
                                {email.subject}
                              </h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: GRID.spacing.md }}>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption, minWidth: 36 }}>From:</span>
                                  <span className="text-gray-700" style={{ fontSize: TYPE.caption }}>{selectedAgent.name}</span>
                                </div>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption, minWidth: 36 }}>To:</span>
                                  <span className="text-gray-700" style={{ fontSize: TYPE.caption }}>{email.to}</span>
                                </div>
                                <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                  <span className="text-gray-400 font-medium" style={{ fontSize: TYPE.caption, minWidth: 36 }}>Date:</span>
                                  <span className="text-gray-700" style={{ fontSize: TYPE.caption }}>{email.date} at {email.time}</span>
                                </div>
                              </div>
                              <div
                                style={{
                                  padding: GRID.spacing.md,
                                  borderRadius: RADIUS.button,
                                  backgroundColor: COLORS.gray[50],
                                  whiteSpace: 'pre-wrap',
                                  fontSize: TYPE.meta,
                                  lineHeight: 1.6,
                                  color: COLORS.gray[700],
                                }}
                              >
                                {email.body}
                              </div>
                            </>
                          );
                        })()}

                        {/* ═══ MEETINGS VIEW ═══ */}
                        {drawerView === 'meetings' && (() => {
                          const meetings = AGENT_MEETINGS[selectedAgent.id];
                          return (
                            <>
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                                <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700" style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}>
                                  <Calendar className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Scheduled Meetings</p>
                                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{meetings?.length || 0} upcoming</p>
                                </div>
                              </div>
                              {!meetings || meetings.length === 0 ? (
                                <ManagerEmptyState icon={Calendar} title="No meetings scheduled" description="This agent doesn't have any upcoming meetings." />
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                                  {meetings.map((meeting) => {
                                    const typeStyle = MEETING_TYPE_STYLES[meeting.type];
                                    const TypeIcon = typeStyle.icon;
                                    return (
                                      <div key={meeting.id} style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[50] }}>
                                        <div className="flex items-center justify-between" style={{ marginBottom: GRID.spacing.xs }}>
                                          <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>{meeting.title}</p>
                                          <span
                                            className={`flex items-center ${typeStyle.bg} ${typeStyle.text}`}
                                            style={{ fontSize: TYPE.caption, padding: '2px 8px', borderRadius: RADIUS.pill, gap: 4, fontWeight: 500 }}
                                          >
                                            <TypeIcon style={{ width: 12, height: 12 }} />
                                            {meeting.type === 'in-person' ? 'In-Person' : meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                                          </span>
                                        </div>
                                        <div className="flex items-center" style={{ gap: GRID.spacing.md }}>
                                          <div className="flex items-center" style={{ gap: 4 }}>
                                            <Calendar className="text-gray-400" style={{ width: 12, height: 12 }} />
                                            <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>{meeting.date}</span>
                                          </div>
                                          <div className="flex items-center" style={{ gap: 4 }}>
                                            <Clock className="text-gray-400" style={{ width: 12, height: 12 }} />
                                            <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>{meeting.time}</span>
                                          </div>
                                          <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>{meeting.duration}</span>
                                        </div>
                                        <div className="flex items-center mt-1" style={{ gap: 4 }}>
                                          <Users className="text-gray-400" style={{ width: 12, height: 12 }} />
                                          <span className="text-gray-600" style={{ fontSize: TYPE.caption }}>{meeting.attendee}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()}

                        {/* ═══ CALLS VIEW ═══ */}
                        {drawerView === 'calls' && (() => {
                          const calls = AGENT_CALLS[selectedAgent.id];
                          return (
                            <>
                              <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.md }}>
                                <div className="flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700" style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button }}>
                                  <Phone className="text-amber-200" style={{ width: LAYOUT.icon.xs, height: LAYOUT.icon.xs }} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>Call Log</p>
                                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{calls?.length || 0} calls today</p>
                                </div>
                              </div>
                              {!calls || calls.length === 0 ? (
                                <ManagerEmptyState icon={Phone} title="No calls recorded" description="This agent hasn't made or received any calls today." />
                              ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                                  {calls.map((call) => {
                                    const outcomeStyle = CALL_OUTCOME_STYLES[call.outcome];
                                    const isPlaying = playingCall === `${selectedAgent.id}-${call.id}`;
                                    return (
                                      <div key={call.id} style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button, backgroundColor: COLORS.gray[50] }}>
                                        <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                                          <div
                                            className={`flex items-center justify-center flex-shrink-0 ${call.direction === 'inbound' ? 'bg-blue-100' : 'bg-emerald-100'}`}
                                            style={{ width: 32, height: 32, borderRadius: RADIUS.button }}
                                          >
                                            {call.direction === 'inbound' ? (
                                              <PhoneIncoming className="text-blue-600" style={{ width: 14, height: 14 }} />
                                            ) : (
                                              <PhoneOutgoing className="text-emerald-600" style={{ width: 14, height: 14 }} />
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{call.contact}</p>
                                              <span
                                                className={`flex-shrink-0 ${outcomeStyle.bg} ${outcomeStyle.text}`}
                                                style={{ fontSize: TYPE.micro, padding: '1px 6px', borderRadius: RADIUS.pill, fontWeight: 500 }}
                                              >
                                                {outcomeStyle.label}
                                              </span>
                                            </div>
                                            <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginTop: 2 }}>
                                              <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{call.date} {call.time}</span>
                                              {call.duration !== '0:00' && (
                                                <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>{call.duration}</span>
                                              )}
                                            </div>
                                          </div>
                                          {call.hasRecording && (
                                            <motion.button
                                              whileHover={{ scale: 1.1 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => setPlayingCall(isPlaying ? null : `${selectedAgent.id}-${call.id}`)}
                                              className={`flex items-center justify-center flex-shrink-0 ${isPlaying ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 border border-emerald-200'}`}
                                              style={{ width: 32, height: 32, borderRadius: RADIUS.pill, cursor: 'pointer' }}
                                            >
                                              {isPlaying ? (
                                                <Pause style={{ width: 14, height: 14 }} />
                                              ) : (
                                                <Play style={{ width: 14, height: 14, marginLeft: 1 }} />
                                              )}
                                            </motion.button>
                                          )}
                                        </div>
                                        {isPlaying && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            style={{ marginTop: GRID.spacing.xs }}
                                          >
                                            <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                                              <span className="text-emerald-600 font-mono" style={{ fontSize: TYPE.micro }}>0:00</span>
                                              <div className="flex-1 relative" style={{ height: 4, borderRadius: 2, backgroundColor: COLORS.gray[200] }}>
                                                <motion.div
                                                  initial={{ width: '0%' }}
                                                  animate={{ width: '35%' }}
                                                  transition={{ duration: 2, ease: 'easeOut' }}
                                                  className="absolute top-0 left-0 h-full bg-emerald-500"
                                                  style={{ borderRadius: 2 }}
                                                />
                                              </div>
                                              <span className="text-gray-400 font-mono" style={{ fontSize: TYPE.micro }}>{call.duration}</span>
                                            </div>
                                          </motion.div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>

      {/* ─── ALL AGENTS MODAL ─── */}
      <AnimatePresence>
        {showAllAgents && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.transition }}
              className="fixed inset-0 z-50"
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setShowAllAgents(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed z-50 overflow-hidden inset-0 m-auto"
              style={{
                width: '90vw',
                maxWidth: 720,
                height: '85vh',
                maxHeight: '85vh',
                borderRadius: RADIUS.hero,
                backgroundColor: '#ffffff',
                boxShadow: '0 24px 64px rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <div
                className="relative overflow-hidden flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
                  padding: GRID.spacing.md,
                }}
              >
                <div className="absolute bg-white/10 blur-sm" style={{ width: 100, height: 100, borderRadius: RADIUS.pill, top: -30, right: -20 }} />
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-white" style={{ fontSize: TYPE.section }}>All Agents</h2>
                    <p className="text-white/70" style={{ fontSize: TYPE.caption }}>{filteredAgents.length} team members</p>
                  </div>
                  <motion.button
                    onClick={() => setShowAllAgents(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
                    style={{ width: LAYOUT.icon.xl, height: LAYOUT.icon.xl, borderRadius: RADIUS.button, border: 'none', cursor: 'pointer' }}
                  >
                    <X style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                  </motion.button>
                </div>
              </div>

              {/* Search */}
              <div className="flex-shrink-0" style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px` }}>
                <div className="relative">
                  <Search className="absolute text-gray-400" style={{ width: 16, height: 16, left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={allAgentsSearch}
                    onChange={(e) => setAllAgentsSearch(e.target.value)}
                    className="w-full text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    style={{
                      fontSize: TYPE.meta,
                      padding: '8px 12px 8px 36px',
                      borderRadius: RADIUS.pill,
                      border: `1px solid ${COLORS.gray[200]}`,
                      backgroundColor: COLORS.gray[50],
                    }}
                  />
                </div>
              </div>

              {/* Agent List */}
              <div className="overflow-y-auto flex-1" style={{ padding: `0 ${GRID.spacing.md}px ${GRID.spacing.md}px` }}>
                <div className="grid grid-cols-2 sm:grid-cols-3" style={{ gap: GRID.spacing.sm }}>
                  {filteredAgents
                    .filter((a) => !allAgentsSearch.trim() || a.name.toLowerCase().includes(allAgentsSearch.toLowerCase()))
                    .map((agent) => {
                      const statusStyle = ACTIVITY_STATUS_COLORS[agent.status];
                      return (
                        <motion.div
                          key={agent.id}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ duration: MOTION.duration.hover }}
                          className="cursor-pointer"
                          onClick={() => { setShowAllAgents(false); setSelectedAgent(agent); setDrawerView('overview'); setPlayingCall(null); }}
                          style={{
                            ...GLASS.css.light,
                            borderRadius: RADIUS.button,
                            boxShadow: SHADOW.card,
                            padding: GRID.spacing.sm,
                          }}
                        >
                          <div className="flex items-center" style={{ gap: GRID.spacing.xs, marginBottom: GRID.spacing.xs }}>
                            <div
                              className="bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0"
                              style={{ width: LAYOUT.icon.xxl, height: LAYOUT.icon.xxl, borderRadius: RADIUS.button }}
                            >
                              <span className="text-white font-bold" style={{ fontSize: TYPE.meta }}>{agent.avatar}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.meta }}>{agent.name.split(' ')[0]}</p>
                              <div className="flex items-center" style={{ gap: 4 }}>
                                <div className={statusStyle.dot} style={{ width: 6, height: 6, borderRadius: RADIUS.pill }} />
                                <span className={statusStyle.text} style={{ fontSize: TYPE.caption }}>{statusStyle.label}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                            <div className="flex items-center" style={{ gap: 3 }}>
                              <Phone className="text-gray-400" style={{ width: 12, height: 12 }} />
                              <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>{agent.calls}</span>
                            </div>
                            <div className="flex items-center" style={{ gap: 3 }}>
                              <Mail className="text-gray-400" style={{ width: 12, height: 12 }} />
                              <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>{agent.emails}</span>
                            </div>
                            <div className="flex items-center" style={{ gap: 3 }}>
                              <Calendar className="text-gray-400" style={{ width: 12, height: 12 }} />
                              <span className="font-medium text-gray-700" style={{ fontSize: TYPE.caption }}>{agent.meetings}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Full page wrapper (kept for redirect compatibility) ── */
export function ManagerActivityMonitor() {
  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ─── HERO ─── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={Activity}
            title="Live Activity"
            subtitle="See what your team is doing right now"
            badge={
              <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                <div
                  className="flex items-center"
                  style={{
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: RADIUS.pill,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: RADIUS.pill,
                      background: '#4ade80',
                      boxShadow: '0 0 6px rgba(74, 222, 128, 0.6)',
                    }}
                  />
                  <span className="font-semibold text-white" style={{ fontSize: TYPE.caption }}>Live</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => toast.success('Report exported', { description: 'Activity report PDF has been downloaded.' })}
                  className="flex items-center font-semibold text-white"
                  style={{
                    gap: 5,
                    padding: '4px 12px',
                    borderRadius: RADIUS.pill,
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: TYPE.caption,
                  }}
                >
                  <Download style={{ width: 13, height: 13 }} />
                  Export
                </motion.button>
              </div>
            }
          />
        </motion.div>
        <ActivityMonitorContent />
      </motion.div>
    </ManagerLoungeLayout>
  );
}

export default ManagerActivityMonitor;
