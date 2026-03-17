/**
 * Executive Lounge Access Control
 * Manage member approvals, lounge access, and promotions
 * Heritage Design System — Orange/Blood Orange/Gold theme
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ExecutiveLoungeLayout } from './ExecutiveLoungeLayout';
import { ExecutivePageHero } from './primitives/ExecutivePageHero';
import { ExecutiveStatCard, ExecutiveStatCardGrid } from './primitives/ExecutiveStatCard';
import { ExecutiveTabSection, TabsContent } from './primitives/ExecutiveTabSection';
import { ExecutiveFilterBar } from './primitives/ExecutiveFilterBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  GRID,
  TYPE,
  RADIUS,
  SHADOW,
  COLORS,
  GLASS,
  fadeInUp,
  staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  EXECUTIVE_GRADIENT_CSS,
  LOUNGES,
  ROLE_DISPLAY,
  ACTION_TYPE_COLORS,
  fmtCurrency,
} from './executiveConstants';
import { toast } from 'sonner';
import {
  ShieldCheck,
  UserCheck,
  Users,
  TrendingUp,
  Layers,
  X,
  CheckCircle,
  XCircle,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  AlertTriangle,
  ArrowUpRight,
  UserCog,
  Crown,
  Eye,
  FileText,
  Download,
  GraduationCap,
  BookOpen,
  Building2,
  Shield,
  CreditCard,
  Upload,
  type LucideIcon,
} from 'lucide-react';

// ─── API HELPERS ───
async function fetchJSON(url: string) {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function postJSON(url: string, body: Record<string, unknown>) {
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// ─── TYPES ───
interface PendingRegistration {
  profile_id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_licensed: boolean;
  license_number: string | null;
  licensed_states: string[] | null;
  years_experience: number | null;
  previous_agency: string | null;
  npn: string | null;
  why_join_heritage: string | null;
  referral_source: string | null;
  referring_agent_name: string | null;
  street_address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  date_of_birth: string | null;
  applied_at: string;
}

interface Member {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
  approval_status: string | null;
  is_licensed: boolean | null;
  years_experience: number | null;
  hierarchy_level: number | null;
  hierarchy_title: string | null;
}

interface HistoryEntry {
  id: string;
  target_user_id: string;
  performed_by: string;
  action_type: string;
  previous_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  email_sent: boolean;
  created_at: string;
  target_first_name: string;
  target_last_name: string;
  target_email: string;
  performer_first_name: string;
  performer_last_name: string;
}

interface LoungeAccessEntry {
  lounge_key: string;
  granted: boolean;
}

interface OnboardingProfile {
  onboarding_type: 'licensed' | 'new_agent' | null;
  onboarding_step: number;
  onboarding_completed_at: string | null;
  ssn_masked: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  bank_name: string | null;
  bank_account_type: string | null;
  routing_number_masked: string | null;
  account_number_masked: string | null;
  license_expiration_date: string | null;
  eo_provider: string | null;
  eo_policy_number: string | null;
  eo_effective_date: string | null;
  eo_expiration_date: string | null;
  eo_certificate_s3_key: string | null;
  aml_certificate_s3_key: string | null;
  drivers_license_s3_key: string | null;
  has_felony: boolean;
  felony_details: string | null;
  has_bankruptcy: boolean;
  bankruptcy_details: string | null;
  has_misdemeanor: boolean;
  misdemeanor_details: string | null;
  docusign_nda_signed: boolean;
  docusign_nda_s3_key?: string;
  docusign_debt_rollup_signed: boolean;
  docusign_debt_rollup_s3_key?: string;
  docusign_compliance_signed: boolean;
  docusign_compliance_s3_key?: string;
  highest_education: string | null;
  previous_sales_experience: string | null;
  previous_industry: string | null;
  learning_style: string | null;
  weekly_study_hours: number | null;
  target_exam_date: string | null;
  mentor_id: string | null;
  can_commit_in_person: boolean | null;
  can_commit_scheduled_online: boolean | null;
}

// ─── SECTION HEADER ───
function SectionHeader({ icon: Icon, title, subtitle }: { icon: LucideIcon; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        style={{
          width: 40, height: 40, borderRadius: RADIUS.pill,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.10) 100%)',
          backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: '#ea580c' }} />
      </div>
      <div>
        <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>{title}</h3>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>{subtitle}</p>
      </div>
    </div>
  );
}

// ─── ROLE BADGE ───
function RoleBadge({ role }: { role: string }) {
  const display = ROLE_DISPLAY[role] || { label: role, color: '#94a3b8' };
  return (
    <span
      className="inline-flex items-center font-semibold px-2.5 py-0.5"
      style={{
        fontSize: TYPE.micro,
        borderRadius: RADIUS.pill,
        backgroundColor: `${display.color}15`,
        color: display.color,
      }}
    >
      {display.label}
    </span>
  );
}

// ─── STATUS DOT ───
function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        style={{
          width: 8, height: 8, borderRadius: 9999,
          backgroundColor: active ? '#10b981' : '#94a3b8',
        }}
      />
      <span style={{ fontSize: TYPE.caption, color: active ? '#10b981' : '#94a3b8', fontWeight: 500 }}>
        {active ? 'Active' : 'Inactive'}
      </span>
    </span>
  );
}

// ─── ACTION BADGE ───
function ActionBadge({ actionType }: { actionType: string }) {
  const colors = ACTION_TYPE_COLORS[actionType] || { bg: 'bg-gray-50', text: 'text-gray-700' };
  const label = actionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <span className={`inline-flex items-center font-medium px-2 py-0.5 ${colors.bg} ${colors.text}`}
      style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill }}>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export function ExecutiveLoungeAccess() {
  const queryClient = useQueryClient();

  // ─── STATE ───
  const [selectedRegistration, setSelectedRegistration] = useState<PendingRegistration | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [drawerMode, setDrawerMode] = useState<'registration' | 'member' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [promoteRole, setPromoteRole] = useState('');
  const [promoteReason, setPromoteReason] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [historyFilter, setHistoryFilter] = useState('All');
  const [loungeFilter, setLoungeFilter] = useState<string | null>(null);

  // ─── API QUERIES ───
  const { data: pendingData } = useQuery({
    queryKey: ['pending-registrations'],
    queryFn: () => fetchJSON('/api/admin/pending-registrations'),
    refetchInterval: 30000,
  });

  const { data: membersData } = useQuery({
    queryKey: ['admin-members', roleFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (roleFilter !== 'All') params.set('role', roleFilter.toLowerCase().replace(' ', '_'));
      if (statusFilter === 'Active') params.set('status', 'active');
      if (statusFilter === 'Inactive') params.set('status', 'inactive');
      return fetchJSON(`/api/admin/members?${params}`);
    },
  });

  const { data: historyData } = useQuery({
    queryKey: ['access-history', historyFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (historyFilter !== 'All') params.set('actionType', historyFilter);
      return fetchJSON(`/api/admin/access-history?${params}`);
    },
  });

  // Lounge members query (when a lounge filter is active)
  const { data: loungeMembersData } = useQuery({
    queryKey: ['lounge-members', loungeFilter],
    queryFn: () => fetchJSON(`/api/admin/lounge-members/${loungeFilter}`),
    enabled: !!loungeFilter,
  });

  // Selected member's lounge access
  const { data: memberLoungeAccess, refetch: refetchMemberAccess } = useQuery({
    queryKey: ['member-lounge-access', selectedMember?.id],
    queryFn: () => fetchJSON(`/api/admin/lounge-access/${selectedMember!.id}`),
    enabled: !!selectedMember,
  });

  // Selected member's onboarding profile
  const { data: memberOnboarding } = useQuery({
    queryKey: ['member-onboarding', selectedMember?.id],
    queryFn: () => fetchJSON(`/api/admin/member/${selectedMember!.id}/onboarding`),
    enabled: !!selectedMember,
  });

  // ─── MUTATIONS ───
  const loungeToggleMutation = useMutation({
    mutationFn: ({ userId, loungeKey, granted }: { userId: string; loungeKey: string; granted: boolean }) =>
      postJSON('/api/admin/lounge-access/toggle', { userId, loungeKey, granted }),
    onSuccess: (_data, variables) => {
      refetchMemberAccess();
      queryClient.invalidateQueries({ queryKey: ['lounge-members'] });
      queryClient.invalidateQueries({ queryKey: ['access-history'] });
      const lounge = LOUNGES.find(l => l.key === variables.loungeKey);
      toast.success(`${lounge?.name || variables.loungeKey} access ${variables.granted ? 'granted' : 'revoked'}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const approveMutation = useMutation({
    mutationFn: (profileId: string) => postJSON('/api/admin/approve-registration', { profileId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['access-history'] });
      toast.success('Agent approved! Welcome email sent.');
      closeDrawer();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ profileId, reason }: { profileId: string; reason: string }) =>
      postJSON('/api/admin/reject-registration', { profileId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-registrations'] });
      queryClient.invalidateQueries({ queryKey: ['access-history'] });
      toast.success('Application rejected. Notification sent.');
      closeDrawer();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const promoteMutation = useMutation({
    mutationFn: (data: { userId: string; newRole: string; newHierarchyLevel: number; reason: string }) =>
      postJSON('/api/admin/promote', data),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['access-history'] });
      toast.success(`Promoted to ${data.newTitle}! Email sent.`);
      closeDrawer();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deactivateMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      postJSON('/api/admin/deactivate', { userId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-members'] });
      queryClient.invalidateQueries({ queryKey: ['access-history'] });
      toast.success('Account deactivated.');
      closeDrawer();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ─── DERIVED DATA ───
  const pendingRegistrations: PendingRegistration[] = pendingData?.registrations || [];
  const allMembers: Member[] = membersData?.members || [];
  const loungeMembers: Member[] = loungeMembersData?.members || [];
  const members: Member[] = loungeFilter ? loungeMembers : allMembers;
  const history: HistoryEntry[] = historyData?.history || [];
  const pendingCount = pendingRegistrations.length;
  const activeCount = allMembers.filter(m => m.is_active).length;
  const promotionsThisMonth = history.filter(h =>
    h.action_type === 'promoted' &&
    new Date(h.created_at).getMonth() === new Date().getMonth()
  ).length;

  // Resolve lounge access map for selected member
  const memberAccessMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    if (memberLoungeAccess?.access) {
      (memberLoungeAccess.access as LoungeAccessEntry[]).forEach(entry => {
        map[entry.lounge_key] = entry.granted;
      });
    }
    return map;
  }, [memberLoungeAccess]);

  // Parse onboarding data
  const onboarding: OnboardingProfile | null = memberOnboarding?.profile || null;

  // ─── HELPERS ───
  function closeDrawer() {
    setSelectedRegistration(null);
    setSelectedMember(null);
    setDrawerMode(null);
    setRejectReason('');
    setPromoteRole('');
    setPromoteReason('');
  }

  function openRegistrationDrawer(reg: PendingRegistration) {
    setSelectedRegistration(reg);
    setDrawerMode('registration');
  }

  function openMemberDrawer(member: Member) {
    setSelectedMember(member);
    setDrawerMode('member');
  }

  const roleToLevel: Record<string, number> = {
    system_admin: 1,
    manager: 3,
    sales_agent: 5,
    marketing_staff: 4,
    investor: 1,
  };

  // ─── RENDER ───
  return (
    <ExecutiveLoungeLayout>
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
        {/* Hero */}
        <ExecutivePageHero
          icon={ShieldCheck}
          title="Lounge Access Control"
          subtitle="Manage member approvals, access, and promotions across all lounges"
        />

        {/* Stat Cards */}
        <ExecutiveStatCardGrid>
          <ExecutiveStatCard icon={Clock} label="Pending Approvals" value={String(pendingCount)} delta={pendingCount > 0 ? pendingCount : undefined} periodLabel="awaiting review" />
          <ExecutiveStatCard icon={Users} label="Active Members" value={String(activeCount)} periodLabel="internal team" />
          <ExecutiveStatCard icon={TrendingUp} label="Promotions This Month" value={String(promotionsThisMonth)} periodLabel="role changes" />
          <ExecutiveStatCard icon={Layers} label="Total Lounges" value="7" periodLabel="access-controlled" />
        </ExecutiveStatCardGrid>

        {/* Tabs */}
        <ExecutiveTabSection
          defaultValue="approvals"
          tabs={[
            { value: 'approvals', label: 'Approval Queue', icon: UserCheck },
            { value: 'directory', label: 'Member Directory', icon: Users },
            { value: 'access', label: 'Access Control', icon: ShieldCheck },
            { value: 'history', label: 'Activity Log', icon: Clock },
          ]}
        >
          {/* ═══ TAB 1: APPROVAL QUEUE ═══ */}
          <TabsContent value="approvals">
            <motion.div variants={fadeInUp} className="space-y-4 mt-4">
              {pendingRegistrations.length === 0 ? (
                <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <CheckCircle style={{ width: 48, height: 48, color: '#10b981', marginBottom: 16 }} />
                    <h3 style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>All Clear!</h3>
                    <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500], marginTop: 4 }}>No pending applications to review</p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr style={{ backgroundColor: COLORS.gray[50] }}>
                            {['Applicant', 'Email', 'Licensed', 'Experience', 'Applied', 'Actions'].map(h => (
                              <th key={h} className="text-left font-medium text-gray-500"
                                style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {pendingRegistrations.map((reg) => (
                            <tr
                              key={reg.profile_id}
                              className="cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                              style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                              onClick={() => openRegistrationDrawer(reg)}
                            >
                              <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                  {reg.first_name} {reg.last_name}
                                </span>
                              </td>
                              <td style={{ fontSize: TYPE.meta, color: COLORS.gray[600], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                {reg.email}
                              </td>
                              <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                <span className={`inline-flex items-center font-medium px-2 py-0.5 ${reg.is_licensed ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}
                                  style={{ fontSize: TYPE.micro, borderRadius: RADIUS.pill }}>
                                  {reg.is_licensed ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td style={{ fontSize: TYPE.meta, color: COLORS.gray[600], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                {reg.years_experience ? `${reg.years_experience} yrs` : '—'}
                              </td>
                              <td style={{ fontSize: TYPE.meta, color: COLORS.gray[500], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                {new Date(reg.applied_at).toLocaleDateString()}
                              </td>
                              <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    className="text-white"
                                    style={{ background: EXECUTIVE_GRADIENT_CSS, fontSize: TYPE.micro }}
                                    onClick={() => approveMutation.mutate(reg.profile_id)}
                                    disabled={approveMutation.isPending}
                                  >
                                    <CheckCircle style={{ width: 14, height: 14, marginRight: 4 }} />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    style={{ fontSize: TYPE.micro }}
                                    onClick={() => openRegistrationDrawer(reg)}
                                  >
                                    Review
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* ═══ TAB 2: MEMBER DIRECTORY ═══ */}
          <TabsContent value="directory">
            <motion.div variants={fadeInUp} className="space-y-4 mt-4">
              {/* Lounge Filter Pills */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setLoungeFilter(null)}
                  className="inline-flex items-center gap-1.5 font-semibold transition-all duration-200"
                  style={{
                    fontSize: TYPE.caption,
                    padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                    borderRadius: RADIUS.pill,
                    border: `1.5px solid ${!loungeFilter ? '#ea580c' : COLORS.gray[200]}`,
                    backgroundColor: !loungeFilter ? '#ea580c10' : 'rgba(255,255,255,0.8)',
                    color: !loungeFilter ? '#ea580c' : COLORS.gray[600],
                  }}
                >
                  <Users style={{ width: 14, height: 14 }} />
                  All Members
                  <span className="inline-flex items-center justify-center font-bold" style={{
                    fontSize: 10, minWidth: 20, height: 18, borderRadius: 9999, padding: '0 5px',
                    backgroundColor: !loungeFilter ? '#ea580c20' : COLORS.gray[100],
                    color: !loungeFilter ? '#ea580c' : COLORS.gray[500],
                  }}>
                    {allMembers.length}
                  </span>
                </button>
                {LOUNGES.map(lounge => (
                  <button
                    key={lounge.key}
                    onClick={() => setLoungeFilter(loungeFilter === lounge.key ? null : lounge.key)}
                    className="inline-flex items-center gap-1.5 font-semibold transition-all duration-200"
                    style={{
                      fontSize: TYPE.caption,
                      padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                      borderRadius: RADIUS.pill,
                      border: `1.5px solid ${loungeFilter === lounge.key ? '#ea580c' : COLORS.gray[200]}`,
                      backgroundColor: loungeFilter === lounge.key ? '#ea580c10' : 'rgba(255,255,255,0.8)',
                      color: loungeFilter === lounge.key ? '#ea580c' : COLORS.gray[600],
                    }}
                  >
                    {lounge.name}
                  </button>
                ))}
              </div>

              <ExecutiveFilterBar
                periods={['All', 'Owners', 'Admins', 'Managers', 'Agents']}
                activePeriod={roleFilter}
                onPeriodChange={setRoleFilter}
                teams={['All', 'Active', 'Inactive']}
                activeTeam={statusFilter}
                onTeamChange={setStatusFilter}
              />

              <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: COLORS.gray[50] }}>
                          {['Member', 'Role', 'Hierarchy', 'Status', 'Last Login', ''].map(h => (
                            <th key={h} className="text-left font-medium text-gray-500"
                              style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {members.map((member) => (
                          <tr
                            key={member.id}
                            className="cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                            style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}
                            onClick={() => openMemberDrawer(member)}
                          >
                            <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              <div>
                                <span className="font-semibold text-gray-900" style={{ fontSize: TYPE.meta }}>
                                  {member.first_name} {member.last_name}
                                </span>
                                <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>{member.email}</p>
                              </div>
                            </td>
                            <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              <RoleBadge role={member.role} />
                            </td>
                            <td style={{ fontSize: TYPE.meta, color: COLORS.gray[600], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              {member.hierarchy_title || '—'}
                            </td>
                            <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              <StatusDot active={member.is_active} />
                            </td>
                            <td style={{ fontSize: TYPE.meta, color: COLORS.gray[500], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              {member.last_login_at ? new Date(member.last_login_at).toLocaleDateString() : 'Never'}
                            </td>
                            <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              <ChevronRight style={{ width: 16, height: 16, color: COLORS.gray[400] }} />
                            </td>
                          </tr>
                        ))}
                        {members.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center text-gray-400" style={{ padding: GRID.spacing.xl, fontSize: TYPE.meta }}>
                              No members found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ═══ TAB 3: ACCESS CONTROL ═══ */}
          <TabsContent value="access">
            <motion.div variants={fadeInUp} className="space-y-6 mt-4">
              {/* Lounge Access Matrix */}
              <SectionHeader icon={ShieldCheck} title="Lounge Access Matrix" subtitle="Role-based access to each lounge" />

              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                {LOUNGES.map((lounge) => (
                  <Card key={lounge.key} className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                    <CardContent style={{ padding: GRID.spacing.md }}>
                      <h4 className="font-bold text-gray-900" style={{ fontSize: TYPE.body }}>{lounge.name}</h4>
                      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], marginBottom: 12 }}>{lounge.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {lounge.roles.map(role => {
                          const display = ROLE_DISPLAY[role];
                          return display ? (
                            <span
                              key={role}
                              className="inline-flex items-center font-medium px-2 py-0.5"
                              style={{
                                fontSize: 10,
                                borderRadius: RADIUS.pill,
                                backgroundColor: `${display.color}12`,
                                color: display.color,
                              }}
                            >
                              {display.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Promotion Section */}
              <SectionHeader icon={ArrowUpRight} title="Quick Promotion" subtitle="Change a member's role and notify them" />

              <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent style={{ padding: GRID.spacing.md }}>
                  <p style={{ fontSize: TYPE.meta, color: COLORS.gray[600], marginBottom: 16 }}>
                    Select a member from the Member Directory tab and click their row to open the promotion panel.
                    Changing a member's role automatically updates their lounge access.
                  </p>
                  <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                    {[
                      { from: 'Agent', to: 'Manager', desc: 'Grants Manager Lounge access' },
                      { from: 'Manager', to: 'System Admin', desc: 'Grants Executive + Admin access' },
                      { from: 'Agent', to: 'Senior Agent', desc: 'Updates hierarchy level' },
                    ].map(p => (
                      <div key={p.from + p.to} className="flex items-center gap-2 p-3" style={{
                        borderRadius: RADIUS.button,
                        border: `1px solid ${COLORS.gray[200]}`,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                      }}>
                        <div>
                          <p className="font-semibold text-gray-800" style={{ fontSize: TYPE.caption }}>{p.from} → {p.to}</p>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>{p.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* ═══ TAB 4: ACTIVITY LOG ═══ */}
          <TabsContent value="history">
            <motion.div variants={fadeInUp} className="space-y-4 mt-4">
              <ExecutiveFilterBar
                periods={['All', 'registration_approved', 'registration_rejected', 'promoted', 'account_deactivated', 'onboarding_completed', 'lounge_access_changed']}
                activePeriod={historyFilter}
                onPeriodChange={setHistoryFilter}
                teams={[]}
              />

              <Card className="border-0 overflow-hidden" style={{ ...GLASS.css.light, borderRadius: RADIUS.card, boxShadow: SHADOW.card }}>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr style={{ backgroundColor: COLORS.gray[50] }}>
                          {['Date', 'Member', 'Action', 'Details', 'Performed By', 'Reason'].map(h => (
                            <th key={h} className="text-left font-medium text-gray-500"
                              style={{ fontSize: TYPE.caption, padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px` }}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {history.map((entry) => (
                          <tr key={entry.id} style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}>
                            <td style={{ fontSize: TYPE.meta, color: COLORS.gray[500], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              {new Date(entry.created_at).toLocaleDateString()}
                            </td>
                            <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              <span className="font-medium text-gray-900" style={{ fontSize: TYPE.meta }}>
                                {entry.target_first_name} {entry.target_last_name}
                              </span>
                            </td>
                            <td style={{ padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              <ActionBadge actionType={entry.action_type} />
                            </td>
                            <td style={{ fontSize: TYPE.micro, color: COLORS.gray[600], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`, maxWidth: 200 }}>
                              {entry.previous_value && entry.new_value
                                ? `${(entry.previous_value as any).role || '—'} → ${(entry.new_value as any).role || '—'}`
                                : '—'}
                            </td>
                            <td style={{ fontSize: TYPE.meta, color: COLORS.gray[500], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px` }}>
                              {entry.performer_first_name} {entry.performer_last_name}
                            </td>
                            <td style={{ fontSize: TYPE.micro, color: COLORS.gray[500], padding: `${GRID.spacing.xs + 2}px ${GRID.spacing.sm}px`, maxWidth: 180 }}
                              className="truncate">
                              {entry.reason || '—'}
                            </td>
                          </tr>
                        ))}
                        {history.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center text-gray-400" style={{ padding: GRID.spacing.xl, fontSize: TYPE.meta }}>
                              No activity logged yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </ExecutiveTabSection>

        {/* ═══ DETAIL DRAWER ═══ */}
        <AnimatePresence>
          {drawerMode && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={closeDrawer}
              />

              {/* Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 z-50 overflow-y-auto"
                style={{
                  width: 440,
                  backgroundColor: 'rgba(255,255,255,0.97)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
                  borderLeft: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                {/* Close button */}
                <div className="sticky top-0 z-10 flex items-center justify-between" style={{
                  padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
                  borderBottom: `1px solid ${COLORS.gray[200]}`,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                }}>
                  <h3 style={{ fontSize: TYPE.title, fontWeight: 700 }}>
                    {drawerMode === 'registration' ? 'Application Review' : 'Member Details'}
                  </h3>
                  <button onClick={closeDrawer} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                    <X style={{ width: 20, height: 20, color: COLORS.gray[500] }} />
                  </button>
                </div>

                <div style={{ padding: GRID.spacing.md }}>
                  {/* ─── REGISTRATION DRAWER ─── */}
                  {drawerMode === 'registration' && selectedRegistration && (
                    <div className="space-y-5">
                      {/* Name + Contact */}
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {selectedRegistration.first_name} {selectedRegistration.last_name}
                        </h4>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.meta }}>
                            <Mail style={{ width: 14, height: 14 }} /> {selectedRegistration.email}
                          </div>
                          {selectedRegistration.phone && (
                            <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.meta }}>
                              <Phone style={{ width: 14, height: 14 }} /> {selectedRegistration.phone}
                            </div>
                          )}
                          {selectedRegistration.city && (
                            <div className="flex items-center gap-2 text-gray-600" style={{ fontSize: TYPE.meta }}>
                              <MapPin style={{ width: 14, height: 14 }} />
                              {selectedRegistration.city}, {selectedRegistration.state} {selectedRegistration.zip_code}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Professional Info */}
                      <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card }}>
                        <CardContent style={{ padding: GRID.spacing.sm }}>
                          <h5 className="font-semibold text-gray-800 mb-3" style={{ fontSize: TYPE.meta }}>
                            <Briefcase style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
                            Professional Background
                          </h5>
                          <div className="grid grid-cols-2 gap-3">
                            <InfoRow label="Licensed" value={selectedRegistration.is_licensed ? 'Yes' : 'No'} />
                            <InfoRow label="License #" value={selectedRegistration.license_number || '—'} />
                            <InfoRow label="Experience" value={selectedRegistration.years_experience ? `${selectedRegistration.years_experience} years` : '—'} />
                            <InfoRow label="NPN" value={selectedRegistration.npn || '—'} />
                            <InfoRow label="Previous Agency" value={selectedRegistration.previous_agency || '—'} />
                            <InfoRow label="States" value={selectedRegistration.licensed_states?.join(', ') || '—'} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Motivation */}
                      {selectedRegistration.why_join_heritage && (
                        <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card }}>
                          <CardContent style={{ padding: GRID.spacing.sm }}>
                            <h5 className="font-semibold text-gray-800 mb-2" style={{ fontSize: TYPE.meta }}>
                              <Award style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
                              Why Heritage?
                            </h5>
                            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[600], lineHeight: 1.5 }}>
                              {selectedRegistration.why_join_heritage}
                            </p>
                            {selectedRegistration.referral_source && (
                              <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400], marginTop: 8 }}>
                                Referral: {selectedRegistration.referral_source}
                                {selectedRegistration.referring_agent_name && ` — ${selectedRegistration.referring_agent_name}`}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Actions */}
                      <div className="space-y-3 pt-2">
                        <Button
                          className="w-full text-white font-semibold"
                          style={{ background: EXECUTIVE_GRADIENT_CSS, height: 44, borderRadius: RADIUS.button }}
                          onClick={() => approveMutation.mutate(selectedRegistration.profile_id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle style={{ width: 18, height: 18, marginRight: 8 }} />
                          {approveMutation.isPending ? 'Approving...' : 'Approve & Send Welcome Email'}
                        </Button>

                        <div className="space-y-2">
                          <textarea
                            placeholder="Rejection reason (required)..."
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            className="w-full p-3 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-red-300 resize-none"
                            style={{
                              fontSize: TYPE.meta,
                              borderRadius: RADIUS.input,
                              border: `1px solid ${COLORS.gray[200]}`,
                              minHeight: 80,
                            }}
                          />
                          <Button
                            variant="outline"
                            className="w-full text-red-600 border-red-200 hover:bg-red-50"
                            style={{ height: 40, borderRadius: RADIUS.button }}
                            onClick={() => {
                              if (!rejectReason.trim()) {
                                toast.error('Please provide a rejection reason');
                                return;
                              }
                              rejectMutation.mutate({ profileId: selectedRegistration.profile_id, reason: rejectReason });
                            }}
                            disabled={rejectMutation.isPending}
                          >
                            <XCircle style={{ width: 16, height: 16, marginRight: 6 }} />
                            {rejectMutation.isPending ? 'Rejecting...' : 'Reject Application'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── MEMBER DRAWER ─── */}
                  {drawerMode === 'member' && selectedMember && (
                    <div className="space-y-5">
                      {/* Profile Header */}
                      <div className="flex items-start gap-4">
                        <div
                          className="flex items-center justify-center font-bold text-white"
                          style={{
                            width: 56, height: 56, borderRadius: RADIUS.card,
                            background: EXECUTIVE_GRADIENT_CSS,
                            fontSize: TYPE.title,
                          }}
                        >
                          {(selectedMember.first_name?.[0] || '') + (selectedMember.last_name?.[0] || '')}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {selectedMember.first_name} {selectedMember.last_name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <RoleBadge role={selectedMember.role} />
                            <StatusDot active={selectedMember.is_active} />
                          </div>
                          <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500], marginTop: 4 }}>{selectedMember.email}</p>
                        </div>
                      </div>

                      {/* Lounge Access Toggles */}
                      <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card }}>
                        <CardContent style={{ padding: GRID.spacing.sm }}>
                          <h5 className="font-semibold text-gray-800 mb-3" style={{ fontSize: TYPE.meta }}>
                            <ShieldCheck style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
                            Lounge Access
                          </h5>
                          <div className="space-y-3">
                            {LOUNGES.map(lounge => {
                              const hasAccess = memberAccessMap[lounge.key] ?? lounge.roles.includes(selectedMember.role as any);
                              return (
                                <div key={lounge.key} className="flex items-center justify-between">
                                  <div>
                                    <span style={{ fontSize: TYPE.caption, fontWeight: 600, color: hasAccess ? COLORS.gray[900] : COLORS.gray[400] }}>
                                      {lounge.name}
                                    </span>
                                    <p style={{ fontSize: 10, color: COLORS.gray[400], marginTop: 1 }}>{lounge.description}</p>
                                  </div>
                                  <Switch
                                    checked={hasAccess}
                                    onCheckedChange={(granted) => {
                                      loungeToggleMutation.mutate({
                                        userId: selectedMember.id,
                                        loungeKey: lounge.key,
                                        granted,
                                      });
                                    }}
                                    disabled={loungeToggleMutation.isPending}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Info */}
                      <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card }}>
                        <CardContent style={{ padding: GRID.spacing.sm }}>
                          <div className="grid grid-cols-2 gap-3">
                            <InfoRow label="Hierarchy" value={selectedMember.hierarchy_title || '—'} />
                            <InfoRow label="Level" value={selectedMember.hierarchy_level != null ? String(selectedMember.hierarchy_level) : '—'} />
                            <InfoRow label="Joined" value={new Date(selectedMember.created_at).toLocaleDateString()} />
                            <InfoRow label="Last Login" value={selectedMember.last_login_at ? new Date(selectedMember.last_login_at).toLocaleDateString() : 'Never'} />
                          </div>
                        </CardContent>
                      </Card>

                      {/* Onboarding Profile */}
                      {onboarding && onboarding.onboarding_type && (
                        <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card }}>
                          <CardContent style={{ padding: GRID.spacing.sm }}>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-semibold text-gray-800" style={{ fontSize: TYPE.meta }}>
                                <FileText style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
                                Onboarding Profile
                              </h5>
                              <span
                                className="inline-flex items-center font-semibold px-2.5 py-0.5"
                                style={{
                                  fontSize: 10,
                                  borderRadius: RADIUS.pill,
                                  backgroundColor: onboarding.onboarding_type === 'licensed' ? '#dcfce7' : '#e0e7ff',
                                  color: onboarding.onboarding_type === 'licensed' ? '#16a34a' : '#4338ca',
                                }}
                              >
                                {onboarding.onboarding_type === 'licensed' ? 'Licensed Agent' : 'New Agent'}
                              </span>
                            </div>

                            {/* Completion status */}
                            <div className="flex items-center gap-2 mb-4" style={{
                              padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
                              borderRadius: RADIUS.input,
                              backgroundColor: onboarding.onboarding_completed_at ? '#dcfce7' : '#fef3c7',
                            }}>
                              {onboarding.onboarding_completed_at ? (
                                <CheckCircle style={{ width: 14, height: 14, color: '#16a34a' }} />
                              ) : (
                                <Clock style={{ width: 14, height: 14, color: '#d97706' }} />
                              )}
                              <span style={{ fontSize: TYPE.micro, fontWeight: 600, color: onboarding.onboarding_completed_at ? '#16a34a' : '#d97706' }}>
                                {onboarding.onboarding_completed_at
                                  ? `Completed ${new Date(onboarding.onboarding_completed_at).toLocaleDateString()}`
                                  : `In Progress — Step ${onboarding.onboarding_step}`}
                              </span>
                            </div>

                            {/* Licensed Agent Data */}
                            {onboarding.onboarding_type === 'licensed' && (
                              <div className="space-y-4">
                                {/* Personal */}
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                    <Shield style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                    Personal & Sensitive
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoRow label="SSN" value={onboarding.ssn_masked || '—'} />
                                    <InfoRow label="Emergency Contact" value={onboarding.emergency_contact_name || '—'} />
                                    <InfoRow label="Emergency Phone" value={onboarding.emergency_contact_phone || '—'} />
                                  </div>
                                </div>

                                {/* Banking */}
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                    <CreditCard style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                    Direct Deposit
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoRow label="Bank" value={onboarding.bank_name || '—'} />
                                    <InfoRow label="Account Type" value={onboarding.bank_account_type || '—'} />
                                    <InfoRow label="Routing #" value={onboarding.routing_number_masked || '—'} />
                                    <InfoRow label="Account #" value={onboarding.account_number_masked || '—'} />
                                  </div>
                                </div>

                                {/* License & E&O */}
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                    <Award style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                    License & E&O
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoRow label="License Exp." value={onboarding.license_expiration_date ? new Date(onboarding.license_expiration_date).toLocaleDateString() : '—'} />
                                    <InfoRow label="E&O Provider" value={onboarding.eo_provider || '—'} />
                                    <InfoRow label="E&O Policy #" value={onboarding.eo_policy_number || '—'} />
                                    <InfoRow label="E&O Effective" value={onboarding.eo_effective_date ? new Date(onboarding.eo_effective_date).toLocaleDateString() : '—'} />
                                    <InfoRow label="E&O Expires" value={onboarding.eo_expiration_date ? new Date(onboarding.eo_expiration_date).toLocaleDateString() : '—'} />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* New Agent Data */}
                            {onboarding.onboarding_type === 'new_agent' && (
                              <div className="space-y-4">
                                {/* Background */}
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                    <GraduationCap style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                    Background & Education
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoRow label="Education" value={onboarding.highest_education || '—'} />
                                    <InfoRow label="Industry" value={onboarding.previous_industry || '—'} />
                                  </div>
                                  {onboarding.previous_sales_experience && (
                                    <p style={{ fontSize: TYPE.micro, color: COLORS.gray[600], marginTop: 4 }}>
                                      Sales experience: {onboarding.previous_sales_experience}
                                    </p>
                                  )}
                                </div>

                                {/* Study Preferences */}
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                    <BookOpen style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                    Study Preferences
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoRow label="Learning Style" value={onboarding.learning_style?.replace(/_/g, ' ') || '—'} />
                                    <InfoRow label="Weekly Hours" value={onboarding.weekly_study_hours ? `${onboarding.weekly_study_hours} hrs` : '—'} />
                                    <InfoRow label="Target Exam" value={onboarding.target_exam_date ? new Date(onboarding.target_exam_date).toLocaleDateString() : '—'} />
                                  </div>
                                </div>

                                {/* Training */}
                                <div>
                                  <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                    <Building2 style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                    Training Schedule
                                  </p>
                                  <div className="grid grid-cols-2 gap-2">
                                    <InfoRow label="In-Person" value={onboarding.can_commit_in_person === true ? 'Yes' : onboarding.can_commit_in_person === false ? 'No' : '—'} />
                                    <InfoRow label="Online" value={onboarding.can_commit_scheduled_online === true ? 'Yes' : onboarding.can_commit_scheduled_online === false ? 'No' : '—'} />
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Compliance (both paths) */}
                            <div className="mt-4">
                              <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                <AlertTriangle style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                Compliance
                              </p>
                              <div className="space-y-1">
                                <ComplianceRow label="Felony" value={onboarding.has_felony} details={onboarding.felony_details} />
                                <ComplianceRow label="Bankruptcy" value={onboarding.has_bankruptcy} details={onboarding.bankruptcy_details} />
                                <ComplianceRow label="Misdemeanor" value={onboarding.has_misdemeanor} details={onboarding.misdemeanor_details} />
                              </div>
                            </div>

                            {/* DocuSign Status */}
                            <div className="mt-4">
                              <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                <FileText style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                E-Sign Documents
                              </p>
                              <div className="space-y-1.5">
                                <DocSignRow label="NDA" signed={onboarding.docusign_nda_signed} s3Key={onboarding.docusign_nda_s3_key} />
                                <DocSignRow label="Debt Roll-Up" signed={onboarding.docusign_debt_rollup_signed} s3Key={onboarding.docusign_debt_rollup_s3_key} />
                                <DocSignRow label="Compliance" signed={onboarding.docusign_compliance_signed} s3Key={onboarding.docusign_compliance_s3_key} />
                              </div>
                            </div>

                            {/* Documents */}
                            {(onboarding.eo_certificate_s3_key || onboarding.aml_certificate_s3_key || onboarding.drivers_license_s3_key) && (
                              <div className="mt-4">
                                <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: TYPE.caption }}>
                                  <Upload style={{ width: 12, height: 12, display: 'inline', marginRight: 4 }} />
                                  Uploaded Documents
                                </p>
                                <div className="space-y-1.5">
                                  {onboarding.eo_certificate_s3_key && (
                                    <DocumentRow label="E&O Certificate" s3Key={onboarding.eo_certificate_s3_key} />
                                  )}
                                  {onboarding.aml_certificate_s3_key && (
                                    <DocumentRow label="AML Certificate" s3Key={onboarding.aml_certificate_s3_key} />
                                  )}
                                  {onboarding.drivers_license_s3_key && (
                                    <DocumentRow label="Driver's License" s3Key={onboarding.drivers_license_s3_key} />
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Promote */}
                      {selectedMember.role !== 'owner' && (
                        <Card className="border-0" style={{ ...GLASS.css.light, borderRadius: RADIUS.card }}>
                          <CardContent style={{ padding: GRID.spacing.sm }}>
                            <h5 className="font-semibold text-gray-800 mb-3" style={{ fontSize: TYPE.meta }}>
                              <ArrowUpRight style={{ width: 14, height: 14, display: 'inline', marginRight: 6 }} />
                              Change Role
                            </h5>
                            <select
                              value={promoteRole}
                              onChange={e => setPromoteRole(e.target.value)}
                              className="w-full p-2.5 text-gray-700 outline-none focus:ring-2 focus:ring-orange-300 mb-2"
                              style={{
                                fontSize: TYPE.meta,
                                borderRadius: RADIUS.input,
                                border: `1px solid ${COLORS.gray[200]}`,
                              }}
                            >
                              <option value="">Select new role...</option>
                              {Object.entries(ROLE_DISPLAY)
                                .filter(([key]) => key !== 'owner' && key !== 'client' && key !== selectedMember.role)
                                .map(([key, val]) => (
                                  <option key={key} value={key}>{val.label}</option>
                                ))}
                            </select>
                            <textarea
                              placeholder="Reason for change..."
                              value={promoteReason}
                              onChange={e => setPromoteReason(e.target.value)}
                              className="w-full p-2.5 text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-orange-300 resize-none mb-2"
                              style={{
                                fontSize: TYPE.meta,
                                borderRadius: RADIUS.input,
                                border: `1px solid ${COLORS.gray[200]}`,
                                minHeight: 60,
                              }}
                            />
                            <Button
                              className="w-full text-white font-semibold"
                              style={{ background: EXECUTIVE_GRADIENT_CSS, borderRadius: RADIUS.button }}
                              disabled={!promoteRole || promoteMutation.isPending}
                              onClick={() => {
                                promoteMutation.mutate({
                                  userId: selectedMember.id,
                                  newRole: promoteRole,
                                  newHierarchyLevel: roleToLevel[promoteRole] ?? 5,
                                  reason: promoteReason || `Role changed to ${promoteRole}`,
                                });
                              }}
                            >
                              {promoteMutation.isPending ? 'Promoting...' : 'Promote & Notify'}
                            </Button>
                          </CardContent>
                        </Card>
                      )}

                      {/* Deactivate */}
                      {selectedMember.is_active && selectedMember.role !== 'owner' && (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 border-red-200 hover:bg-red-50"
                          style={{ borderRadius: RADIUS.button }}
                          onClick={() => {
                            deactivateMutation.mutate({
                              userId: selectedMember.id,
                              reason: 'Deactivated by admin',
                            });
                          }}
                          disabled={deactivateMutation.isPending}
                        >
                          <AlertTriangle style={{ width: 16, height: 16, marginRight: 6 }} />
                          Deactivate Account
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </ExecutiveLoungeLayout>
  );
}

// ─── HELPER COMPONENTS ───
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: TYPE.micro, color: COLORS.gray[400], fontWeight: 500 }}>{label}</p>
      <p style={{ fontSize: TYPE.caption, color: COLORS.gray[800], fontWeight: 600 }}>{value}</p>
    </div>
  );
}

function ComplianceRow({ label, value, details }: { label: string; value: boolean; details: string | null }) {
  return (
    <div className="flex items-start justify-between py-1" style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}>
      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[600] }}>{label}</span>
      <div className="text-right">
        <span
          className="inline-flex items-center font-medium px-1.5 py-0.5"
          style={{
            fontSize: 10,
            borderRadius: RADIUS.pill,
            backgroundColor: value ? '#fef2f2' : '#dcfce7',
            color: value ? '#dc2626' : '#16a34a',
          }}
        >
          {value ? 'Yes' : 'No'}
        </span>
        {value && details && (
          <p style={{ fontSize: 10, color: COLORS.gray[500], marginTop: 2, maxWidth: 160 }}>{details}</p>
        )}
      </div>
    </div>
  );
}

function DocSignRow({ label, signed, s3Key }: { label: string; signed: boolean; s3Key?: string }) {
  return (
    <div className="flex items-center justify-between py-1" style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}>
      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[600] }}>{label}</span>
      <div className="flex items-center gap-2">
        {signed && s3Key && (
          <a
            href={`/api/onboarding/download/${encodeURIComponent(s3Key)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium hover:underline"
            style={{ fontSize: 10, color: '#3b82f6' }}
          >
            <Download style={{ width: 10, height: 10 }} />
            PDF
          </a>
        )}
        <span
          className="inline-flex items-center gap-1 font-medium px-2 py-0.5"
          style={{
            fontSize: 10,
            borderRadius: RADIUS.pill,
            backgroundColor: signed ? '#dcfce7' : '#fef3c7',
            color: signed ? '#16a34a' : '#d97706',
          }}
        >
          {signed ? <CheckCircle style={{ width: 10, height: 10 }} /> : <Clock style={{ width: 10, height: 10 }} />}
          {signed ? 'Signed' : 'Pending'}
        </span>
      </div>
    </div>
  );
}

function DocumentRow({ label, s3Key }: { label: string; s3Key: string }) {
  return (
    <div className="flex items-center justify-between py-1" style={{ borderBottom: `1px solid ${COLORS.gray[100]}` }}>
      <span style={{ fontSize: TYPE.micro, color: COLORS.gray[600] }}>{label}</span>
      <a
        href={`/api/onboarding/download/${encodeURIComponent(s3Key)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-medium hover:underline"
        style={{ fontSize: 10, color: '#3b82f6' }}
      >
        <Download style={{ width: 10, height: 10 }} />
        Download
      </a>
    </div>
  );
}

export default ExecutiveLoungeAccess;
