/**
 * Manager Scorecard — Deep-dive agent performance view
 *
 * Detailed KPI scorecard for individual agents with activity timeline,
 * call recordings, performance trends, AI coaching moments, coaching notes
 * with linked actions, quick actions, and comparison mode.
 *
 * Heritage Design System — Emerald theme with amber accents
 */

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useLocation, useSearch } from 'wouter';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero, ManagerStatCard, ManagerStatCardGrid, ManagerEmptyState } from './primitives';
import { MANAGER_ICON_GRADIENT, glassCard, AGENT_SPARKLINES } from './managerConstants';
import { ScheduleOneOnOneModal } from './ScheduleOneOnOneModal';
import { ScheduleCoachingModal } from './ScheduleCoachingModal';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  GLASS,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
  staggerCards,
} from '@/lib/heritageDesignSystem';
import {
  UserCheck,
  DollarSign,
  Phone,
  Target,
  Shield,
  Mail,
  GraduationCap,
  Award,
  CheckCircle,
  Calendar,
  ChevronDown,
  Flag,
  Network,
  TrendingUp,
  Sparkles,
  Play,
  Pause,
  Square,
  Check,
  X,
  ClipboardList,
  GitCompare,
  ArrowUp,
  ArrowDown,
  PhoneOutgoing,
  PhoneIncoming,
  type LucideIcon,
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

// ─── DEMO DATA ───────────────────────────────────────────────

const AGENTS = [
  { id: '1', name: 'Sarah Johnson', role: 'Senior Agent', avatar: 'SJ', level: 6, apWeekly: 8500, calls: 45, closeRate: 18, complianceScore: 96, trends: { ap: 12, calls: 8, close: 2, compliance: 3 } },
  { id: '2', name: 'Mike Chen', role: 'Agent', avatar: 'MC', level: 5, apWeekly: 6200, calls: 38, closeRate: 16, complianceScore: 91, trends: { ap: 6, calls: -3, close: 4, compliance: 1 } },
  { id: '3', name: 'Emily Davis', role: 'Agent', avatar: 'ED', level: 4, apWeekly: 5100, calls: 32, closeRate: 15, complianceScore: 87, trends: { ap: -4, calls: 5, close: -1, compliance: -2 } },
  { id: '4', name: 'James Wilson', role: 'Agent', avatar: 'JW', level: 3, apWeekly: 3800, calls: 24, closeRate: 17, complianceScore: 82, trends: { ap: 15, calls: -8, close: 6, compliance: 0 } },
  { id: '5', name: 'Lisa Park', role: 'Junior Agent', avatar: 'LP', level: 2, apWeekly: 2100, calls: 28, closeRate: 11, complianceScore: 79, trends: { ap: 22, calls: 18, close: 8, compliance: 5 } },
];

type ActivityType = 'call' | 'deal' | 'email' | 'coaching' | 'cert';
type ActivityItem = { id: string; type: ActivityType; description: string; timestamp: string; icon: LucideIcon };
type CoachingNote = { id: string; date: string; topic: string; summary: string };
type PerfTrend = { label: string; current: number; target: number; color: string; unit: string };
type CallRecording = { id: string; contact: string; duration: string; outcome: 'positive' | 'neutral' | 'negative'; date: string; type: 'outbound' | 'inbound'; scores: { rapport: number; discovery: number; presentation: number; closing: number } };
type AIInsight = { id: string; insight: string; confidence: number; action: string; dataPoints: string[]; trend: 'improving' | 'declining'; priority: 'high' | 'medium' | 'low' };
type PipelineItem = { stage: string; count: number; value: number };
type CertItem = { name: string; status: string; expiry: string; color: string };

const AGENT_ACTIVITY: Record<string, ActivityItem[]> = {
  '1': [
    { id: '1', type: 'call', description: 'Completed 45-minute client call with Anderson Group', timestamp: '10 min ago', icon: Phone },
    { id: '2', type: 'deal', description: 'Moved Thompson Corp to Proposal stage ($32K)', timestamp: '1 hr ago', icon: Target },
    { id: '3', type: 'email', description: 'Sent follow-up quote to Williams Family', timestamp: '2 hrs ago', icon: Mail },
    { id: '4', type: 'coaching', description: 'Completed coaching session — objection handling', timestamp: '1 day ago', icon: GraduationCap },
    { id: '5', type: 'cert', description: 'Passed Advanced Life Insurance certification', timestamp: '3 days ago', icon: Award },
    { id: '6', type: 'deal', description: 'Closed Rodriguez policy ($18K annual premium)', timestamp: '4 days ago', icon: CheckCircle },
  ],
  '2': [
    { id: '1', type: 'call', description: 'Called Nguyen Family — 30 min discovery call', timestamp: '25 min ago', icon: Phone },
    { id: '2', type: 'email', description: 'Sent proposal to Park Industries ($22K)', timestamp: '2 hrs ago', icon: Mail },
    { id: '3', type: 'deal', description: 'Moved Kim Corp to Negotiation stage ($18K)', timestamp: '3 hrs ago', icon: Target },
    { id: '4', type: 'call', description: 'Follow-up with Lee Family — policy questions', timestamp: '1 day ago', icon: Phone },
    { id: '5', type: 'coaching', description: 'Completed coaching session — closing techniques', timestamp: '2 days ago', icon: GraduationCap },
  ],
  '3': [
    { id: '1', type: 'email', description: 'Sent quote to Martinez Family ($14K)', timestamp: '1 hr ago', icon: Mail },
    { id: '2', type: 'call', description: 'Cold called 8 prospects — 2 interested', timestamp: '3 hrs ago', icon: Phone },
    { id: '3', type: 'deal', description: 'Closed Adams policy ($9K annual premium)', timestamp: '1 day ago', icon: CheckCircle },
    { id: '4', type: 'coaching', description: 'Completed coaching session — pipeline management', timestamp: '3 days ago', icon: GraduationCap },
    { id: '5', type: 'cert', description: 'Started Health Insurance certification course', timestamp: '5 days ago', icon: Award },
  ],
  '4': [
    { id: '1', type: 'call', description: 'Called Robinson Estate — needs review', timestamp: '45 min ago', icon: Phone },
    { id: '2', type: 'deal', description: 'Moved Taylor Family to Proposal ($15K)', timestamp: '2 hrs ago', icon: Target },
    { id: '3', type: 'email', description: 'Sent follow-up to 5 warm leads', timestamp: '4 hrs ago', icon: Mail },
    { id: '4', type: 'call', description: 'Prospecting calls — 12 dials, 3 connects', timestamp: '1 day ago', icon: Phone },
    { id: '5', type: 'coaching', description: 'Completed coaching session — discovery questions', timestamp: '4 days ago', icon: GraduationCap },
  ],
  '5': [
    { id: '1', type: 'call', description: 'Shadow call with manager — Brown Family', timestamp: '1 hr ago', icon: Phone },
    { id: '2', type: 'email', description: 'Sent intro emails to 10 new leads', timestamp: '3 hrs ago', icon: Mail },
    { id: '3', type: 'coaching', description: 'Coaching session — rapport building basics', timestamp: '1 day ago', icon: GraduationCap },
    { id: '4', type: 'cert', description: 'Completed Life Insurance License exam prep', timestamp: '2 days ago', icon: Award },
    { id: '5', type: 'call', description: 'First solo call — Henderson Family', timestamp: '3 days ago', icon: Phone },
  ],
};

const AGENT_COACHING_NOTES: Record<string, CoachingNote[]> = {
  '1': [
    { id: '1', date: 'Feb 28', topic: 'Objection Handling', summary: 'Worked on price objection responses. Agent showing improvement in reframing value proposition.' },
    { id: '2', date: 'Feb 21', topic: 'Pipeline Review', summary: 'Reviewed 8 active deals. Identified 3 that need acceleration. Set follow-up cadence.' },
    { id: '3', date: 'Feb 14', topic: 'Goal Setting', summary: 'Set Q1 target to $95K AP. Discussed strategies for reaching Level 7 by end of quarter.' },
  ],
  '2': [
    { id: '1', date: 'Mar 1', topic: 'Closing Techniques', summary: 'Reviewed assumptive close and trial close methods. Mike needs to be more confident asking for the sale.' },
    { id: '2', date: 'Feb 22', topic: 'Time Management', summary: 'Discussed blocking 2hrs daily for prospecting. Mike tends to over-research before calling.' },
    { id: '3', date: 'Feb 15', topic: 'Product Knowledge', summary: 'Reviewed IUL and whole life differences. Needs to better articulate cash value benefits.' },
  ],
  '3': [
    { id: '1', date: 'Mar 2', topic: 'Pipeline Management', summary: 'Emily has 15 open deals but only 3 actively moving. Need to prioritize and disqualify stale leads.' },
    { id: '2', date: 'Feb 23', topic: 'Presentation Skills', summary: 'Reviewed client presentation deck. Needs to focus more on storytelling and less on features.' },
  ],
  '4': [
    { id: '1', date: 'Feb 27', topic: 'Discovery Questions', summary: 'James asks good surface questions but needs to dig deeper into client pain points and motivations.' },
    { id: '2', date: 'Feb 20', topic: 'Follow-Up Cadence', summary: 'Set up a 7-touch follow-up system. James was losing deals by not following up consistently.' },
  ],
  '5': [
    { id: '1', date: 'Mar 3', topic: 'Rapport Building', summary: 'Lisa is improving on small talk but needs to transition more naturally into discovery. Practice scenarios assigned.' },
    { id: '2', date: 'Feb 24', topic: 'Product Basics', summary: 'Reviewed term vs whole life fundamentals. Lisa passed quiz with 88%. Ready for more complex products.' },
    { id: '3', date: 'Feb 17', topic: 'Call Structure', summary: 'Introduced SPIN selling framework. Lisa will practice on 5 calls next week with recording review.' },
  ],
};

const AGENT_PERF_TRENDS: Record<string, PerfTrend[]> = {
  '1': [
    { label: 'Weekly AP', current: 85, target: 100, color: '#10b981', unit: '%' },
    { label: 'Call Volume', current: 72, target: 100, color: '#0d9488', unit: '%' },
    { label: 'Close Rate', current: 90, target: 100, color: '#f59e0b', unit: '%' },
    { label: 'Compliance', current: 96, target: 100, color: '#059669', unit: '%' },
  ],
  '2': [
    { label: 'Weekly AP', current: 73, target: 100, color: '#10b981', unit: '%' },
    { label: 'Call Volume', current: 68, target: 100, color: '#0d9488', unit: '%' },
    { label: 'Close Rate', current: 80, target: 100, color: '#f59e0b', unit: '%' },
    { label: 'Compliance', current: 91, target: 100, color: '#059669', unit: '%' },
  ],
  '3': [
    { label: 'Weekly AP', current: 60, target: 100, color: '#10b981', unit: '%' },
    { label: 'Call Volume', current: 58, target: 100, color: '#0d9488', unit: '%' },
    { label: 'Close Rate', current: 75, target: 100, color: '#f59e0b', unit: '%' },
    { label: 'Compliance', current: 87, target: 100, color: '#059669', unit: '%' },
  ],
  '4': [
    { label: 'Weekly AP', current: 45, target: 100, color: '#10b981', unit: '%' },
    { label: 'Call Volume', current: 43, target: 100, color: '#0d9488', unit: '%' },
    { label: 'Close Rate', current: 85, target: 100, color: '#f59e0b', unit: '%' },
    { label: 'Compliance', current: 82, target: 100, color: '#059669', unit: '%' },
  ],
  '5': [
    { label: 'Weekly AP', current: 25, target: 100, color: '#10b981', unit: '%' },
    { label: 'Call Volume', current: 50, target: 100, color: '#0d9488', unit: '%' },
    { label: 'Close Rate', current: 55, target: 100, color: '#f59e0b', unit: '%' },
    { label: 'Compliance', current: 79, target: 100, color: '#059669', unit: '%' },
  ],
};

const AGENT_RECORDINGS: Record<string, CallRecording[]> = {
  '1': [
    { id: '1', contact: 'Anderson Group — Jim Anderson', duration: '45:12', outcome: 'positive', date: 'Today, 10:15 AM', type: 'outbound', scores: { rapport: 92, discovery: 88, presentation: 95, closing: 90 } },
    { id: '2', contact: 'Thompson Estate — Lisa Thompson', duration: '32:08', outcome: 'positive', date: 'Today, 9:00 AM', type: 'outbound', scores: { rapport: 85, discovery: 91, presentation: 78, closing: 88 } },
    { id: '3', contact: 'Williams Family — Mark Williams', duration: '18:45', outcome: 'neutral', date: 'Yesterday, 4:30 PM', type: 'inbound', scores: { rapport: 72, discovery: 65, presentation: 70, closing: 55 } },
    { id: '4', contact: 'Garcia Corp — Ana Garcia', duration: '52:33', outcome: 'positive', date: 'Yesterday, 2:15 PM', type: 'outbound', scores: { rapport: 94, discovery: 90, presentation: 92, closing: 96 } },
    { id: '5', contact: 'Rodriguez Policy — Maria Rodriguez', duration: '12:20', outcome: 'negative', date: 'Yesterday, 11:00 AM', type: 'inbound', scores: { rapport: 60, discovery: 45, presentation: 52, closing: 38 } },
  ],
  '2': [
    { id: '1', contact: 'Nguyen Family — David Nguyen', duration: '38:22', outcome: 'positive', date: 'Today, 11:00 AM', type: 'outbound', scores: { rapport: 80, discovery: 85, presentation: 82, closing: 78 } },
    { id: '2', contact: 'Park Industries — Jenny Park', duration: '25:10', outcome: 'neutral', date: 'Today, 9:30 AM', type: 'outbound', scores: { rapport: 75, discovery: 80, presentation: 70, closing: 65 } },
    { id: '3', contact: 'Kim Corp — Steven Kim', duration: '42:55', outcome: 'positive', date: 'Yesterday, 3:00 PM', type: 'outbound', scores: { rapport: 88, discovery: 82, presentation: 85, closing: 80 } },
    { id: '4', contact: 'Lee Family — Grace Lee', duration: '15:30', outcome: 'negative', date: 'Yesterday, 1:15 PM', type: 'inbound', scores: { rapport: 65, discovery: 55, presentation: 60, closing: 42 } },
  ],
  '3': [
    { id: '1', contact: 'Martinez Family — Carlos Martinez', duration: '28:15', outcome: 'neutral', date: 'Today, 10:45 AM', type: 'outbound', scores: { rapport: 70, discovery: 72, presentation: 68, closing: 60 } },
    { id: '2', contact: 'Adams Estate — Robert Adams', duration: '35:40', outcome: 'positive', date: 'Yesterday, 2:00 PM', type: 'outbound', scores: { rapport: 78, discovery: 80, presentation: 75, closing: 82 } },
    { id: '3', contact: 'Turner Group — Amy Turner', duration: '20:05', outcome: 'negative', date: 'Yesterday, 11:30 AM', type: 'inbound', scores: { rapport: 62, discovery: 58, presentation: 55, closing: 40 } },
  ],
  '4': [
    { id: '1', contact: 'Robinson Estate — Tom Robinson', duration: '33:18', outcome: 'neutral', date: 'Today, 9:15 AM', type: 'outbound', scores: { rapport: 82, discovery: 70, presentation: 75, closing: 72 } },
    { id: '2', contact: 'Taylor Family — Susan Taylor', duration: '28:44', outcome: 'positive', date: 'Yesterday, 3:30 PM', type: 'outbound', scores: { rapport: 85, discovery: 78, presentation: 80, closing: 88 } },
    { id: '3', contact: 'Harris Corp — Mike Harris', duration: '14:20', outcome: 'negative', date: 'Yesterday, 10:00 AM', type: 'inbound', scores: { rapport: 58, discovery: 50, presentation: 48, closing: 35 } },
  ],
  '5': [
    { id: '1', contact: 'Brown Family — Jennifer Brown', duration: '22:10', outcome: 'neutral', date: 'Today, 11:30 AM', type: 'outbound', scores: { rapport: 60, discovery: 55, presentation: 50, closing: 42 } },
    { id: '2', contact: 'Henderson Family — Paul Henderson', duration: '18:33', outcome: 'neutral', date: 'Yesterday, 2:45 PM', type: 'outbound', scores: { rapport: 55, discovery: 48, presentation: 52, closing: 38 } },
  ],
};

const AGENT_AI_INSIGHTS: Record<string, AIInsight[]> = {
  '1': [
    { id: '1', insight: 'Call-to-close ratio has improved 22% over the past 2 weeks', confidence: 94, action: 'Reinforce current objection handling approach', dataPoints: ['8 closes from 45 calls', 'vs 5 from 42 calls last period'], trend: 'improving', priority: 'low' },
    { id: '2', insight: 'Average deal size trending upward — $13.7K vs $11.2K last month', confidence: 87, action: 'Consider assigning larger pipeline opportunities', dataPoints: ['Top 3 deals all >$30K', 'Upsell rate increased 15%'], trend: 'improving', priority: 'medium' },
    { id: '3', insight: 'Activity dip detected on Thursdays — 40% fewer calls than avg', confidence: 78, action: 'Discuss time management during next 1:1', dataPoints: ['Avg 12 calls Mon-Wed', 'Only 7 calls on Thursdays'], trend: 'declining', priority: 'high' },
  ],
  '2': [
    { id: '1', insight: 'Discovery phase is strong but closing confidence drops on larger deals', confidence: 82, action: 'Practice assumptive close on deals >$15K', dataPoints: ['88% close on <$10K deals', 'Only 45% on >$15K deals'], trend: 'declining', priority: 'high' },
    { id: '2', insight: 'Email response rate is above team average by 18%', confidence: 90, action: 'Share email templates with team as best practice', dataPoints: ['32% open rate', '12% reply rate vs 8% avg'], trend: 'improving', priority: 'low' },
  ],
  '3': [
    { id: '1', insight: 'Pipeline has 15 deals but only 3 moving — stale lead risk detected', confidence: 88, action: 'Review and disqualify inactive leads in next 1:1', dataPoints: ['12 deals untouched >7 days', 'Average age: 22 days'], trend: 'declining', priority: 'high' },
    { id: '2', insight: 'Presentation scores improving steadily over last 4 weeks', confidence: 75, action: 'Continue current coaching focus on storytelling', dataPoints: ['Presentation score: 55 → 68', '+24% improvement trend'], trend: 'improving', priority: 'medium' },
  ],
  '4': [
    { id: '1', insight: 'High close rate (17%) but low call volume limiting total output', confidence: 91, action: 'Increase daily call target from 8 to 12', dataPoints: ['17% close rate (2nd on team)', 'Only 24 calls/wk (4th on team)'], trend: 'declining', priority: 'high' },
    { id: '2', insight: 'Follow-up consistency improved since coaching session', confidence: 80, action: 'Maintain 7-touch cadence and review weekly', dataPoints: ['Follow-up rate: 45% → 78%', 'No deal lost to lack of follow-up this week'], trend: 'improving', priority: 'low' },
  ],
  '5': [
    { id: '1', insight: 'Rapport building scores improving but still below team average', confidence: 72, action: 'Continue shadow calls with senior agents', dataPoints: ['Rapport score: 48 → 60', 'Team avg: 78'], trend: 'improving', priority: 'medium' },
    { id: '2', insight: 'Call anxiety decreasing — solo call duration increasing', confidence: 68, action: 'Assign 3 solo calls per day next week', dataPoints: ['Avg call length: 12m → 18m', 'Fewer early hang-ups'], trend: 'improving', priority: 'medium' },
    { id: '3', insight: 'Product knowledge gaps on IUL and annuity products', confidence: 85, action: 'Complete IUL module before next client-facing call', dataPoints: ['Failed 2 IUL quiz questions', 'No annuity calls attempted'], trend: 'declining', priority: 'high' },
  ],
};

const AGENT_PIPELINE: Record<string, PipelineItem[]> = {
  '1': [
    { stage: 'Prospecting', count: 12, value: 48 },
    { stage: 'Proposal', count: 5, value: 82 },
    { stage: 'Negotiation', count: 3, value: 67 },
    { stage: 'Closing', count: 2, value: 41 },
  ],
  '2': [
    { stage: 'Prospecting', count: 9, value: 32 },
    { stage: 'Proposal', count: 4, value: 55 },
    { stage: 'Negotiation', count: 2, value: 38 },
    { stage: 'Closing', count: 1, value: 18 },
  ],
  '3': [
    { stage: 'Prospecting', count: 15, value: 45 },
    { stage: 'Proposal', count: 2, value: 28 },
    { stage: 'Negotiation', count: 1, value: 14 },
    { stage: 'Closing', count: 0, value: 0 },
  ],
  '4': [
    { stage: 'Prospecting', count: 6, value: 22 },
    { stage: 'Proposal', count: 3, value: 35 },
    { stage: 'Negotiation', count: 2, value: 28 },
    { stage: 'Closing', count: 1, value: 15 },
  ],
  '5': [
    { stage: 'Prospecting', count: 10, value: 18 },
    { stage: 'Proposal', count: 1, value: 8 },
    { stage: 'Negotiation', count: 0, value: 0 },
    { stage: 'Closing', count: 0, value: 0 },
  ],
};

const AGENT_CERTS: Record<string, CertItem[]> = {
  '1': [
    { name: 'Life Insurance License', status: 'Active', expiry: 'Dec 2026', color: '#10b981' },
    { name: 'Advanced Life Cert', status: 'Active', expiry: 'Mar 2027', color: '#10b981' },
    { name: 'Health Insurance License', status: 'Expiring', expiry: 'Apr 2026', color: '#f59e0b' },
    { name: 'Series 6', status: 'Pending', expiry: 'In progress', color: '#3b82f6' },
  ],
  '2': [
    { name: 'Life Insurance License', status: 'Active', expiry: 'Nov 2026', color: '#10b981' },
    { name: 'Health Insurance License', status: 'Active', expiry: 'Aug 2026', color: '#10b981' },
    { name: 'Advanced Life Cert', status: 'Pending', expiry: 'In progress', color: '#3b82f6' },
  ],
  '3': [
    { name: 'Life Insurance License', status: 'Active', expiry: 'Sep 2026', color: '#10b981' },
    { name: 'Health Insurance License', status: 'Pending', expiry: 'In progress', color: '#3b82f6' },
  ],
  '4': [
    { name: 'Life Insurance License', status: 'Active', expiry: 'Jan 2027', color: '#10b981' },
    { name: 'Health Insurance License', status: 'Expiring', expiry: 'May 2026', color: '#f59e0b' },
  ],
  '5': [
    { name: 'Life Insurance License', status: 'In Progress', expiry: 'Exam scheduled', color: '#3b82f6' },
  ],
};

// ─── STYLES ─────────────────────────────────────────────────

const ACTIVITY_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  call: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669' },
  deal: { bg: 'rgba(245, 158, 11, 0.1)', text: '#d97706' },
  email: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563eb' },
  coaching: { bg: 'rgba(139, 92, 246, 0.1)', text: '#7c3aed' },
  cert: { bg: 'rgba(20, 184, 166, 0.1)', text: '#0d9488' },
};

const OUTCOME_BADGES: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', label: 'Won' },
  neutral: { bg: 'rgba(245, 158, 11, 0.12)', text: '#d97706', label: 'Follow-up' },
  negative: { bg: 'rgba(244, 63, 94, 0.12)', text: '#e11d48', label: 'Lost' },
};

const GlassTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name?: string; value?: number; color?: string; payload?: Record<string, unknown> }> }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: RADIUS.button,
        padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
        boxShadow: SHADOW.level2,
      }}
    >
      {payload.map((entry, i) => (
        <p key={i} style={{ fontSize: TYPE.meta, fontWeight: 600, color: entry.color || COLORS.lounges.manager.dark, margin: 0 }}>
          {(entry.payload?.skill as string) || entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

// ─── HELPERS ────────────────────────────────────────────────

const formatAP = (value: number): string => {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${value}`;
};

const parseDuration = (dur: string): number => {
  const parts = dur.split(':').map(Number);
  return parts[0] + (parts[1] || 0) / 60;
};

const calcDelta = (a: number, b: number): { value: string; positive: boolean } => {
  if (b === 0) return { value: 'N/A', positive: true };
  const pct = Math.round(((a - b) / b) * 100);
  return { value: `${pct >= 0 ? '+' : ''}${pct}%`, positive: pct >= 0 };
};

// ─── COMPONENT ───────────────────────────────────────────────

export function ManagerScorecard() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const [selectedAgent, setSelectedAgent] = useState(() => {
    const params = new URLSearchParams(search);
    const agentId = params.get('agent');
    return AGENTS.find((a) => a.id === agentId) || AGENTS[0];
  });
  const [openDropdown, setOpenDropdown] = useState<'primary' | 'compare' | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareAgent, setCompareAgent] = useState(AGENTS[1]);
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);

  // Modal state
  const [showOneOnOneModal, setShowOneOnOneModal] = useState(false);
  const [showCoachingModal, setShowCoachingModal] = useState(false);
  const [showActionItemModal, setShowActionItemModal] = useState(false);
  const [actionItemTopic, setActionItemTopic] = useState('');

  // Sync selected agent when navigating from Performance page
  useEffect(() => {
    const params = new URLSearchParams(search);
    const agentId = params.get('agent');
    if (agentId) {
      const agent = AGENTS.find((a) => a.id === agentId);
      if (agent && agent.id !== selectedAgent.id) setSelectedAgent(agent);
    }
  }, [search]);

  // Interactive state
  const [flaggedAgents, setFlaggedAgents] = useState<Set<string>>(new Set());
  const [actedInsights, setActedInsights] = useState<Set<string>>(new Set());
  const [playingRecording, setPlayingRecording] = useState<string | null>(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toggle flag for review
  const toggleFlag = useCallback(() => {
    setFlaggedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(selectedAgent.id)) {
        next.delete(selectedAgent.id);
        toast.info(`${selectedAgent.name} unflagged`);
      } else {
        next.add(selectedAgent.id);
        toast.success(`${selectedAgent.name} flagged for review`);
      }
      return next;
    });
  }, [selectedAgent]);

  // Toggle acted insight
  const toggleActed = useCallback((insightId: string, action: string) => {
    setActedInsights((prev) => {
      const next = new Set(prev);
      if (next.has(insightId)) {
        next.delete(insightId);
      } else {
        next.add(insightId);
        toast.success(`Action started: ${action}`);
      }
      return next;
    });
  }, []);

  // Mock audio player
  const startPlayback = useCallback((recId: string) => {
    // Stop any existing playback
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    setPlayingRecording(recId);
    setPlayProgress(0);
    setIsPaused(false);
    playIntervalRef.current = setInterval(() => {
      setPlayProgress((prev) => {
        if (prev >= 100) {
          if (playIntervalRef.current) clearInterval(playIntervalRef.current);
          setPlayingRecording(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
  }, []);

  const pausePlayback = useCallback(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    playIntervalRef.current = null;
    setIsPaused(true);
  }, []);

  const resumePlayback = useCallback(() => {
    setIsPaused(false);
    playIntervalRef.current = setInterval(() => {
      setPlayProgress((prev) => {
        if (prev >= 100) {
          if (playIntervalRef.current) clearInterval(playIntervalRef.current);
          setPlayingRecording(null);
          return 0;
        }
        return prev + 2;
      });
    }, 100);
  }, []);

  const stopPlayback = useCallback(() => {
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    playIntervalRef.current = null;
    setPlayingRecording(null);
    setPlayProgress(0);
    setIsPaused(false);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, []);

  // Reset expanded recording when agent changes (#1)
  useEffect(() => {
    setSelectedRecording(null);
    stopPlayback();
  }, [selectedAgent.id, stopPlayback]);

  // Memoize team averages (#10)
  const teamAvg = useMemo(() => ({
    ap: Math.round(AGENTS.reduce((s, a) => s + a.apWeekly, 0) / AGENTS.length),
    calls: Math.round(AGENTS.reduce((s, a) => s + a.calls, 0) / AGENTS.length),
    close: Math.round(AGENTS.reduce((s, a) => s + a.closeRate, 0) / AGENTS.length),
    compliance: Math.round(AGENTS.reduce((s, a) => s + a.complianceScore, 0) / AGENTS.length),
  }), []);

  if (!AGENTS.length) {
    return (
      <ManagerLoungeLayout>
        <ManagerPageHero icon={UserCheck} title="Agent Scorecard" subtitle="Deep-dive into individual agent performance" />
        <ManagerEmptyState icon={UserCheck} title="No agents found" description="There are no agents to display scorecards for." />
      </ManagerLoungeLayout>
    );
  }

  // ─── Agent Selector Renderer ───────────────────────────────
  const renderAgentSelector = (
    agent: typeof AGENTS[0],
    setAgent: (a: typeof AGENTS[0]) => void,
    isOpen: boolean,
    setOpen: (v: boolean) => void,
    label: string,
    excludeId?: string,
  ) => (
    <div style={{ position: 'relative', flex: 1 }}>
      <motion.button
        onClick={() => setOpen(!isOpen)}
        whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
        transition={{ duration: MOTION.duration.hover }}
        style={{
          ...glassCard,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
          display: 'flex',
          alignItems: 'center',
          gap: GRID.spacing.sm,
          width: '100%',
          cursor: 'pointer',
          textAlign: 'left',
        }}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={label}
      >
        <div
          className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
          style={{
            width: LAYOUT.icon.xxl + 8,
            height: LAYOUT.icon.xxl + 8,
            borderRadius: RADIUS.button,
            fontSize: TYPE.meta,
            boxShadow: SHADOW.glow.emerald,
          }}
        >
          {agent.avatar}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p className="font-semibold text-gray-900 truncate" style={{ fontSize: TYPE.body }}>
            {agent.name}
          </p>
          <p className="text-gray-500 truncate" style={{ fontSize: TYPE.meta }}>
            {agent.role} &middot; Level {agent.level}
          </p>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: MOTION.duration.fast }}
        >
          <ChevronDown
            className="text-gray-400 flex-shrink-0"
            style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }}
          />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.fast, ease: MOTION.easing }}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: GRID.spacing.xs,
            ...glassCard,
            backgroundColor: 'rgba(255,255,255,0.97)',
            borderRadius: RADIUS.card,
            boxShadow: SHADOW.hero,
            padding: GRID.spacing.xs,
            zIndex: 50,
          }}
          role="listbox"
          aria-label={`${label} list`}
        >
          {AGENTS.filter((a) => a.id !== excludeId).map((a) => {
            const isSelected = a.id === agent.id;
            return (
              <motion.button
                key={a.id}
                onClick={() => {
                  setAgent(a);
                  setOpen(false);
                }}
                whileHover={{ backgroundColor: COLORS.gray[50] }}
                transition={{ duration: MOTION.duration.hover }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: GRID.spacing.sm,
                  width: '100%',
                  padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                  borderRadius: RADIUS.button,
                  cursor: 'pointer',
                  textAlign: 'left',
                  backgroundColor: isSelected ? COLORS.lounges.manager.light : 'transparent',
                  border: 'none',
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold flex-shrink-0`}
                  style={{
                    width: LAYOUT.icon.xl,
                    height: LAYOUT.icon.xl,
                    borderRadius: RADIUS.button,
                    fontSize: TYPE.caption,
                  }}
                >
                  {a.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                    {a.name}
                  </p>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    {a.role} &middot; Level {a.level}
                  </p>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: RADIUS.pill,
                      backgroundColor: COLORS.lounges.manager.main,
                      flexShrink: 0,
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Click-away overlay */}
      {isOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 40 }}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );

  // ─── Stat Row Renderer ─────────────────────────────────────
  const renderStatRow = (agent: typeof AGENTS[0]) => {
    const agentSparkline = AGENT_SPARKLINES[`agent-${agent.id}`];
    return (
      <motion.div variants={staggerCards} initial="hidden" animate="visible">
        <ManagerStatCardGrid>
          <ManagerStatCard
            icon={DollarSign}
            value={formatAP(agent.apWeekly)}
            label="Weekly AP"
            sparklineData={agentSparkline?.revenue}
            delta={agent.trends.ap}
            deltaFormat="percent"
            periodLabel="Last 7 days"
          />
          <ManagerStatCard
            icon={Phone}
            value={`${agent.calls} calls`}
            label="Call Volume"
            sparklineData={agentSparkline?.calls}
            delta={agent.trends.calls}
            deltaFormat="percent"
            periodLabel="Last 7 days"
          />
          <ManagerStatCard
            icon={Target}
            value={`${agent.closeRate}%`}
            label="Close Rate"
            delta={agent.trends.close}
            deltaFormat="percent"
            periodLabel="vs last week"
          />
          <ManagerStatCard
            icon={Shield}
            value={`${agent.complianceScore}/100`}
            label="Compliance Score"
            delta={agent.trends.compliance}
            periodLabel="vs last week"
          />
        </ManagerStatCardGrid>
      </motion.div>
    );
  };

  // ─── Delta Row ─────────────────────────────────────────────
  const renderDeltaRow = () => {
    const deltas = [
      { label: 'AP', ...calcDelta(selectedAgent.apWeekly, compareAgent.apWeekly) },
      { label: 'Calls', ...calcDelta(selectedAgent.calls, compareAgent.calls) },
      { label: 'Close', ...calcDelta(selectedAgent.closeRate, compareAgent.closeRate) },
      { label: 'Compliance', ...calcDelta(selectedAgent.complianceScore, compareAgent.complianceScore) },
    ];
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: GRID.spacing.sm }}>
        {deltas.map((d) => (
          <div
            key={d.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              padding: `${GRID.spacing.xs}px 0`,
            }}
          >
            {d.positive ? (
              <ArrowUp style={{ width: 14, height: 14, color: COLORS.lounges.manager.dark }} />
            ) : (
              <ArrowDown style={{ width: 14, height: 14, color: COLORS.semantic.error }} />
            )}
            <span
              style={{
                fontSize: TYPE.caption,
                fontWeight: 600,
                color: d.positive ? COLORS.lounges.manager.dark : COLORS.semantic.error,
              }}
            >
              {d.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* ─── 1. HERO ─── */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={UserCheck}
            title="Agent Scorecard"
            subtitle="Deep-dive into individual agent performance"
          />
        </motion.div>

        {/* ─── 2. AGENT SELECTOR + COMPARE TOGGLE ─── */}
        <motion.div
          variants={fadeInUp}
          style={{ display: 'flex', alignItems: 'flex-start', gap: GRID.spacing.sm }}
        >
          {renderAgentSelector(
            selectedAgent,
            setSelectedAgent,
            openDropdown === 'primary',
            (v) => setOpenDropdown(v ? 'primary' : null),
            'Select agent',
            compareMode ? compareAgent.id : undefined,
          )}

          {/* Compare Toggle */}
          <motion.button
            onClick={() => setCompareMode(!compareMode)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: MOTION.duration.hover }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: GRID.spacing.xs,
              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
              borderRadius: RADIUS.pill,
              border: compareMode
                ? `2px solid ${COLORS.lounges.manager.main}`
                : `1px solid ${GLASS.border}`,
              backgroundColor: compareMode ? COLORS.lounges.manager.light : 'white',
              cursor: 'pointer',
              flexShrink: 0,
              height: LAYOUT.icon.xxl + 8 + GRID.spacing.sm * 2,
            }}
            type="button"
          >
            <GitCompare
              style={{
                width: LAYOUT.icon.sm,
                height: LAYOUT.icon.sm,
                color: compareMode ? COLORS.lounges.manager.main : COLORS.gray[400],
              }}
            />
            <span
              className="font-medium"
              style={{
                fontSize: TYPE.meta,
                color: compareMode ? COLORS.lounges.manager.dark : COLORS.gray[600],
              }}
            >
              Compare KPIs
            </span>
          </motion.button>

          {/* Compare Agent Selector */}
          <AnimatePresence>
            {compareMode && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
                style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.sm, overflow: 'hidden', flex: 1, transformOrigin: 'left' }}
              >
                <span className="font-bold text-gray-400 flex-shrink-0" style={{ fontSize: TYPE.title }}>
                  vs
                </span>
                {renderAgentSelector(
                  compareAgent,
                  setCompareAgent,
                  openDropdown === 'compare',
                  (v) => setOpenDropdown(v ? 'compare' : null),
                  'Select comparison agent',
                  selectedAgent.id,
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── 3. STAT CARDS ─── */}
        <motion.div variants={fadeInUp}>
          {compareMode ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
              {/* Agent A label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs, marginBottom: 4 }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold`}
                  style={{ width: 24, height: 24, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                >
                  {selectedAgent.avatar}
                </div>
                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                  {selectedAgent.name}
                </span>
              </div>
              {renderStatRow(selectedAgent)}

              {/* Delta indicators */}
              {renderDeltaRow()}

              {/* Agent B label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs, marginBottom: 4 }}>
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white font-bold`}
                  style={{ width: 24, height: 24, borderRadius: RADIUS.button, fontSize: TYPE.micro }}
                >
                  {compareAgent.avatar}
                </div>
                <span className="font-semibold text-gray-700" style={{ fontSize: TYPE.meta }}>
                  {compareAgent.name}
                </span>
              </div>
              {renderStatRow(compareAgent)}
            </div>
          ) : (
            renderStatRow(selectedAgent)
          )}
        </motion.div>

        {/* ─── TEAM AVERAGE COMPARISON ─── */}
        {!compareMode && (
          <motion.div
            variants={fadeInUp}
            style={{
              ...glassCard,
              borderRadius: RADIUS.card,
              padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
              display: 'flex',
              alignItems: 'center',
              gap: GRID.spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <span className="font-medium text-gray-500" style={{ fontSize: TYPE.caption, flexShrink: 0 }}>
              vs Team Avg
            </span>
            {[
              { label: 'AP', agent: selectedAgent.apWeekly, avg: teamAvg.ap, fmt: formatAP },
              { label: 'Calls', agent: selectedAgent.calls, avg: teamAvg.calls, fmt: (v: number) => `${v}` },
              { label: 'Close', agent: selectedAgent.closeRate, avg: teamAvg.close, fmt: (v: number) => `${v}%` },
              { label: 'Compliance', agent: selectedAgent.complianceScore, avg: teamAvg.compliance, fmt: (v: number) => `${v}` },
            ].map((m) => {
              const diff = m.agent - m.avg;
              const positive = diff >= 0;
              return (
                <div key={m.label} className="flex items-center" style={{ gap: 4 }}>
                  <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>{m.label}:</span>
                  <span className="text-gray-700 font-medium" style={{ fontSize: TYPE.caption }}>{m.fmt(m.agent)}</span>
                  <span className="text-gray-300" style={{ fontSize: TYPE.caption }}>/</span>
                  <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>{m.fmt(m.avg)}</span>
                  <span className="font-semibold" style={{ fontSize: TYPE.caption, color: positive ? COLORS.lounges.manager.dark : COLORS.semantic.error }}>
                    ({positive ? '+' : ''}{diff}{m.label === 'Close' ? '%' : ''})
                  </span>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* ─── 4. TWO-COLUMN LAYOUT ─── */}
        <motion.div
          key={selectedAgent.id}
          variants={fadeInUp}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.normal, ease: MOTION.easing }}
          style={{ gap: GRID.spacing.md }}
          className="grid grid-cols-1 lg:grid-cols-2"
        >
          {/* ─── LEFT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Activity Timeline */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <TrendingUp className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Activity Timeline
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Recent agent activities
                  </p>
                </div>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {!(AGENT_ACTIVITY[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No recent activity recorded</p>
                )}
                {(AGENT_ACTIVITY[selectedAgent.id] || []).map((activity, index) => {
                  const typeColor = ACTIVITY_TYPE_COLORS[activity.type] || ACTIVITY_TYPE_COLORS.call;
                  const ActivityIcon = activity.icon;

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: MOTION.duration.normal,
                        delay: index * 0.06,
                        ease: MOTION.easing,
                      }}
                      whileHover={{ backgroundColor: COLORS.gray[50] }}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: GRID.spacing.sm,
                        padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        transition: `background-color ${MOTION.duration.hover}s`,
                      }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: RADIUS.button,
                          backgroundColor: typeColor.bg,
                        }}
                      >
                        <ActivityIcon
                          style={{
                            width: LAYOUT.icon.sm,
                            height: LAYOUT.icon.sm,
                            color: typeColor.text,
                          }}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-gray-800" style={{ fontSize: TYPE.meta, lineHeight: 1.45 }}>
                          {activity.description}
                        </p>
                        <p className="text-gray-400" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                          {activity.timestamp}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ─── CALL RECORDINGS (NEW) ─── */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <Phone className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Call Recordings
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Recent calls
                  </p>
                </div>
              </div>

              {/* Recording Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {!(AGENT_RECORDINGS[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No call recordings available</p>
                )}
                {(AGENT_RECORDINGS[selectedAgent.id] || []).map((rec, index) => {
                  const outcome = OUTCOME_BADGES[rec.outcome] || OUTCOME_BADGES.neutral;
                  const CallTypeIcon = rec.type === 'outbound' ? PhoneOutgoing : PhoneIncoming;
                  const callColor = rec.type === 'outbound' ? '#059669' : '#2563eb';
                  const isExpanded = selectedRecording === rec.id;
                  const radarData = [
                    { skill: 'Rapport', value: rec.scores.rapport },
                    { skill: 'Discovery', value: rec.scores.discovery },
                    { skill: 'Presentation', value: rec.scores.presentation },
                    { skill: 'Closing', value: rec.scores.closing },
                  ];

                  return (
                    <div key={rec.id}>
                      <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: MOTION.duration.normal,
                          delay: index * 0.06,
                          ease: MOTION.easing,
                        }}
                        whileHover={{ backgroundColor: COLORS.gray[50] }}
                        onClick={() => setSelectedRecording(isExpanded ? null : rec.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: GRID.spacing.sm,
                          padding: `${GRID.spacing.sm - 4}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.button,
                          transition: `background-color ${MOTION.duration.hover}s`,
                          cursor: 'pointer',
                        }}
                      >
                        {/* Call type icon */}
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: RADIUS.button,
                            backgroundColor: `${callColor}14`,
                          }}
                        >
                          <CallTypeIcon
                            style={{
                              width: LAYOUT.icon.sm,
                              height: LAYOUT.icon.sm,
                              color: callColor,
                            }}
                          />
                        </div>

                        {/* Contact + Duration */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="text-gray-800 font-medium" style={{ fontSize: TYPE.meta, lineHeight: 1.45 }}>
                            {rec.contact}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: GRID.spacing.xs, marginTop: 2 }}>
                            <span className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                              {rec.duration}
                            </span>
                            <span className="text-gray-300" style={{ fontSize: TYPE.caption }}>
                              &middot;
                            </span>
                            <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                              {rec.date}
                            </span>
                          </div>
                        </div>

                        {/* Outcome badge */}
                        <span
                          style={{
                            fontSize: TYPE.micro,
                            fontWeight: 600,
                            padding: '3px 10px',
                            borderRadius: RADIUS.pill,
                            backgroundColor: outcome.bg,
                            color: outcome.text,
                            flexShrink: 0,
                          }}
                        >
                          {outcome.label}
                        </span>

                        {/* Play button */}
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.95 }}
                          transition={{ duration: MOTION.duration.hover }}
                          onClick={(e) => { e.stopPropagation(); playingRecording === rec.id ? stopPlayback() : startPlayback(rec.id); }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 32,
                            height: 32,
                            borderRadius: RADIUS.pill,
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          type="button"
                          aria-label={playingRecording === rec.id ? `Stop recording for ${rec.contact}` : `Play recording for ${rec.contact}`}
                        >
                          {playingRecording === rec.id ? (
                            <Square
                              style={{
                                width: LAYOUT.icon.sm,
                                height: LAYOUT.icon.sm,
                                color: COLORS.semantic.error,
                                fill: COLORS.semantic.error,
                              }}
                            />
                          ) : (
                            <Play
                              style={{
                                width: LAYOUT.icon.md,
                                height: LAYOUT.icon.md,
                                color: COLORS.lounges.manager.dark,
                              }}
                            />
                          )}
                        </motion.button>
                      </motion.div>

                      {/* Inline Audio Player */}
                      <AnimatePresence>
                        {playingRecording === rec.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: MOTION.duration.fast, ease: MOTION.easing }}
                            style={{
                              marginLeft: 36 + GRID.spacing.sm,
                              marginBottom: GRID.spacing.xs,
                              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                              borderRadius: RADIUS.button,
                              backgroundColor: COLORS.lounges.manager.light,
                              overflow: 'hidden',
                            }}
                          >
                            <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                              {/* Pause/Resume */}
                              <motion.button
                                onClick={(e) => { e.stopPropagation(); isPaused ? resumePlayback() : pausePlayback(); }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 24, height: 24, borderRadius: RADIUS.pill,
                                  backgroundColor: COLORS.lounges.manager.dark, border: 'none', cursor: 'pointer',
                                }}
                                type="button"
                              >
                                {isPaused ? (
                                  <Play style={{ width: 12, height: 12, color: 'white' }} />
                                ) : (
                                  <Pause style={{ width: 12, height: 12, color: 'white' }} />
                                )}
                              </motion.button>

                              {/* Progress bar */}
                              <div style={{ flex: 1, height: 4, borderRadius: RADIUS.pill, backgroundColor: 'rgba(4,120,87,0.2)', overflow: 'hidden' }}>
                                <motion.div
                                  style={{ height: '100%', borderRadius: RADIUS.pill, backgroundColor: COLORS.lounges.manager.dark, width: `${playProgress}%` }}
                                />
                              </div>

                              {/* Time display */}
                              <span className="font-medium" style={{ fontSize: TYPE.micro, color: COLORS.lounges.manager.dark, minWidth: 60, textAlign: 'right' }}>
                                {Math.floor(playProgress / 100 * parseDuration(rec.duration))}:{String(Math.floor((playProgress / 100 * parseDuration(rec.duration) % 1) * 60)).padStart(2, '0')} / {rec.duration}
                              </span>

                              {/* Stop */}
                              <motion.button
                                onClick={(e) => { e.stopPropagation(); stopPlayback(); }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                style={{
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  width: 20, height: 20, borderRadius: RADIUS.pill,
                                  backgroundColor: 'transparent', border: 'none', cursor: 'pointer',
                                }}
                                type="button"
                              >
                                <Square style={{ width: 10, height: 10, color: COLORS.lounges.manager.dark, fill: COLORS.lounges.manager.dark }} />
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Expandable Skill Scores RadarChart */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: MOTION.duration.expand, ease: MOTION.easing }}
                            style={{
                              marginLeft: 36 + GRID.spacing.sm,
                              marginTop: GRID.spacing.xs,
                              marginBottom: GRID.spacing.xs,
                              padding: GRID.spacing.sm,
                              borderRadius: RADIUS.button,
                              backgroundColor: COLORS.gray[50],
                              overflow: 'hidden',
                            }}
                          >
                            <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption, marginBottom: GRID.spacing.xs }}>
                              AI Call Analysis — Skill Scores
                            </p>
                            <ResponsiveContainer width="100%" height={180}>
                              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                                <PolarGrid stroke={COLORS.gray[200]} />
                                <PolarAngleAxis
                                  dataKey="skill"
                                  tick={{ fontSize: TYPE.caption, fill: COLORS.gray[600], fontWeight: 600 }}
                                />
                                <PolarRadiusAxis
                                  angle={90}
                                  domain={[0, 100]}
                                  tick={{ fontSize: TYPE.micro, fill: COLORS.gray[400] }}
                                  axisLine={false}
                                />
                                <Tooltip content={<GlassTooltip />} />
                                <Radar
                                  name="Score"
                                  dataKey="value"
                                  stroke={COLORS.lounges.manager.dark}
                                  fill={COLORS.lounges.manager.dark}
                                  fillOpacity={0.2}
                                  strokeWidth={2}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                            {/* Score badges */}
                            <div className="flex items-center justify-center flex-wrap" style={{ gap: GRID.spacing.xs, marginTop: GRID.spacing.xs }}>
                              {radarData.map((d) => (
                                <span
                                  key={d.skill}
                                  style={{
                                    fontSize: TYPE.micro,
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: RADIUS.pill,
                                    backgroundColor: d.value >= 80 ? 'rgba(16,185,129,0.1)' : d.value >= 60 ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)',
                                    color: d.value >= 80 ? '#059669' : d.value >= 60 ? '#d97706' : '#e11d48',
                                  }}
                                >
                                  {d.skill}: {d.value}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Pipeline Summary */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <Target className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Pipeline Summary
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Active opportunities
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {!(AGENT_PIPELINE[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No pipeline data available</p>
                )}
                {(AGENT_PIPELINE[selectedAgent.id] || []).map((item) => (
                  <div
                    key={item.stage}
                    className="flex items-center justify-between"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      backgroundColor: COLORS.gray[50],
                    }}
                  >
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                        {item.stage}
                      </span>
                      <span
                        style={{
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                          padding: '1px 6px',
                          borderRadius: RADIUS.pill,
                          backgroundColor: `${COLORS.lounges.manager.main}14`,
                          color: COLORS.lounges.manager.dark,
                        }}
                      >
                        {item.count}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                      ${item.value}K
                    </span>
                  </div>
                ))}
                <div
                  className="flex items-center justify-between"
                  style={{
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    marginTop: GRID.spacing.xs,
                    borderTop: `1px solid ${COLORS.gray[100]}`,
                  }}
                >
                  <span className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                    Total Pipeline
                  </span>
                  <span className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>
                    ${(AGENT_PIPELINE[selectedAgent.id] || []).reduce((s, p) => s + p.value, 0)}K
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Performance Trends */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <Target className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Performance Trends
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Weekly metric progress
                  </p>
                </div>
              </div>

              {/* Metric Bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
                {!(AGENT_PERF_TRENDS[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No performance data available</p>
                )}
                {(AGENT_PERF_TRENDS[selectedAgent.id] || []).map((metric, index) => (
                  <div key={metric.label}>
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs }}
                    >
                      <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                        {metric.label}
                      </span>
                      <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                        {metric.current}{metric.unit}
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: 10,
                        borderRadius: RADIUS.pill,
                        backgroundColor: COLORS.gray[100],
                        overflow: 'hidden',
                      }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${metric.current}%` }}
                        transition={{
                          duration: MOTION.duration.slow,
                          delay: 0.2 + index * 0.1,
                          ease: MOTION.easing,
                        }}
                        style={{
                          height: '100%',
                          borderRadius: RADIUS.pill,
                          background: `linear-gradient(90deg, ${metric.color}, ${metric.color}dd)`,
                          boxShadow: `0 2px 8px ${metric.color}40`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
            {/* Coaching Notes (Enhanced with Linked Actions) */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <GraduationCap className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Coaching Notes
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Recent session summaries
                  </p>
                </div>
              </div>

              {/* Notes List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {!(AGENT_COACHING_NOTES[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No coaching notes yet</p>
                )}
                {(AGENT_COACHING_NOTES[selectedAgent.id] || []).map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: MOTION.duration.normal,
                      delay: 0.1 + index * 0.08,
                      ease: MOTION.easing,
                    }}
                    style={{
                      padding: GRID.spacing.sm,
                      borderRadius: RADIUS.button,
                      backgroundColor: COLORS.gray[50],
                    }}
                  >
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: GRID.spacing.xs }}
                    >
                      <span
                        className="font-semibold text-gray-800"
                        style={{ fontSize: TYPE.meta }}
                      >
                        {note.topic}
                      </span>
                      <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                        {note.date}
                      </span>
                    </div>
                    <p
                      className="text-gray-600"
                      style={{ fontSize: TYPE.caption, lineHeight: 1.5 }}
                    >
                      {note.summary}
                    </p>

                    {/* ─── Linked Coaching Actions (NEW) ─── */}
                    <div style={{ display: 'flex', gap: GRID.spacing.xs, marginTop: GRID.spacing.sm }}>
                      <motion.button
                        onClick={() => setShowOneOnOneModal(true)}
                        whileHover={{ scale: 1.04, backgroundColor: COLORS.lounges.manager.light }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: MOTION.duration.hover }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 12px',
                          borderRadius: RADIUS.pill,
                          border: `1px solid ${COLORS.lounges.manager.main}40`,
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: COLORS.lounges.manager.dark,
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                        }}
                        type="button"
                      >
                        <Calendar style={{ width: 12, height: 12 }} />
                        Schedule Follow-Up
                      </motion.button>

                      <motion.button
                        onClick={() => { setActionItemTopic(note.topic); setShowActionItemModal(true); }}
                        whileHover={{ scale: 1.04, backgroundColor: 'rgba(13, 148, 136, 0.08)' }}
                        whileTap={{ scale: 0.96 }}
                        transition={{ duration: MOTION.duration.hover }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          padding: '4px 12px',
                          borderRadius: RADIUS.pill,
                          border: `1px solid rgba(13, 148, 136, 0.25)`,
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          color: '#0f766e',
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                        }}
                        type="button"
                      >
                        <ClipboardList style={{ width: 12, height: 12 }} />
                        Create Action Item
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ─── AI COACHING MOMENTS ─── */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className="flex items-center justify-center bg-white/20 backdrop-blur"
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    boxShadow: '0 4px 12px rgba(245,158,11,0.25)',
                  }}
                >
                  <Sparkles className="text-white" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    AI Coach
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Pattern-based insights
                  </p>
                </div>
              </div>

              {/* Insight Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                {!(AGENT_AI_INSIGHTS[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No AI insights available yet</p>
                )}
                {(AGENT_AI_INSIGHTS[selectedAgent.id] || []).map((item, index) => {
                  const isActed = actedInsights.has(item.id);
                  const priorityColor = item.priority === 'high'
                    ? { bg: 'rgba(244,63,94,0.1)', text: '#e11d48' }
                    : item.priority === 'medium'
                    ? { bg: 'rgba(245,158,11,0.1)', text: '#d97706' }
                    : { bg: 'rgba(16,185,129,0.1)', text: '#059669' };
                  const trendArrow = item.trend === 'improving' ? ArrowUp : ArrowDown;
                  const TrendIcon = trendArrow;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: MOTION.duration.normal,
                        delay: 0.1 + index * 0.08,
                        ease: MOTION.easing,
                      }}
                      style={{
                        padding: GRID.spacing.sm,
                        borderRadius: RADIUS.button,
                        backgroundColor: isActed ? 'rgba(16,185,129,0.06)' : COLORS.gray[50],
                        border: isActed ? '1px solid rgba(16,185,129,0.2)' : '1px solid transparent',
                        }}
                    >
                      {/* Insight text + priority badge */}
                      <div className="flex items-start justify-between" style={{ gap: GRID.spacing.xs }}>
                        <p className="font-medium text-gray-800" style={{ fontSize: TYPE.meta, lineHeight: 1.45, flex: 1 }}>
                          {item.insight}
                        </p>
                        <span
                          style={{
                            fontSize: TYPE.micro,
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: RADIUS.pill,
                            backgroundColor: priorityColor.bg,
                            color: priorityColor.text,
                            flexShrink: 0,
                          }}
                        >
                          {item.priority}
                        </span>
                      </div>

                      {/* Confidence bar + Trend */}
                      <div className="flex items-center" style={{ gap: GRID.spacing.sm, marginTop: GRID.spacing.xs }}>
                        <div className="flex items-center" style={{ gap: 6, flex: 1 }}>
                          <span className="text-gray-500 flex-shrink-0" style={{ fontSize: TYPE.caption }}>
                            {item.confidence}%
                          </span>
                          <div style={{ flex: 1, height: 4, borderRadius: RADIUS.pill, backgroundColor: COLORS.gray[100], overflow: 'hidden' }}>
                            <div style={{ width: `${item.confidence}%`, height: '100%', borderRadius: RADIUS.pill, backgroundColor: item.confidence >= 85 ? COLORS.lounges.manager.main : item.confidence >= 70 ? '#f59e0b' : COLORS.gray[400] }} />
                          </div>
                        </div>
                        <span className="flex items-center flex-shrink-0" style={{ gap: 2, fontSize: TYPE.caption, color: item.trend === 'improving' ? COLORS.lounges.manager.dark : COLORS.semantic.error }}>
                          <TrendIcon style={{ width: 12, height: 12 }} />
                          {item.trend}
                        </span>
                      </div>

                      {/* Data Points */}
                      <div style={{ marginTop: GRID.spacing.xs }}>
                        {item.dataPoints.map((dp, i) => (
                          <p key={i} className="text-gray-500" style={{ fontSize: TYPE.micro, lineHeight: 1.6 }}>
                            &bull; {dp}
                          </p>
                        ))}
                      </div>

                      {/* Recommended Action */}
                      <div
                        className="flex items-center justify-between"
                        style={{
                          gap: GRID.spacing.xs,
                          marginTop: GRID.spacing.sm,
                          padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                          borderRadius: RADIUS.input,
                          backgroundColor: 'rgba(245,158,11,0.06)',
                        }}
                      >
                        <div className="flex items-center" style={{ gap: GRID.spacing.xs, flex: 1, minWidth: 0 }}>
                          <Sparkles style={{ width: 12, height: 12, color: '#d97706', flexShrink: 0 }} />
                          <p className="text-gray-600" style={{ fontSize: TYPE.caption, fontWeight: 500 }}>
                            {item.action}
                          </p>
                        </div>
                        <motion.button
                          onClick={() => toggleActed(item.id, item.action)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 10px',
                            borderRadius: RADIUS.pill,
                            border: 'none',
                            background: isActed ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: 'white',
                            fontSize: TYPE.micro,
                            fontWeight: 600,
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                          type="button"
                        >
                          {isActed ? <><Check style={{ width: 10, height: 10 }} /> Done</> : 'Act'}
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ─── CERTIFICATION STATUS ─── */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <Shield className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Certifications
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Licenses & credentials
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {!(AGENT_CERTS[selectedAgent.id]?.length) && (
                  <p className="text-gray-400 text-center" style={{ fontSize: TYPE.caption, padding: GRID.spacing.md }}>No certifications on file</p>
                )}
                {(AGENT_CERTS[selectedAgent.id] || []).map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-center justify-between"
                    style={{
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.button,
                      backgroundColor: COLORS.gray[50],
                    }}
                  >
                    <span className="font-medium text-gray-700" style={{ fontSize: TYPE.meta }}>
                      {cert.name}
                    </span>
                    <div className="flex items-center" style={{ gap: GRID.spacing.xs }}>
                      <span className="text-gray-400" style={{ fontSize: TYPE.caption }}>
                        {cert.expiry}
                      </span>
                      <span
                        style={{
                          fontSize: TYPE.micro,
                          fontWeight: 600,
                          padding: '2px 8px',
                          borderRadius: RADIUS.pill,
                          backgroundColor: `${cert.color}18`,
                          color: cert.color,
                        }}
                      >
                        {cert.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              whileHover={{ y: -2 }}
              transition={{ duration: MOTION.duration.hover }}
              style={{
                ...glassCard,
                borderRadius: RADIUS.card,
                boxShadow: SHADOW.card,
                padding: GRID.spacing.md,
              }}
            >
              {/* Card Header */}
              <div
                className="flex items-center"
                style={{ gap: GRID.spacing.sm, marginBottom: GRID.spacing.md }}
              >
                <div
                  className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                  style={{
                    width: LAYOUT.icon.xxl,
                    height: LAYOUT.icon.xxl,
                    borderRadius: RADIUS.button,
                    boxShadow: SHADOW.glow.emerald,
                  }}
                >
                  <UserCheck className="text-amber-200" style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900" style={{ fontSize: TYPE.title }}>
                    Quick Actions
                  </h3>
                  <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                    Manage this agent
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                {(() => {
                  const isFlagged = flaggedAgents.has(selectedAgent.id);
                  return [
                    { icon: Calendar, label: 'Schedule 1:1', color: COLORS.lounges.manager.main, onClick: () => setShowOneOnOneModal(true) },
                    { icon: GraduationCap, label: 'Schedule Coaching', color: '#0d9488', onClick: () => setShowCoachingModal(true) },
                    { icon: isFlagged ? Check : Flag, label: isFlagged ? 'Flagged for Review' : 'Flag for Review', color: isFlagged ? COLORS.semantic.error : COLORS.accent.amber[500], onClick: toggleFlag },
                    { icon: Network, label: 'View in Hierarchy', color: '#0d9488', onClick: () => navigate('/agents/hierarchy') },
                  ];
                })().map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      onClick={action.onClick}
                      whileHover={{
                        scale: 1.02,
                        backgroundColor: COLORS.gray[50],
                      }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: MOTION.duration.hover }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: GRID.spacing.sm,
                        width: '100%',
                        padding: `${GRID.spacing.sm}px ${GRID.spacing.sm}px`,
                        borderRadius: RADIUS.button,
                        border: `1px solid ${GLASS.border}`,
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      type="button"
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: RADIUS.button,
                          backgroundColor: `${action.color}14`,
                        }}
                      >
                        <ActionIcon
                          style={{
                            width: LAYOUT.icon.sm,
                            height: LAYOUT.icon.sm,
                            color: action.color,
                          }}
                        />
                      </div>
                      <span
                        className="font-medium text-gray-700"
                        style={{ fontSize: TYPE.meta }}
                      >
                        {action.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* ─── MODALS ─── */}
      <ScheduleOneOnOneModal
        agent={{ name: selectedAgent.name, avatar: selectedAgent.avatar, role: selectedAgent.role }}
        open={showOneOnOneModal}
        onClose={() => setShowOneOnOneModal(false)}
      />
      <ScheduleCoachingModal
        agent={{ name: selectedAgent.name, avatar: selectedAgent.avatar, role: selectedAgent.role }}
        open={showCoachingModal}
        onClose={() => setShowCoachingModal(false)}
      />

      {/* Action Item Modal */}
      <AnimatePresence>
        {showActionItemModal && (
          <ActionItemModal
            topic={actionItemTopic}
            agentName={selectedAgent.name}
            onClose={() => { setShowActionItemModal(false); setActionItemTopic(''); }}
          />
        )}
      </AnimatePresence>
    </ManagerLoungeLayout>
  );
}

// ─── ACTION ITEM MODAL ─────────────────────────────────────

function ActionItemModal({ topic, agentName, onClose }: { topic: string; agentName: string; onClose: () => void }) {
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [owner, setOwner] = useState<'manager' | 'agent'>('agent');

  const handleSubmit = () => {
    if (!description.trim()) {
      toast.error('Please add a description');
      return;
    }
    toast.success(`Action item created for ${agentName}: ${description.slice(0, 50)}${description.length > 50 ? '...' : ''}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: GRID.spacing.lg,
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 440,
          backgroundColor: 'white',
          borderRadius: RADIUS.card,
          boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #0d9488 50%, #fb7185 100%)',
            padding: `${GRID.spacing.md}px ${GRID.spacing.md}px`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ width: 100, height: 100, borderRadius: RADIUS.pill }} className="absolute top-0 right-0 bg-white/10 -translate-y-1/2 translate-x-1/3 blur-sm" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
              <div
                className="flex items-center justify-center bg-white/20 backdrop-blur"
                style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
              >
                <ClipboardList className="text-white" style={{ width: 20, height: 20 }} />
              </div>
              <div>
                <h3 className="font-bold text-white" style={{ fontSize: TYPE.body }}>Create Action Item</h3>
                <p className="text-white/70" style={{ fontSize: TYPE.caption }}>for {agentName}</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center text-white/80 hover:text-white bg-white/15 hover:bg-white/25"
              style={{ width: 32, height: 32, borderRadius: RADIUS.button }}
            >
              <X style={{ width: 16, height: 16 }} />
            </motion.button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: GRID.spacing.md, display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
          {/* Topic (read-only) */}
          <div>
            <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Topic</label>
            <div
              style={{
                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                borderRadius: RADIUS.input,
                backgroundColor: COLORS.gray[50],
                fontSize: TYPE.meta,
                color: COLORS.gray[700],
                fontWeight: 500,
              }}
            >
              {topic}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What needs to be done..."
              rows={3}
              style={{
                width: '100%',
                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                borderRadius: RADIUS.input,
                border: `1px solid ${COLORS.gray[200]}`,
                fontSize: TYPE.meta,
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Due Date <span className="text-gray-300">(optional)</span></label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '100%',
                padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                borderRadius: RADIUS.input,
                border: `1px solid ${COLORS.gray[200]}`,
                fontSize: TYPE.meta,
                outline: 'none',
              }}
            />
          </div>

          {/* Owner Toggle */}
          <div>
            <label className="block text-gray-500 font-medium" style={{ fontSize: TYPE.caption, marginBottom: 4 }}>Assigned To</label>
            <div className="flex" style={{ gap: GRID.spacing.xs }}>
              {(['manager', 'agent'] as const).map((o) => (
                <motion.button
                  key={o}
                  onClick={() => setOwner(o)}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="font-medium"
                  style={{
                    flex: 1,
                    padding: `${GRID.spacing.xs}px 0`,
                    borderRadius: RADIUS.pill,
                    fontSize: TYPE.caption,
                    border: owner === o ? 'none' : `1px solid ${COLORS.gray[200]}`,
                    background: owner === o ? 'linear-gradient(135deg, #059669, #0d9488)' : 'white',
                    color: owner === o ? 'white' : COLORS.gray[600],
                    cursor: 'pointer',
                  }}
                  type="button"
                >
                  {o === 'manager' ? 'Manager' : agentName.split(' ')[0]}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end"
          style={{
            padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
            gap: GRID.spacing.sm,
            borderTop: `1px solid ${COLORS.gray[100]}`,
          }}
        >
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-medium text-gray-600"
            style={{
              padding: `${GRID.spacing.xs}px ${GRID.spacing.md}px`,
              borderRadius: RADIUS.button,
              fontSize: TYPE.meta,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
            type="button"
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600"
            style={{
              padding: `${GRID.spacing.xs}px ${GRID.spacing.lg}px`,
              borderRadius: RADIUS.button,
              fontSize: TYPE.meta,
              border: 'none',
              cursor: 'pointer',
            }}
            type="button"
          >
            Create
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ManagerScorecard;
