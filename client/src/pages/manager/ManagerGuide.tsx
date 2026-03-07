/**
 * Manager Guide
 * Comprehensive guide for Heritage Life managers — team management,
 * performance reviews, escalation procedures, override structure,
 * compliance oversight, and downloadable documents.
 *
 * Heritage Design System — Emerald theme
 * Pattern: AgentGuidelines.tsx adapted for managers
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ManagerLoungeLayout } from './ManagerLoungeLayout';
import { ManagerPageHero } from './primitives';
import { glassCard, MANAGER_ICON_GRADIENT } from './managerConstants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  RADIUS,
  TYPE,
  GRID,
  SHADOW,
  MOTION,
  COLORS,
  LAYOUT,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  BookOpen,
  Users,
  Target,
  Shield,
  DollarSign,
  FileText,
  Download,
  CheckCircle2,
  AlertTriangle,
  Star,
  Clock,
  TrendingUp,
  Award,
  Briefcase,
  Heart,
  Sparkles,
  Phone,
  Mail,
  ClipboardList,
  BarChart3,
} from 'lucide-react';

/* ── Icon Helper ──────────────────────────────────────── */

function SectionIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
    >
      <Icon className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
    </div>
  );
}

/* ── Constants ─────────────────────────────────────────── */

const CORE_PRINCIPLES = [
  {
    icon: Heart,
    title: 'Lead by Example',
    description: 'Set the standard for your team. Your work ethic, attitude, and professionalism define the culture.',
  },
  {
    icon: Users,
    title: 'Develop Your People',
    description: 'Your success is measured by how many agents you elevate. Invest time in coaching and mentorship.',
  },
  {
    icon: Shield,
    title: 'Protect the Culture',
    description: 'Maintain Heritage Life standards. Address issues early and hold your team accountable with respect.',
  },
  {
    icon: Target,
    title: 'Drive Results',
    description: 'Balance team development with production targets. Hit your numbers while building a sustainable team.',
  },
];

const DAILY_RESPONSIBILITIES = [
  { task: 'Morning huddle with team', detail: 'Set daily goals, review pipeline, motivate', icon: Clock },
  { task: 'Monitor team activity', detail: 'Track dials, appointments, and submissions in real-time', icon: BarChart3 },
  { task: 'Conduct 2+ coaching sessions', detail: 'Sit with agents, listen to calls, provide real-time feedback', icon: Users },
  { task: 'Review escalations', detail: 'Address client issues, compliance flags, and agent concerns', icon: AlertTriangle },
  { task: 'Pipeline review', detail: 'Check pending applications, follow up on stalled deals', icon: Target },
  { task: 'End-of-day debrief', detail: 'Celebrate wins, identify areas for improvement, set next-day priorities', icon: Star },
];

const WEEKLY_RESPONSIBILITIES = [
  { task: 'Weekly 1:1s with each agent', detail: 'Review performance, set goals, address concerns' },
  { task: 'Team performance report', detail: 'Compile and review weekly AP, close rates, and activity metrics' },
  { task: 'Training session', detail: 'Lead or assign at least one team training per week' },
  { task: 'Pipeline deep-dive', detail: 'Review all deals in progress with each agent' },
  { task: 'Recruiting call block', detail: 'Dedicate 2+ hours to recruitment and interviews' },
];

const PERFORMANCE_METRICS = [
  { metric: 'Team AP Target', target: '$50,000/month', description: 'Combined annual premium for your team' },
  { metric: 'Agent Retention', target: '85%+', description: '12-month retention rate for onboarded agents' },
  { metric: 'Avg Agent Production', target: '$6,250/month', description: 'Per-agent monthly AP average' },
  { metric: 'Coaching Hours', target: '10+ hrs/week', description: 'Time spent in direct coaching sessions' },
  { metric: 'Placement Ratio', target: '70%+', description: 'Submitted applications that issue successfully' },
  { metric: 'Compliance Score', target: '95%+', description: 'Team compliance audit pass rate' },
];

const OVERRIDE_STRUCTURE = [
  { level: 'Direct Override', rate: '10%', description: 'On all directly managed agent production', requirement: null },
  { level: 'Second-Line Override', rate: '5%', description: 'On sub-team agent production', requirement: '10+ active agents' },
  { level: 'Agency Bonus', rate: '3%', description: 'On total agency production above target', requirement: '$100K+ monthly team AP' },
  { level: 'Recruitment Bonus', rate: '$500', description: 'Per new agent who reaches $5K AP in first 90 days', requirement: null },
  { level: 'Retention Bonus', rate: '$250', description: 'Per agent retained past 12 months', requirement: '85%+ retention rate' },
];

const ESCALATION_PROCEDURES = [
  {
    category: 'Client Complaints',
    steps: [
      'Acknowledge the complaint within 2 hours',
      'Document all details in the CRM with notes',
      'Attempt resolution with the client directly',
      'If unresolved, escalate to Director within 24 hours',
      'Follow up with client within 48 hours of resolution',
    ],
  },
  {
    category: 'Compliance Violations',
    steps: [
      'Document the violation immediately',
      'Remove agent from active sales if severity warrants',
      'Report to Compliance Officer within 4 hours',
      'Conduct corrective action meeting with agent',
      'File formal incident report within 24 hours',
    ],
  },
  {
    category: 'Agent Performance Issues',
    steps: [
      'Track underperformance for 2 consecutive weeks',
      'Conduct private coaching conversation',
      'Create a Performance Improvement Plan (PIP)',
      'Weekly check-ins during PIP period (30 days)',
      'If no improvement, escalate to Director for review',
    ],
  },
];

const COMPLIANCE_OVERSIGHT = [
  {
    area: 'Sales Practices',
    checks: [
      'Review 3+ recorded calls per agent weekly',
      'Verify all quotes match carrier guidelines',
      'Ensure proper disclosure on every sale',
      'Monitor for unauthorized product recommendations',
    ],
  },
  {
    area: 'Documentation',
    checks: [
      'Audit CRM entries for completeness weekly',
      'Verify all applications are properly signed',
      'Ensure needs analysis is documented per client',
      'Check that all communications are logged',
    ],
  },
  {
    area: 'Licensing & Training',
    checks: [
      'Track certification expiration dates',
      'Ensure CE credits are current for all agents',
      'Verify state appointments before agent sells',
      'Monitor training module completion rates',
    ],
  },
];

const DOCUMENTS = [
  { title: 'Manager Handbook', size: '3.2 MB', type: 'PDF' },
  { title: 'Override & Compensation Guide', size: '1.5 MB', type: 'PDF' },
  { title: 'Performance Review Template', size: '800 KB', type: 'PDF' },
  { title: 'Escalation Procedure Manual', size: '1.1 MB', type: 'PDF' },
  { title: 'Recruiting Playbook', size: '2.4 MB', type: 'PDF' },
  { title: 'Compliance Oversight Checklist', size: '600 KB', type: 'PDF' },
];

/* ── Component ─────────────────────────────────────────── */

export default function ManagerGuide() {
  const [activeTab, setActiveTab] = useState('principles');
  const [acknowledged, setAcknowledged] = useState(false);
  const cardStyle = { ...glassCard, borderRadius: RADIUS.card, boxShadow: SHADOW.card };

  const handleDownload = (docTitle: string) => {
    toast.success('Download started', { description: docTitle });
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    toast.success('Manager Guide acknowledged', { description: 'Thank you for reviewing management standards' });
  };

  return (
    <ManagerLoungeLayout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
      >
        {/* Hero */}
        <motion.div variants={fadeInUp}>
          <ManagerPageHero
            icon={BookOpen}
            title="Manager Guide"
            subtitle="Standards, responsibilities, and best practices for Heritage Life managers"
          >
            {acknowledged ? (
              <Badge
                className="bg-emerald-500/20 text-emerald-200 border-0 px-4 py-2 backdrop-blur"
                style={{ borderRadius: RADIUS.pill }}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acknowledged
              </Badge>
            ) : (
              <Button
                onClick={handleAcknowledge}
                className="bg-white/20 backdrop-blur text-white border-0 hover:bg-white/30 transition-colors"
                style={{ borderRadius: RADIUS.button }}
              >
                Acknowledge Guide
              </Button>
            )}
          </ManagerPageHero>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className="mb-4 flex-wrap h-auto gap-1 p-1"
              style={{ backgroundColor: COLORS.gray[100], borderRadius: RADIUS.button }}
            >
              {[
                { value: 'principles', icon: Heart, label: 'Principles' },
                { value: 'responsibilities', icon: ClipboardList, label: 'Responsibilities' },
                { value: 'performance', icon: TrendingUp, label: 'Performance' },
                { value: 'escalations', icon: AlertTriangle, label: 'Escalations' },
                { value: 'compliance', icon: Shield, label: 'Compliance' },
                { value: 'documents', icon: FileText, label: 'Documents' },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="gap-2 data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm text-gray-500 hover:text-gray-700"
                  style={{ borderRadius: RADIUS.button }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Principles Tab ─────────────────────────────── */}
            <TabsContent value="principles" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              <motion.div
                className="grid md:grid-cols-2"
                style={{ gap: GRID.spacing.md }}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {CORE_PRINCIPLES.map((value) => (
                  <motion.div key={value.title} variants={fadeInUp}>
                    <Card
                      className={`overflow-hidden relative bg-gradient-to-br ${MANAGER_ICON_GRADIENT} h-full`}
                      style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
                    >
                      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
                      <div className="absolute -bottom-3 -left-3 w-14 h-14 bg-amber-400/15 rounded-full blur-lg" />
                      <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                        <div
                          className="flex items-center justify-center bg-white/20 backdrop-blur mb-4"
                          style={{ width: 48, height: 48, borderRadius: RADIUS.button }}
                        >
                          <value.icon className="text-amber-200" style={{ width: 24, height: 24 }} />
                        </div>
                        <h3 className="font-semibold text-white mb-2" style={{ fontSize: TYPE.title }}>{value.title}</h3>
                        <p className="text-white/80" style={{ fontSize: TYPE.meta }}>{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Mission card */}
              <motion.div variants={fadeInUp}>
                <Card className="overflow-hidden" style={cardStyle}>
                  <CardContent style={{ padding: GRID.spacing.md }}>
                    <div className="flex items-start" style={{ gap: GRID.spacing.md }}>
                      <SectionIcon icon={Award} />
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2" style={{ fontSize: TYPE.title }}>Your Mission as a Manager</h3>
                        <p className="text-gray-600" style={{ fontSize: TYPE.meta }}>
                          Build and lead a high-performing team of insurance professionals who protect families
                          across America. Your role is to recruit, train, coach, and retain agents while driving
                          production and maintaining Heritage Life's standards of excellence and compliance.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* ── Responsibilities Tab ───────────────────────── */}
            <TabsContent value="responsibilities" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              {/* Daily */}
              <Card className="overflow-hidden" style={cardStyle}>
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <SectionIcon icon={Clock} />
                    <div>
                      <span className="text-gray-900">Daily Responsibilities</span>
                      <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                        What's expected of every Heritage Life manager, every day
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div className="divide-y divide-gray-100">
                    {DAILY_RESPONSIBILITIES.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center hover:bg-emerald-50/40 transition-colors"
                        style={{ gap: GRID.spacing.sm, padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button }}
                      >
                        <div
                          className={`flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                          style={{ width: 36, height: 36, borderRadius: RADIUS.button }}
                        >
                          <item.icon className="text-amber-200" style={{ width: 16, height: 16 }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{item.task}</p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Weekly */}
              <Card className="overflow-hidden" style={cardStyle}>
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <SectionIcon icon={ClipboardList} />
                    <div>
                      <span className="text-gray-900">Weekly Responsibilities</span>
                      <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                        Recurring tasks to complete each week
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div className="divide-y divide-gray-100">
                    {WEEKLY_RESPONSIBILITIES.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start hover:bg-emerald-50/40 transition-colors"
                        style={{ gap: GRID.spacing.sm, padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button }}
                      >
                        <div
                          className={`flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                          style={{ width: 36, height: 36, borderRadius: RADIUS.button }}
                        >
                          <CheckCircle2 className="text-amber-200" style={{ width: 16, height: 16 }} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{item.task}</p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{item.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Performance Tab ────────────────────────────── */}
            <TabsContent value="performance" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              {/* KPIs */}
              <Card className="overflow-hidden" style={cardStyle}>
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <SectionIcon icon={TrendingUp} />
                    <div>
                      <span className="text-gray-900">Key Performance Metrics</span>
                      <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                        Targets that define manager success
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div className="divide-y divide-gray-100">
                    {PERFORMANCE_METRICS.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between hover:bg-emerald-50/40 transition-colors"
                        style={{ padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button }}
                      >
                        <div className="flex items-center" style={{ gap: GRID.spacing.sm }}>
                          <div
                            className={`flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                            style={{ width: 36, height: 36, borderRadius: RADIUS.button }}
                          >
                            <Star className="text-amber-200" style={{ width: 16, height: 16 }} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{item.metric}</p>
                            <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{item.description}</p>
                          </div>
                        </div>
                        <Badge
                          className="bg-emerald-100 text-emerald-700 border-0 font-bold px-3"
                          style={{ borderRadius: RADIUS.pill, fontSize: TYPE.meta }}
                        >
                          {item.target}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Override Structure */}
              <Card
                className={`overflow-hidden relative bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-amber-400/15 rounded-full blur-lg" />
                <CardHeader className="relative z-10" style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <div
                      className="flex items-center justify-center bg-white/20 backdrop-blur"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <DollarSign className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <span className="text-white">Override & Bonus Structure</span>
                      <p className="text-white/60 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                        How manager compensation works
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10" style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.sm }}>
                    {OVERRIDE_STRUCTURE.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white/10 backdrop-blur"
                        style={{ padding: GRID.spacing.sm, borderRadius: RADIUS.button }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white" style={{ fontSize: TYPE.meta }}>{item.level}</span>
                          <Badge
                            className="bg-amber-400/20 text-amber-200 border-0 font-bold"
                            style={{ borderRadius: RADIUS.pill, fontSize: TYPE.meta }}
                          >
                            {item.rate}
                          </Badge>
                        </div>
                        <p className="text-white/80" style={{ fontSize: TYPE.caption }}>{item.description}</p>
                        {item.requirement && (
                          <p className="text-amber-200/80 mt-1" style={{ fontSize: TYPE.micro }}>
                            Requires: {item.requirement}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Escalations Tab ────────────────────────────── */}
            <TabsContent value="escalations" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              {/* Warning banner */}
              <Card
                className={`overflow-hidden relative bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                  <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-white/20 backdrop-blur flex-shrink-0"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <AlertTriangle className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white" style={{ fontSize: TYPE.title }}>How to Handle Issues</h4>
                      <p className="text-white/80 mt-1" style={{ fontSize: TYPE.meta }}>
                        Follow these procedures exactly. Improper escalation handling can result in compliance violations,
                        client loss, and regulatory action. When in doubt, escalate up — never ignore.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Escalation procedures */}
              <div className="grid md:grid-cols-3" style={{ gap: GRID.spacing.md }}>
                {ESCALATION_PROCEDURES.map((section) => (
                  <Card key={section.category} className="overflow-hidden h-full" style={cardStyle}>
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <SectionIcon icon={AlertTriangle} />
                        <span className="text-gray-900">{section.category}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <ol style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {section.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start" style={{ gap: GRID.spacing.xs }}>
                            <div
                              className={`flex items-center justify-center flex-shrink-0 text-xs font-bold bg-gradient-to-br ${MANAGER_ICON_GRADIENT} text-white`}
                              style={{ width: 22, height: 22, borderRadius: RADIUS.pill, marginTop: 1 }}
                            >
                              {idx + 1}
                            </div>
                            <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* ── Compliance Tab ──────────────────────────────── */}
            <TabsContent value="compliance" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              {/* Non-negotiable banner */}
              <Card
                className={`overflow-hidden relative bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                style={{ borderRadius: RADIUS.card, boxShadow: SHADOW.card }}
              >
                <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl" />
                <CardContent className="relative z-10" style={{ padding: GRID.spacing.md }}>
                  <div className="flex items-start" style={{ gap: GRID.spacing.sm }}>
                    <div
                      className="flex items-center justify-center bg-white/20 backdrop-blur flex-shrink-0"
                      style={{ width: 40, height: 40, borderRadius: RADIUS.button }}
                    >
                      <Shield className="text-amber-200" style={{ width: LAYOUT.icon.md, height: LAYOUT.icon.md }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white" style={{ fontSize: TYPE.title }}>Compliance Responsibilities</h4>
                      <p className="text-white/80 mt-1" style={{ fontSize: TYPE.meta }}>
                        As a manager, you are personally responsible for your team's compliance.
                        Failure to detect and address violations can result in personal liability
                        and regulatory sanctions.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compliance areas */}
              <div className="grid md:grid-cols-3" style={{ gap: GRID.spacing.md }}>
                {COMPLIANCE_OVERSIGHT.map((section) => (
                  <Card key={section.area} className="overflow-hidden h-full" style={cardStyle}>
                    <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                      <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                        <SectionIcon icon={Shield} />
                        <span className="text-gray-900">{section.area}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                      <ul style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.xs }}>
                        {section.checks.map((check, idx) => (
                          <li key={idx} className="flex items-start" style={{ gap: GRID.spacing.xs }}>
                            <CheckCircle2 className="text-emerald-600 flex-shrink-0" style={{ width: 16, height: 16, marginTop: 2 }} />
                            <span className="text-gray-700" style={{ fontSize: TYPE.meta }}>{check}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Need Help */}
              <Card className="overflow-hidden" style={cardStyle}>
                <CardContent style={{ padding: GRID.spacing.md }}>
                  <h4 className="font-semibold text-gray-900 mb-3" style={{ fontSize: TYPE.title }}>Need Compliance Help?</h4>
                  <div className="flex flex-wrap" style={{ gap: GRID.spacing.sm }}>
                    <Button
                      className={`gap-2 text-white border-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                      style={{ borderRadius: RADIUS.button }}
                      asChild
                    >
                      <a href="tel:6307780800">
                        <Phone className="w-4 h-4" />
                        (630) 778-0800
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      style={{ borderRadius: RADIUS.button }}
                      asChild
                    >
                      <a href="mailto:compliance@heritagels.org">
                        <Mail className="w-4 h-4" />
                        compliance@heritagels.org
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── Documents Tab ───────────────────────────────── */}
            <TabsContent value="documents" style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}>
              <Card className="overflow-hidden" style={cardStyle}>
                <CardHeader style={{ padding: GRID.spacing.md, paddingBottom: 12 }}>
                  <CardTitle className="font-semibold flex items-center gap-3" style={{ fontSize: TYPE.title }}>
                    <SectionIcon icon={FileText} />
                    <div>
                      <span className="text-gray-900">Documents</span>
                      <p className="text-gray-500 font-normal" style={{ fontSize: TYPE.caption, marginTop: 2 }}>
                        Official documents and guides for Heritage Life managers
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: GRID.spacing.md, paddingTop: 0 }}>
                  <div className="divide-y divide-gray-100">
                    {DOCUMENTS.map((doc) => (
                      <button
                        key={doc.title}
                        className="w-full flex items-center hover:bg-emerald-50/40 transition-colors text-left"
                        onClick={() => handleDownload(doc.title)}
                        style={{ gap: GRID.spacing.sm, padding: `${GRID.spacing.sm}px ${GRID.spacing.xs}px`, borderRadius: RADIUS.button }}
                      >
                        <div
                          className={`flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${MANAGER_ICON_GRADIENT}`}
                          style={{ width: 36, height: 36, borderRadius: RADIUS.button }}
                        >
                          <FileText className="text-amber-200" style={{ width: 16, height: 16 }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>{doc.title}</p>
                          <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>{doc.type} · {doc.size}</p>
                        </div>
                        <div
                          className="flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 transition-colors"
                          style={{ width: 32, height: 32, borderRadius: RADIUS.button }}
                        >
                          <Download className="text-emerald-600" style={{ width: 16, height: 16 }} />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </ManagerLoungeLayout>
  );
}
