import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { toast, Toaster } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ComposedChart,
  Legend, RadialBarChart, RadialBar, Treemap
} from "recharts";
import {
  Crown, LayoutDashboard, TrendingUp, AlertTriangle, Users, Settings,
  DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Minus,
  Bell, LogOut, Sun, Moon, Menu, X, Building2, Shield,
  Target, Flame, Activity, BarChart3, PieChart as PieChartIcon, Calendar,
  Clock, CheckCircle2, XCircle, AlertCircle, Info, Play, Brain,
  UserPlus, Mail, Lock, Unlock, Search, Download, Filter, SortAsc, SortDesc,
  RefreshCw, Sparkles, Scale, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  Briefcase, Award, UserCheck, FileText, Phone, Zap, Star,
  CircleDollarSign, CreditCard, Receipt, Landmark, LineChart as LineChartIcon, Globe, Command,
  TrendingDown, Eye, MoreHorizontal, ArrowRight, Banknote, PiggyBank,
  ListTodo, CalendarDays, MessageSquare, Paperclip, MapPin,
  Video, Presentation, GraduationCap, PartyPopper, Plus, Edit3, Trash2, Heart,
  BookOpen, Handshake, Layers, Network, GitMerge, CircleUser, Coins,
  GripVertical, Pin, PinOff, Loader2, Check, RotateCcw
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// Skeleton Loader Component
function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={cn("animate-pulse bg-muted rounded", className)} style={style} />
  );
}

// Card Skeleton for loading states
function CardSkeleton({ theme }: { theme: string }) {
  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-48 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  );
}

// KPI Skeleton for the header
function KpiSkeleton({ theme }: { theme: string }) {
  return (
    <div className={cn(
      "flex flex-col p-3 rounded-lg",
      theme === 'dark' ? 'bg-gray-700/50' : 'bg-white/50'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Skeleton className="w-4 h-4 rounded-full" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-12 mt-1" />
    </div>
  );
}

// Chart Skeleton
function ChartSkeleton({ height = "h-64", theme }: { height?: string; theme?: string }) {
  return (
    <Card className={cn("p-4", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <div className={cn("flex flex-col gap-2", height)}>
        <div className="flex-1 flex items-end gap-2 px-4">
          {[40, 65, 45, 80, 55, 70, 60, 75, 50, 85, 65, 90].map((h, i) => (
            <Skeleton key={i} className="flex-1" style={{ height: `${h}%` }} />
          ))}
        </div>
        <div className="flex justify-between px-4">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
            <Skeleton key={m} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </Card>
  );
}

type ExecTab = 'dashboard' | 'revenue' | 'forecasts' | 'risk' | 'leadership' | 'partnerships' | 'access';

type NavItemType = { id: ExecTab; label: string; icon: any; isLink?: false } | { id: string; label: string; icon: any; isLink: true; href: string };

const navItems: NavItemType[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo, isLink: true, href: '/exec/tasks' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, isLink: true, href: '/exec/calendar' },
  { id: 'revenue', label: 'Revenue & Capital', icon: DollarSign },
  { id: 'forecasts', label: 'Forecasts', icon: TrendingUp },
  { id: 'risk', label: 'Risk', icon: AlertTriangle },
  { id: 'leadership', label: 'Leadership', icon: Users },
  { id: 'partnerships', label: 'Partnerships', icon: Building2 },
  { id: 'access', label: 'Access Control', icon: Shield },
];

// ============ CAPITAL ALLOCATION DATA ============
const capitalBudgetCategories = [
  { id: 'marketing', name: 'Marketing & Lead Gen', allocated: 145000, spent: 98000, committed: 25000, available: 22000, ytdBudget: 580000, color: '#EC4899' },
  { id: 'hiring', name: 'Recruiting & Hiring', allocated: 85000, spent: 42000, committed: 18000, available: 25000, ytdBudget: 340000, color: '#8B5CF6' },
  { id: 'technology', name: 'Technology & Tools', allocated: 45000, spent: 38000, committed: 5000, available: 2000, ytdBudget: 180000, color: '#3B82F6' },
  { id: 'training', name: 'Training & Development', allocated: 35000, spent: 22000, committed: 8000, available: 5000, ytdBudget: 140000, color: '#10B981' },
  { id: 'incentives', name: 'Bonuses & Incentives', allocated: 120000, spent: 75000, committed: 30000, available: 15000, ytdBudget: 480000, color: '#F59E0B' },
  { id: 'operations', name: 'Operations & Admin', allocated: 98000, spent: 82000, committed: 12000, available: 4000, ytdBudget: 392000, color: '#6366F1' },
  { id: 'reserves', name: 'Cash Reserves', allocated: 200000, spent: 0, committed: 0, available: 200000, ytdBudget: 200000, color: '#14B8A6' },
  { id: 'contingency', name: 'Contingency Fund', allocated: 50000, spent: 8000, committed: 0, available: 42000, ytdBudget: 200000, color: '#64748B' },
];

const capitalAllocationHistory = [
  { date: '2026-01-05', category: 'Marketing', amount: 25000, type: 'allocation', approver: 'CEO', notes: 'Q1 digital campaign budget increase' },
  { date: '2026-01-03', category: 'Hiring', amount: 15000, type: 'reallocation', approver: 'CFO', notes: 'Moved from contingency for recruiter fees' },
  { date: '2025-12-28', category: 'Technology', amount: 12000, type: 'spend', approver: 'COO', notes: 'CRM upgrade payment' },
  { date: '2025-12-20', category: 'Incentives', amount: 45000, type: 'spend', approver: 'CEO', notes: 'Q4 performance bonuses' },
  { date: '2025-12-15', category: 'Training', amount: 8000, type: 'allocation', approver: 'CFO', notes: 'New agent onboarding materials' },
];

// ============ STRATEGIC DIRECTIVES DATA ============
const strategicDirectives = [
  { id: 1, title: 'Expand Final Expense Market Share', status: 'active', priority: 'high', owner: 'Sarah Mitchell', created: '2025-11-15', target: 'Q2 2026', kpis: ['Increase FE AP by 25%', 'Add 5 FE-focused agents', 'Partner with 2 new carriers'], progress: 35, notes: 'Focus on underserved markets in Midwest' },
  { id: 2, title: 'Reduce Override Exposure to 35%', status: 'active', priority: 'critical', owner: 'CFO', created: '2025-12-01', target: 'Q1 2026', kpis: ['Renegotiate top 3 agent contracts', 'Implement tiered structure', 'Cap new agent overrides at 30%'], progress: 60, notes: 'Critical for cash flow sustainability' },
  { id: 3, title: 'Launch IUL Product Line', status: 'planning', priority: 'medium', owner: 'David Park', created: '2025-12-20', target: 'Q3 2026', kpis: ['Train 10 agents on IUL', 'Partner with 3 IUL carriers', 'Target $500K Q3 IUL AP'], progress: 15, notes: 'Higher margin opportunity' },
  { id: 4, title: 'Achieve 6-Month Cash Runway', status: 'active', priority: 'high', owner: 'CFO', created: '2025-10-01', target: 'Q2 2026', kpis: ['Reduce monthly burn by 15%', 'Build reserve to $690K', 'Improve collection cycle to 45 days'], progress: 70, notes: 'Currently at 4.2 months' },
  { id: 5, title: 'Digital Transformation Initiative', status: 'active', priority: 'medium', owner: 'COO', created: '2025-09-01', target: 'Q4 2026', kpis: ['Implement new CRM', 'Automate lead distribution', '100% digital applications'], progress: 45, notes: 'Phase 1 complete, Phase 2 in progress' },
];

// ============ AGENT BREAKDOWN DATA ============
const agentsByTeam = [
  { team: 'Alpha', total: 12, active: 11, inactive: 1, onboarding: 2, topPerformers: 4, atRisk: 1, avgAP: 40417, leader: 'Sarah Mitchell', trend: '+2' },
  { team: 'Beta', total: 10, active: 9, inactive: 1, onboarding: 1, topPerformers: 2, atRisk: 2, avgAP: 31200, leader: 'David Park', trend: '+1' },
  { team: 'Gamma', total: 8, active: 8, inactive: 0, onboarding: 0, topPerformers: 2, atRisk: 1, avgAP: 30625, leader: 'Lisa Rodriguez', trend: '0' },
  { team: 'Delta', total: 10, active: 9, inactive: 1, onboarding: 1, topPerformers: 2, atRisk: 1, avgAP: 27800, leader: 'Marcus Chen', trend: '+1' },
];

const agentStatusBreakdown = [
  { status: 'Top Performers', count: 10, percentage: 25, color: '#10B981', criteria: '>$50K AP/mo, >15% conversion' },
  { status: 'Consistent Producers', count: 15, percentage: 37.5, color: '#3B82F6', criteria: '$25-50K AP/mo, 10-15% conversion' },
  { status: 'Developing', count: 10, percentage: 25, color: '#F59E0B', criteria: '<$25K AP/mo, <10% conversion, <6 months' },
  { status: 'At Risk', count: 5, percentage: 12.5, color: '#EF4444', criteria: '<$15K AP/mo or >14 days inactive' },
];

const agentTrendData = [
  { month: 'Jul', total: 32, active: 28, hired: 4, churned: 2 },
  { month: 'Aug', total: 34, active: 30, hired: 3, churned: 1 },
  { month: 'Sep', total: 36, active: 32, hired: 4, churned: 2 },
  { month: 'Oct', total: 38, active: 34, hired: 3, churned: 1 },
  { month: 'Nov', total: 39, active: 35, hired: 2, churned: 1 },
  { month: 'Dec', total: 40, active: 36, hired: 3, churned: 2 },
];

const agentTenureDistribution = [
  { tenure: '0-3 months', count: 8, avgAP: 18000, color: '#F59E0B' },
  { tenure: '3-6 months', count: 7, avgAP: 28000, color: '#3B82F6' },
  { tenure: '6-12 months', count: 12, avgAP: 38000, color: '#8B5CF6' },
  { tenure: '1-2 years', count: 9, avgAP: 52000, color: '#10B981' },
  { tenure: '2+ years', count: 4, avgAP: 85000, color: '#EC4899' },
];

// ============ STRATEGIC PARTNERSHIPS DATA ============
const partnershipCategories = {
  carriers: { count: 8, healthScore: 85, renewalsPending: 2, totalPremium: 12500000 },
  vendors: { count: 12, healthScore: 78, renewalsPending: 3, totalSpend: 285000 },
  strategic: { count: 5, healthScore: 92, renewalsPending: 1, totalValue: 850000 },
};

const carrierPartnerships = [
  { id: 1, name: 'Mutual of Omaha', type: 'carrier', status: 'active', healthScore: 92, tier: 'Platinum', contractStart: '2023-01-01', contractEnd: '2026-12-31', renewalDate: '2026-10-01', premium: 2850000, commission: 285000, roi: 10.0, dependencyScore: 'High', notes: 'Primary FE carrier, excellent underwriting speed', contacts: [{ name: 'John Smith', role: 'Regional VP', email: 'jsmith@mutualomaha.com' }], obligations: ['Minimum $2M annual premium', 'Quarterly business reviews'], alerts: [] },
  { id: 2, name: 'Transamerica', type: 'carrier', status: 'active', healthScore: 88, tier: 'Gold', contractStart: '2022-06-01', contractEnd: '2025-05-31', renewalDate: '2025-03-01', premium: 2100000, commission: 189000, roi: 9.0, dependencyScore: 'High', notes: 'Strong term product lineup', contacts: [{ name: 'Lisa Chen', role: 'Agency Director', email: 'lchen@transamerica.com' }], obligations: ['Quarterly production minimums'], alerts: [{ type: 'renewal', message: 'Renewal in 60 days', severity: 'warning' }] },
  { id: 3, name: 'Foresters', type: 'carrier', status: 'active', healthScore: 85, tier: 'Gold', contractStart: '2023-03-01', contractEnd: '2026-02-28', renewalDate: '2025-12-01', premium: 1800000, commission: 162000, roi: 9.0, dependencyScore: 'Medium', notes: 'New IUL products launching Q2', contacts: [], obligations: [], alerts: [] },
  { id: 4, name: 'Americo', type: 'carrier', status: 'active', healthScore: 72, tier: 'Silver', contractStart: '2024-01-01', contractEnd: '2026-12-31', renewalDate: '2026-10-01', premium: 1450000, commission: 123250, roi: 8.5, dependencyScore: 'Medium', notes: 'Underwriting delays affecting placement', contacts: [], obligations: [], alerts: [{ type: 'performance', message: 'ROI declining 3 consecutive months', severity: 'warning' }] },
  { id: 5, name: 'Corebridge', type: 'carrier', status: 'active', healthScore: 80, tier: 'Silver', contractStart: '2024-06-01', contractEnd: '2027-05-31', renewalDate: '2027-03-01', premium: 980000, commission: 78400, roi: 8.0, dependencyScore: 'Low', notes: 'Growing relationship, good annuity products', contacts: [], obligations: [], alerts: [] },
];

const vendorPartnerships = [
  { id: 101, name: 'LeadByte', type: 'vendor', category: 'Lead Generation', status: 'active', healthScore: 85, contractValue: 48000, contractEnd: '2026-06-30', renewalDate: '2026-04-30', performance: { quality: 82, volume: 95, cost: 78 }, dependencyScore: 'High', notes: 'Primary lead source, 40% of leads' },
  { id: 102, name: 'RingCentral', type: 'vendor', category: 'Communications', status: 'active', healthScore: 90, contractValue: 24000, contractEnd: '2026-12-31', renewalDate: '2026-10-31', performance: { quality: 92, volume: 100, cost: 88 }, dependencyScore: 'Critical', notes: 'Phone system, cannot operate without' },
  { id: 103, name: 'Salesforce', type: 'vendor', category: 'CRM', status: 'active', healthScore: 78, contractValue: 36000, contractEnd: '2026-03-31', renewalDate: '2026-01-31', performance: { quality: 75, volume: 100, cost: 65 }, dependencyScore: 'High', notes: 'Evaluating alternatives due to cost', alerts: [{ type: 'renewal', message: 'Renewal in 26 days - decision needed', severity: 'critical' }] },
  { id: 104, name: 'Zapier', type: 'vendor', category: 'Automation', status: 'active', healthScore: 88, contractValue: 6000, contractEnd: '2026-08-31', renewalDate: '2026-06-30', performance: { quality: 90, volume: 85, cost: 92 }, dependencyScore: 'Medium', notes: 'Workflow automation' },
  { id: 105, name: 'DocuSign', type: 'vendor', category: 'E-Signature', status: 'active', healthScore: 95, contractValue: 12000, contractEnd: '2026-11-30', renewalDate: '2026-09-30', performance: { quality: 98, volume: 100, cost: 85 }, dependencyScore: 'Critical', notes: 'All applications use DocuSign' },
];

const strategicPartners = [
  { id: 201, name: 'National Insurance Alliance', type: 'strategic', category: 'Distribution', status: 'active', healthScore: 88, value: 450000, partnerSince: '2022-01-01', nextReview: '2026-03-15', benefits: ['Access to exclusive leads', 'Co-marketing programs', 'Training resources'], strategicValue: 'High', notes: 'Key distribution partner for Midwest expansion' },
  { id: 202, name: 'InsureTech Accelerator', type: 'strategic', category: 'Technology', status: 'active', healthScore: 75, value: 150000, partnerSince: '2024-06-01', nextReview: '2026-06-01', benefits: ['Early access to new tools', 'Discounted implementations'], strategicValue: 'Medium', notes: 'Innovation partnership' },
  { id: 203, name: 'Life Insurance Council', type: 'strategic', category: 'Industry', status: 'active', healthScore: 92, value: 25000, partnerSince: '2020-01-01', nextReview: '2026-12-01', benefits: ['Industry advocacy', 'Regulatory updates', 'Networking events'], strategicValue: 'Medium', notes: 'Industry association membership' },
];

const businessDeals = [
  { id: 301, name: 'Midwest Agency Acquisition', type: 'deal', category: 'M&A', status: 'in_progress', stage: 'Due Diligence', value: 1250000, potentialRevenue: 480000, probability: 65, startDate: '2025-10-15', targetClose: '2026-03-31', keyContact: 'Robert Miller', contactRole: 'Owner', terms: 'Asset purchase with 2-year earnout', risks: ['Agent retention post-acquisition', 'Client transition'], nextAction: 'Complete financial audit', notes: 'Regional agency with 15 agents, strong FE book' },
  { id: 302, name: 'Chicago IMO Partnership', type: 'deal', category: 'Joint Venture', status: 'active', stage: 'Contracted', value: 350000, potentialRevenue: 185000, probability: 100, startDate: '2025-08-01', targetClose: 'Active', keyContact: 'Jennifer Walsh', contactRole: 'Managing Partner', terms: '60/40 revenue split on joint business', risks: ['Commission disputes', 'Territory overlap'], nextAction: 'Quarterly review meeting', notes: 'Expanded Chicago market access' },
  { id: 303, name: 'Southern States Distribution', type: 'deal', category: 'Distribution Agreement', status: 'in_progress', stage: 'Negotiation', value: 0, potentialRevenue: 320000, probability: 45, startDate: '2025-12-01', targetClose: '2026-02-28', keyContact: 'William Davis', contactRole: 'VP Sales', terms: 'Exclusive distribution rights for FL, GA, SC', risks: ['Compliance in new states', 'Onboarding timeline'], nextAction: 'Finalize contract terms', notes: 'Opens 3 new state markets' },
  { id: 304, name: 'Senior Market Lead Co-op', type: 'deal', category: 'Co-Marketing', status: 'in_progress', stage: 'Pilot', value: 75000, potentialRevenue: 125000, probability: 80, startDate: '2025-11-15', targetClose: '2026-06-30', keyContact: 'Patricia Brown', contactRole: 'Marketing Director', terms: 'Shared lead generation costs, split leads 50/50', risks: ['Lead quality variability', 'Brand alignment'], nextAction: 'Review pilot results', notes: '3-month pilot showing 22% conversion' },
  { id: 305, name: 'Legacy Block Purchase', type: 'deal', category: 'Book Purchase', status: 'pending', stage: 'Evaluation', value: 580000, potentialRevenue: 145000, probability: 30, startDate: '2026-01-02', targetClose: '2026-04-30', keyContact: 'Thomas Anderson', contactRole: 'Retiring Agent', terms: 'Purchase of FE policy block at 1.4x annual commission', risks: ['Policy lapse rate', 'Client acceptance'], nextAction: 'Complete book analysis', notes: '~4,200 policies, avg age 72' },
];

const investments = [
  { id: 401, name: 'QuoteEngine AI', type: 'investment', category: 'Equity Stake', status: 'active', investmentAmount: 125000, equityPercentage: 8.5, currentValuation: 185000, unrealizedGain: 60000, investmentDate: '2024-03-15', stage: 'Seed', sector: 'InsurTech', keyContact: 'Alex Chen', contactRole: 'CEO', exitStrategy: 'Strategic acquisition target', nextMilestone: 'Series A raise Q2 2026', notes: 'AI-powered quoting tool we use internally' },
  { id: 402, name: 'AgentTrainer Pro', type: 'investment', category: 'Convertible Note', status: 'active', investmentAmount: 50000, equityPercentage: 0, currentValuation: 55000, unrealizedGain: 5000, investmentDate: '2025-06-01', stage: 'Pre-Seed', sector: 'EdTech', keyContact: 'Maria Santos', contactRole: 'Founder', exitStrategy: 'Convert at Series A', nextMilestone: 'Product launch Feb 2026', notes: 'Training platform for insurance agents' },
  { id: 403, name: 'Benefits Marketing Group', type: 'investment', category: 'Revenue Share', status: 'active', investmentAmount: 200000, equityPercentage: 15, currentValuation: 280000, unrealizedGain: 80000, investmentDate: '2023-09-01', stage: 'Growth', sector: 'Marketing', keyContact: 'David Thompson', contactRole: 'Managing Partner', exitStrategy: 'Partner buyout option in 2027', nextMilestone: 'Profitability target Q1 2026', notes: 'Marketing agency specializing in life insurance' },
  { id: 404, name: 'PolicyVault', type: 'investment', category: 'SAFE', status: 'pending', investmentAmount: 75000, equityPercentage: 0, currentValuation: 75000, unrealizedGain: 0, investmentDate: '2026-01-05', stage: 'Pre-Seed', sector: 'InsurTech', keyContact: 'Kevin Liu', contactRole: 'CTO', exitStrategy: 'Convert at first priced round', nextMilestone: 'Close SAFE round Jan 2026', notes: 'Digital policy storage and management' },
];

const networkRelationships = [
  { id: 501, name: 'Michael Stevens', type: 'individual', category: 'Industry Influencer', relationship: 'Mentor', strength: 95, lastContact: '2026-01-03', frequency: 'Monthly', value: 'High', connections: ['Carrier introductions', 'Speaking opportunities'], linkedTo: ['Mutual of Omaha', 'National Insurance Alliance'], notes: '30-year industry veteran, former carrier executive' },
  { id: 502, name: 'First National Bank - Naperville', type: 'institution', category: 'Referral Partner', relationship: 'Active Partner', strength: 78, lastContact: '2025-12-20', frequency: 'Quarterly', value: 'Medium', connections: ['Client referrals', 'Estate planning'], linkedTo: ['Local attorneys', 'CPAs'], notes: '15-20 referrals/year, wealth management focus' },
  { id: 503, name: 'Chicago Estate Planners Association', type: 'organization', category: 'Professional Network', relationship: 'Member', strength: 85, lastContact: '2025-12-15', frequency: 'Monthly', value: 'High', connections: ['Attorney referrals', 'Joint seminars'], linkedTo: ['High net worth clients'], notes: 'Source of IUL and estate planning cases' },
  { id: 504, name: 'Sandra Williams', type: 'individual', category: 'Former Colleague', relationship: 'Strategic Contact', strength: 70, lastContact: '2025-11-10', frequency: 'Quarterly', value: 'Medium', connections: ['Carrier intelligence', 'Agent recruiting'], linkedTo: ['Transamerica', 'Foresters'], notes: 'VP at competing agency, mutual respect' },
  { id: 505, name: 'Illinois Insurance Association', type: 'organization', category: 'Regulatory', relationship: 'Member', strength: 90, lastContact: '2026-01-02', frequency: 'Monthly', value: 'High', connections: ['Regulatory updates', 'Compliance resources'], linkedTo: ['State DOI', 'Lobbyists'], notes: 'Essential for compliance and advocacy' },
  { id: 506, name: 'Premier Wealth Advisors', type: 'institution', category: 'Cross-Sell Partner', relationship: 'Active Partner', strength: 82, lastContact: '2025-12-28', frequency: 'Bi-weekly', value: 'High', connections: ['Annuity referrals', 'Financial planning'], linkedTo: ['High net worth clients', 'CPAs'], notes: 'Joint clients for comprehensive planning' },
];

const renewalCalendar = [
  { id: 1, partner: 'Salesforce', type: 'vendor', renewalDate: '2026-01-31', daysRemaining: 26, value: 36000, action: 'Negotiate', priority: 'critical' },
  { id: 2, partner: 'Transamerica', type: 'carrier', renewalDate: '2025-03-01', daysRemaining: 55, value: 189000, action: 'Renew', priority: 'high' },
  { id: 3, partner: 'LeadByte', type: 'vendor', renewalDate: '2026-04-30', daysRemaining: 115, value: 48000, action: 'Review', priority: 'medium' },
  { id: 4, partner: 'InsureTech Accelerator', type: 'strategic', renewalDate: '2026-06-01', daysRemaining: 147, value: 150000, action: 'Evaluate', priority: 'medium' },
];

const revenueData = [
  { month: 'Jul', revenue: 245000, collected: 228000, booked: 252000 },
  { month: 'Aug', revenue: 268000, collected: 251000, booked: 275000 },
  { month: 'Sep', revenue: 312000, collected: 295000, booked: 320000 },
  { month: 'Oct', revenue: 298000, collected: 280000, booked: 305000 },
  { month: 'Nov', revenue: 345000, collected: 328000, booked: 355000 },
  { month: 'Dec', revenue: 420000, collected: 398000, booked: 435000 },
];

const cashFlowData = [
  { week: 'W1', inflow: 95000, outflow: 72000 },
  { week: 'W2', inflow: 88000, outflow: 68000 },
  { week: 'W3', inflow: 102000, outflow: 75000 },
  { week: 'W4', inflow: 115000, outflow: 82000 },
];

const forecastData = [
  { month: 'Jan', projected: 385000, optimistic: 420000, conservative: 350000 },
  { month: 'Feb', projected: 405000, optimistic: 445000, conservative: 370000 },
  { month: 'Mar', projected: 425000, optimistic: 475000, conservative: 390000 },
  { month: 'Apr', projected: 450000, optimistic: 510000, conservative: 410000 },
  { month: 'May', projected: 480000, optimistic: 550000, conservative: 430000 },
  { month: 'Jun', projected: 515000, optimistic: 595000, conservative: 455000 },
];

const agentDistribution = [
  { name: 'Top Performers', value: 8, color: '#10B981' },
  { name: 'Consistent', value: 15, color: '#3B82F6' },
  { name: 'Developing', value: 12, color: '#F59E0B' },
  { name: 'At Risk', value: 5, color: '#EF4444' },
];

const carrierROI = [
  { carrier: 'Mutual of Omaha', premium: 2850000, commission: 285000, roi: 10.0, trend: 'up' },
  { carrier: 'Transamerica', premium: 2100000, commission: 189000, roi: 9.0, trend: 'up' },
  { carrier: 'Foresters', premium: 1800000, commission: 162000, roi: 9.0, trend: 'stable' },
  { carrier: 'Americo', premium: 1450000, commission: 123250, roi: 8.5, trend: 'down' },
  { carrier: 'Corebridge', premium: 980000, commission: 78400, roi: 8.0, trend: 'up' },
];

const riskAlerts = [
  { id: 1, severity: 'critical', title: 'Override Exposure Warning', message: 'Override obligations exceed 45% of projected revenue for Q1', timestamp: '2 hours ago', acknowledged: false },
  { id: 2, severity: 'warning', title: 'Agent Inactivity Detected', message: '3 agents have zero activity in the past 14 days', timestamp: '5 hours ago', acknowledged: false },
  { id: 3, severity: 'info', title: 'Cash Reserve Notice', message: 'Cash reserves at 4.2 months runway (target: 6 months)', timestamp: '1 day ago', acknowledged: true },
];

const teamMembers = [
  { id: 1, name: 'Sarah Mitchell', role: 'Sales Director', readiness: 92, potential: 'High', status: 'ready' },
  { id: 2, name: 'Michael Chen', role: 'Operations Manager', readiness: 78, potential: 'High', status: 'developing' },
  { id: 3, name: 'Jessica Rodriguez', role: 'Senior Agent', readiness: 85, potential: 'Medium', status: 'ready' },
  { id: 4, name: 'David Park', role: 'Recruiting Lead', readiness: 65, potential: 'High', status: 'developing' },
];

const emailAccessList = [
  { id: 1, email: 'sarah.mitchell@goldcoast.com', access: ['agent-portal', 'crm', 'reports'], role: 'Sales Director', status: 'active' },
  { id: 2, email: 'michael.chen@goldcoast.com', access: ['admin-portal', 'agent-portal', 'hr'], role: 'Operations', status: 'active' },
  { id: 3, email: 'new.agent@goldcoast.com', access: ['agent-portal'], role: 'Agent', status: 'pending' },
];

const accessOptions = [
  { id: 'agent-portal', label: 'Agent Portal', icon: Users },
  { id: 'admin-portal', label: 'Admin Portal', icon: Settings },
  { id: 'exec-portal', label: 'Executive Portal', icon: Crown },
  { id: 'crm', label: 'CRM System', icon: Briefcase },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'hr', label: 'HR & Payroll', icon: FileText },
  { id: 'finance', label: 'Finance Tools', icon: DollarSign },
];

const revenueSparkline = [
  { value: 245 }, { value: 268 }, { value: 312 }, { value: 298 }, { value: 345 }, { value: 420 }
];

const cashSparkline = [
  { value: 410 }, { value: 425 }, { value: 442 }, { value: 458 }, { value: 472 }, { value: 485 }
];

const agentSparkline = [
  { value: 32 }, { value: 34 }, { value: 36 }, { value: 38 }, { value: 39 }, { value: 40 }
];

const overrideSparkline = [
  { value: 95 }, { value: 102 }, { value: 108 }, { value: 115 }, { value: 122 }, { value: 128 }
];

const agentPerformanceData = [
  { id: 1, name: 'Sarah Mitchell', role: 'Senior Agent', team: 'Alpha', dailyCalls: 28, weeklyCalls: 145, deals: 8, ap: 125000, conversionRate: 18.5, streak: 15, status: 'top', trend: 'up', avatar: 'SM' },
  { id: 2, name: 'Marcus Chen', role: 'Agent', team: 'Alpha', dailyCalls: 24, weeklyCalls: 118, deals: 6, ap: 98500, conversionRate: 15.2, streak: 12, status: 'top', trend: 'up', avatar: 'MC' },
  { id: 3, name: 'Alex Johnson', role: 'Agent', team: 'Beta', dailyCalls: 22, weeklyCalls: 98, deals: 4, ap: 72000, conversionRate: 12.8, streak: 5, status: 'consistent', trend: 'up', avatar: 'AJ' },
  { id: 4, name: 'Emily Davis', role: 'Agent', team: 'Beta', dailyCalls: 18, weeklyCalls: 85, deals: 3, ap: 54000, conversionRate: 11.2, streak: 3, status: 'consistent', trend: 'down', avatar: 'ED' },
  { id: 5, name: 'Jordan Taylor', role: 'Junior Agent', team: 'Alpha', dailyCalls: 15, weeklyCalls: 72, deals: 2, ap: 38000, conversionRate: 9.5, streak: 7, status: 'developing', trend: 'up', avatar: 'JT' },
  { id: 6, name: 'Lisa Rodriguez', role: 'Agent', team: 'Gamma', dailyCalls: 20, weeklyCalls: 92, deals: 3, ap: 48000, conversionRate: 10.8, streak: 4, status: 'consistent', trend: 'stable', avatar: 'LR' },
  { id: 7, name: 'Kevin Park', role: 'Junior Agent', team: 'Beta', dailyCalls: 12, weeklyCalls: 58, deals: 1, ap: 22000, conversionRate: 6.2, streak: 0, status: 'at_risk', trend: 'down', avatar: 'KP' },
  { id: 8, name: 'Nina Williams', role: 'Agent', team: 'Gamma', dailyCalls: 19, weeklyCalls: 88, deals: 4, ap: 61000, conversionRate: 13.5, streak: 8, status: 'consistent', trend: 'up', avatar: 'NW' },
];

const activityStreamData = [
  { id: 1, type: 'deal', agent: 'Sarah Mitchell', message: 'Closed $18,500 Term 20 policy', time: '2 minutes ago', value: 18500, highlight: true },
  { id: 2, type: 'milestone', agent: 'Marcus Chen', message: 'Reached $100K monthly AP milestone', time: '15 minutes ago', highlight: true },
  { id: 3, type: 'deal', agent: 'Alex Johnson', message: 'Closed $12,000 Whole Life policy', time: '28 minutes ago', value: 12000 },
  { id: 4, type: 'call', agent: 'Emily Davis', message: 'Completed 5 discovery calls', time: '45 minutes ago' },
  { id: 5, type: 'alert', agent: 'System', message: 'Override threshold approaching 50%', time: '1 hour ago', severity: 'warning' },
  { id: 6, type: 'deal', agent: 'Nina Williams', message: 'Closed $8,200 Final Expense policy', time: '1.5 hours ago', value: 8200 },
  { id: 7, type: 'achievement', agent: 'Jordan Taylor', message: 'Earned "Rising Star" badge', time: '2 hours ago' },
  { id: 8, type: 'deal', agent: 'Lisa Rodriguez', message: 'Closed $15,800 Mortgage Protection', time: '2.5 hours ago', value: 15800 },
];

const productMixData = [
  { name: 'Term 20', value: 485000, percentage: 25.7, color: '#10B981', trend: '+12%' },
  { name: 'Term 30', value: 392000, percentage: 20.7, color: '#3B82F6', trend: '+8%' },
  { name: 'Whole Life', value: 358000, percentage: 19.0, color: '#8B5CF6', trend: '+15%' },
  { name: 'Final Expense', value: 312000, percentage: 16.5, color: '#F59E0B', trend: '+22%' },
  { name: 'Mortgage Protection', value: 243000, percentage: 12.9, color: '#EC4899', trend: '+5%' },
  { name: 'IUL', value: 100000, percentage: 5.2, color: '#6366F1', trend: '+32%' },
];

const pipelineData = [
  { stage: 'New Leads', count: 245, value: 2450000, conversion: 100 },
  { stage: 'Contacted', count: 186, value: 1860000, conversion: 76 },
  { stage: 'Discovery', count: 124, value: 1240000, conversion: 51 },
  { stage: 'Proposal', count: 68, value: 680000, conversion: 28 },
  { stage: 'Negotiation', count: 42, value: 420000, conversion: 17 },
  { stage: 'Closed Won', count: 28, value: 280000, conversion: 11 },
];

const financialSummary = {
  revenue: { gross: 2120000, net: 1870000, collected: 1650000 },
  expenses: {
    commissions: 748000,
    overrides: 312000,
    marketing: 145000,
    operations: 98000,
    technology: 45000,
    other: 62000,
  },
  metrics: {
    grossMargin: 42.5,
    netMargin: 28.8,
    opexRatio: 15.2,
  }
};

const teamPerformance = [
  { team: 'Alpha', agents: 12, ap: 485000, deals: 45, avgConversion: 15.8, leader: 'Sarah Mitchell' },
  { team: 'Beta', agents: 10, ap: 312000, deals: 28, avgConversion: 12.4, leader: 'David Park' },
  { team: 'Gamma', agents: 8, ap: 245000, deals: 22, avgConversion: 11.2, leader: 'Lisa Rodriguez' },
  { team: 'Delta', agents: 10, ap: 278000, deals: 25, avgConversion: 10.8, leader: 'Marcus Chen' },
];

const commissionWaterfallData = [
  { name: 'Gross Premium', value: 2120000, fill: '#10B981' },
  { name: 'Carrier Commission', value: -850000, fill: '#EF4444' },
  { name: 'Agent Commissions', value: -748000, fill: '#F59E0B' },
  { name: 'Override Payments', value: -312000, fill: '#8B5CF6' },
  { name: 'Net to Agency', value: 210000, fill: '#3B82F6' },
];

const execTasksData = [
  { id: 1, title: 'Review Q1 financial projections', description: 'Analyze revenue forecasts and adjust budget allocations', priority: 'high', status: 'in_progress', assignee: 'You', dueDate: '2026-01-06', category: 'Finance', progress: 65, comments: 3, attachments: 2 },
  { id: 2, title: 'Approve agent promotion recommendations', description: 'Review 5 agents for Senior Agent promotion based on Q4 performance', priority: 'high', status: 'pending', assignee: 'You', dueDate: '2026-01-07', category: 'Leadership', progress: 0, comments: 8, attachments: 5 },
  { id: 3, title: 'Sign carrier renewal contract - Mutual of Omaha', description: 'Review and execute renewal with improved commission structure', priority: 'urgent', status: 'pending', assignee: 'You', dueDate: '2026-01-05', category: 'Contracts', progress: 0, comments: 12, attachments: 3 },
  { id: 4, title: 'Review marketing spend efficiency report', description: 'Analyze ROI on Q4 marketing campaigns and lead generation', priority: 'medium', status: 'completed', assignee: 'Sarah Mitchell', dueDate: '2026-01-04', category: 'Marketing', progress: 100, comments: 5, attachments: 1 },
  { id: 5, title: 'Prepare board presentation', description: 'Create executive summary for Q1 board meeting', priority: 'high', status: 'in_progress', assignee: 'You', dueDate: '2026-01-10', category: 'Leadership', progress: 35, comments: 2, attachments: 4 },
  { id: 6, title: 'Finalize 2026 hiring plan', description: 'Set agent recruitment targets and budget for new year', priority: 'medium', status: 'pending', assignee: 'Michael Chen', dueDate: '2026-01-08', category: 'HR', progress: 0, comments: 6, attachments: 2 },
  { id: 7, title: 'Review compliance audit findings', description: 'Address 3 minor findings from Q4 compliance review', priority: 'medium', status: 'in_progress', assignee: 'You', dueDate: '2026-01-09', category: 'Compliance', progress: 50, comments: 4, attachments: 3 },
  { id: 8, title: 'Update override compensation structure', description: 'Implement new tiered override system for team leaders', priority: 'low', status: 'pending', assignee: 'David Park', dueDate: '2026-01-15', category: 'Finance', progress: 0, comments: 1, attachments: 1 },
];

const calendarEventsData = [
  { id: 1, title: 'Board of Directors Meeting', date: '2026-01-10', time: '09:00 AM', endTime: '12:00 PM', type: 'meeting', location: 'Conference Room A', attendees: ['CEO', 'CFO', 'COO', 'Board Members'], priority: 'high', description: 'Quarterly performance review and 2026 strategy discussion' },
  { id: 2, title: 'Carrier Review - Mutual of Omaha', date: '2026-01-05', time: '02:00 PM', endTime: '03:30 PM', type: 'call', location: 'Video Call', attendees: ['Regional VP'], priority: 'high', description: 'Contract renewal negotiation' },
  { id: 3, title: 'Weekly Leadership Sync', date: '2026-01-06', time: '10:00 AM', endTime: '11:00 AM', type: 'meeting', location: 'Executive Suite', attendees: ['Sales Director', 'Ops Manager', 'HR Lead'], priority: 'medium', description: 'Team performance updates and priorities' },
  { id: 4, title: 'Agent Town Hall', date: '2026-01-08', time: '04:00 PM', endTime: '05:00 PM', type: 'presentation', location: 'Main Office + Virtual', attendees: ['All Agents'], priority: 'medium', description: 'Q1 kickoff and goal announcements' },
  { id: 5, title: 'Q1 Revenue Target Review', date: '2026-01-07', time: '11:00 AM', endTime: '12:00 PM', type: 'meeting', location: 'Finance Office', attendees: ['CFO', 'Controller'], priority: 'high', description: 'Review pipeline against Q1 targets' },
  { id: 6, title: 'Marketing Strategy Session', date: '2026-01-09', time: '01:00 PM', endTime: '02:30 PM', type: 'meeting', location: 'Marketing Suite', attendees: ['Marketing Director', 'Agency'], priority: 'medium', description: 'Q1 campaign planning and budget allocation' },
  { id: 7, title: 'New Agent Orientation', date: '2026-01-12', time: '09:00 AM', endTime: '11:00 AM', type: 'training', location: 'Training Room', attendees: ['New Hires', 'HR Lead'], priority: 'low', description: 'Welcome and onboarding for 5 new agents' },
  { id: 8, title: 'Industry Conference - Life Insurance Summit', date: '2026-01-15', time: '08:00 AM', endTime: '05:00 PM', type: 'event', location: 'Chicago Convention Center', attendees: ['Industry Leaders'], priority: 'medium', description: 'Keynote speaking opportunity' },
  { id: 9, title: 'Performance Review - Sarah Mitchell', date: '2026-01-06', time: '03:00 PM', endTime: '04:00 PM', type: 'meeting', location: 'Executive Office', attendees: ['Sarah Mitchell'], priority: 'medium', description: 'Annual review and promotion discussion' },
  { id: 10, title: 'Tech Platform Demo - New CRM', date: '2026-01-11', time: '02:00 PM', endTime: '03:00 PM', type: 'demo', location: 'Video Call', attendees: ['IT Team', 'Vendor'], priority: 'low', description: 'Evaluate new CRM features' },
];


export default function ExecPortal() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<ExecTab>(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs: ExecTab[] = ['dashboard', 'revenue', 'forecasts', 'risk', 'leadership', 'partnerships', 'access'];
    return validTabs.includes(hash as ExecTab) ? hash as ExecTab : 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem("execTheme");
    return saved === "dark" ? "dark" : "light";
  });
  const [user, setUser] = useState<any>(null);
  const [marketingAllocation, setMarketingAllocation] = useState([35]);
  const [hiringAllocation, setHiringAllocation] = useState([25]);
  const [incentivesAllocation, setIncentivesAllocation] = useState([20]);
  const [alerts, setAlerts] = useState(riskAlerts);
  const [showScenarioModal, setShowScenarioModal] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<string | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs: ExecTab[] = ['dashboard', 'revenue', 'forecasts', 'risk', 'leadership', 'partnerships', 'access'];
      if (validTabs.includes(hash as ExecTab)) {
        setActiveTab(hash as ExecTab);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const auth = localStorage.getItem("execAuth");
    if (!auth) {
      navigate("/exec-login");
      return;
    }
    setUser(JSON.parse(auth));
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem("execTheme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    localStorage.removeItem("execAuth");
    navigate("/exec-login");
  };

  const acknowledgeAlert = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const runAIScenario = () => {
    setScenarioResult(null);
    setTimeout(() => {
      setScenarioResult(`Based on current allocation (Marketing: ${marketingAllocation[0]}%, Hiring: ${hiringAllocation[0]}%, Incentives: ${incentivesAllocation[0]}%), projected Q2 revenue impact: +${(marketingAllocation[0] * 0.8 + hiringAllocation[0] * 1.2 + incentivesAllocation[0] * 0.5).toFixed(1)}% growth. Recommendation: Consider increasing hiring allocation by 5% for optimal agent capacity.`);
    }, 2000);
  };

  if (!user) return null;

  const totalBudget = marketingAllocation[0] + hiringAllocation[0] + incentivesAllocation[0];
  const remainingBudget = 100 - totalBudget;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className={cn("min-h-screen flex", theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50')}>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: { background: theme === 'dark' ? '#1f2937' : undefined },
        }}
      />
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-r'
      )}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => navigate("/")}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <div className="bg-primary p-1.5 rounded-sm">
                <Crown className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold leading-none text-primary dark:text-white">GOLD COAST</span>
                <span className="text-[0.5rem] uppercase tracking-widest text-muted-foreground">Exec Command</span>
              </div>
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              if (item.isLink) {
                return (
                  <Link key={item.id} href={item.href}>
                    <div
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                        "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      )}
                      data-testid={`nav-${item.id}`}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.label}
                      <Badge className="ml-auto bg-amber-500/20 text-amber-500 text-[10px]">NEW</Badge>
                    </div>
                  </Link>
                );
              }
              return (
                <button
                  key={item.id}
                  onClick={() => { 
                    setActiveTab(item.id as ExecTab); 
                    setSidebarOpen(false); 
                    window.location.hash = item.id;
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id 
                      ? "bg-violet-50 text-secondary" 
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  )}
                  data-testid={`nav-${item.id}`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                  {item.id === 'risk' && unacknowledgedAlerts.length > 0 && (
                    <Badge className="ml-auto bg-red-500 text-white text-xs">{unacknowledgedAlerts.length}</Badge>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                <span className="font-bold text-secondary">{user.name?.charAt(0) || 'E'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate dark:text-white">{user.name || 'Executive'}</p>
                <p className="text-xs text-muted-foreground">Executive</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleTheme}
                className="flex-1"
                data-testid="button-toggle-theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className={cn(
          "sticky top-0 z-30 h-16 border-b flex items-center justify-between px-4",
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
        )}>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold dark:text-white">
              {navItems.find(n => n.id === activeTab)?.label}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" data-testid="button-refresh">
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {unacknowledgedAlerts.length > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unacknowledgedAlerts.length} Alerts
              </Badge>
            )}
          </div>
        </header>

        <main className={cn("flex-1 p-4 md:p-6", theme === 'dark' ? 'text-white' : '')}>
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <DashboardView
                theme={theme}
                alerts={alerts}
                acknowledgeAlert={acknowledgeAlert}
                marketingAllocation={marketingAllocation}
                setMarketingAllocation={setMarketingAllocation}
                hiringAllocation={hiringAllocation}
                setHiringAllocation={setHiringAllocation}
                incentivesAllocation={incentivesAllocation}
                setIncentivesAllocation={setIncentivesAllocation}
                remainingBudget={remainingBudget}
                runAIScenario={runAIScenario}
                scenarioResult={scenarioResult}
                showScenarioModal={showScenarioModal}
                setShowScenarioModal={setShowScenarioModal}
                user={user}
                setActiveTab={setActiveTab}
                navigate={navigate}
              />
            )}
            {activeTab === 'revenue' && <RevenueView theme={theme} />}
            {activeTab === 'forecasts' && <ForecastsView theme={theme} />}
            {activeTab === 'risk' && <RiskView theme={theme} alerts={alerts} acknowledgeAlert={acknowledgeAlert} />}
            {activeTab === 'leadership' && <LeadershipView theme={theme} />}
            {activeTab === 'partnerships' && <PartnershipsView theme={theme} />}
            {activeTab === 'access' && <AccessControlView theme={theme} />}
          </AnimatePresence>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <nav 
          className={cn(
            "fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t safe-area-inset-bottom",
            theme === 'dark' 
              ? 'bg-gray-900/95 backdrop-blur-lg border-gray-700' 
              : 'bg-white/95 backdrop-blur-lg border-gray-200'
          )}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-around h-16 px-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'revenue', label: 'Revenue', icon: DollarSign },
              { id: 'tasks', label: 'Tasks', icon: ListTodo, href: '/exec/tasks' },
              { id: 'calendar', label: 'Calendar', icon: CalendarDays, href: '/exec/calendar' },
              { id: 'more', label: 'More', icon: Menu },
            ].map((item) => {
              const isActive = activeTab === item.id;
              if (item.href) {
                return (
                  <Link key={item.id} href={item.href}>
                    <motion.div
                      className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 px-3 rounded-xl touch-manipulation"
                      whileTap={{ scale: 0.9 }}
                    >
                      <item.icon className={cn("w-5 h-5", theme === 'dark' ? 'text-gray-400' : 'text-gray-500')} />
                      <span className={cn("text-[10px] font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                        {item.label}
                      </span>
                    </motion.div>
                  </Link>
                );
              }
              if (item.id === 'more') {
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setSidebarOpen(true)}
                    className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 px-3 rounded-xl touch-manipulation"
                    whileTap={{ scale: 0.9 }}
                  >
                    <item.icon className={cn("w-5 h-5", theme === 'dark' ? 'text-gray-400' : 'text-gray-500')} />
                    <span className={cn("text-[10px] font-medium", theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>
                      {item.label}
                    </span>
                  </motion.button>
                );
              }
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as ExecTab);
                    window.location.hash = item.id;
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2 px-3 rounded-xl touch-manipulation transition-colors",
                    isActive && (theme === 'dark' ? 'bg-violet-100' : 'bg-violet-50')
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  <item.icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? 'text-secondary' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                  )} />
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? 'text-secondary' : (theme === 'dark' ? 'text-gray-400' : 'text-gray-500')
                  )}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      className="absolute -bottom-0 w-8 h-0.5 bg-secondary rounded-full"
                      layoutId="mobile-nav-indicator"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
      </div>
      
      {/* Add bottom padding on mobile for navigation bar */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}

function MiniSparkline({ data, color, theme }: { data: { value: number }[]; color: string; theme: string }) {
  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={1.5} 
            fill={`url(#spark-${color})`} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function EnhancedMetricCard({ 
  title, value, change, changeType, icon: Icon, subtitle, theme, testId, 
  sparklineData, sparklineColor, target, targetLabel, breakdown, expandable = false 
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  const cardTestId = testId || `metric-${title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border transition-all overflow-hidden',
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'
      )}
      data-testid={cardTestId}
    >
      <div 
        className={cn(
          'p-4 cursor-pointer transition-colors',
          expandable && (theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50')
        )}
        onClick={() => expandable && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            theme === 'dark' ? 'bg-violet-100' : 'bg-violet-50'
          )}>
            <Icon className="w-5 h-5 text-secondary" />
          </div>
          <div className="flex items-center gap-2">
            {sparklineData && (
              <MiniSparkline data={sparklineData} color={sparklineColor || '#E1B138'} theme={theme} />
            )}
            {change && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                isPositive && 'text-emerald-500 bg-emerald-500/10',
                isNegative && 'text-red-500 bg-red-500/10',
                !isPositive && !isNegative && (theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100')
              )} data-testid={`${cardTestId}-change`}>
                {isPositive && <ArrowUpRight className="w-3 h-3" />}
                {isNegative && <ArrowDownRight className="w-3 h-3" />}
                {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                {change}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-end justify-between">
          <div>
            <p className={cn('text-xs mb-1', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>{title}</p>
            <p className="text-2xl font-bold" data-testid={`${cardTestId}-value`}>{value}</p>
            {subtitle && <p className={cn('text-xs mt-1', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>{subtitle}</p>}
          </div>
          {expandable && (
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              isExpanded && 'rotate-180'
            )} />
          )}
        </div>
        
        {target && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">{targetLabel || 'vs Target'}</span>
              <span className="font-medium">{target}</span>
            </div>
            <Progress value={typeof target === 'string' ? parseInt(target) : 75} className="h-1.5" />
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isExpanded && breakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={cn(
              'border-t overflow-hidden',
              theme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'
            )}
          >
            <div className="p-4 space-y-2">
              {breakdown.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MetricCard({ title, value, change, changeType, icon: Icon, subtitle, theme, testId }: any) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';
  const cardTestId = testId || `metric-${title?.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-all',
        theme === 'dark' ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
      )}
      data-testid={cardTestId}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          theme === 'dark' ? 'bg-violet-100' : 'bg-violet-50'
        )}>
          <Icon className="w-5 h-5 text-secondary" />
        </div>
        {change && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPositive && 'text-emerald-500 bg-emerald-500/10',
            isNegative && 'text-red-500 bg-red-500/10',
            !isPositive && !isNegative && (theme === 'dark' ? 'text-gray-400 bg-gray-700' : 'text-gray-500 bg-gray-100')
          )} data-testid={`${cardTestId}-change`}>
            {isPositive && <ArrowUpRight className="w-3 h-3" />}
            {isNegative && <ArrowDownRight className="w-3 h-3" />}
            {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
            {change}
          </div>
        )}
      </div>
      <p className={cn('text-xs mb-1', theme === 'dark' ? 'text-gray-400' : 'text-gray-500')}>{title}</p>
      <p className="text-xl font-bold" data-testid={`${cardTestId}-value`}>{value}</p>
      {subtitle && <p className={cn('text-xs mt-1', theme === 'dark' ? 'text-gray-500' : 'text-gray-400')}>{subtitle}</p>}
    </motion.div>
  );
}

function ActivityStream({ theme }: { theme: string }) {
  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-secondary" />
            Live Activity
          </CardTitle>
          <Badge variant="outline" className="animate-pulse text-emerald-500 border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px] pr-4">
          <div className="space-y-3">
            {activityStreamData.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-all',
                  activity.highlight ? (theme === 'dark' ? 'bg-violet-50 border border-secondary/20' : 'bg-secondary/5 border border-secondary/10') : (theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-50')
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                  activity.type === 'deal' && 'bg-emerald-500/20 text-emerald-500',
                  activity.type === 'milestone' && 'bg-violet-100 text-secondary',
                  activity.type === 'call' && 'bg-blue-500/20 text-blue-500',
                  activity.type === 'alert' && 'bg-amber-500/20 text-amber-500',
                  activity.type === 'achievement' && 'bg-purple-500/20 text-purple-500'
                )}>
                  {activity.type === 'deal' && <DollarSign className="w-4 h-4" />}
                  {activity.type === 'milestone' && <Star className="w-4 h-4" />}
                  {activity.type === 'call' && <Phone className="w-4 h-4" />}
                  {activity.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                  {activity.type === 'achievement' && <Award className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{activity.agent}</span>
                    {activity.highlight && <Zap className="w-3 h-3 text-secondary" />}
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
                {activity.value && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 shrink-0">
                    +${activity.value.toLocaleString()}
                  </Badge>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function AgentPerformanceGrid({ theme }: { theme: string }) {
  const [sortBy, setSortBy] = useState<'ap' | 'deals' | 'conversion'>('ap');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const sortedAgents = useMemo(() => {
    let filtered = filterStatus === 'all' 
      ? agentPerformanceData 
      : agentPerformanceData.filter(a => a.status === filterStatus);
    
    return [...filtered].sort((a, b) => {
      if (sortBy === 'ap') return b.ap - a.ap;
      if (sortBy === 'deals') return b.deals - a.deals;
      return b.conversionRate - a.conversionRate;
    });
  }, [sortBy, filterStatus]);

  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-secondary" />
              Agent Performance
            </CardTitle>
            <CardDescription>Real-time agent metrics and standings</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className={cn('w-32', theme === 'dark' ? 'bg-gray-700 border-gray-600' : '')}>
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="top">Top Performers</SelectItem>
                <SelectItem value="consistent">Consistent</SelectItem>
                <SelectItem value="developing">Developing</SelectItem>
                <SelectItem value="at_risk">At Risk</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
              <SelectTrigger className={cn('w-32', theme === 'dark' ? 'bg-gray-700 border-gray-600' : '')}>
                <SortDesc className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ap">By AP</SelectItem>
                <SelectItem value="deals">By Deals</SelectItem>
                <SelectItem value="conversion">By Conv. Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="pb-3 font-medium">Agent</th>
                <th className="pb-3 font-medium text-center">Team</th>
                <th className="pb-3 font-medium text-center">Calls (D/W)</th>
                <th className="pb-3 font-medium text-center">Deals</th>
                <th className="pb-3 font-medium text-right">AP</th>
                <th className="pb-3 font-medium text-center">Conv %</th>
                <th className="pb-3 font-medium text-center">Streak</th>
                <th className="pb-3 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100')}>
              {sortedAgents.map((agent, idx) => (
                <motion.tr 
                  key={agent.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "text-sm transition-colors",
                    theme === 'dark' ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                  )}
                >
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        agent.status === 'top' && 'bg-violet-100 text-secondary',
                        agent.status === 'consistent' && 'bg-blue-500/20 text-blue-500',
                        agent.status === 'developing' && 'bg-amber-500/20 text-amber-500',
                        agent.status === 'at_risk' && 'bg-red-500/20 text-red-500'
                      )}>
                        {agent.avatar}
                      </div>
                      <div>
                        <span className="font-medium">{agent.name}</span>
                        <p className="text-xs text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    <Badge variant="outline" className="text-xs">{agent.team}</Badge>
                  </td>
                  <td className="py-3 text-center">
                    <span className="font-medium">{agent.dailyCalls}</span>
                    <span className="text-muted-foreground">/{agent.weeklyCalls}</span>
                  </td>
                  <td className="py-3 text-center font-medium">{agent.deals}</td>
                  <td className="py-3 text-right font-bold text-emerald-500">
                    ${(agent.ap / 1000).toFixed(0)}K
                  </td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-medium">{agent.conversionRate}%</span>
                      {agent.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                      {agent.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {agent.streak > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="font-medium">{agent.streak}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <Badge className={cn(
                      'text-xs',
                      agent.status === 'top' && 'bg-emerald-500/10 text-emerald-500',
                      agent.status === 'consistent' && 'bg-blue-500/10 text-blue-500',
                      agent.status === 'developing' && 'bg-amber-500/10 text-amber-500',
                      agent.status === 'at_risk' && 'bg-red-500/10 text-red-500'
                    )}>
                      {agent.status === 'top' && 'Top'}
                      {agent.status === 'consistent' && 'Solid'}
                      {agent.status === 'developing' && 'Dev'}
                      {agent.status === 'at_risk' && 'Risk'}
                    </Badge>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function PipelineFunnel({ theme }: { theme: string }) {
  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="w-5 h-5 text-secondary" />
          Deal Pipeline
        </CardTitle>
        <CardDescription>Conversion funnel and pipeline health</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pipelineData.map((stage, idx) => {
            const widthPercent = (stage.count / pipelineData[0].count) * 100;
            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{stage.stage}</span>
                    <Badge variant="outline" className="text-xs">{stage.count}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">${(stage.value / 1000000).toFixed(2)}M</span>
                    <span className={cn(
                      'font-medium',
                      stage.conversion > 50 ? 'text-emerald-500' : stage.conversion > 20 ? 'text-amber-500' : 'text-blue-500'
                    )}>
                      {stage.conversion}%
                    </span>
                  </div>
                </div>
                <div className={cn('h-8 rounded-lg overflow-hidden', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ delay: idx * 0.1 + 0.2, duration: 0.5 }}
                    className={cn(
                      'h-full rounded-lg flex items-center px-3',
                      idx === 0 && 'bg-blue-500',
                      idx === 1 && 'bg-cyan-500',
                      idx === 2 && 'bg-purple-500',
                      idx === 3 && 'bg-amber-500',
                      idx === 4 && 'bg-orange-500',
                      idx === 5 && 'bg-emerald-500'
                    )}
                  >
                    {widthPercent > 30 && (
                      <span className="text-white text-xs font-medium">{stage.count} leads</span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </div>
        <div className={cn('mt-4 pt-4 border-t flex items-center justify-between', theme === 'dark' ? 'border-gray-700' : 'border-gray-200')}>
          <div className="text-sm">
            <span className="text-muted-foreground">Overall Conversion:</span>
            <span className="ml-2 font-bold text-emerald-500">11.4%</span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Avg Deal Size:</span>
            <span className="ml-2 font-bold">$10,000</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductMixBreakdown({ theme }: { theme: string }) {
  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PieChartIcon className="w-5 h-5 text-secondary" />
          Revenue by Product
        </CardTitle>
        <CardDescription>Product mix distribution</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-6">
          <div className="h-48 w-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productMixData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {productMixData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => [`$${(value / 1000).toFixed(0)}K`, '']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                    border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-2">
            {productMixData.map((product) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: product.color }} />
                  <span className="text-sm">{product.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{product.percentage}%</span>
                  <span className="text-xs text-emerald-500">{product.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TeamPerformanceCard({ theme }: { theme: string }) {
  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5 text-secondary" />
          Team Performance
        </CardTitle>
        <CardDescription>Performance by team</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamPerformance.map((team, idx) => (
            <div key={team.team} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-bold">{team.team}</Badge>
                  <span className="text-xs text-muted-foreground">{team.agents} agents</span>
                </div>
                <span className="font-bold text-emerald-500">${(team.ap / 1000).toFixed(0)}K</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Deals: </span>
                  <span className="font-medium">{team.deals}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Conv: </span>
                  <span className="font-medium">{team.avgConversion}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Lead: </span>
                  <span className="font-medium truncate">{team.leader.split(' ')[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialSnapshot({ theme }: { theme: string }) {
  const expenseData = Object.entries(financialSummary.expenses).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    percentage: ((value / Object.values(financialSummary.expenses).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
  }));

  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Banknote className="w-5 h-5 text-secondary" />
          Financial Snapshot
        </CardTitle>
        <CardDescription>P&L overview and expense breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-xs text-muted-foreground">Gross Revenue</p>
            <p className="text-xl font-bold">${(financialSummary.revenue.gross / 1000000).toFixed(2)}M</p>
          </div>
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-xs text-muted-foreground">Net Revenue</p>
            <p className="text-xl font-bold text-emerald-500">${(financialSummary.revenue.net / 1000000).toFixed(2)}M</p>
          </div>
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-xs text-muted-foreground">Collected</p>
            <p className="text-xl font-bold">${(financialSummary.revenue.collected / 1000000).toFixed(2)}M</p>
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium mb-3">Expense Breakdown</p>
          {expenseData.map((expense) => (
            <div key={expense.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{expense.name}</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">${(expense.value / 1000).toFixed(0)}K</span>
                <span className="text-xs text-muted-foreground">({expense.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className={cn('mt-4 pt-4 border-t grid grid-cols-3 gap-4', theme === 'dark' ? 'border-gray-700' : 'border-gray-200')}>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Gross Margin</p>
            <p className="font-bold text-emerald-500">{financialSummary.metrics.grossMargin}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Net Margin</p>
            <p className="font-bold">{financialSummary.metrics.netMargin}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">OpEx Ratio</p>
            <p className="font-bold">{financialSummary.metrics.opexRatio}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ExecutiveTaskSection({ theme }: { theme: string }) {
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [tasks, setTasks] = useState(execTasksData);
  
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'all') return tasks;
    return tasks.filter(t => t.status === taskFilter);
  }, [tasks, taskFilter]);

  const taskStats = useMemo(() => ({
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
  }), [tasks]);

  const toggleTaskStatus = (taskId: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (t.status === 'completed') return { ...t, status: 'pending' as const, progress: 0 };
        return { ...t, status: 'completed' as const, progress: 100 };
      }
      return t;
    }));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    
    const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dateStr: string, status: string) => {
    return new Date(dateStr) < new Date() && status !== 'completed';
  };

  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="w-5 h-5 text-secondary" />
              Executive Tasks
            </CardTitle>
            <CardDescription>Your priority items and action items</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              {taskStats.urgent > 0 && (
                <Badge className="bg-red-500/10 text-red-500 border border-red-500/20">
                  {taskStats.urgent} Urgent
                </Badge>
              )}
              {taskStats.overdue > 0 && (
                <Badge className="bg-orange-500/10 text-orange-500 border border-orange-500/20">
                  {taskStats.overdue} Overdue
                </Badge>
              )}
            </div>
            <Select value={taskFilter} onValueChange={(v: any) => setTaskFilter(v)}>
              <SelectTrigger className={cn('w-32', theme === 'dark' ? 'bg-gray-700 border-gray-600' : '')} data-testid="select-task-filter">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" data-testid="select-item-all">All ({taskStats.total})</SelectItem>
                <SelectItem value="pending" data-testid="select-item-pending">Pending ({taskStats.pending})</SelectItem>
                <SelectItem value="in_progress" data-testid="select-item-in-progress">In Progress ({taskStats.inProgress})</SelectItem>
                <SelectItem value="completed" data-testid="select-item-completed">Completed ({taskStats.completed})</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1 bg-secondary hover:bg-secondary/90" data-testid="button-add-task">
              <Plus className="w-3 h-3" />
              Add Task
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-2xl font-bold">{taskStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Tasks</p>
          </div>
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-2xl font-bold text-amber-500">{taskStats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </div>
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-2xl font-bold text-blue-500">{taskStats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
            <p className="text-2xl font-bold text-emerald-500">{taskStats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>

        <ScrollArea className="h-[320px] pr-2">
          <div className="space-y-2">
            {filteredTasks.map((task, idx) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  'p-3 rounded-lg border transition-all group',
                  task.status === 'completed' 
                    ? (theme === 'dark' ? 'bg-gray-700/30 border-gray-700/50 opacity-60' : 'bg-gray-50/50 border-gray-200/50 opacity-60')
                    : (theme === 'dark' ? 'bg-gray-700/50 border-gray-600 hover:border-gray-500' : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm')
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    <Checkbox
                      checked={task.status === 'completed'}
                      onCheckedChange={() => toggleTaskStatus(task.id)}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      data-testid={`checkbox-task-${task.id}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'font-medium text-sm',
                        task.status === 'completed' && 'line-through text-muted-foreground'
                      )}>
                        {task.title}
                      </span>
                      <Badge className={cn('text-[10px] px-1.5 py-0 h-4 border', getPriorityColor(task.priority))}>
                        {task.priority}
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                        {task.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <div className={cn(
                        'flex items-center gap-1',
                        isOverdue(task.dueDate, task.status) ? 'text-red-500' : 'text-muted-foreground'
                      )}>
                        <Clock className="w-3 h-3" />
                        {formatDueDate(task.dueDate)}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="w-3 h-3" />
                        {task.assignee}
                      </div>
                      {task.comments > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          {task.comments}
                        </div>
                      )}
                      {task.attachments > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Paperclip className="w-3 h-3" />
                          {task.attachments}
                        </div>
                      )}
                    </div>
                    {task.status === 'in_progress' && task.progress > 0 && task.progress < 100 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="h-1.5" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="ghost" className="h-7 w-7" data-testid={`button-edit-task-${task.id}`}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:text-red-600" data-testid={`button-delete-task-${task.id}`}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function ExecutiveCalendarSection({ theme }: { theme: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  
  const currentMonth = selectedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      days.push({ date: d, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const days = getDaysInMonth(selectedDate);
  const today = new Date();
  
  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return calendarEventsData.filter(e => e.date === dateStr);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting': return Users;
      case 'call': return Phone;
      case 'presentation': return Presentation;
      case 'training': return GraduationCap;
      case 'event': return PartyPopper;
      case 'demo': return Video;
      default: return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'call': return 'bg-emerald-500';
      case 'presentation': return 'bg-purple-500';
      case 'training': return 'bg-amber-500';
      case 'event': return 'bg-pink-500';
      case 'demo': return 'bg-cyan-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeHexColor = (type: string) => {
    switch (type) {
      case 'meeting': return '#3B82F6';
      case 'call': return '#10B981';
      case 'presentation': return '#8B5CF6';
      case 'training': return '#F59E0B';
      case 'event': return '#EC4899';
      case 'demo': return '#06B6D4';
      default: return '#6B7280';
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const upcomingEvents = useMemo(() => {
    const todayStr = today.toISOString().split('T')[0];
    return calendarEventsData
      .filter(e => e.date >= todayStr)
      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime())
      .slice(0, 5);
  }, []);

  const todaysEvents = getEventsForDate(today);

  return (
    <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="w-5 h-5 text-secondary" />
              Executive Calendar
            </CardTitle>
            <CardDescription>Meetings, events, and important dates</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date())} data-testid="button-calendar-today">
              Today
            </Button>
            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('prev')} data-testid="button-calendar-prev">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium w-32 text-center" data-testid="text-calendar-month">{currentMonth}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth('next')} data-testid="button-calendar-next">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-7 gap-px mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className={cn('grid grid-cols-7 gap-px rounded-lg overflow-hidden', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200')}>
              {days.map((day, idx) => {
                const events = getEventsForDate(day.date);
                const isToday = day.date.toDateString() === today.toDateString();
                return (
                  <div
                    key={idx}
                    className={cn(
                      'min-h-[72px] p-1 transition-colors cursor-pointer',
                      theme === 'dark' ? 'bg-gray-800' : 'bg-white',
                      !day.isCurrentMonth && 'opacity-40',
                      isToday && (theme === 'dark' ? 'bg-violet-50' : 'bg-secondary/5'),
                      'hover:bg-secondary/5'
                    )}
                  >
                    <div className={cn(
                      'text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full',
                      isToday && 'bg-secondary text-white'
                    )}>
                      {day.date.getDate()}
                    </div>
                    <div className="space-y-0.5">
                      {events.slice(0, 2).map((event, eidx) => (
                        <div
                          key={eidx}
                          className={cn(
                            'text-[9px] px-1 py-0.5 rounded truncate text-white',
                            getEventTypeColor(event.type)
                          )}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className="text-[9px] text-muted-foreground px-1">
                          +{events.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {todaysEvents.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-secondary" />
                  Today's Schedule
                </h4>
                <div className="space-y-2">
                  {todaysEvents.map((event) => {
                    const EventIcon = getEventTypeIcon(event.type);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'p-2 rounded-lg border-l-3',
                          theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                        )}
                        style={{ borderLeftColor: getEventTypeHexColor(event.type) }}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white', getEventTypeColor(event.type))}>
                            <EventIcon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{event.title}</p>
                            <p className="text-[10px] text-muted-foreground">{event.time} - {event.endTime}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-secondary" />
                Upcoming Events
              </h4>
              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-2">
                  {upcomingEvents.map((event) => {
                    const EventIcon = getEventTypeIcon(event.type);
                    const eventDate = new Date(event.date);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          theme === 'dark' ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <div className={cn('w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-white', getEventTypeColor(event.type))}>
                            <EventIcon className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{event.title}</p>
                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                              <span>{eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                              <span>•</span>
                              <span>{event.time}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {event.location}
                            </div>
                          </div>
                          {event.priority === 'high' && (
                            <Badge className="text-[9px] px-1 h-4 bg-red-500/10 text-red-500 border-0">
                              High
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Drill-down data for each KPI
const kpiDrilldownData: Record<string, { title: string; breakdown: { label: string; value: string; change?: string; changeType?: 'positive' | 'negative' | 'neutral' }[]; chart?: { name: string; value: number }[] }> = {
  'revenue-ytd': {
    title: 'Revenue YTD Breakdown',
    breakdown: [
      { label: 'Q1 Revenue', value: '$485K', change: '+8%', changeType: 'positive' },
      { label: 'Q2 Revenue', value: '$512K', change: '+12%', changeType: 'positive' },
      { label: 'Q3 Revenue', value: '$478K', change: '-2%', changeType: 'negative' },
      { label: 'Q4 (Current)', value: '$415K', change: '+15%', changeType: 'positive' },
    ],
    chart: [
      { name: 'Jan', value: 158000 }, { name: 'Feb', value: 162000 }, { name: 'Mar', value: 165000 },
      { name: 'Apr', value: 168000 }, { name: 'May', value: 172000 }, { name: 'Jun', value: 172000 },
      { name: 'Jul', value: 155000 }, { name: 'Aug', value: 160000 }, { name: 'Sep', value: 163000 },
      { name: 'Oct', value: 135000 }, { name: 'Nov', value: 140000 }, { name: 'Dec', value: 140000 },
    ]
  },
  'net-margin': {
    title: 'Net Margin Analysis',
    breakdown: [
      { label: 'Gross Revenue', value: '$1.89M' },
      { label: 'Override Payments', value: '-$792K', change: '42%', changeType: 'negative' },
      { label: 'Operating Expenses', value: '-$748K', change: '39.5%', changeType: 'neutral' },
      { label: 'Net Profit', value: '$350K', change: '18.5%', changeType: 'positive' },
    ],
    chart: [
      { name: 'Q1', value: 19.2 }, { name: 'Q2', value: 20.1 }, { name: 'Q3', value: 17.8 }, { name: 'Q4', value: 18.5 },
    ]
  },
  'cash-position': {
    title: 'Cash Position Details',
    breakdown: [
      { label: 'Operating Cash', value: '$312K' },
      { label: 'Reserve Fund', value: '$128K' },
      { label: 'Accounts Receivable', value: '$45K' },
      { label: 'Monthly Burn Rate', value: '$115K' },
      { label: 'Runway', value: '4.2 months', changeType: 'positive' },
    ],
    chart: [
      { name: 'Jul', value: 380000 }, { name: 'Aug', value: 395000 }, { name: 'Sep', value: 420000 },
      { name: 'Oct', value: 445000 }, { name: 'Nov', value: 460000 }, { name: 'Dec', value: 485000 },
    ]
  },
  'override-exposure': {
    title: 'Override Exposure by Agent Tier',
    breakdown: [
      { label: 'Platinum Agents (5)', value: '$52K', change: '40%', changeType: 'negative' },
      { label: 'Gold Agents (10)', value: '$48K', change: '38%', changeType: 'negative' },
      { label: 'Silver Agents (15)', value: '$22K', change: '17%', changeType: 'neutral' },
      { label: 'Bronze Agents (10)', value: '$6K', change: '5%', changeType: 'positive' },
    ],
    chart: [
      { name: 'Platinum', value: 52000 }, { name: 'Gold', value: 48000 }, { name: 'Silver', value: 22000 }, { name: 'Bronze', value: 6000 },
    ]
  },
  'active-agents': {
    title: 'Agent Workforce Details',
    breakdown: [
      { label: 'Top Performers', value: '8 agents', change: '+2', changeType: 'positive' },
      { label: 'Consistent Producers', value: '15 agents', change: '+1', changeType: 'positive' },
      { label: 'Developing', value: '12 agents', change: '+3', changeType: 'positive' },
      { label: 'At Risk', value: '5 agents', change: '+1', changeType: 'negative' },
    ],
    chart: [
      { name: 'Jul', value: 32 }, { name: 'Aug', value: 34 }, { name: 'Sep', value: 36 },
      { name: 'Oct', value: 38 }, { name: 'Nov', value: 39 }, { name: 'Dec', value: 40 },
    ]
  },
  'churn-rate': {
    title: 'Churn Rate Analysis',
    breakdown: [
      { label: 'Agents Churned (YTD)', value: '9 agents' },
      { label: 'Avg Tenure at Churn', value: '4.2 months' },
      { label: 'Top Reason', value: 'Low Production', changeType: 'negative' },
      { label: 'Cost per Churn', value: '$8,500' },
      { label: 'Retention Rate', value: '95.8%', changeType: 'positive' },
    ],
    chart: [
      { name: 'Jul', value: 3.2 }, { name: 'Aug', value: 2.8 }, { name: 'Sep', value: 3.5 },
      { name: 'Oct', value: 3.8 }, { name: 'Nov', value: 4.0 }, { name: 'Dec', value: 4.2 },
    ]
  },
};

// Export utility function
function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function DashboardView({ theme, alerts, acknowledgeAlert, marketingAllocation, setMarketingAllocation, hiringAllocation, setHiringAllocation, incentivesAllocation, setIncentivesAllocation, remainingBudget, runAIScenario, scenarioResult, showScenarioModal, setShowScenarioModal, user, setActiveTab, navigate }: any) {
  const unacknowledgedAlerts = alerts.filter((a: any) => !a.acknowledged);
  const [globalTimeRange, setGlobalTimeRange] = useState<'7d' | '30d' | '90d' | 'ytd'>(() => {
    const saved = localStorage.getItem('exec_time_range');
    return (saved as '7d' | '30d' | '90d' | 'ytd') || 'ytd';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [drilldownKpi, setDrilldownKpi] = useState<string | null>(null);
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [quickActionLoading, setQuickActionLoading] = useState<string | null>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');
  const [pinnedKpis, setPinnedKpis] = useState<string[]>(() => {
    const saved = localStorage.getItem('exec_pinned_kpis');
    return saved ? JSON.parse(saved) : [];
  });
  const [comparisonMode, setComparisonMode] = useState(false);
  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const pullStartY = useRef(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('exec_time_range', globalTimeRange);
  }, [globalTimeRange]);

  useEffect(() => {
    localStorage.setItem('exec_pinned_kpis', JSON.stringify(pinnedKpis));
  }, [pinnedKpis]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickAction = useCallback((action: string) => {
    setQuickActionLoading(action);
    setTimeout(() => {
      setQuickActionLoading(null);
      toast.success(`${action} completed successfully`, {
        description: `Action "${action}" has been processed.`,
        duration: 3000,
      });
    }, 1200);
  }, []);

  const togglePinKpi = useCallback((kpiKey: string) => {
    setPinnedKpis(prev => 
      prev.includes(kpiKey) 
        ? prev.filter(k => k !== kpiKey)
        : [...prev, kpiKey]
    );
    toast.success(pinnedKpis.includes(kpiKey) ? 'KPI unpinned' : 'KPI pinned to dashboard');
  }, [pinnedKpis]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  }, []);

  const handleExport = useCallback((type: 'dashboard' | 'kpis' | 'revenue') => {
    if (type === 'kpis') {
      exportToCSV([
        { metric: 'Revenue YTD', value: '$1.89M', change: '+12.5%' },
        { metric: 'Net Margin', value: '18.5%', change: '-2.3%' },
        { metric: 'Cash Position', value: '$485K', change: '+8.2%' },
        { metric: 'Override Exposure', value: '42%', change: '-3.1%' },
        { metric: 'Active Agents', value: '40', change: '+5' },
        { metric: 'Churn Rate', value: '4.2%', change: '+0.8%' },
      ], 'executive_kpis');
    } else if (type === 'revenue') {
      exportToCSV(revenueData, 'revenue_data');
    } else {
      exportToCSV([
        ...revenueData.map(r => ({ type: 'revenue', ...r })),
        { type: 'summary', metric: 'Total YTD', value: '$1.89M' },
      ], 'dashboard_export');
    }
    setShowExportMenu(false);
  }, []);

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Header with Greeting and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <motion.h2 
            className="text-2xl md:text-3xl font-serif font-bold"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {user.name?.split(' ')[0] || 'Executive'}! <Sparkles className="inline w-6 h-6 text-secondary" />
          </motion.h2>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: <span className="font-medium">{formatLastUpdated(lastUpdated)}</span></span>
            </div>
            <span className="text-muted-foreground">•</span>
            <div className={cn("flex items-center gap-1.5", isRefreshing ? "text-secondary" : "text-emerald-500")}>
              <span className="relative flex h-2.5 w-2.5">
                {!isRefreshing && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                )}
                <span className={cn(
                  "relative inline-flex rounded-full h-2.5 w-2.5",
                  isRefreshing ? "bg-secondary animate-pulse" : "bg-emerald-500"
                )} />
              </span>
              <span className="text-xs font-medium">{isRefreshing ? 'Refreshing...' : 'Live'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={comparisonMode ? 'secondary' : 'outline'}
                  size="sm"
                  className={cn("h-7 px-3 gap-1.5", comparisonMode && "ring-2 ring-secondary/30")}
                  onClick={() => {
                    setComparisonMode(!comparisonMode);
                    toast.success(comparisonMode ? 'Comparison mode disabled' : 'Comparison mode enabled');
                  }}
                  data-testid="button-comparison-mode"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-xs">Compare</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Compare with previous period</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            {(['7d', '30d', '90d', 'ytd'] as const).map((range) => (
              <Button
                key={range}
                variant={globalTimeRange === range ? 'secondary' : 'ghost'}
                size="sm"
                className="h-7 px-3 text-xs"
                onClick={() => setGlobalTimeRange(range)}
                data-testid={`button-range-${range}`}
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleRefresh}
            disabled={isRefreshing}
            data-testid="button-refresh-dashboard"
          >
            <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
          <div className="relative">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={() => setShowExportMenu(!showExportMenu)}
              aria-haspopup="true"
              aria-expanded={showExportMenu}
              data-testid="button-export-menu"
            >
              <Download className="w-4 h-4" />
              Export
              <ChevronDown className="w-3 h-3" />
            </Button>
            {showExportMenu && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "absolute right-0 mt-1 w-48 rounded-lg shadow-lg border z-50",
                  theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                )}
                role="menu"
                aria-label="Export options"
              >
                <div className="p-1">
                  <button
                    onClick={() => handleExport('dashboard')}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    )}
                    role="menuitem"
                    data-testid="export-dashboard"
                  >
                    <FileText className="w-4 h-4" />
                    Full Dashboard (CSV)
                  </button>
                  <button
                    onClick={() => handleExport('kpis')}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    )}
                    role="menuitem"
                    data-testid="export-kpis"
                  >
                    <BarChart3 className="w-4 h-4" />
                    KPI Summary (CSV)
                  </button>
                  <button
                    onClick={() => handleExport('revenue')}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                      theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    )}
                    role="menuitem"
                    data-testid="export-revenue"
                  >
                    <DollarSign className="w-4 h-4" />
                    Revenue Data (CSV)
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* GLOBAL KPI HEADER - Critical Metrics Strip */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
        role="region"
        aria-label="Key Performance Indicators"
      >
        <Card className={cn("border-secondary/20 bg-gradient-to-r from-secondary/5 via-transparent to-secondary/5 overflow-hidden", theme === 'dark' ? 'bg-gray-800/50' : '')}>
          <CardContent className="py-4 px-6">
            {/* Goal Progress Bar at Top */}
            <div className="mb-4 pb-4 border-b border-border/50" role="group" aria-label="Annual revenue goal progress">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-secondary" aria-hidden="true" />
                  <span className="font-semibold text-sm" id="goal-label">2026 Revenue Goal: $2.5M</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-secondary" aria-label="76 percent complete">76%</span>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-0">On Track</Badge>
                </div>
              </div>
              <div 
                className="relative h-3 bg-muted rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={76}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-labelledby="goal-label"
              >
                <motion.div 
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-secondary to-secondary/80 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '76%' }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <div className="absolute inset-y-0 left-[76%] w-px bg-white/50" />
              </div>
              <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
                <span>$1.89M achieved</span>
                <span>$610K remaining</span>
              </div>
            </div>

            {/* Critical KPIs Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4" role="list" aria-label="Key performance indicators">
              {isInitialLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <KpiSkeleton key={idx} theme={theme} />
                ))
              ) : [
                { label: 'Revenue YTD', value: '$1.89M', prevValue: '$1.68M', change: '+12.5%', changeType: 'positive', icon: DollarSign, color: 'text-emerald-500', key: 'revenue-ytd' },
                { label: 'Net Margin', value: '18.5%', prevValue: '20.8%', change: '-2.3%', changeType: 'negative', icon: TrendingUp, color: 'text-amber-500', key: 'net-margin' },
                { label: 'Cash Position', value: '$485K', prevValue: '$448K', change: '+8.2%', changeType: 'positive', icon: Wallet, color: 'text-blue-500', key: 'cash-position' },
                { label: 'Override Exposure', value: '42%', prevValue: '45.1%', change: '-3.1%', changeType: 'positive', icon: Scale, color: 'text-purple-500', key: 'override-exposure' },
                { label: 'Active Agents', value: '40', prevValue: '35', change: '+5', changeType: 'positive', icon: Users, color: 'text-cyan-500', key: 'active-agents' },
                { label: 'Churn Rate', value: '4.2%', prevValue: '3.4%', change: '+0.8%', changeType: 'negative', icon: TrendingDown, color: 'text-red-500', key: 'churn-rate' },
              ].sort((a, b) => {
                const aPin = pinnedKpis.includes(a.key) ? -1 : 0;
                const bPin = pinnedKpis.includes(b.key) ? -1 : 0;
                return aPin - bPin;
              }).map((kpi, idx) => {
                const isPinned = pinnedKpis.includes(kpi.key);
                return (
                <TooltipProvider key={kpi.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div 
                        className={cn(
                          "relative flex flex-col p-3 sm:p-4 rounded-lg cursor-pointer transition-all hover:scale-105 min-h-[72px] touch-manipulation group",
                          theme === 'dark' ? 'bg-gray-700/50 hover:bg-gray-700' : 'bg-white/50 hover:bg-white shadow-sm hover:shadow',
                          isPinned && 'ring-2 ring-secondary/40',
                          theme === 'dark' ? 'backdrop-blur-sm' : 'backdrop-blur-sm bg-white/70'
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        layout
                      >
                        <button
                          className="absolute top-1.5 right-1.5 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                          onClick={(e) => { e.stopPropagation(); togglePinKpi(kpi.key); }}
                          aria-label={isPinned ? 'Unpin KPI' : 'Pin KPI'}
                        >
                          {isPinned ? <PinOff className="w-3 h-3 text-secondary" /> : <Pin className="w-3 h-3 text-muted-foreground" />}
                        </button>
                        <div 
                          className="flex-1"
                          onClick={() => { setDrilldownKpi(kpi.key); setShowDrilldown(true); }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${kpi.label}: ${kpi.value}, change ${kpi.change}. Click for details.`}
                          data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s+/g, '-')}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <kpi.icon className={cn("w-4 h-4", kpi.color)} />
                            <span className="text-xs text-muted-foreground truncate">{kpi.label}</span>
                            {isPinned && <Pin className="w-2.5 h-2.5 text-secondary" />}
                          </div>
                          <div className="flex items-end justify-between gap-2">
                            <div className="flex flex-col">
                              <span className="text-xl font-bold">{kpi.value}</span>
                              {comparisonMode && (
                                <span className="text-[10px] text-muted-foreground">
                                  vs {kpi.prevValue}
                                </span>
                              )}
                            </div>
                            <span className={cn(
                              "text-xs font-medium flex items-center gap-0.5",
                              kpi.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'
                            )}>
                              {kpi.changeType === 'positive' ? <ArrowUpRight className="w-3 h-3" aria-hidden="true" /> : <ArrowDownRight className="w-3 h-3" aria-hidden="true" />}
                              {kpi.change}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click to drill down • Hover to pin</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );})}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions Bar */}
      <nav className="flex items-center gap-2 flex-wrap" role="toolbar" aria-label="Quick actions">
        <span className="text-xs font-medium text-muted-foreground mr-2 hidden sm:inline">Quick Actions:</span>
        {[
          { label: 'Approve Budget', icon: CheckCircle2, variant: 'outline' as const, color: 'text-emerald-500', successColor: 'bg-emerald-500' },
          { label: 'Escalate Issue', icon: AlertTriangle, variant: 'outline' as const, color: 'text-amber-500', successColor: 'bg-amber-500' },
          { label: 'Schedule Review', icon: Calendar, variant: 'outline' as const, color: 'text-blue-500', successColor: 'bg-blue-500' },
          { label: 'View Reports', icon: FileText, variant: 'outline' as const, color: 'text-purple-500', successColor: 'bg-purple-500' },
        ].map((action, idx) => {
          const isLoading = quickActionLoading === action.label;
          return (
            <motion.div key={idx} whileTap={{ scale: 0.95 }}>
              <Button 
                variant={action.variant} 
                size="sm" 
                className={cn(
                  "gap-1.5 h-10 sm:h-8 px-3 sm:px-4 touch-manipulation relative overflow-hidden transition-all",
                  isLoading && "pointer-events-none"
                )}
                aria-label={action.label}
                onClick={() => handleQuickAction(action.label)}
                disabled={isLoading}
                data-testid={`quick-action-${action.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 sm:w-3.5 sm:h-3.5 animate-spin" />
                ) : (
                  <action.icon className={cn("w-4 h-4 sm:w-3.5 sm:h-3.5", action.color)} aria-hidden="true" />
                )}
                <span className="hidden sm:inline">{action.label}</span>
                {isLoading && (
                  <motion.div
                    className={cn("absolute bottom-0 left-0 h-0.5", action.successColor)}
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.2, ease: "linear" }}
                  />
                )}
              </Button>
            </motion.div>
          );
        })}
        <div className="flex-1" />
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 px-3 text-muted-foreground hidden md:flex"
          onClick={() => setShowCommandPalette(true)}
          data-testid="button-command-palette"
        >
          <Command className="w-3.5 h-3.5" />
          <span className="text-xs">Search</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </nav>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {showCommandPalette && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center pt-[20vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCommandPalette(false)}
          >
            <motion.div
              className={cn(
                "w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden",
                theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              )}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search commands, KPIs, or navigate..."
                  className={cn(
                    "flex-1 bg-transparent border-0 outline-none text-sm",
                    theme === 'dark' ? 'placeholder:text-gray-500' : 'placeholder:text-gray-400'
                  )}
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs bg-muted rounded">ESC</kbd>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Navigation</div>
                {[
                  { label: 'Dashboard', icon: LayoutDashboard, shortcut: 'D', tab: 'dashboard' },
                  { label: 'Tasks', icon: ListTodo, shortcut: 'T', href: '/exec/tasks' },
                  { label: 'Calendar', icon: CalendarDays, shortcut: 'C', href: '/exec/calendar' },
                  { label: 'Revenue & Capital', icon: DollarSign, shortcut: 'R', tab: 'revenue' },
                  { label: 'Forecasts', icon: TrendingUp, shortcut: 'F', tab: 'forecasts' },
                  { label: 'Risk Analysis', icon: AlertTriangle, shortcut: 'K', tab: 'risk' },
                  { label: 'Leadership', icon: Users, shortcut: 'L', tab: 'leadership' },
                  { label: 'Partnerships', icon: Building2, shortcut: 'P', tab: 'partnerships' },
                ].filter(item => item.label.toLowerCase().includes(commandSearch.toLowerCase())).map((item, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    )}
                    onClick={() => {
                      if (item.href) {
                        navigate(item.href);
                      } else if (item.tab && setActiveTab) {
                        setActiveTab(item.tab);
                        window.location.hash = item.tab;
                      }
                      setShowCommandPalette(false);
                      toast.success(`Navigated to ${item.label}`);
                    }}
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <kbd className="px-1.5 py-0.5 text-[10px] bg-muted rounded font-mono">{item.shortcut}</kbd>
                  </button>
                ))}
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground mt-2">Quick Actions</div>
                {[
                  { label: 'Refresh Dashboard', icon: RefreshCw },
                  { label: 'Export Data', icon: Download },
                  { label: 'Toggle Comparison Mode', icon: BarChart3 },
                ].filter(item => item.label.toLowerCase().includes(commandSearch.toLowerCase())).map((item, idx) => (
                  <button
                    key={idx}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                      theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    )}
                    onClick={() => {
                      if (item.label === 'Toggle Comparison Mode') setComparisonMode(!comparisonMode);
                      setShowCommandPalette(false);
                    }}
                  >
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI INSIGHTS PANEL - Intelligence Layer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
        role="region"
        aria-label="AI-powered insights and recommendations"
      >
        {isInitialLoading ? (
          <Card className={cn("overflow-hidden border-purple-500/20", theme === 'dark' ? 'bg-gray-800/50' : 'bg-gradient-to-br from-purple-50/50 to-blue-50/50')}>
            <CardContent className="py-4 px-5">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <CardSkeleton key={idx} theme={theme} />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
        <Card className={cn("overflow-hidden border-purple-500/20", theme === 'dark' ? 'bg-gray-800/50' : 'bg-gradient-to-br from-purple-50/50 to-blue-50/50')}>
          <CardContent className="py-4 px-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
                  <Brain className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="font-semibold text-sm">AI Insights</span>
                <Badge variant="outline" className="text-[10px] h-5 bg-purple-500/10 text-purple-600 border-purple-500/20">
                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                  3 New
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Eye className="w-3 h-3" />
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  type: 'recommendation',
                  icon: Zap,
                  color: 'text-amber-500',
                  bgColor: 'bg-amber-500/10',
                  title: 'Optimize Agent Onboarding',
                  message: 'Agents hired in Q4 show 23% lower first-month production. Consider extended training.',
                  action: 'View Training Data',
                  confidence: 87
                },
                {
                  type: 'anomaly',
                  icon: AlertTriangle,
                  color: 'text-red-500',
                  bgColor: 'bg-red-500/10',
                  title: 'Revenue Anomaly Detected',
                  message: 'Final Expense premiums dropped 18% in Week 52. Seasonality or issue?',
                  action: 'Investigate',
                  confidence: 92
                },
                {
                  type: 'forecast',
                  icon: TrendingUp,
                  color: 'text-emerald-500',
                  bgColor: 'bg-emerald-500/10',
                  title: 'Q1 2026 Forecast',
                  message: 'Projected revenue of $520K-$580K based on current pipeline and agent productivity.',
                  action: 'View Forecast',
                  confidence: 78
                }
              ].map((insight, idx) => (
                <motion.div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                    theme === 'dark' ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' : 'bg-white border-gray-200 hover:border-gray-300'
                  )}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  data-testid={`insight-${insight.type}-${idx}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn("p-1.5 rounded-lg shrink-0", insight.bgColor)}>
                      <insight.icon className={cn("w-3.5 h-3.5", insight.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                        <Badge variant="outline" className="text-[9px] h-4 shrink-0">
                          {insight.confidence}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{insight.message}</p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={cn("h-6 px-2 text-[11px] gap-1", insight.color)}
                      >
                        {insight.action}
                        <ArrowRight className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        )}
      </motion.div>

      {unacknowledgedAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          {unacknowledgedAlerts.slice(0, 2).map((alert: any) => (
            <div
              key={alert.id}
              className={cn(
                'flex items-center justify-between p-3 rounded-lg border-l-4',
                alert.severity === 'critical' && 'bg-red-500/10 border-red-500',
                alert.severity === 'warning' && 'bg-amber-500/10 border-amber-500',
                alert.severity === 'info' && 'bg-blue-500/10 border-blue-500'
              )}
            >
              <div className="flex items-center gap-3">
                {alert.severity === 'critical' && <XCircle className="w-5 h-5 text-red-500" />}
                {alert.severity === 'warning' && <AlertCircle className="w-5 h-5 text-amber-500" />}
                {alert.severity === 'info' && <Info className="w-5 h-5 text-blue-500" />}
                <div>
                  <p className="font-medium text-sm">{alert.title}</p>
                  <p className="text-xs text-muted-foreground">{alert.message}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => acknowledgeAlert(alert.id)}
                data-testid={`button-acknowledge-${alert.id}`}
              >
                Acknowledge
              </Button>
            </div>
          ))}
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Detailed metrics">
        {isInitialLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, idx) => (
              <CardSkeleton key={idx} theme={theme} />
            ))}
          </>
        ) : (
        <>
        <EnhancedMetricCard
          title="Total Revenue (YTD)"
          value="$1.89M"
          change="+12.5%"
          changeType="positive"
          icon={DollarSign}
          subtitle="vs $1.68M last year"
          theme={theme}
          sparklineData={revenueSparkline}
          sparklineColor="#10B981"
          target="94%"
          targetLabel="vs $2M target"
          expandable
          breakdown={[
            { label: 'Q1 Revenue', value: '$485K' },
            { label: 'Q2 Revenue', value: '$512K' },
            { label: 'Q3 Revenue', value: '$478K' },
            { label: 'Q4 Revenue (Current)', value: '$415K' },
          ]}
        />
        <EnhancedMetricCard
          title="Cash Position"
          value="$485K"
          change="+8.2%"
          changeType="positive"
          icon={Wallet}
          subtitle="4.2 months runway"
          theme={theme}
          sparklineData={cashSparkline}
          sparklineColor="#3B82F6"
          expandable
          breakdown={[
            { label: 'Operating Cash', value: '$312K' },
            { label: 'Reserves', value: '$128K' },
            { label: 'Receivables', value: '$45K' },
          ]}
        />
        <EnhancedMetricCard
          title="Active Agents"
          value="40"
          change="+5"
          changeType="positive"
          icon={Users}
          subtitle="8 top performers"
          theme={theme}
          sparklineData={agentSparkline}
          sparklineColor="#8B5CF6"
          expandable
          breakdown={[
            { label: 'Top Performers', value: '8' },
            { label: 'Consistent', value: '15' },
            { label: 'Developing', value: '12' },
            { label: 'At Risk', value: '5' },
          ]}
        />
        <EnhancedMetricCard
          title="Override Exposure"
          value="$128K"
          change="+15%"
          changeType="negative"
          icon={AlertTriangle}
          subtitle="45% of Q1 revenue"
          theme={theme}
          sparklineData={overrideSparkline}
          sparklineColor="#EF4444"
          target="75%"
          targetLabel="Risk threshold"
          expandable
          breakdown={[
            { label: 'Direct Overrides', value: '$78K' },
            { label: 'Indirect Overrides', value: '$35K' },
            { label: 'Bonus Pool', value: '$15K' },
          ]}
        />
        </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6" role="region" aria-label="Pipeline and activity">
        {isInitialLoading ? (
          <>
            <ChartSkeleton theme={theme} />
            <ChartSkeleton theme={theme} />
          </>
        ) : (
          <>
            <PipelineFunnel theme={theme} />
            <ActivityStream theme={theme} />
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={cn("cursor-pointer hover:border-secondary transition-colors", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <Link href="/exec/tasks">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium">Tasks</p>
                <p className="text-xs text-muted-foreground">12 pending items</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
        <Card className={cn("cursor-pointer hover:border-secondary transition-colors", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <Link href="/exec/calendar">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <CalendarDays className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Calendar</p>
                <p className="text-xs text-muted-foreground">3 events today</p>
              </div>
              <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </CardContent>
          </Link>
        </Card>
        <Card className={cn("cursor-pointer hover:border-secondary transition-colors", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')} onClick={() => {}}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium">Leadership</p>
              <p className="text-xs text-muted-foreground">40 agents, 5 directives</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className={cn("cursor-pointer hover:border-secondary transition-colors", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')} onClick={() => {}}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="font-medium">Revenue & Capital</p>
              <p className="text-xs text-muted-foreground">$778K allocated</p>
            </div>
            <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* MISSION-CRITICAL METRICS SECTION */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Control Panel - Booked/Collected/Net */}
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CircleDollarSign className="w-5 h-5 text-secondary" />
              Revenue Control Panel
            </CardTitle>
            <CardDescription>Precise revenue state tracking with reconciliation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className={cn('p-3 rounded-lg border-l-4 border-blue-500', theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50')}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-blue-600">GROSS BOOKED</p>
                    <p className="text-xl font-bold">$2,124,850</p>
                    <p className="text-xs text-muted-foreground">Issued policy premiums (pending + funded)</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-500/10 text-blue-500">Live</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Updated: 2m ago</p>
                  </div>
                </div>
              </div>
              <div className={cn('p-3 rounded-lg border-l-4 border-emerald-500', theme === 'dark' ? 'bg-gray-700' : 'bg-emerald-50')}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-emerald-600">COLLECTED REVENUE</p>
                    <p className="text-xl font-bold text-emerald-600">$1,892,340</p>
                    <p className="text-xs text-muted-foreground">Carrier-paid premiums received</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-500">Confirmed</Badge>
                    <p className="text-xs text-muted-foreground mt-1">89.1% collection rate</p>
                  </div>
                </div>
              </div>
              <div className={cn('p-3 rounded-lg border-l-4 border-amber-500', theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50')}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs font-medium text-amber-600">NET REVENUE</p>
                    <p className="text-xl font-bold">$1,867,890</p>
                    <p className="text-xs text-muted-foreground">Collected − chargebacks − refunds</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-amber-500/10 text-amber-500">Final</Badge>
                    <p className="text-xs text-muted-foreground mt-1">-$24.5K chargebacks</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={cn('p-3 rounded-lg border', theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
              <p className="text-xs font-medium mb-2">Reconciliation Status</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">Bank ↔ Ledger: Matched</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm">Carrier ↔ Revenue: Matched</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Last reconciled: Today 9:15 AM • Variance: $0.00</p>
            </div>
          </CardContent>
        </Card>

        {/* Override Liability Staging */}
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5 text-secondary" />
              Override Liability Staging
            </CardTitle>
            <CardDescription>Downstream commission obligations (liability until paid)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Accrued</p>
                <p className="text-xl font-bold text-amber-500">$128,450</p>
                <p className="text-xs text-muted-foreground">Owed, not paid</p>
              </div>
              <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Realized</p>
                <p className="text-xl font-bold text-emerald-500">$89,200</p>
                <p className="text-xs text-muted-foreground">Paid this period</p>
              </div>
              <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-xl font-bold text-blue-500">$39,250</p>
                <p className="text-xs text-muted-foreground">Next payout</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Override Exposure vs Q1 Revenue</span>
                <span className="font-bold text-amber-500">6.8%</span>
              </div>
              <Progress value={68} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Safe zone: &lt;5%</span>
                <span>Warning: 5-10%</span>
                <span>Critical: &gt;10%</span>
              </div>
            </div>
            <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50')}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-sm font-medium text-amber-600">Liability Check</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Current cash ($485K) can cover 3.8x accrued overrides. Healthy.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium">By Hierarchy Level</p>
              {[
                { level: 'Direct Agents', amount: 78200, pct: 61 },
                { level: 'Team Leads', amount: 35800, pct: 28 },
                { level: 'Managers', amount: 14450, pct: 11 },
              ].map((item) => (
                <div key={item.level} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.level}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={item.pct} className="w-20 h-1.5" />
                    <span className="font-medium w-16 text-right">${(item.amount / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Activation Matrix */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-secondary" />
            Agent Activation Matrix
          </CardTitle>
          <CardDescription>Precise agent status tracking with 14/30 day activity windows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className={cn('p-4 rounded-lg border-2 border-emerald-500/30', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-emerald-600">ACTIVE</p>
                <Badge className="bg-emerald-500 text-white">≥1 policy in 14d</Badge>
              </div>
              <p className="text-3xl font-bold text-emerald-600">28</p>
              <p className="text-xs text-muted-foreground mt-1">70% of total agents</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUpRight className="w-3 h-3" />
                <span>+3 from last week</span>
              </div>
            </div>
            <div className={cn('p-4 rounded-lg border-2 border-amber-500/30', theme === 'dark' ? 'bg-amber-900/10' : 'bg-amber-50')}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-amber-600">SEMI-ACTIVE</p>
                <Badge className="bg-amber-500 text-white">No policy 14-30d</Badge>
              </div>
              <p className="text-3xl font-bold text-amber-600">7</p>
              <p className="text-xs text-muted-foreground mt-1">17.5% of total agents</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="w-3 h-3" />
                <span>Intervention window</span>
              </div>
            </div>
            <div className={cn('p-4 rounded-lg border-2 border-red-500/30', theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50')}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-red-600">INACTIVE</p>
                <Badge className="bg-red-500 text-white">No policy &gt;30d</Badge>
              </div>
              <p className="text-3xl font-bold text-red-600">5</p>
              <p className="text-xs text-muted-foreground mt-1">12.5% of total agents</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <XCircle className="w-3 h-3" />
                <span>At churn risk</span>
              </div>
            </div>
            <div className={cn('p-4 rounded-lg border-2 border-blue-500/30', theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50')}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-blue-600">TOTAL LICENSED</p>
                <Badge className="bg-blue-500 text-white">+Active contracts</Badge>
              </div>
              <p className="text-3xl font-bold text-blue-600">40</p>
              <p className="text-xs text-muted-foreground mt-1">All contracted agents</p>
              <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                <TrendingUp className="w-3 h-3" />
                <span>+5 YoY growth</span>
              </div>
            </div>
          </div>
          <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Activity Threshold Alerts</p>
              <Badge variant="outline" className="text-xs">Auto-triggered</Badge>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              <div className={cn('p-2 rounded flex items-center gap-2', theme === 'dark' ? 'bg-gray-600' : 'bg-white')}>
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs">7 agents approaching 14-day window</span>
              </div>
              <div className={cn('p-2 rounded flex items-center gap-2', theme === 'dark' ? 'bg-gray-600' : 'bg-white')}>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs">2 agents at 28+ days (critical)</span>
              </div>
              <div className={cn('p-2 rounded flex items-center gap-2', theme === 'dark' ? 'bg-gray-600' : 'bg-white')}>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs">4 agents reactivated this week</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cash Position & Multi-Interval Growth */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className="w-5 h-5 text-secondary" />
              Cash Position Control
            </CardTitle>
            <CardDescription>Liquid funds after known obligations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Bank Balance</p>
                <p className="text-2xl font-bold">$612,450</p>
                <p className="text-xs text-muted-foreground">As of today 6:00 AM</p>
              </div>
              <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Pending Obligations</p>
                <p className="text-2xl font-bold text-red-500">-$127,320</p>
                <p className="text-xs text-muted-foreground">Overrides + payroll + ops</p>
              </div>
            </div>
            <div className={cn('p-4 rounded-lg border-2 border-emerald-500', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-emerald-600">AVAILABLE CASH</p>
                  <p className="text-3xl font-bold text-emerald-600">$485,130</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">4.2 months runway</p>
                  <p className="text-xs text-muted-foreground">At $115K monthly burn</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium">Cash Waterfall</p>
              {[
                { item: 'Bank Balance', value: 612450, type: 'add' },
                { item: 'Override Obligations', value: -128450, type: 'sub' },
                { item: 'Payroll (Jan 15)', value: -45000, type: 'sub' },
                { item: 'Operating Expenses', value: -32500, type: 'sub' },
                { item: 'Tax Reserve', value: -25000, type: 'sub' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className={item.type === 'sub' ? 'text-muted-foreground pl-4' : 'font-medium'}>{item.item}</span>
                  <span className={item.type === 'sub' ? 'text-red-500' : 'text-emerald-500'}>
                    {item.type === 'add' ? '+' : ''}{item.value < 0 ? '-' : ''}${Math.abs(item.value / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between text-sm font-bold pt-2 border-t">
                <span>= Net Available</span>
                <span className="text-emerald-500">$381.5K</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Multi-Interval Growth Rates
            </CardTitle>
            <CardDescription>MoM, QoQ, and YoY performance tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {[
                { interval: 'MoM', revenue: '+8.4%', agents: '+2', textClass: 'text-emerald-500', label: 'Month-over-Month' },
                { interval: 'QoQ', revenue: '+12.5%', agents: '+5', textClass: 'text-blue-500', label: 'Quarter-over-Quarter' },
                { interval: 'YoY', revenue: '+24.2%', agents: '+8', textClass: 'text-purple-500', label: 'Year-over-Year' },
              ].map((item) => (
                <div key={item.interval} className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className={cn('text-2xl font-bold', item.textClass)}>{item.revenue}</p>
                  <p className="text-xs text-muted-foreground mt-1">Agents: {item.agents}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium">Growth Breakdown</p>
              {[
                { metric: 'Revenue Growth', mom: '+$38K', qoq: '+$112K', yoy: '+$385K' },
                { metric: 'Agent Growth', mom: '+2', qoq: '+5', yoy: '+8' },
                { metric: 'Avg Production/Agent', mom: '+$1.2K', qoq: '+$2.8K', yoy: '+$4.1K' },
                { metric: 'Retention Rate', mom: '94%', qoq: '91%', yoy: '88%' },
              ].map((row) => (
                <div key={row.metric} className="grid grid-cols-4 gap-2 text-sm">
                  <span className="text-muted-foreground">{row.metric}</span>
                  <span className="text-center">{row.mom}</span>
                  <span className="text-center">{row.qoq}</span>
                  <span className="text-center font-medium">{row.yoy}</span>
                </div>
              ))}
            </div>
            <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-secondary" />
                <p className="text-sm font-medium">7-Day Rolling Average</p>
              </div>
              <p className="text-xs text-muted-foreground">Daily revenue smoothed: $8,240/day (+5.2% vs prior 7d)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operational Alert Matrix */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-secondary" />
            Operational Alert Matrix
          </CardTitle>
          <CardDescription>Threshold-driven automated notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[
              { category: 'Financial', active: 2, total: 8, critical: 0 },
              { category: 'Agent Activity', active: 3, total: 6, critical: 1 },
              { category: 'Operational', active: 1, total: 5, critical: 0 },
            ].map((cat) => (
              <div key={cat.category} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{cat.category}</p>
                  {cat.critical > 0 && <Badge className="bg-red-500 text-white text-xs">{cat.critical} Critical</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{cat.active} of {cat.total} alerts active</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground px-3">
              <span>Alert</span>
              <span>Threshold</span>
              <span>Current</span>
              <span>Status</span>
              <span>Severity</span>
              <span>Action</span>
            </div>
            {[
              { alert: 'Cash below 3mo runway', threshold: '<$345K', current: '$485K', status: 'normal', severity: 'info' },
              { alert: 'Active agent ratio', threshold: '<60%', current: '70%', status: 'normal', severity: 'info' },
              { alert: 'Override exposure', threshold: '>10%', current: '6.8%', status: 'watch', severity: 'warning' },
              { alert: 'Revenue variance', threshold: '±15%', current: '-8%', status: 'normal', severity: 'info' },
              { alert: 'Churn rate spike', threshold: '>5%/mo', current: '2.5%', status: 'normal', severity: 'info' },
              { alert: 'Inactive agents', threshold: '>5', current: '5', status: 'triggered', severity: 'warning' },
            ].map((row, i) => (
              <div key={i} className={cn('grid grid-cols-6 gap-2 text-sm p-3 rounded', 
                row.status === 'triggered' && (theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50'),
                row.status === 'normal' && (theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')
              )}>
                <span className="font-medium">{row.alert}</span>
                <span className="text-muted-foreground">{row.threshold}</span>
                <span className={row.status === 'triggered' ? 'text-amber-500 font-medium' : ''}>{row.current}</span>
                <span>
                  <Badge className={cn(
                    row.status === 'normal' && 'bg-emerald-500/10 text-emerald-500',
                    row.status === 'watch' && 'bg-amber-500/10 text-amber-500',
                    row.status === 'triggered' && 'bg-red-500/10 text-red-500'
                  )}>{row.status}</Badge>
                </span>
                <span>
                  <Badge variant="outline" className="text-xs">{row.severity}</Badge>
                </span>
                <span>
                  {row.status !== 'normal' && (
                    <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">View</Button>
                  )}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Drill-Down Modal */}
      <Dialog open={showDrilldown} onOpenChange={setShowDrilldown}>
        <DialogContent className={cn("max-w-2xl", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          {drilldownKpi && kpiDrilldownData[drilldownKpi] && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  {kpiDrilldownData[drilldownKpi].title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Breakdown Table */}
                <div className="space-y-2">
                  {kpiDrilldownData[drilldownKpi].breakdown.map((item, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg",
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      )}
                    >
                      <span className="font-medium text-sm">{item.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.value}</span>
                        {item.change && (
                          <span className={cn(
                            "text-xs font-medium flex items-center gap-0.5",
                            item.changeType === 'positive' ? 'text-emerald-500' : item.changeType === 'negative' ? 'text-red-500' : 'text-muted-foreground'
                          )}>
                            {item.changeType === 'positive' && <ArrowUpRight className="w-3 h-3" />}
                            {item.changeType === 'negative' && <ArrowDownRight className="w-3 h-3" />}
                            {item.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                {kpiDrilldownData[drilldownKpi].chart && (
                  <div className="h-48 pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={kpiDrilldownData[drilldownKpi].chart}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={11} />
                        <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={11} />
                        <RechartsTooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="value" stroke="#8B0000" fill="url(#drilldownGradient)" strokeWidth={2} />
                        <defs>
                          <linearGradient id="drilldownGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B0000" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B0000" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-4 border-t">
                  <Button variant="outline" size="sm" className="gap-2" data-testid="button-export-drilldown">
                    <Download className="w-4 h-4" />
                    Export Data
                  </Button>
                  <Button variant="secondary" size="sm" className="gap-2" onClick={() => setShowDrilldown(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function RevenueView({ theme }: { theme: string }) {
  return (
    <motion.div
      key="revenue"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-serif font-bold">Revenue & Capital Operations</h2>
        <p className="text-muted-foreground">Cash flow management and financial performance</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Gross Booked" value="$2.12M" change="+8.4%" changeType="positive" icon={CircleDollarSign} theme={theme} />
        <MetricCard title="Collected Revenue" value="$1.89M" change="+12.5%" changeType="positive" icon={Receipt} theme={theme} />
        <MetricCard title="Chargebacks" value="$24.5K" change="-15%" changeType="positive" icon={CreditCard} theme={theme} />
        <MetricCard title="Net Revenue" value="$1.87M" change="+11.2%" changeType="positive" icon={Landmark} theme={theme} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-secondary" />
              Cash Flow Analysis
            </CardTitle>
            <CardDescription>Weekly inflow vs outflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cashFlowData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="week" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                  <RechartsTooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                  <Bar dataKey="inflow" fill="#10B981" radius={[4, 4, 0, 0]} name="Inflow" />
                  <Bar dataKey="outflow" fill="#EF4444" radius={[4, 4, 0, 0]} name="Outflow" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-secondary" />
              Burn Rate & Runway
            </CardTitle>
            <CardDescription>Financial sustainability metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Monthly Burn</p>
                <p className="text-xl font-bold text-red-500">$115K</p>
                <p className="text-xs text-muted-foreground mt-1">Operating expenses</p>
              </div>
              <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <p className="text-xs text-muted-foreground">Runway</p>
                <p className="text-xl font-bold text-emerald-500">4.2 mo</p>
                <p className="text-xs text-muted-foreground mt-1">At current burn rate</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cash Reserve Health</span>
                <span className="text-secondary font-medium">Moderate</span>
              </div>
              <Progress value={70} className="h-2" />
              <p className="text-xs text-muted-foreground">Target: 6 months runway • Current: 4.2 months</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-secondary" />
            Carrier Partner ROI
          </CardTitle>
          <CardDescription>Performance by carrier relationship</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Carrier</th>
                  <th className="pb-3 font-medium">Premium Volume</th>
                  <th className="pb-3 font-medium">Commission</th>
                  <th className="pb-3 font-medium">ROI %</th>
                  <th className="pb-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                {carrierROI.map((carrier) => (
                  <tr key={carrier.carrier} className="text-sm">
                    <td className="py-3 font-medium">{carrier.carrier}</td>
                    <td className="py-3">${(carrier.premium / 1000000).toFixed(2)}M</td>
                    <td className="py-3">${(carrier.commission / 1000).toFixed(0)}K</td>
                    <td className="py-3">
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">{carrier.roi}%</Badge>
                    </td>
                    <td className="py-3">
                      {carrier.trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-500" />}
                      {carrier.trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-500" />}
                      {carrier.trend === 'stable' && <Minus className="w-4 h-4 text-gray-400" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="w-5 h-5 text-secondary" />
            Revenue Trend
          </CardTitle>
          <CardDescription>Monthly revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E1B138" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E1B138" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} formatter={(value: number) => [`$${value.toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#E1B138" strokeWidth={2} fill="url(#revenueGradient2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Banknote className="w-5 h-5 text-secondary" />
            Budget Allocation by Category
          </CardTitle>
          <CardDescription>Q1 2026 budget with spend tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {capitalBudgetCategories.map((category) => {
              const spentPercent = (category.spent / category.allocated) * 100;
              return (
                <div key={category.id} className={cn('p-4 rounded-lg border', theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }} />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Allocated</p>
                        <p className="font-bold">${(category.allocated / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Spent</p>
                        <p className="font-bold text-red-500">${(category.spent / 1000).toFixed(0)}K</p>
                      </div>
                      <div className="text-right">
                        <p className="text-muted-foreground text-xs">Available</p>
                        <p className="font-bold text-emerald-500">${(category.available / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative h-2 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                    <div className="absolute h-full rounded-full bg-red-500 transition-all" style={{ width: `${spentPercent}%` }} />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>{Math.round(spentPercent)}% spent</span>
                    <span>YTD: ${(category.ytdBudget / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={cn("mt-6 pt-4 border-t", theme === 'dark' ? 'border-gray-700' : 'border-gray-200')}>
            <p className="text-sm font-medium mb-3">Recent Allocation Activity</p>
            <div className="space-y-2">
              {capitalAllocationHistory.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'allocation' ? 'default' : item.type === 'reallocation' ? 'secondary' : 'outline'} className="text-xs">{item.type}</Badge>
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">${(item.amount / 1000).toFixed(0)}K</span>
                    <span className="text-xs text-muted-foreground">{item.approver}</span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Per-Entity P&L Statements */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Building2 className="w-5 h-5 text-secondary" />
            Per-Entity P&L Statements
          </CardTitle>
          <CardDescription>Complete income statement isolated per legal entity (no cross-entity blending)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Entity</th>
                  <th className="pb-3 font-medium text-right">Gross Revenue</th>
                  <th className="pb-3 font-medium text-right">Direct Costs</th>
                  <th className="pb-3 font-medium text-right">Overrides</th>
                  <th className="pb-3 font-medium text-right">Operating Exp</th>
                  <th className="pb-3 font-medium text-right">Net Income</th>
                  <th className="pb-3 font-medium text-right">Margin</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                {[
                  { entity: 'Gold Coast Financial LLC', gross: 1450000, costs: 145000, overrides: 98500, opex: 185000, net: 1021500, margin: 70.4 },
                  { entity: 'GCF Insurance Agency Inc', gross: 485000, costs: 48500, overrides: 29800, opex: 62000, net: 344700, margin: 71.1 },
                  { entity: 'GCF Marketing Services', gross: 189000, costs: 28350, overrides: 0, opex: 45000, net: 115650, margin: 61.2 },
                ].map((entity) => (
                  <tr key={entity.entity} className="text-sm">
                    <td className="py-3 font-medium">{entity.entity}</td>
                    <td className="py-3 text-right">${(entity.gross / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right text-red-500">-${(entity.costs / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right text-red-500">-${(entity.overrides / 1000).toFixed(1)}K</td>
                    <td className="py-3 text-right text-red-500">-${(entity.opex / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right font-bold text-emerald-500">${(entity.net / 1000).toFixed(0)}K</td>
                    <td className="py-3 text-right">
                      <Badge className="bg-emerald-500/10 text-emerald-500">{entity.margin}%</Badge>
                    </td>
                  </tr>
                ))}
                <tr className={cn("font-bold", theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
                  <td className="py-3">CONSOLIDATED TOTAL</td>
                  <td className="py-3 text-right">$2,124K</td>
                  <td className="py-3 text-right text-red-500">-$222K</td>
                  <td className="py-3 text-right text-red-500">-$128K</td>
                  <td className="py-3 text-right text-red-500">-$292K</td>
                  <td className="py-3 text-right text-emerald-500">$1,482K</td>
                  <td className="py-3 text-right"><Badge className="bg-emerald-500/10 text-emerald-500">69.8%</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={cn('mt-4 p-3 rounded-lg flex items-center justify-between', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm">Entity ledgers isolated • No cross-contamination</span>
            </div>
            <span className="text-xs text-muted-foreground">Last close: Dec 31, 2025 • Status: Final</span>
          </div>
        </CardContent>
      </Card>

      {/* Enforced Reserve Categories */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PiggyBank className="w-5 h-5 text-secondary" />
              Enforced Reserve Categories
            </CardTitle>
            <CardDescription>Protected capital (not discretionary spending)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Operational Reserve', target: 345000, current: 312000, purpose: '2-3 months fixed costs', borderClass: 'border-blue-500', rule: 'Auto-funded from net revenue' },
              { name: 'Tax Reserve', target: 125000, current: 98500, purpose: 'Quarterly tax liability', borderClass: 'border-purple-500', rule: '5-10% of gross inflows' },
              { name: 'Risk/Chargeback Reserve', target: 45000, current: 38200, purpose: 'Chargeback buffer', borderClass: 'border-amber-500', rule: '2% of collected revenue' },
              { name: 'Growth Reserve', target: 150000, current: 85000, purpose: 'Strategic reinvestment', borderClass: 'border-emerald-500', rule: 'Discretionary after others funded' },
            ].map((reserve) => {
              const pct = (reserve.current / reserve.target) * 100;
              return (
                <div key={reserve.name} className={cn('p-3 rounded-lg border-l-4', reserve.borderClass, theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium text-sm">{reserve.name}</p>
                      <p className="text-xs text-muted-foreground">{reserve.purpose}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${(reserve.current / 1000).toFixed(0)}K</p>
                      <p className="text-xs text-muted-foreground">of ${(reserve.target / 1000).toFixed(0)}K target</p>
                    </div>
                  </div>
                  <Progress value={Math.min(pct, 100)} className="h-2 mb-1" />
                  <div className="flex justify-between text-xs">
                    <span className={pct >= 100 ? 'text-emerald-500' : pct >= 75 ? 'text-amber-500' : 'text-red-500'}>
                      {pct.toFixed(0)}% funded
                    </span>
                    <span className="text-muted-foreground">{reserve.rule}</span>
                  </div>
                </div>
              );
            })}
            <div className={cn('p-3 rounded-lg border-2 border-dashed', theme === 'dark' ? 'border-gray-600' : 'border-gray-300')}>
              <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-sm font-medium">Reserve Guardrail Active</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Reserves cannot be spent without executive override. All overrides logged and audited.</p>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowRight className="w-5 h-5 text-secondary" />
              Inter-Entity Transaction Ledger
            </CardTitle>
            <CardDescription>Logged transfers between legal entities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { from: 'Gold Coast Financial LLC', to: 'GCF Marketing Services', amount: 25000, type: 'Marketing allocation', status: 'settled', date: 'Jan 3, 2026' },
              { from: 'GCF Insurance Agency Inc', to: 'Gold Coast Financial LLC', amount: 45000, type: 'Commission remittance', status: 'settled', date: 'Jan 2, 2026' },
              { from: 'Gold Coast Financial LLC', to: 'GCF Insurance Agency Inc', amount: 15000, type: 'Operating support', status: 'pending', date: 'Jan 5, 2026' },
            ].map((txn, i) => (
              <div key={i} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium truncate max-w-[120px]">{txn.from}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[120px]">{txn.to}</span>
                  </div>
                  <span className="font-bold">${(txn.amount / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{txn.type}</span>
                  <div className="flex items-center gap-2">
                    <Badge className={txn.status === 'settled' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}>
                      {txn.status}
                    </Badge>
                    <span>{txn.date}</span>
                  </div>
                </div>
              </div>
            ))}
            <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-xs text-muted-foreground">Transactions logged as receivables/payables • Settled on fixed schedules • Never netted informally</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* True Net Profit After Reserves */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-secondary" />
            True Net Profit After Reserves
          </CardTitle>
          <CardDescription>Net Income − Required Reserve Allocations = Deployable Capital</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-xs text-muted-foreground">Consolidated Net Income</p>
              <p className="text-2xl font-bold">$1,481,850</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-xs text-muted-foreground">Required Reserve Allocation</p>
              <p className="text-2xl font-bold text-red-500">-$533,700</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center border-2 border-emerald-500', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
              <p className="text-xs font-medium text-emerald-600">TRUE NET PROFIT</p>
              <p className="text-2xl font-bold text-emerald-600">$948,150</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-xs text-muted-foreground">Deployable Capital</p>
              <p className="text-2xl font-bold text-blue-500">$485,130</p>
            </div>
          </div>
          <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <p className="font-medium text-emerald-700">Discretionary Spending: AUTHORIZED</p>
            </div>
            <p className="text-sm text-muted-foreground">True net profit is positive ($948K). All required reserves funded. Capital deployment approved within limits.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function ForecastsView({ theme }: { theme: string }) {
  const [activeScenario, setActiveScenario] = useState<'base' | 'optimistic' | 'defensive'>('base');
  
  const scenarioData = {
    base: { q1: '$1.21M', q2: '$1.45M', annual: '$5.5M', confidence: 72, assumptions: ['Current agent productivity maintained', 'No major carrier changes', '5% market growth'] },
    optimistic: { q1: '$1.38M', q2: '$1.72M', annual: '$6.4M', confidence: 45, assumptions: ['15% agent productivity increase', 'Successful IUL launch', '2 new top performers onboarded'] },
    defensive: { q1: '$1.05M', q2: '$1.18M', annual: '$4.6M', confidence: 85, assumptions: ['2 carrier contracts lost', '10% agent churn', 'Flat market conditions'] }
  };
  
  const currentScenario = scenarioData[activeScenario];

  return (
    <motion.div
      key="forecasts"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-secondary" />
            Predictive Analytics & Forecasts
          </h2>
          <p className="text-muted-foreground">AI-powered revenue projections with scenario modeling</p>
        </div>
        <div className={cn("flex items-center gap-1 p-1 rounded-lg", theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100')}>
          {(['base', 'optimistic', 'defensive'] as const).map((scenario) => (
            <Button
              key={scenario}
              variant={activeScenario === scenario ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveScenario(scenario)}
              className={cn(
                activeScenario === scenario && scenario === 'optimistic' && 'bg-emerald-500 hover:bg-emerald-600',
                activeScenario === scenario && scenario === 'defensive' && 'bg-amber-500 hover:bg-amber-600'
              )}
              data-testid={`button-scenario-${scenario}`}
            >
              {scenario.charAt(0).toUpperCase() + scenario.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <Card className={cn("border-2", theme === 'dark' ? 'bg-gray-800 border-gray-700' : '', activeScenario === 'optimistic' && 'border-emerald-500/30', activeScenario === 'defensive' && 'border-amber-500/30')}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", activeScenario === 'optimistic' ? 'bg-emerald-500/10' : activeScenario === 'defensive' ? 'bg-amber-500/10' : 'bg-violet-50')}>
                <Sparkles className={cn("w-5 h-5", activeScenario === 'optimistic' ? 'text-emerald-500' : activeScenario === 'defensive' ? 'text-amber-500' : 'text-secondary')} />
              </div>
              <div>
                <p className="font-semibold">{activeScenario.charAt(0).toUpperCase() + activeScenario.slice(1)} Scenario</p>
                <p className="text-xs text-muted-foreground">Confidence: {currentScenario.confidence}%</p>
              </div>
            </div>
            <Progress value={currentScenario.confidence} className="w-32" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            {currentScenario.assumptions.map((assumption, i) => (
              <div key={i} className={cn("p-2 rounded text-xs", theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <CheckCircle2 className="w-3 h-3 inline mr-1 text-emerald-500" />
                {assumption}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Q1 Projected" value={currentScenario.q1} change="+18%" changeType="positive" icon={TrendingUp} subtitle="Jan - Mar 2026" theme={theme} />
        <MetricCard title="Q2 Projected" value={currentScenario.q2} change="+20%" changeType="positive" icon={LineChartIcon} subtitle="Apr - Jun 2026" theme={theme} />
        <MetricCard title="Annual Target" value={currentScenario.annual} change="68% on track" changeType="positive" icon={Target} subtitle="FY 2026" theme={theme} />
        <MetricCard title="Model Confidence" value={`${currentScenario.confidence}%`} change={currentScenario.confidence >= 70 ? 'High' : 'Medium'} changeType={currentScenario.confidence >= 70 ? 'positive' : 'neutral'} icon={Brain} subtitle="AI certainty" theme={theme} />
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-secondary" />
                Revenue Forecast Model
              </CardTitle>
              <CardDescription>6-month projection with confidence intervals</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-6 h-3 rounded opacity-30 bg-secondary" />
                <span className="text-muted-foreground">Confidence Band</span>
              </div>
              <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">Optimistic</Badge>
              <Badge variant="outline" className="text-secondary border-secondary/30">Projected</Badge>
              <Badge variant="outline" className="text-blue-500 border-blue-500/30">Conservative</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={forecastData}>
                <defs>
                  <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E1B138" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#E1B138" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} tickFormatter={(v) => `$${v/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} 
                  formatter={(value: number) => [`$${(value/1000).toFixed(0)}k`, '']}
                />
                <Area type="monotone" dataKey="optimistic" stroke="transparent" fill="url(#confidenceBand)" />
                <Area type="monotone" dataKey="conservative" stroke="transparent" fill={theme === 'dark' ? '#1f2937' : '#fff'} />
                <Line type="monotone" dataKey="optimistic" stroke="#10B981" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Optimistic" />
                <Line type="monotone" dataKey="projected" stroke="#E1B138" strokeWidth={3} dot={{ fill: '#E1B138', r: 5, strokeWidth: 2, stroke: '#fff' }} name="Projected" />
                <Line type="monotone" dataKey="conservative" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Conservative" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-0.5 bg-emerald-500" style={{ borderStyle: 'dashed' }} />
              <span className="text-muted-foreground">Optimistic (+15%)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-1 bg-secondary rounded" />
              <span className="text-muted-foreground">Base Projection</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-4 h-0.5 bg-blue-500" style={{ borderStyle: 'dashed' }} />
              <span className="text-muted-foreground">Conservative (-10%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-secondary" />
              Growth Drivers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Agent Productivity', value: 85, color: 'bg-emerald-500' },
              { label: 'Lead Conversion', value: 72, color: 'bg-secondary' },
              { label: 'Policy Retention', value: 91, color: 'bg-blue-500' },
              { label: 'Market Expansion', value: 45, color: 'bg-purple-500' },
            ].map((driver) => (
              <div key={driver.label} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{driver.label}</span>
                  <span className="font-medium">{driver.value}%</span>
                </div>
                <div className={cn('h-2 rounded-full', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <div className={cn('h-full rounded-full transition-all', driver.color)} style={{ width: `${driver.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-secondary" />
              Market Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { market: 'Final Expense', potential: '$2.1M', growth: '+24%', status: 'active' },
              { market: 'Mortgage Protection', potential: '$1.8M', growth: '+18%', status: 'active' },
              { market: 'Index Universal Life', potential: '$950K', growth: '+32%', status: 'exploring' },
              { market: 'Annuities', potential: '$1.2M', growth: '+15%', status: 'planned' },
            ].map((opp) => (
              <div key={opp.market} className={cn('flex items-center justify-between p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div>
                  <p className="font-medium text-sm">{opp.market}</p>
                  <p className="text-xs text-muted-foreground">Potential: {opp.potential}</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-500 font-medium text-sm">{opp.growth}</p>
                  <Badge variant={opp.status === 'active' ? 'default' : 'secondary'} className="text-xs">{opp.status}</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Production Forecasting with Confidence Intervals */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-secondary" />
            Production Forecasting (30/60/90 Day)
          </CardTitle>
          <CardDescription>Projected production volume with confidence bands and MAPE tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[
              { horizon: '30-Day', projected: '$485K', low: '$425K', high: '$545K', confidence: '90%', mape: '4.2%' },
              { horizon: '60-Day', projected: '$980K', low: '$840K', high: '$1.12M', confidence: '75%', mape: '8.5%' },
              { horizon: '90-Day', projected: '$1.52M', low: '$1.25M', high: '$1.79M', confidence: '50%', mape: '12.1%' },
            ].map((forecast) => (
              <div key={forecast.horizon} className={cn('p-4 rounded-lg border-2', theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold">{forecast.horizon}</p>
                  <Badge className="bg-violet-50 text-secondary">{forecast.confidence} conf.</Badge>
                </div>
                <p className="text-2xl font-bold">{forecast.projected}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <span>Range: {forecast.low} - {forecast.high}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs">
                  <span className="text-muted-foreground">MAPE:</span>
                  <span className={parseFloat(forecast.mape) <= 5 ? 'text-emerald-500' : parseFloat(forecast.mape) <= 10 ? 'text-amber-500' : 'text-red-500'}>{forecast.mape}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
            <p className="text-xs font-medium mb-2">Methodology</p>
            <p className="text-xs text-muted-foreground">Time-series modeling with trend/seasonal components • Driver-based adjustments from leading indicators • Daily aggregation rolled to weekly/monthly</p>
          </div>
        </CardContent>
      </Card>

      {/* Retention Probability Scoring */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserCheck className="w-5 h-5 text-secondary" />
            Retention Probability Scoring
          </CardTitle>
          <CardDescription>Agent churn prediction with probability scores (0-1)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className={cn('p-4 rounded-lg text-center border-2 border-emerald-500/30', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
              <p className="text-xs font-medium text-emerald-600">LOW RISK (0.7-1.0)</p>
              <p className="text-3xl font-bold text-emerald-600">22</p>
              <p className="text-xs text-muted-foreground">Agents likely to stay</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center border-2 border-amber-500/30', theme === 'dark' ? 'bg-amber-900/10' : 'bg-amber-50')}>
              <p className="text-xs font-medium text-amber-600">MEDIUM RISK (0.4-0.7)</p>
              <p className="text-3xl font-bold text-amber-600">11</p>
              <p className="text-xs text-muted-foreground">Intervention recommended</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center border-2 border-red-500/30', theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50')}>
              <p className="text-xs font-medium text-red-600">HIGH RISK (0-0.4)</p>
              <p className="text-3xl font-bold text-red-600">7</p>
              <p className="text-xs text-muted-foreground">Immediate action needed</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">High-Risk Agents (Immediate Attention)</p>
            {[
              { name: 'Marcus Johnson', score: 0.28, tenure: '4 months', lastProduction: '32 days ago', factors: ['Activity decay', 'Low engagement'] },
              { name: 'Emily Rodriguez', score: 0.35, tenure: '2 months', lastProduction: '18 days ago', factors: ['Production volatility', 'Missed training'] },
              { name: 'David Kim', score: 0.31, tenure: '6 months', lastProduction: '45 days ago', factors: ['Extended inactivity', 'No 1:1 attendance'] },
            ].map((agent) => (
              <div key={agent.name} className={cn('p-3 rounded-lg flex items-center justify-between', theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50')}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold text-sm">
                    {agent.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Tenure: {agent.tenure}</span>
                      <span>•</span>
                      <span>Last production: {agent.lastProduction}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-red-500 text-white">{agent.score.toFixed(2)}</Badge>
                    <Button size="sm" variant="outline" className="text-xs">Intervene</Button>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {agent.factors.map((f, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1">{f}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agent Segmentation & Clustering */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-secondary" />
              Agent Performance Clusters
            </CardTitle>
            <CardDescription>Unsupervised grouping based on production, growth, and consistency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { cluster: 'Core Performers', count: 8, avgProduction: '$52K', growth: '+12%', consistency: 94, borderClass: 'border-emerald-500', badgeClass: 'bg-emerald-500/10 text-emerald-500', action: 'Retain & develop to leadership' },
              { cluster: 'Rising Stars', count: 12, avgProduction: '$28K', growth: '+35%', consistency: 78, borderClass: 'border-blue-500', badgeClass: 'bg-blue-500/10 text-blue-500', action: 'Accelerated training path' },
              { cluster: 'Steady Contributors', count: 15, avgProduction: '$18K', growth: '+5%', consistency: 85, borderClass: 'border-secondary', badgeClass: 'bg-violet-50 text-secondary', action: 'Maintain support' },
              { cluster: 'At-Risk Performers', count: 5, avgProduction: '$8K', growth: '-15%', consistency: 45, borderClass: 'border-red-500', badgeClass: 'bg-red-500/10 text-red-500', action: 'Immediate coaching intervention' },
            ].map((segment) => (
              <div key={segment.cluster} className={cn('p-3 rounded-lg border-l-4', segment.borderClass, theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{segment.cluster}</p>
                    <Badge className={segment.badgeClass}>{segment.count} agents</Badge>
                  </div>
                  <p className="text-sm font-bold">{segment.avgProduction}/mo avg</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Growth: <span className={segment.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>{segment.growth}</span></span>
                  <span>Consistency: {segment.consistency}%</span>
                </div>
                <p className="text-xs mt-2 text-muted-foreground italic">→ {segment.action}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="w-5 h-5 text-secondary" />
              Stress Test Scenarios
            </CardTitle>
            <CardDescription>Downside modeling and impact analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { scenario: 'Carrier Loss (Top Partner)', probability: '15%', revenueImpact: '-$420K', agentImpact: '-8 agents', mitigation: 'Diversification strategy in place' },
              { scenario: 'Agent Churn Spike (+50%)', probability: '25%', revenueImpact: '-$285K', agentImpact: '-12 agents', mitigation: 'Retention bonuses activated' },
              { scenario: 'Market Downturn (-20%)', probability: '20%', revenueImpact: '-$380K', agentImpact: '-5 agents', mitigation: 'Cash reserve covers 4.2 months' },
              { scenario: 'Regulatory Change', probability: '10%', revenueImpact: '-$150K', agentImpact: '0 agents', mitigation: 'Compliance team monitoring' },
            ].map((stress) => (
              <div key={stress.scenario} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-sm">{stress.scenario}</p>
                  <Badge variant="outline">{stress.probability} probability</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-muted-foreground">Revenue Impact: </span>
                    <span className="text-red-500 font-medium">{stress.revenueImpact}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Agent Impact: </span>
                    <span className="text-red-500 font-medium">{stress.agentImpact}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  <Shield className="w-3 h-3 inline mr-1 text-emerald-500" />
                  {stress.mitigation}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

function RiskView({ theme, alerts, acknowledgeAlert }: { theme: string; alerts: any[]; acknowledgeAlert: (id: number) => void }) {
  return (
    <motion.div
      key="risk"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-serif font-bold">Risk Management</h2>
        <p className="text-muted-foreground">Operational alerts and risk mitigation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Critical Alerts" value={alerts.filter((a: any) => a.severity === 'critical' && !a.acknowledged).length.toString()} change="Requires action" changeType="negative" icon={XCircle} theme={theme} />
        <MetricCard title="Warnings" value={alerts.filter((a: any) => a.severity === 'warning' && !a.acknowledged).length.toString()} change="Under review" changeType="neutral" icon={AlertCircle} theme={theme} />
        <MetricCard title="Risk Score" value="72/100" change="Moderate" changeType="neutral" icon={Shield} theme={theme} />
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5 text-secondary" />
            Active Alerts
          </CardTitle>
          <CardDescription>Threshold and trend-based notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert: any) => (
            <motion.div
              key={alert.id}
              layout
              className={cn(
                'flex items-start justify-between p-3 rounded-lg border-l-4 transition-all',
                alert.severity === 'critical' && !alert.acknowledged && 'bg-red-500/10 border-red-500',
                alert.severity === 'warning' && !alert.acknowledged && 'bg-amber-500/10 border-amber-500',
                alert.severity === 'info' && 'bg-blue-500/10 border-blue-500',
                alert.acknowledged && (theme === 'dark' ? 'bg-gray-700/50 border-gray-600 opacity-60' : 'bg-gray-100 border-gray-300 opacity-60')
              )}
            >
              <div className="flex items-start gap-3">
                {alert.severity === 'critical' && <XCircle className={cn('w-5 h-5 mt-0.5', alert.acknowledged ? 'text-gray-500' : 'text-red-500')} />}
                {alert.severity === 'warning' && <AlertCircle className={cn('w-5 h-5 mt-0.5', alert.acknowledged ? 'text-gray-500' : 'text-amber-500')} />}
                {alert.severity === 'info' && <Info className={cn('w-5 h-5 mt-0.5', alert.acknowledged ? 'text-gray-500' : 'text-blue-500')} />}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{alert.title}</p>
                    {alert.acknowledged && <Badge variant="outline" className="text-xs">Acknowledged</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alert.timestamp}</p>
                </div>
              </div>
              {!alert.acknowledged && (
                <Button size="sm" variant="outline" onClick={() => acknowledgeAlert(alert.id)} data-testid={`button-ack-risk-${alert.id}`}>
                  Acknowledge
                </Button>
              )}
            </motion.div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="w-5 h-5 text-secondary" />
              Risk Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { category: 'Override Exposure', level: 'High', value: 75, color: 'bg-red-500' },
              { category: 'Agent Churn', level: 'Medium', value: 45, color: 'bg-amber-500' },
              { category: 'Cash Flow', level: 'Medium', value: 50, color: 'bg-amber-500' },
              { category: 'Compliance', level: 'Low', value: 15, color: 'bg-emerald-500' },
              { category: 'Data Integrity', level: 'Low', value: 20, color: 'bg-emerald-500' },
            ].map((risk) => (
              <div key={risk.category} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{risk.category}</span>
                  <Badge variant={risk.level === 'High' ? 'destructive' : risk.level === 'Medium' ? 'secondary' : 'outline'}>{risk.level}</Badge>
                </div>
                <Progress value={risk.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-secondary" />
              Mitigation Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { risk: 'API Outages', mitigation: 'Cached fallbacks enabled', status: 'active' },
              { risk: 'Carrier Delays', mitigation: 'Accrual vs realized separation', status: 'active' },
              { risk: 'Data Misinterpretation', mitigation: 'Usage playbooks available', status: 'active' },
              { risk: 'Manual Overrides', mitigation: 'Restricted permissions enforced', status: 'active' },
            ].map((item) => (
              <div key={item.risk} className={cn('flex items-center justify-between p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div>
                  <p className="font-medium text-sm">{item.risk}</p>
                  <p className="text-xs text-muted-foreground">{item.mitigation}</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-secondary" />
            Compliance SLA Tracker
          </CardTitle>
          <CardDescription>Regulatory and internal compliance deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { item: 'Q4 State Filings', deadline: 'Jan 15, 2026', status: 'on_track', progress: 85, owner: 'Compliance Team' },
              { item: 'Anti-Money Laundering Review', deadline: 'Jan 31, 2026', status: 'on_track', progress: 60, owner: 'Legal Dept' },
              { item: 'Agent License Renewals (IL)', deadline: 'Feb 28, 2026', status: 'at_risk', progress: 25, owner: 'HR Team' },
              { item: 'Carrier Contract Compliance Audit', deadline: 'Mar 15, 2026', status: 'on_track', progress: 40, owner: 'Operations' },
              { item: 'SOC 2 Type II Certification', deadline: 'Apr 30, 2026', status: 'on_track', progress: 15, owner: 'IT Security' },
            ].map((sla) => (
              <div key={sla.item} className={cn('p-3 rounded-lg border-l-4', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100', sla.status === 'at_risk' ? 'border-amber-500' : 'border-emerald-500')}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{sla.item}</p>
                    <p className="text-xs text-muted-foreground">Owner: {sla.owner}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={sla.status === 'at_risk' ? 'destructive' : 'default'} className="text-xs">
                      {sla.status === 'at_risk' ? 'At Risk' : 'On Track'}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{sla.deadline}</p>
                  </div>
                </div>
                <Progress value={sla.progress} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="w-5 h-5 text-secondary" />
            Board Escalation Log
          </CardTitle>
          <CardDescription>Issues escalated to board-level review</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { issue: 'Q4 Revenue Miss (12% below target)', date: 'Dec 15, 2025', status: 'resolved', resolution: 'Action plan approved, Q1 recovery targets set', escalatedBy: 'CFO' },
              { issue: 'Carrier Dependency Risk - Single carrier >40% volume', date: 'Nov 28, 2025', status: 'monitoring', resolution: 'Diversification initiative launched', escalatedBy: 'COO' },
              { issue: 'Agent Churn Rate Spike (18% in Q3)', date: 'Oct 10, 2025', status: 'resolved', resolution: 'Revised compensation structure implemented', escalatedBy: 'VP Sales' },
            ].map((item, i) => (
              <div key={i} className={cn('p-3 rounded-lg flex items-start justify-between', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div>
                  <p className="font-medium text-sm">{item.issue}</p>
                  <p className="text-xs text-muted-foreground mt-1">Resolution: {item.resolution}</p>
                  <p className="text-xs text-muted-foreground">Escalated by: {item.escalatedBy} • {item.date}</p>
                </div>
                <Badge variant={item.status === 'resolved' ? 'default' : 'secondary'}>
                  {item.status === 'resolved' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function LeadershipView({ theme }: { theme: string }) {
  return (
    <motion.div
      key="leadership"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-serif font-bold">Leadership & Succession</h2>
        <p className="text-muted-foreground">Team readiness and bench strength analysis</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Team Size" value="12" change="+2 this quarter" changeType="positive" icon={Users} theme={theme} />
        <MetricCard title="Ready Now" value="4" subtitle="Leadership positions" icon={UserCheck} theme={theme} />
        <MetricCard title="Developing" value="6" subtitle="In pipeline" icon={TrendingUp} theme={theme} />
        <MetricCard title="Avg Readiness" value="80%" change="+5%" changeType="positive" icon={Award} theme={theme} />
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-secondary" />
            Bench Strength Overview
          </CardTitle>
          <CardDescription>Leadership succession readiness by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Team Member</th>
                  <th className="pb-3 font-medium">Current Role</th>
                  <th className="pb-3 font-medium">Readiness</th>
                  <th className="pb-3 font-medium">Potential</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="text-sm">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-secondary font-bold text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium">{member.name}</span>
                      </div>
                    </td>
                    <td className="py-3">{member.role}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={member.readiness} className="w-16 h-2" />
                        <span className="font-medium text-xs">{member.readiness}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge variant={member.potential === 'High' ? 'default' : 'secondary'}>{member.potential}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={cn(
                        member.status === 'ready' && 'bg-emerald-500/10 text-emerald-500',
                        member.status === 'developing' && 'bg-amber-500/10 text-amber-500'
                      )}>
                        {member.status === 'ready' ? 'Ready Now' : 'Developing'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-secondary" />
              Development Focus Areas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { area: 'Strategic Planning', progress: 75, priority: 'High' },
              { area: 'Financial Acumen', progress: 60, priority: 'High' },
              { area: 'Team Leadership', progress: 85, priority: 'Medium' },
              { area: 'Client Relations', progress: 90, priority: 'Low' },
            ].map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{area.area}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{area.progress}%</span>
                    <Badge variant="outline" className="text-xs">{area.priority}</Badge>
                  </div>
                </div>
                <Progress value={area.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-secondary" />
              Upcoming Reviews
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Sarah Mitchell', date: 'Jan 15, 2026', type: 'Quarterly Review' },
              { name: 'Michael Chen', date: 'Jan 22, 2026', type: 'Development Check-in' },
              { name: 'Team All-Hands', date: 'Feb 1, 2026', type: 'Strategy Session' },
              { name: 'Board Presentation', date: 'Feb 15, 2026', type: 'Executive Review' },
            ].map((review, i) => (
              <div key={i} className={cn('flex items-center justify-between p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div>
                  <p className="font-medium text-sm">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{review.type}</p>
                </div>
                <Badge variant="outline">{review.date}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Briefcase className="w-5 h-5 text-secondary" />
            Strategic Directives
          </CardTitle>
          <CardDescription>Active strategic initiatives and their progress</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {strategicDirectives.map((directive) => (
            <div key={directive.id} className={cn('p-4 rounded-lg border', theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{directive.title}</p>
                    <Badge variant={directive.priority === 'critical' ? 'destructive' : directive.priority === 'high' ? 'default' : 'secondary'}>{directive.priority}</Badge>
                    <Badge variant="outline">{directive.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{directive.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="font-medium">{directive.target}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{directive.progress}%</span>
                </div>
                <Progress value={directive.progress} className="h-2" />
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                <p className="text-xs text-muted-foreground mb-2">KEY PERFORMANCE INDICATORS</p>
                <div className="flex flex-wrap gap-1">
                  {directive.kpis.map((kpi, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{kpi}</Badge>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>Owner: {directive.owner}</span>
                  <span>Created: {directive.created}</span>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-secondary" />
            Agent Workforce Breakdown
          </CardTitle>
          <CardDescription>Detailed agent count by team, status, and tenure</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <p className="text-sm font-medium">By Team</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-2 font-medium">Team</th>
                      <th className="pb-2 font-medium">Total</th>
                      <th className="pb-2 font-medium">Active</th>
                      <th className="pb-2 font-medium">Top</th>
                      <th className="pb-2 font-medium">At Risk</th>
                      <th className="pb-2 font-medium">Avg AP</th>
                      <th className="pb-2 font-medium">Leader</th>
                      <th className="pb-2 font-medium">Trend</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                    {agentsByTeam.map((team) => (
                      <tr key={team.team}>
                        <td className="py-2 font-medium">{team.team}</td>
                        <td className="py-2">{team.total}</td>
                        <td className="py-2 text-emerald-500">{team.active}</td>
                        <td className="py-2 text-blue-500">{team.topPerformers}</td>
                        <td className="py-2 text-red-500">{team.atRisk}</td>
                        <td className="py-2">${(team.avgAP / 1000).toFixed(0)}K</td>
                        <td className="py-2 text-muted-foreground">{team.leader}</td>
                        <td className="py-2">
                          <Badge variant={team.trend.startsWith('+') ? 'default' : team.trend === '0' ? 'secondary' : 'destructive'} className="text-xs">{team.trend}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-sm font-medium pt-4">6-Month Hiring/Churn Trend</p>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={agentTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                    <XAxis dataKey="month" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} fontSize={12} />
                    <RechartsTooltip contentStyle={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', border: `1px solid ${theme === 'dark' ? '#374151' : '#e5e7eb'}`, borderRadius: '8px' }} />
                    <Bar dataKey="hired" fill="#10B981" radius={[4, 4, 0, 0]} name="Hired" />
                    <Bar dataKey="churned" fill="#EF4444" radius={[4, 4, 0, 0]} name="Churned" />
                    <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={2} dot={{ fill: '#8B5CF6', r: 4 }} name="Total" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-medium">By Status</p>
              {agentStatusBreakdown.map((status) => (
                <div key={status.status} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }} />
                      <span className="font-medium text-sm">{status.status}</span>
                    </div>
                    <span className="font-bold">{status.count}</span>
                  </div>
                  <Progress value={status.percentage} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">{status.criteria}</p>
                </div>
              ))}

              <p className="text-sm font-medium pt-4">By Tenure</p>
              {agentTenureDistribution.map((tenure) => (
                <div key={tenure.tenure} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tenure.color }} />
                    <span className="text-sm">{tenure.tenure}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">{tenure.count}</span>
                    <span className="text-xs text-muted-foreground">${(tenure.avgAP / 1000).toFixed(0)}K avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-secondary" />
              Executive Spotlight
            </CardTitle>
            <CardDescription>Highlighting leadership excellence this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn('p-4 rounded-lg border-2 border-secondary/30', theme === 'dark' ? 'bg-gray-700' : 'bg-secondary/5')}>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-secondary font-bold text-xl">
                  SM
                </div>
                <div>
                  <p className="font-semibold text-lg">Sarah Mitchell</p>
                  <p className="text-sm text-muted-foreground">Sales Director • 3.5 years with company</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-violet-100 text-secondary">Top Performer</Badge>
                    <Badge variant="outline">Leadership Ready</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <p className="italic text-muted-foreground">"Sarah's team achieved 142% of Q4 targets while maintaining the highest client satisfaction scores in company history."</p>
                <div className="grid grid-cols-3 gap-2 pt-3">
                  <div className={cn('p-2 rounded text-center', theme === 'dark' ? 'bg-gray-600' : 'bg-white')}>
                    <p className="font-bold text-emerald-500">$485K</p>
                    <p className="text-xs text-muted-foreground">Team Revenue</p>
                  </div>
                  <div className={cn('p-2 rounded text-center', theme === 'dark' ? 'bg-gray-600' : 'bg-white')}>
                    <p className="font-bold text-blue-500">12</p>
                    <p className="text-xs text-muted-foreground">Agents Mentored</p>
                  </div>
                  <div className={cn('p-2 rounded text-center', theme === 'dark' ? 'bg-gray-600' : 'bg-white')}>
                    <p className="font-bold text-purple-500">4.9/5</p>
                    <p className="text-xs text-muted-foreground">Team Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Heart className="w-5 h-5 text-secondary" />
              Culture Pulse
            </CardTitle>
            <CardDescription>Team sentiment and engagement metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { metric: 'Overall Engagement', score: 82, benchmark: 75, trend: '+5%' },
              { metric: 'Manager Trust', score: 88, benchmark: 70, trend: '+8%' },
              { metric: 'Work-Life Balance', score: 71, benchmark: 65, trend: '-2%' },
              { metric: 'Growth Opportunity', score: 79, benchmark: 72, trend: '+3%' },
              { metric: 'Team Collaboration', score: 85, benchmark: 78, trend: '+4%' },
            ].map((item) => (
              <div key={item.metric} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{item.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{item.score}%</span>
                    <span className={cn('text-xs', item.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500')}>{item.trend}</span>
                  </div>
                </div>
                <div className="relative">
                  <Progress value={item.score} className="h-2" />
                  <div className="absolute top-0 h-2 w-0.5 bg-gray-400" style={{ left: `${item.benchmark}%` }} title={`Benchmark: ${item.benchmark}%`} />
                </div>
                <p className="text-xs text-muted-foreground">Industry benchmark: {item.benchmark}%</p>
              </div>
            ))}
            <div className={cn('p-3 rounded-lg mt-4', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-xs text-muted-foreground">Last survey: Dec 15, 2025 • 38 of 40 agents responded (95%)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-secondary" />
            Mentorship Pairings
          </CardTitle>
          <CardDescription>Active development relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { mentor: 'Sarah Mitchell', mentee: 'David Park', focus: 'Leadership Development', progress: 75, nextSession: 'Jan 8' },
              { mentor: 'Michael Chen', mentee: 'Jessica Turner', focus: 'Sales Techniques', progress: 60, nextSession: 'Jan 10' },
              { mentor: 'James Davidson', mentee: 'Marcus Williams', focus: 'Executive Presence', progress: 40, nextSession: 'Jan 12' },
            ].map((pair, i) => (
              <div key={i} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-secondary font-bold text-xs">
                    {pair.mentor.split(' ').map(n => n[0]).join('')}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold text-xs">
                    {pair.mentee.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
                <p className="font-medium text-sm">{pair.mentor} → {pair.mentee}</p>
                <p className="text-xs text-muted-foreground">{pair.focus}</p>
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{pair.progress}%</span>
                  </div>
                  <Progress value={pair.progress} className="h-1.5" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Next: {pair.nextSession}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leadership Effectiveness Scores */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-secondary" />
            Leadership Effectiveness Composite Scores
          </CardTitle>
          <CardDescription>Multi-dimensional performance assessment for leadership team</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Leader</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium text-center">Team Perf</th>
                  <th className="pb-3 font-medium text-center">Retention</th>
                  <th className="pb-3 font-medium text-center">Development</th>
                  <th className="pb-3 font-medium text-center">Engagement</th>
                  <th className="pb-3 font-medium text-center">Composite</th>
                  <th className="pb-3 font-medium">Trend</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                {[
                  { name: 'Sarah Mitchell', role: 'Sales Director', teamPerf: 94, retention: 92, development: 88, engagement: 91, composite: 91.25, trend: '+3.2%' },
                  { name: 'Michael Chen', role: 'Training Manager', teamPerf: 86, retention: 88, development: 95, engagement: 82, composite: 87.75, trend: '+1.8%' },
                  { name: 'James Davidson', role: 'Ops Director', teamPerf: 82, retention: 85, development: 78, engagement: 86, composite: 82.75, trend: '-0.5%' },
                  { name: 'Jennifer Wu', role: 'Recruiting Lead', teamPerf: 78, retention: 91, development: 84, engagement: 88, composite: 85.25, trend: '+2.1%' },
                ].map((leader) => (
                  <tr key={leader.name}>
                    <td className="py-3 font-medium">{leader.name}</td>
                    <td className="py-3 text-muted-foreground">{leader.role}</td>
                    <td className="py-3 text-center">
                      <Badge className={cn(leader.teamPerf >= 90 ? 'bg-emerald-500/10 text-emerald-500' : leader.teamPerf >= 80 ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500')}>{leader.teamPerf}%</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge className={cn(leader.retention >= 90 ? 'bg-emerald-500/10 text-emerald-500' : leader.retention >= 80 ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500')}>{leader.retention}%</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge className={cn(leader.development >= 90 ? 'bg-emerald-500/10 text-emerald-500' : leader.development >= 80 ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500')}>{leader.development}%</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <Badge className={cn(leader.engagement >= 90 ? 'bg-emerald-500/10 text-emerald-500' : leader.engagement >= 80 ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500')}>{leader.engagement}%</Badge>
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn('font-bold text-lg', leader.composite >= 90 ? 'text-emerald-500' : leader.composite >= 80 ? 'text-blue-500' : 'text-amber-500')}>{leader.composite.toFixed(1)}</span>
                    </td>
                    <td className="py-3">
                      <span className={leader.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>{leader.trend}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={cn('mt-4 p-3 rounded-lg text-xs text-muted-foreground', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
            Composite = Weighted average: Team Performance (30%) + Retention (25%) + Development (25%) + Engagement (20%)
          </div>
        </CardContent>
      </Card>

      {/* Promotion Readiness Dashboard */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-secondary" />
              Promotion Readiness Dashboard
            </CardTitle>
            <CardDescription>Candidates assessed against promotion criteria</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'David Park', currentRole: 'Senior Agent', targetRole: 'Team Lead', readiness: 92, criteria: { tenure: true, production: true, leadership: true, training: true }, timeline: 'Q1 2026' },
              { name: 'Jessica Turner', currentRole: 'Agent', targetRole: 'Senior Agent', readiness: 78, criteria: { tenure: true, production: true, leadership: false, training: true }, timeline: 'Q2 2026' },
              { name: 'Marcus Williams', currentRole: 'Team Lead', targetRole: 'Sales Manager', readiness: 65, criteria: { tenure: true, production: false, leadership: true, training: false }, timeline: 'Q3 2026' },
            ].map((candidate) => (
              <div key={candidate.name} className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-secondary font-bold text-sm">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground">{candidate.currentRole} → {candidate.targetRole}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-2xl font-bold', candidate.readiness >= 85 ? 'text-emerald-500' : candidate.readiness >= 70 ? 'text-amber-500' : 'text-red-500')}>{candidate.readiness}%</p>
                    <p className="text-xs text-muted-foreground">Ready</p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <div className={cn('p-2 rounded text-center text-xs', candidate.criteria.tenure ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {candidate.criteria.tenure ? <CheckCircle2 className="w-3 h-3 mx-auto text-emerald-500" /> : <XCircle className="w-3 h-3 mx-auto text-red-500" />}
                    <span>Tenure</span>
                  </div>
                  <div className={cn('p-2 rounded text-center text-xs', candidate.criteria.production ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {candidate.criteria.production ? <CheckCircle2 className="w-3 h-3 mx-auto text-emerald-500" /> : <XCircle className="w-3 h-3 mx-auto text-red-500" />}
                    <span>Production</span>
                  </div>
                  <div className={cn('p-2 rounded text-center text-xs', candidate.criteria.leadership ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {candidate.criteria.leadership ? <CheckCircle2 className="w-3 h-3 mx-auto text-emerald-500" /> : <XCircle className="w-3 h-3 mx-auto text-red-500" />}
                    <span>Leadership</span>
                  </div>
                  <div className={cn('p-2 rounded text-center text-xs', candidate.criteria.training ? 'bg-emerald-500/10' : 'bg-red-500/10')}>
                    {candidate.criteria.training ? <CheckCircle2 className="w-3 h-3 mx-auto text-emerald-500" /> : <XCircle className="w-3 h-3 mx-auto text-red-500" />}
                    <span>Training</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Target timeline: {candidate.timeline}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="w-5 h-5 text-secondary" />
              IDP (Individual Development Plan) Tracker
            </CardTitle>
            <CardDescription>Development milestones and skill gap closure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'David Park', plan: 'Leadership Acceleration', milestones: 8, completed: 7, skills: ['Team Management', 'Coaching', 'Strategic Planning'], nextMilestone: 'Lead Q1 kickoff meeting' },
              { name: 'Jessica Turner', plan: 'Sales Excellence', milestones: 6, completed: 4, skills: ['Advanced Selling', 'Negotiation', 'Client Relations'], nextMilestone: 'Complete objection handling cert' },
              { name: 'Marcus Williams', plan: 'Executive Development', milestones: 10, completed: 5, skills: ['P&L Management', 'Executive Presence', 'Strategy'], nextMilestone: 'Shadow CFO for monthly close' },
            ].map((idp) => (
              <div key={idp.name} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm">{idp.name}</p>
                    <p className="text-xs text-muted-foreground">{idp.plan}</p>
                  </div>
                  <Badge className="bg-violet-50 text-secondary">{idp.completed}/{idp.milestones} milestones</Badge>
                </div>
                <Progress value={(idp.completed / idp.milestones) * 100} className="h-2 mb-2" />
                <div className="flex flex-wrap gap-1 mb-2">
                  {idp.skills.map((skill, i) => (
                    <Badge key={i} variant="outline" className="text-[10px] px-1">{skill}</Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  <Target className="w-3 h-3 inline mr-1" />
                  Next: {idp.nextMilestone}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Succession Coverage Heatmap */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="w-5 h-5 text-secondary" />
            Succession Coverage Heatmap
          </CardTitle>
          <CardDescription>Critical role coverage and bench strength indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground border-b">
                  <th className="pb-3 font-medium">Critical Role</th>
                  <th className="pb-3 font-medium">Current Holder</th>
                  <th className="pb-3 font-medium">Ready Now</th>
                  <th className="pb-3 font-medium">Ready 1-2 Years</th>
                  <th className="pb-3 font-medium">Bench Strength</th>
                  <th className="pb-3 font-medium">Risk Level</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                {[
                  { role: 'CEO / Managing Partner', current: 'James Davidson', readyNow: 0, ready1_2: 1, benchStrength: 'Weak', risk: 'High', action: 'External search recommended' },
                  { role: 'Sales Director', current: 'Sarah Mitchell', readyNow: 2, ready1_2: 3, benchStrength: 'Strong', risk: 'Low', action: 'Succession pipeline healthy' },
                  { role: 'Training Manager', current: 'Michael Chen', readyNow: 1, ready1_2: 2, benchStrength: 'Moderate', risk: 'Medium', action: 'Accelerate IDP for backup' },
                  { role: 'Recruiting Lead', current: 'Jennifer Wu', readyNow: 0, ready1_2: 2, benchStrength: 'Moderate', risk: 'Medium', action: 'Develop internal candidates' },
                  { role: 'Compliance Officer', current: 'Robert Kim', readyNow: 1, ready1_2: 1, benchStrength: 'Moderate', risk: 'Medium', action: 'Cross-train additional staff' },
                ].map((row) => (
                  <tr key={row.role} className={row.risk === 'High' ? (theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50') : ''}>
                    <td className="py-3 font-medium">{row.role}</td>
                    <td className="py-3">{row.current}</td>
                    <td className="py-3">
                      <span className={cn('font-bold', row.readyNow >= 2 ? 'text-emerald-500' : row.readyNow >= 1 ? 'text-amber-500' : 'text-red-500')}>{row.readyNow}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-blue-500">{row.ready1_2}</span>
                    </td>
                    <td className="py-3">
                      <Badge className={cn(
                        row.benchStrength === 'Strong' && 'bg-emerald-500/10 text-emerald-500',
                        row.benchStrength === 'Moderate' && 'bg-amber-500/10 text-amber-500',
                        row.benchStrength === 'Weak' && 'bg-red-500/10 text-red-500'
                      )}>{row.benchStrength}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={cn(
                        row.risk === 'Low' && 'bg-emerald-500/10 text-emerald-500',
                        row.risk === 'Medium' && 'bg-amber-500/10 text-amber-500',
                        row.risk === 'High' && 'bg-red-500/10 text-red-500'
                      )}>{row.risk}</Badge>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">{row.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid md:grid-cols-4 gap-4 mt-4">
            <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
              <p className="text-2xl font-bold text-emerald-500">4</p>
              <p className="text-xs text-muted-foreground">Ready-Now Successors</p>
            </div>
            <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-blue-900/10' : 'bg-blue-50')}>
              <p className="text-2xl font-bold text-blue-500">9</p>
              <p className="text-xs text-muted-foreground">In Development</p>
            </div>
            <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-amber-900/10' : 'bg-amber-50')}>
              <p className="text-2xl font-bold text-amber-500">60%</p>
              <p className="text-xs text-muted-foreground">Roles Covered</p>
            </div>
            <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50')}>
              <p className="text-2xl font-bold text-red-500">1</p>
              <p className="text-xs text-muted-foreground">High-Risk Gaps</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mentorship Telemetry */}
      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-secondary" />
            Mentorship Engagement Telemetry
          </CardTitle>
          <CardDescription>Program health and engagement tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-2xl font-bold text-secondary">12</p>
              <p className="text-xs text-muted-foreground">Active Pairings</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-muted-foreground">Session Attendance</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-2xl font-bold">4.6/5</p>
              <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
            </div>
            <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
              <p className="text-2xl font-bold text-emerald-500">+32%</p>
              <p className="text-xs text-muted-foreground">Mentee Performance</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Session Frequency (Last 30 Days)</p>
            {[
              { pair: 'Sarah Mitchell → David Park', sessions: 4, avgDuration: '45min', lastSession: 'Jan 3', satisfaction: 5 },
              { pair: 'Michael Chen → Jessica Turner', sessions: 3, avgDuration: '30min', lastSession: 'Jan 2', satisfaction: 4.5 },
              { pair: 'James Davidson → Marcus Williams', sessions: 2, avgDuration: '60min', lastSession: 'Dec 28', satisfaction: 4 },
            ].map((telemetry) => (
              <div key={telemetry.pair} className={cn('p-3 rounded-lg flex items-center justify-between', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                <div>
                  <p className="font-medium text-sm">{telemetry.pair}</p>
                  <p className="text-xs text-muted-foreground">{telemetry.sessions} sessions • {telemetry.avgDuration} avg • Last: {telemetry.lastSession}</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={cn('w-3 h-3', star <= Math.floor(telemetry.satisfaction) ? 'text-secondary fill-secondary' : 'text-gray-300')} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PartnershipsView({ theme }: { theme: string }) {
  const [activePartnerTab, setActivePartnerTab] = useState<'overview' | 'carriers' | 'vendors' | 'strategic' | 'deals' | 'investments' | 'network' | 'renewals'>('overview');
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);

  const totalPartners = partnershipCategories.carriers.count + partnershipCategories.vendors.count + partnershipCategories.strategic.count;
  const avgHealthScore = Math.round((partnershipCategories.carriers.healthScore + partnershipCategories.vendors.healthScore + partnershipCategories.strategic.healthScore) / 3);
  const totalRenewals = partnershipCategories.carriers.renewalsPending + partnershipCategories.vendors.renewalsPending + partnershipCategories.strategic.renewalsPending;
  const totalInvestments = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
  const totalDealsValue = businessDeals.reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = businessDeals.filter(d => d.status !== 'completed').length;

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-emerald-500';
    if (score >= 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-500/10';
    if (score >= 70) return 'bg-amber-500/10';
    return 'bg-red-500/10';
  };

  return (
    <motion.div
      key="partnerships"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-serif font-bold">Strategic Partnership & Network System</h2>
        <p className="text-muted-foreground">Carrier, vendor, and strategic partner relationship management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <MetricCard title="Total Partners" value={totalPartners.toString()} subtitle="Active relationships" icon={Building2} theme={theme} />
        <MetricCard title="Avg Health Score" value={`${avgHealthScore}%`} change="Healthy" changeType="positive" icon={Activity} theme={theme} />
        <MetricCard title="Carrier Premium" value={`$${(partnershipCategories.carriers.totalPremium / 1000000).toFixed(1)}M`} change="+8.4% YoY" changeType="positive" icon={CircleDollarSign} theme={theme} />
        <MetricCard title="Vendor Spend" value={`$${(partnershipCategories.vendors.totalSpend / 1000).toFixed(0)}K`} subtitle="Annual contracts" icon={Receipt} theme={theme} />
        <MetricCard title="Active Deals" value={activeDeals.toString()} subtitle={`$${(totalDealsValue / 1000000).toFixed(1)}M value`} icon={Handshake} theme={theme} />
        <MetricCard title="Investments" value={`$${(totalInvestments / 1000).toFixed(0)}K`} change={`+$${(investments.reduce((sum, inv) => sum + inv.unrealizedGain, 0) / 1000).toFixed(0)}K unrealized`} changeType="positive" icon={Coins} theme={theme} />
        <MetricCard title="Network Contacts" value={networkRelationships.length.toString()} subtitle="Key relationships" icon={Network} theme={theme} />
        <MetricCard title="Renewals Pending" value={totalRenewals.toString()} change={totalRenewals > 3 ? 'Action needed' : 'On track'} changeType={totalRenewals > 3 ? 'negative' : 'neutral'} icon={Calendar} theme={theme} />
      </div>

      <Tabs value={activePartnerTab} onValueChange={(v) => setActivePartnerTab(v as any)}>
        <TabsList className={cn("grid w-full grid-cols-4 lg:grid-cols-8", theme === 'dark' ? 'bg-gray-800' : '')}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="carriers">Carriers</TabsTrigger>
          <TabsTrigger value="vendors">Vendors</TabsTrigger>
          <TabsTrigger value="strategic">Strategic</TabsTrigger>
          <TabsTrigger value="deals">Deals</TabsTrigger>
          <TabsTrigger value="investments">Investments</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="renewals">Renewals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-emerald-500" />
                  Carriers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <p className="text-2xl font-bold">{partnershipCategories.carriers.count}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className={cn('p-3 rounded-lg text-center', getHealthBg(partnershipCategories.carriers.healthScore))}>
                    <p className={cn("text-2xl font-bold", getHealthColor(partnershipCategories.carriers.healthScore))}>{partnershipCategories.carriers.healthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Premium Volume</p>
                  <p className="text-xl font-bold">${(partnershipCategories.carriers.totalPremium / 1000000).toFixed(1)}M</p>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{partnershipCategories.carriers.renewalsPending} renewals pending</span>
                  <span>2 high priority</span>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  Vendors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <p className="text-2xl font-bold">{partnershipCategories.vendors.count}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className={cn('p-3 rounded-lg text-center', getHealthBg(partnershipCategories.vendors.healthScore))}>
                    <p className={cn("text-2xl font-bold", getHealthColor(partnershipCategories.vendors.healthScore))}>{partnershipCategories.vendors.healthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Annual Spend</p>
                  <p className="text-xl font-bold">${(partnershipCategories.vendors.totalSpend / 1000).toFixed(0)}K</p>
                  <Progress value={72} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{partnershipCategories.vendors.renewalsPending} renewals pending</span>
                  <span>1 critical decision</span>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Star className="w-5 h-5 text-purple-500" />
                  Strategic Partners
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={cn('p-3 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <p className="text-2xl font-bold">{partnershipCategories.strategic.count}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div className={cn('p-3 rounded-lg text-center', getHealthBg(partnershipCategories.strategic.healthScore))}>
                    <p className={cn("text-2xl font-bold", getHealthColor(partnershipCategories.strategic.healthScore))}>{partnershipCategories.strategic.healthScore}%</p>
                    <p className="text-xs text-muted-foreground">Health</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Strategic Value</p>
                  <p className="text-xl font-bold">${(partnershipCategories.strategic.totalValue / 1000).toFixed(0)}K</p>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{partnershipCategories.strategic.renewalsPending} reviews pending</span>
                  <span>High alignment</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertCircle className="w-5 h-5 text-secondary" />
                Partnership Alerts & Actions
              </CardTitle>
              <CardDescription>Immediate attention required</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {renewalCalendar.filter(r => r.priority === 'critical' || r.priority === 'high').map((renewal) => (
                <div key={renewal.id} className={cn(
                  'flex items-center justify-between p-4 rounded-lg border-l-4',
                  renewal.priority === 'critical' ? 'bg-red-500/10 border-red-500' : 'bg-amber-500/10 border-amber-500'
                )}>
                  <div className="flex items-center gap-4">
                    {renewal.priority === 'critical' ? <XCircle className="w-5 h-5 text-red-500" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{renewal.partner}</p>
                        <Badge variant="outline" className="text-xs">{renewal.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{renewal.daysRemaining} days until renewal | ${(renewal.value / 1000).toFixed(0)}K value</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(renewal.priority === 'critical' ? 'bg-red-500' : 'bg-amber-500')}>{renewal.action}</Badge>
                    <Button size="sm" variant="outline" data-testid={`button-review-${renewal.id}`}>
                      Review <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Scale className="w-5 h-5 text-secondary" />
                  Dependency Analysis
                </CardTitle>
                <CardDescription>Risk concentration by partner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'RingCentral', category: 'Communications', dependency: 'Critical', risk: 95, mitigation: 'No backup identified' },
                  { name: 'DocuSign', category: 'E-Signature', dependency: 'Critical', risk: 90, mitigation: 'Adobe Sign as backup' },
                  { name: 'Mutual of Omaha', category: 'Carrier', dependency: 'High', risk: 75, mitigation: 'Diversified with 4 other carriers' },
                  { name: 'LeadByte', category: 'Leads', dependency: 'High', risk: 70, mitigation: '2 backup vendors identified' },
                  { name: 'Salesforce', category: 'CRM', dependency: 'High', risk: 65, mitigation: 'HubSpot evaluation in progress' },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{item.name}</span>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                      <Badge variant={item.dependency === 'Critical' ? 'destructive' : 'secondary'} className="text-xs">{item.dependency}</Badge>
                    </div>
                    <Progress value={item.risk} className="h-2" />
                    <p className="text-xs text-muted-foreground">{item.mitigation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5 text-secondary" />
                  Partner ROI Ranking
                </CardTitle>
                <CardDescription>Value generated per dollar spent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {carrierROI.map((carrier, i) => (
                  <div key={carrier.carrier} className={cn('flex items-center justify-between p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <div className="flex items-center gap-3">
                      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm', i < 3 ? 'bg-violet-100 text-secondary' : 'bg-gray-200 text-gray-600')}>
                        #{i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{carrier.carrier}</p>
                        <p className="text-xs text-muted-foreground">${(carrier.premium / 1000000).toFixed(2)}M premium</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-500">{carrier.roi}% ROI</p>
                      <div className="flex items-center gap-1">
                        {carrier.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-500" />}
                        {carrier.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                        {carrier.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                        <span className="text-xs text-muted-foreground">${(carrier.commission / 1000).toFixed(0)}K commission</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="carriers" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-secondary" />
                    Carrier Partnership Portfolio
                  </CardTitle>
                  <CardDescription>Complete carrier relationship management</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-carrier">
                  <Plus className="w-4 h-4 mr-1" /> Add Carrier
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground">
                      <th className="pb-3 font-medium">Carrier</th>
                      <th className="pb-3 font-medium">Tier</th>
                      <th className="pb-3 font-medium">Health</th>
                      <th className="pb-3 font-medium">Premium</th>
                      <th className="pb-3 font-medium">Commission</th>
                      <th className="pb-3 font-medium">ROI</th>
                      <th className="pb-3 font-medium">Dependency</th>
                      <th className="pb-3 font-medium">Contract End</th>
                      <th className="pb-3 font-medium">Alerts</th>
                      <th className="pb-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                    {carrierPartnerships.map((carrier) => (
                      <tr key={carrier.id} className="text-sm">
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{carrier.name}</p>
                            <p className="text-xs text-muted-foreground">{carrier.notes?.substring(0, 30)}...</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge variant={carrier.tier === 'Platinum' ? 'default' : 'secondary'} className={cn(carrier.tier === 'Platinum' && 'bg-purple-500')}>{carrier.tier}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className={cn('w-3 h-3 rounded-full', carrier.healthScore >= 85 ? 'bg-emerald-500' : carrier.healthScore >= 70 ? 'bg-amber-500' : 'bg-red-500')} />
                            <span className={getHealthColor(carrier.healthScore)}>{carrier.healthScore}%</span>
                          </div>
                        </td>
                        <td className="py-3">${(carrier.premium / 1000000).toFixed(2)}M</td>
                        <td className="py-3">${(carrier.commission / 1000).toFixed(0)}K</td>
                        <td className="py-3"><Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500">{carrier.roi}%</Badge></td>
                        <td className="py-3">
                          <Badge variant={carrier.dependencyScore === 'High' ? 'destructive' : carrier.dependencyScore === 'Medium' ? 'secondary' : 'outline'}>{carrier.dependencyScore}</Badge>
                        </td>
                        <td className="py-3">{carrier.contractEnd}</td>
                        <td className="py-3">
                          {carrier.alerts && carrier.alerts.length > 0 ? (
                            <Badge variant="destructive" className="text-xs">{carrier.alerts.length}</Badge>
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          )}
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost" onClick={() => { setSelectedPartner(carrier); setShowPartnerModal(true); }} data-testid={`button-view-carrier-${carrier.id}`}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="w-5 h-5 text-secondary" />
                    Vendor Partnership Portfolio
                  </CardTitle>
                  <CardDescription>Operational vendor management</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-vendor">
                  <Plus className="w-4 h-4 mr-1" /> Add Vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorPartnerships.map((vendor) => (
                  <div key={vendor.id} className={cn('p-4 rounded-lg border', theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200', vendor.alerts && vendor.alerts.length > 0 && 'border-l-4 border-l-red-500')}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold">{vendor.name}</p>
                          <Badge variant="outline">{vendor.category}</Badge>
                          <Badge variant={vendor.dependencyScore === 'Critical' ? 'destructive' : vendor.dependencyScore === 'High' ? 'secondary' : 'outline'}>{vendor.dependencyScore}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{vendor.notes}</p>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Health Score</p>
                            <div className="flex items-center gap-2">
                              <p className={cn("font-bold", getHealthColor(vendor.healthScore))}>{vendor.healthScore}%</p>
                              <div className={cn('w-2 h-2 rounded-full', vendor.healthScore >= 85 ? 'bg-emerald-500' : vendor.healthScore >= 70 ? 'bg-amber-500' : 'bg-red-500')} />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Contract Value</p>
                            <p className="font-bold">${(vendor.contractValue / 1000).toFixed(0)}K/yr</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Renewal Date</p>
                            <p className="font-medium">{vendor.renewalDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Performance</p>
                            <div className="flex gap-1">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs">Q:{vendor.performance.quality}</Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Quality Score</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs">V:{vendor.performance.volume}</Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Volume Score</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Badge variant="secondary" className="text-xs">C:{vendor.performance.cost}</Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>Cost Efficiency</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        </div>
                        {vendor.alerts && vendor.alerts.length > 0 && (
                          <div className="mt-3 p-2 bg-red-500/10 rounded flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="text-sm text-red-500">{vendor.alerts[0].message}</p>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline" data-testid={`button-manage-vendor-${vendor.id}`}>
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategic" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5 text-secondary" />
                    Strategic Partnership Network
                  </CardTitle>
                  <CardDescription>High-value strategic relationships</CardDescription>
                </div>
                <Button size="sm" data-testid="button-add-strategic">
                  <Plus className="w-4 h-4 mr-1" /> Add Partner
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-4">
                {strategicPartners.map((partner) => (
                  <div key={partner.id} className={cn('p-4 rounded-lg border', theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200')}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{partner.name}</p>
                          <Badge variant="outline">{partner.category}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Partner since {partner.partnerSince.split('-')[0]}</p>
                      </div>
                      <div className={cn('px-3 py-1 rounded-full text-sm font-medium', getHealthBg(partner.healthScore), getHealthColor(partner.healthScore))}>
                        {partner.healthScore}%
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{partner.notes}</p>
                    <div className="space-y-2 mb-3">
                      <p className="text-xs font-medium text-muted-foreground">KEY BENEFITS</p>
                      <div className="flex flex-wrap gap-1">
                        {partner.benefits.map((benefit, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{benefit}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="text-xs text-muted-foreground">Strategic Value</p>
                        <p className="font-bold">${(partner.value / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Next Review</p>
                        <p className="font-medium">{partner.nextReview}</p>
                      </div>
                      <Button size="sm" variant="outline" data-testid={`button-review-partner-${partner.id}`}>Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="renewals" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-secondary" />
                Renewal Calendar & Lifecycle Management
              </CardTitle>
              <CardDescription>Track and manage all partnership renewals</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[...renewalCalendar].sort((a, b) => a.daysRemaining - b.daysRemaining).map((renewal) => (
                <div key={renewal.id} className={cn(
                  'p-4 rounded-lg border-l-4 flex items-center justify-between',
                  renewal.priority === 'critical' ? 'border-red-500 bg-red-500/5' : 
                  renewal.priority === 'high' ? 'border-amber-500 bg-amber-500/5' : 
                  'border-blue-500 bg-blue-500/5'
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      'w-16 h-16 rounded-lg flex flex-col items-center justify-center',
                      renewal.priority === 'critical' ? 'bg-red-500/20 text-red-500' :
                      renewal.priority === 'high' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-blue-500/20 text-blue-500'
                    )}>
                      <p className="text-2xl font-bold">{renewal.daysRemaining}</p>
                      <p className="text-xs">days</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{renewal.partner}</p>
                        <Badge variant="outline">{renewal.type}</Badge>
                        <Badge variant={renewal.priority === 'critical' ? 'destructive' : renewal.priority === 'high' ? 'default' : 'secondary'}>{renewal.priority}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">Renewal date: {renewal.renewalDate}</p>
                      <p className="text-sm text-muted-foreground">Contract value: ${(renewal.value / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={cn(
                      renewal.action === 'Negotiate' && 'bg-purple-500',
                      renewal.action === 'Renew' && 'bg-emerald-500',
                      renewal.action === 'Review' && 'bg-blue-500',
                      renewal.action === 'Evaluate' && 'bg-amber-500'
                    )}>
                      {renewal.action}
                    </Badge>
                    <Button variant="outline" size="sm" data-testid={`button-renewal-action-${renewal.id}`}>
                      Take Action <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-secondary" />
                Renewal Timeline (Next 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
                  const monthRenewals = renewalCalendar.filter(r => r.renewalDate.includes(`2026-0${i + 1}`));
                  return (
                    <div key={month} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{month}</div>
                      <div className="flex-1 h-8 rounded bg-gray-100 dark:bg-gray-700 relative">
                        {monthRenewals.length > 0 && (
                          <div className={cn(
                            'h-full rounded flex items-center justify-center text-xs font-medium text-white',
                            monthRenewals.some(r => r.priority === 'critical') ? 'bg-red-500' :
                            monthRenewals.some(r => r.priority === 'high') ? 'bg-amber-500' : 'bg-blue-500'
                          )} style={{ width: `${Math.min(monthRenewals.length * 25, 100)}%` }}>
                            {monthRenewals.map(r => r.partner).join(', ')}
                          </div>
                        )}
                      </div>
                      <div className="w-8 text-center text-sm text-muted-foreground">{monthRenewals.length}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Contract Lifecycle Escalation System */}
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <AlertTriangle className="w-5 h-5 text-secondary" />
                Contract Lifecycle Escalation Alerts
              </CardTitle>
              <CardDescription>Automated notification windows at 180/120/90/60 day thresholds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { window: '180 Days', status: 'Planning', action: 'Begin internal strategic review', partners: ['Mutual of Omaha'], borderClass: 'border-blue-500', badgeClass: 'bg-blue-500 text-white' },
                  { window: '120 Days', status: 'Negotiation', action: 'Initiate partner discussions', partners: ['Transamerica', 'LeadByte'], borderClass: 'border-purple-500', badgeClass: 'bg-purple-500 text-white' },
                  { window: '90 Days', status: 'Urgent', action: 'Finalize terms or escalate to leadership', partners: ['RingCentral'], borderClass: 'border-amber-500', badgeClass: 'bg-amber-500 text-white' },
                  { window: '60 Days', status: 'Critical', action: 'Executive intervention required', partners: [], borderClass: 'border-red-500', badgeClass: 'bg-red-500 text-white' },
                ].map((escalation) => (
                  <div key={escalation.window} className={cn('p-4 rounded-lg border-l-4', escalation.borderClass, theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge className={escalation.badgeClass}>{escalation.window}</Badge>
                        <span className="font-medium">{escalation.status}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{escalation.partners.length} active</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Action: {escalation.action}</p>
                    {escalation.partners.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {escalation.partners.map((p, i) => (
                          <Badge key={i} variant="outline">{p}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-emerald-500">No partners in this window</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dependency Risk Matrix */}
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-secondary" />
                Dependency Risk Matrix
              </CardTitle>
              <CardDescription>Concentration risk and diversification planning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-red-900/10' : 'bg-red-50')}>
                  <p className="text-xs font-medium text-red-600">HIGH CONCENTRATION</p>
                  <p className="text-3xl font-bold text-red-600">2</p>
                  <p className="text-xs text-muted-foreground">Partners &gt;25% of revenue</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-amber-900/10' : 'bg-amber-50')}>
                  <p className="text-xs font-medium text-amber-600">MEDIUM RISK</p>
                  <p className="text-3xl font-bold text-amber-600">3</p>
                  <p className="text-xs text-muted-foreground">Partners 10-25% of revenue</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-50')}>
                  <p className="text-xs font-medium text-emerald-600">DIVERSIFIED</p>
                  <p className="text-3xl font-bold text-emerald-600">8</p>
                  <p className="text-xs text-muted-foreground">Partners &lt;10% of revenue</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Concentration Analysis</p>
                {[
                  { partner: 'Mutual of Omaha', percentage: 32, risk: 'Critical', mitigation: 'Develop Foresters as secondary FE carrier' },
                  { partner: 'Transamerica', percentage: 24, risk: 'High', mitigation: 'Onboard Americo for Term products' },
                  { partner: 'LeadByte', percentage: 18, risk: 'Medium', mitigation: 'Test secondary lead vendor Q1' },
                ].map((item) => (
                  <div key={item.partner} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.partner}</span>
                        <Badge className={cn(
                          item.risk === 'Critical' && 'bg-red-500 text-white',
                          item.risk === 'High' && 'bg-amber-500 text-white',
                          item.risk === 'Medium' && 'bg-blue-500 text-white'
                        )}>{item.risk}</Badge>
                      </div>
                      <span className="font-bold">{item.percentage}%</span>
                    </div>
                    <Progress value={item.percentage} className={cn('h-2 mb-2', item.percentage > 25 ? '[&>div]:bg-red-500' : item.percentage > 15 ? '[&>div]:bg-amber-500' : '[&>div]:bg-emerald-500')} />
                    <p className="text-xs text-muted-foreground">
                      <Target className="w-3 h-3 inline mr-1" />
                      Mitigation: {item.mitigation}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relationship Health Breakdown */}
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-secondary" />
                Relationship Health Score Breakdown
              </CardTitle>
              <CardDescription>Multi-factor health assessment: Financial / Operational / Strategic</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-muted-foreground border-b">
                      <th className="pb-3 font-medium">Partner</th>
                      <th className="pb-3 font-medium text-center">Financial</th>
                      <th className="pb-3 font-medium text-center">Operational</th>
                      <th className="pb-3 font-medium text-center">Strategic</th>
                      <th className="pb-3 font-medium text-center">Composite</th>
                      <th className="pb-3 font-medium">Trend</th>
                      <th className="pb-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                    {[
                      { partner: 'Mutual of Omaha', financial: 95, operational: 88, strategic: 92, composite: 92, trend: '+2.1%', action: 'Maintain' },
                      { partner: 'Transamerica', financial: 82, operational: 85, strategic: 78, composite: 82, trend: '-1.5%', action: 'Monitor' },
                      { partner: 'Foresters', financial: 75, operational: 82, strategic: 88, composite: 82, trend: '+3.4%', action: 'Expand' },
                      { partner: 'LeadByte', financial: 78, operational: 72, strategic: 65, composite: 72, trend: '-4.2%', action: 'Review' },
                      { partner: 'RingCentral', financial: 88, operational: 92, strategic: 85, composite: 88, trend: '+1.8%', action: 'Maintain' },
                    ].map((row) => (
                      <tr key={row.partner}>
                        <td className="py-3 font-medium">{row.partner}</td>
                        <td className="py-3 text-center">
                          <Badge className={cn(row.financial >= 85 ? 'bg-emerald-500/10 text-emerald-500' : row.financial >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500')}>{row.financial}</Badge>
                        </td>
                        <td className="py-3 text-center">
                          <Badge className={cn(row.operational >= 85 ? 'bg-emerald-500/10 text-emerald-500' : row.operational >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500')}>{row.operational}</Badge>
                        </td>
                        <td className="py-3 text-center">
                          <Badge className={cn(row.strategic >= 85 ? 'bg-emerald-500/10 text-emerald-500' : row.strategic >= 70 ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500')}>{row.strategic}</Badge>
                        </td>
                        <td className="py-3 text-center">
                          <span className={cn('font-bold text-lg', row.composite >= 85 ? 'text-emerald-500' : row.composite >= 70 ? 'text-amber-500' : 'text-red-500')}>{row.composite}</span>
                        </td>
                        <td className="py-3">
                          <span className={row.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}>{row.trend}</span>
                        </td>
                        <td className="py-3">
                          <Badge variant={row.action === 'Maintain' ? 'secondary' : row.action === 'Expand' ? 'default' : row.action === 'Monitor' ? 'outline' : 'destructive'}>{row.action}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={cn('mt-4 p-3 rounded-lg text-xs text-muted-foreground', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                Financial = Revenue contribution + payment reliability | Operational = SLAs + response times + quality | Strategic = Alignment + growth potential + innovation
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Handshake className="w-5 h-5 text-secondary" />
                Active Business Deals & Pipeline
              </CardTitle>
              <CardDescription>Acquisitions, joint ventures, distribution agreements, and opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-2xl font-bold text-blue-500">{businessDeals.length}</p>
                  <p className="text-xs text-muted-foreground">Total Deals</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50')}>
                  <p className="text-2xl font-bold text-emerald-500">{businessDeals.filter(d => d.status === 'active').length}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-amber-900/20' : 'bg-amber-50')}>
                  <p className="text-2xl font-bold text-amber-500">{businessDeals.filter(d => d.status === 'in_progress').length}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50')}>
                  <p className="text-2xl font-bold text-purple-500">${(businessDeals.reduce((sum, d) => sum + d.potentialRevenue * (d.probability / 100), 0) / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Weighted Pipeline</p>
                </div>
              </div>
              <div className="space-y-4">
                {businessDeals.map((deal) => (
                  <div key={deal.id} className={cn('p-4 rounded-lg border-l-4', 
                    deal.status === 'active' ? 'border-emerald-500' : deal.status === 'in_progress' ? 'border-amber-500' : 'border-gray-400',
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{deal.name}</h4>
                          <Badge variant="outline">{deal.category}</Badge>
                          <Badge className={cn(
                            deal.status === 'active' && 'bg-emerald-500 text-white',
                            deal.status === 'in_progress' && 'bg-amber-500 text-white',
                            deal.status === 'pending' && 'bg-gray-500 text-white'
                          )}>{deal.stage}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{deal.notes}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">${deal.value > 0 ? (deal.value / 1000).toFixed(0) + 'K' : 'TBD'}</p>
                        <p className="text-xs text-muted-foreground">Deal Value</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Potential Revenue</p>
                        <p className="font-medium">${(deal.potentialRevenue / 1000).toFixed(0)}K/yr</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Probability</p>
                        <div className="flex items-center gap-2">
                          <Progress value={deal.probability} className="h-2 flex-1" />
                          <span className="font-medium">{deal.probability}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Key Contact</p>
                        <p className="font-medium">{deal.keyContact} ({deal.contactRole})</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Target Close</p>
                        <p className="font-medium">{deal.targetClose}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex gap-2">
                        {deal.risks.map((risk, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-red-500 border-red-500/30">{risk}</Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Next: {deal.nextAction}</span>
                        <Button size="sm" variant="outline" data-testid={`button-deal-action-${deal.id}`}>Action</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GitMerge className="w-5 h-5 text-secondary" />
                Deal Pipeline by Stage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-center">
                {['Evaluation', 'Negotiation', 'Due Diligence', 'Pilot', 'Contracted'].map((stage) => {
                  const count = businessDeals.filter(d => d.stage === stage).length;
                  const value = businessDeals.filter(d => d.stage === stage).reduce((sum, d) => sum + d.potentialRevenue, 0);
                  return (
                    <div key={stage} className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                      <p className="text-xs text-muted-foreground mb-1">{stage}</p>
                      <p className="text-xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">${(value / 1000).toFixed(0)}K</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Investments Tab */}
        <TabsContent value="investments" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Coins className="w-5 h-5 text-secondary" />
                Investment Portfolio
              </CardTitle>
              <CardDescription>Strategic investments, equity stakes, and capital deployments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-2xl font-bold">${(totalInvestments / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Total Invested</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-emerald-900/20' : 'bg-emerald-50')}>
                  <p className="text-2xl font-bold text-emerald-500">${(investments.reduce((sum, inv) => sum + inv.currentValuation, 0) / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Current Valuation</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50')}>
                  <p className="text-2xl font-bold text-blue-500">+${(investments.reduce((sum, inv) => sum + inv.unrealizedGain, 0) / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-muted-foreground">Unrealized Gains</p>
                </div>
                <div className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-50')}>
                  <p className="text-2xl font-bold text-purple-500">{investments.length}</p>
                  <p className="text-xs text-muted-foreground">Active Positions</p>
                </div>
              </div>
              <div className="space-y-4">
                {investments.map((inv) => (
                  <div key={inv.id} className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50')}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{inv.name}</h4>
                          <Badge variant="outline">{inv.category}</Badge>
                          <Badge className="bg-blue-500/10 text-blue-500">{inv.stage}</Badge>
                          <Badge variant="secondary">{inv.sector}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{inv.notes}</p>
                      </div>
                      <div className="text-right">
                        {inv.equityPercentage > 0 && (
                          <p className="font-bold text-lg">{inv.equityPercentage}%</p>
                        )}
                        <p className="text-xs text-muted-foreground">Equity</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-5 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Invested</p>
                        <p className="font-medium">${(inv.investmentAmount / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Current Value</p>
                        <p className="font-medium">${(inv.currentValuation / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unrealized P&L</p>
                        <p className={cn('font-medium', inv.unrealizedGain >= 0 ? 'text-emerald-500' : 'text-red-500')}>
                          {inv.unrealizedGain >= 0 ? '+' : ''}{((inv.unrealizedGain / inv.investmentAmount) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Key Contact</p>
                        <p className="font-medium">{inv.keyContact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Investment Date</p>
                        <p className="font-medium">{inv.investmentDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <span className="text-xs text-muted-foreground">Exit: </span>
                        <span className="text-sm">{inv.exitStrategy}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Next: {inv.nextMilestone}</span>
                        <Button size="sm" variant="outline" data-testid={`button-investment-${inv.id}`}>Details</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6 mt-6">
          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Network className="w-5 h-5 text-secondary" />
                Strategic Network & Relationships
              </CardTitle>
              <CardDescription>Key contacts, referral partners, and relationship capital</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Individuals', count: networkRelationships.filter(n => n.type === 'individual').length, icon: CircleUser, iconClass: 'text-blue-500' },
                  { label: 'Institutions', count: networkRelationships.filter(n => n.type === 'institution').length, icon: Landmark, iconClass: 'text-purple-500' },
                  { label: 'Organizations', count: networkRelationships.filter(n => n.type === 'organization').length, icon: Building2, iconClass: 'text-emerald-500' },
                  { label: 'High Value', count: networkRelationships.filter(n => n.value === 'High').length, icon: Star, iconClass: 'text-amber-500' },
                ].map((stat) => (
                  <div key={stat.label} className={cn('p-4 rounded-lg text-center', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                    <stat.icon className={cn('w-6 h-6 mx-auto mb-2', stat.iconClass)} />
                    <p className="text-2xl font-bold">{stat.count}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {networkRelationships.map((rel) => (
                  <div key={rel.id} className={cn('p-4 rounded-lg border-l-4',
                    rel.strength >= 85 ? 'border-emerald-500' : rel.strength >= 70 ? 'border-blue-500' : 'border-amber-500',
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  )}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{rel.name}</h4>
                          <Badge variant="outline">{rel.type}</Badge>
                          <Badge variant="secondary">{rel.category}</Badge>
                          <Badge className={cn(
                            rel.value === 'High' && 'bg-emerald-500/10 text-emerald-500',
                            rel.value === 'Medium' && 'bg-blue-500/10 text-blue-500'
                          )}>{rel.value} Value</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rel.notes}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Strength:</span>
                          <span className={cn('font-bold text-lg', rel.strength >= 85 ? 'text-emerald-500' : rel.strength >= 70 ? 'text-blue-500' : 'text-amber-500')}>{rel.strength}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Relationship</p>
                        <p className="font-medium">{rel.relationship}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Contact Frequency</p>
                        <p className="font-medium">{rel.frequency}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Last Contact</p>
                        <p className="font-medium">{rel.lastContact}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Linked To</p>
                        <div className="flex flex-wrap gap-1">
                          {rel.linkedTo.slice(0, 2).map((link, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{link}</Badge>
                          ))}
                          {rel.linkedTo.length > 2 && <Badge variant="outline" className="text-xs">+{rel.linkedTo.length - 2}</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {rel.connections.map((conn, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{conn}</Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" data-testid={`button-contact-${rel.id}`}>Contact</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Layers className="w-5 h-5 text-secondary" />
                Network Health Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-sm font-medium mb-3">Relationship Strength Distribution</p>
                  <div className="space-y-2">
                    {[
                      { label: 'Strong (85+)', count: networkRelationships.filter(r => r.strength >= 85).length, badgeClass: 'bg-emerald-500/10 text-emerald-500' },
                      { label: 'Good (70-84)', count: networkRelationships.filter(r => r.strength >= 70 && r.strength < 85).length, badgeClass: 'bg-blue-500/10 text-blue-500' },
                      { label: 'Developing (<70)', count: networkRelationships.filter(r => r.strength < 70).length, badgeClass: 'bg-amber-500/10 text-amber-500' },
                    ].map((tier) => (
                      <div key={tier.label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{tier.label}</span>
                        <Badge className={tier.badgeClass}>{tier.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-sm font-medium mb-3">Contact Frequency Status</p>
                  <div className="space-y-2">
                    {[
                      { label: 'On Schedule', count: 4, badgeClass: 'bg-emerald-500/10 text-emerald-500' },
                      { label: 'Due Soon', count: 1, badgeClass: 'bg-amber-500/10 text-amber-500' },
                      { label: 'Overdue', count: 1, badgeClass: 'bg-red-500/10 text-red-500' },
                    ].map((status) => (
                      <div key={status.label} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">{status.label}</span>
                        <Badge className={status.badgeClass}>{status.count}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={cn('p-4 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-sm font-medium mb-3">Network Actions</p>
                  <div className="space-y-2">
                    <Button size="sm" className="w-full" variant="outline" data-testid="button-add-contact">
                      <Plus className="w-4 h-4 mr-2" /> Add Contact
                    </Button>
                    <Button size="sm" className="w-full" variant="outline" data-testid="button-schedule-outreach">
                      <Calendar className="w-4 h-4 mr-2" /> Schedule Outreach
                    </Button>
                    <Button size="sm" className="w-full" variant="outline" data-testid="button-network-report">
                      <FileText className="w-4 h-4 mr-2" /> Export Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPartnerModal} onOpenChange={setShowPartnerModal}>
        <DialogContent className={cn("max-w-2xl", theme === 'dark' ? 'bg-gray-800' : '')}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-secondary" />
              {selectedPartner?.name} - Partnership Details
            </DialogTitle>
          </DialogHeader>
          {selectedPartner && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                  <p className={cn("text-xl font-bold", getHealthColor(selectedPartner.healthScore))}>{selectedPartner.healthScore}%</p>
                </div>
                <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-xs text-muted-foreground">Tier</p>
                  <p className="text-xl font-bold">{selectedPartner.tier}</p>
                </div>
                <div className={cn('p-3 rounded-lg', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                  <p className="text-xs text-muted-foreground">Dependency</p>
                  <p className="text-xl font-bold">{selectedPartner.dependencyScore}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Contract Period</p>
                <p className="text-muted-foreground">{selectedPartner.contractStart} to {selectedPartner.contractEnd}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Financial Performance</p>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Premium Volume</p>
                    <p className="font-bold">${(selectedPartner.premium / 1000000).toFixed(2)}M</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="font-bold">${(selectedPartner.commission / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">ROI</p>
                    <p className="font-bold text-emerald-500">{selectedPartner.roi}%</p>
                  </div>
                </div>
              </div>
              {selectedPartner.obligations && selectedPartner.obligations.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2">Contract Obligations</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {selectedPartner.obligations.map((ob: string, i: number) => (
                      <li key={i}>{ob}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-sm font-medium mb-2">Notes</p>
                <p className="text-sm text-muted-foreground">{selectedPartner.notes}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" data-testid="button-partner-renegotiate">Renegotiate Contract</Button>
                <Button variant="outline" className="flex-1" data-testid="button-partner-review">Schedule Review</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function AccessControlView({ theme }: { theme: string }) {
  const [emailList, setEmailList] = useState(emailAccessList);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');
  const [selectedAccess, setSelectedAccess] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = emailList.filter(e =>
    e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addNewEmail = () => {
    if (newEmail && newRole) {
      setEmailList(prev => [...prev, {
        id: Date.now(),
        email: newEmail,
        access: selectedAccess,
        role: newRole,
        status: 'pending'
      }]);
      setNewEmail('');
      setNewRole('');
      setSelectedAccess([]);
    }
  };

  const toggleAccess = (emailId: number, accessId: string) => {
    setEmailList(prev => prev.map(e => {
      if (e.id === emailId) {
        const newAccess = e.access.includes(accessId)
          ? e.access.filter(a => a !== accessId)
          : [...e.access, accessId];
        return { ...e, access: newAccess };
      }
      return e;
    }));
  };

  return (
    <motion.div
      key="access"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-serif font-bold">Access Control Management</h2>
        <p className="text-muted-foreground">Manage email routing and system permissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Users" value={emailList.length.toString()} icon={Users} theme={theme} />
        <MetricCard title="Active" value={emailList.filter(e => e.status === 'active').length.toString()} icon={CheckCircle2} theme={theme} />
        <MetricCard title="Pending" value={emailList.filter(e => e.status === 'pending').length.toString()} icon={Clock} theme={theme} />
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="w-5 h-5 text-secondary" />
                Email Access Directory
              </CardTitle>
              <CardDescription>Control what each user can access</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn('pl-9 w-full md:w-56', theme === 'dark' ? 'bg-gray-700 border-gray-600' : '')}
                data-testid="input-search-access"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Access Permissions</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={cn("divide-y", theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200')}>
                {filteredEmails.map((user) => (
                  <tr key={user.id} className="text-sm">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-secondary" />
                        <span className="font-medium">{user.email}</span>
                      </div>
                    </td>
                    <td className="py-3">{user.role}</td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {accessOptions.slice(0, 4).map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => toggleAccess(user.id, opt.id)}
                            className={cn(
                              'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
                              user.access.includes(opt.id)
                                ? 'bg-violet-100 text-secondary border border-secondary/30'
                                : theme === 'dark' ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-500 border border-gray-200'
                            )}
                            data-testid={`toggle-access-${user.id}-${opt.id}`}
                          >
                            {user.access.includes(opt.id) ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <Badge className={cn(
                        user.status === 'active' && 'bg-emerald-500/10 text-emerald-500',
                        user.status === 'pending' && 'bg-amber-500/10 text-amber-500'
                      )}>
                        {user.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserPlus className="w-5 h-5 text-secondary" />
            Add New User
          </CardTitle>
          <CardDescription>Grant access to new team members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input
                placeholder="user@goldcoast.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''}
                data-testid="input-new-email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className={theme === 'dark' ? 'bg-gray-700 border-gray-600' : ''} data-testid="select-new-role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Senior Agent">Senior Agent</SelectItem>
                  <SelectItem value="Team Lead">Team Lead</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="Admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Initial Access</label>
              <div className="flex flex-wrap gap-1.5">
                {accessOptions.slice(0, 3).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedAccess(prev =>
                      prev.includes(opt.id) ? prev.filter(a => a !== opt.id) : [...prev, opt.id]
                    )}
                    className={cn(
                      'flex items-center gap-1 px-2 py-1 rounded text-xs transition-all',
                      selectedAccess.includes(opt.id)
                        ? 'bg-violet-100 text-secondary border border-secondary/30'
                        : theme === 'dark' ? 'bg-gray-700 text-gray-400 border border-gray-600' : 'bg-gray-100 text-gray-500 border border-gray-200'
                    )}
                    data-testid={`toggle-new-access-${opt.id}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={addNewEmail}
              disabled={!newEmail || !newRole}
              className="gap-2 bg-secondary hover:bg-secondary/90 text-white"
              data-testid="button-add-user"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-secondary" />
              Access Audit Log
            </CardTitle>
            <CardDescription>Recent permission changes and access events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: 'Permission granted', user: 'sarah@goldcoastfnl.com', detail: 'Added Financial Reports access', time: '2 hours ago', icon: Unlock, color: 'text-emerald-500' },
                { action: 'Login detected', user: 'james@goldcoastfnl.com', detail: 'New device: MacBook Pro (Chicago, IL)', time: '5 hours ago', icon: Globe, color: 'text-blue-500' },
                { action: 'Permission revoked', user: 'former.agent@goldcoastfnl.com', detail: 'All access removed - offboarding', time: '1 day ago', icon: Lock, color: 'text-red-500' },
                { action: 'Role changed', user: 'michael@goldcoastfnl.com', detail: 'Promoted: Agent → Senior Agent', time: '2 days ago', icon: Award, color: 'text-secondary' },
                { action: 'Failed login attempt', user: 'unknown@external.com', detail: 'IP: 192.168.1.45 - blocked', time: '3 days ago', icon: AlertTriangle, color: 'text-amber-500' },
              ].map((log, i) => {
                const LogIcon = log.icon;
                return (
                  <div key={i} className={cn('flex items-start gap-3 p-2 rounded', theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50')}>
                    <div className={cn('p-1.5 rounded', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100')}>
                      <LogIcon className={cn('w-4 h-4', log.color)} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.action}</p>
                      <p className="text-xs text-muted-foreground">{log.user}</p>
                      <p className="text-xs text-muted-foreground">{log.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{log.time}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-secondary" />
              Governance & Compliance
            </CardTitle>
            <CardDescription>Security policy status and attestations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { policy: 'Password Policy', status: 'compliant', lastCheck: 'Today', details: 'All users meet 12+ char requirement' },
              { policy: 'Two-Factor Auth', status: 'partial', lastCheck: 'Today', details: '8 of 12 users enabled (67%)' },
              { policy: 'Access Review', status: 'compliant', lastCheck: 'Dec 28, 2025', details: 'Quarterly review completed' },
              { policy: 'Data Encryption', status: 'compliant', lastCheck: 'Today', details: 'AES-256 on all sensitive data' },
              { policy: 'Session Timeout', status: 'compliant', lastCheck: 'Today', details: '30-minute idle timeout active' },
            ].map((item) => (
              <div key={item.policy} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{item.policy}</p>
                  <p className="text-xs text-muted-foreground">{item.details}</p>
                </div>
                <div className="text-right">
                  <Badge className={cn(
                    item.status === 'compliant' && 'bg-emerald-500/10 text-emerald-500',
                    item.status === 'partial' && 'bg-amber-500/10 text-amber-500',
                    item.status === 'non_compliant' && 'bg-red-500/10 text-red-500'
                  )}>
                    {item.status === 'compliant' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {item.status === 'partial' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {item.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{item.lastCheck}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className={cn(theme === 'dark' ? 'bg-gray-800 border-gray-700' : '')}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-secondary" />
            Privilege Drift Alerts
          </CardTitle>
          <CardDescription>Unusual permission patterns detected</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { alert: 'Excessive permissions detected', user: 'temp.contractor@goldcoastfnl.com', detail: 'User has admin access despite "Contractor" role', severity: 'high', action: 'Review & Adjust' },
              { alert: 'Dormant account with access', user: 'inactive.user@goldcoastfnl.com', detail: 'No login in 45 days, still has CRM access', severity: 'medium', action: 'Disable Account' },
            ].map((item, i) => (
              <div key={i} className={cn('p-3 rounded-lg border-l-4', theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100', item.severity === 'high' ? 'border-red-500' : 'border-amber-500')}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={cn('w-4 h-4', item.severity === 'high' ? 'text-red-500' : 'text-amber-500')} />
                      <p className="font-medium text-sm">{item.alert}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{item.user}</p>
                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                  </div>
                  <Button size="sm" variant="outline" data-testid={`button-privilege-action-${i}`}>
                    {item.action}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
