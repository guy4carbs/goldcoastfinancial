/**
 * MemberDirectoryCore
 * Theme-agnostic shared component that renders the full Member Directory page.
 * Wrapped by thin admin and executive page wrappers that pass in the theme.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import {
  Users, Search, ChevronRight, ChevronDown, X, Shield, Download,
  FileText, Phone, MapPin, Clock, Calendar, Building2, Network,
  ExternalLink, ClipboardCheck,
  type LucideIcon,
} from 'lucide-react';
import {
  GLASS, RADIUS, SHADOW, MOTION, TYPE, GRID, COLORS,
  fadeInUp, staggerContainer,
} from '@/lib/heritageDesignSystem';
import {
  useMembers,
  useMemberProfile,
  useMemberDocuments,
  useMemberLoungeAccess,
  useToggleLoungeAccess,
  usePromoteMember,
  useDeactivateMember,
} from '@/hooks/useMemberDirectory';
import { RoleBadge, StatusDot, InfoRow, DocumentRow, DocSignRow } from './MemberHelpers';

// ============================================
// TYPES
// ============================================
interface MemberDirectoryCoreProps {
  variant: 'admin' | 'executive';
  gradientCSS: string;
  accentColor: string;
  accentLight: string;
  hideStats?: boolean;
}

type DrawerTab = 'profile' | 'documents' | 'access';

const ROLE_OPTIONS = [
  { value: 'all', label: 'All Roles' },
  { value: 'owner', label: 'Owner' },
  { value: 'system_admin', label: 'System Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'sales_agent', label: 'Sales Agent' },
  { value: 'client', label: 'Client' },
  { value: 'investor', label: 'Investor' },
];

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

// ============================================
// HELPERS
// ============================================
function getInitials(first?: string, last?: string, username?: string): string {
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first[0].toUpperCase();
  if (username) return username.slice(0, 2).toUpperCase();
  return '??';
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '--';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '--';
  }
}

function formatRelative(dateStr?: string | null): string {
  if (!dateStr) return 'Never';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateStr);
  } catch {
    return 'Never';
  }
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function MemberDirectoryCore({
  variant,
  gradientCSS,
  accentColor,
  accentLight,
  hideStats = false,
}: MemberDirectoryCoreProps) {
  // --- State ---
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('profile');
  const [, navigate] = useLocation();

  // --- Data ---
  const { data, isLoading } = useMembers({
    search,
    role: roleFilter,
    status: statusFilter,
    page,
    limit: 50,
  });
  const { data: profile } = useMemberProfile(selectedMemberId);
  const { data: documents } = useMemberDocuments(selectedMemberId);
  const { data: loungeAccess } = useMemberLoungeAccess(selectedMemberId);

  // --- Mutations ---
  const toggleAccess = useToggleLoungeAccess();
  const promoteMember = usePromoteMember();
  const deactivateMember = useDeactivateMember();

  // --- Derived ---
  const members: any[] = data?.members || [];
  const totalCount = data?.total || 0;
  const activeCount = data?.activeCount ?? members.filter((m: any) => (m.is_active ?? m.isActive) !== false).length;
  const pendingCount = data?.pendingCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / 50));

  // --- Handlers ---
  function openDrawer(memberId: string) {
    setSelectedMemberId(memberId);
    setDrawerTab('profile');
  }

  function closeDrawer() {
    setSelectedMemberId(null);
  }

  function handleRoleChange(userId: string, newRole: string) {
    promoteMember.mutate(
      { userId, newRole },
      {
        onSuccess: () => toast.success('Role updated successfully'),
        onError: () => toast.error('Failed to update role'),
      },
    );
  }

  function handleDeactivate(userId: string) {
    if (!confirm('Are you sure you want to deactivate this member?')) return;
    deactivateMember.mutate(
      { userId },
      {
        onSuccess: () => {
          toast.success('Member deactivated');
          closeDrawer();
        },
        onError: () => toast.error('Failed to deactivate member'),
      },
    );
  }

  function handleToggleLounge(userId: string, loungeKey: string, granted: boolean) {
    toggleAccess.mutate(
      { userId, loungeKey, granted },
      {
        onSuccess: () => toast.success(granted ? 'Access granted' : 'Access revoked'),
        onError: () => toast.error('Failed to toggle access'),
      },
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      style={{ display: 'flex', flexDirection: 'column', gap: GRID.spacing.md }}
    >
      {/* ======== STATS ROW ======== */}
      {!hideStats && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            icon={Users}
            label="Total Members"
            value={totalCount}
            gradientCSS={gradientCSS}
          />
          <StatCard
            icon={Shield}
            label="Active"
            value={activeCount}
            gradientCSS="linear-gradient(135deg, #10b981, #059669)"
            sub="Currently active"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pendingCount}
            gradientCSS="linear-gradient(135deg, #f59e0b, #d97706)"
            sub="Awaiting completion"
          />
          <StatCard
            icon={FileText}
            label="Documents"
            value={data?.documentCount ?? '--'}
            gradientCSS="linear-gradient(135deg, #3b82f6, #2563eb)"
            sub="Total uploaded"
          />
        </motion.div>
      )}

      {/* ======== FILTER BAR ======== */}
      <motion.div
        variants={fadeInUp}
        style={{
          ...GLASS.css.standard,
          borderRadius: RADIUS.card,
          padding: `${GRID.spacing.sm}px ${GRID.spacing.md}px`,
          boxShadow: SHADOW.card,
        }}
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: COLORS.gray[400] }}
            />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              style={{
                width: '100%',
                height: 40,
                paddingLeft: 36,
                paddingRight: search ? 32 : 12,
                borderRadius: RADIUS.input,
                border: `1px solid ${COLORS.gray[200]}`,
                fontSize: TYPE.meta,
                color: COLORS.gray[900],
                background: 'rgba(255,255,255,0.6)',
                outline: 'none',
              }}
            />
            {search && (
              <button
                onClick={() => { setSearch(''); setPage(1); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
              >
                <X className="w-3.5 h-3.5" style={{ color: COLORS.gray[400] }} />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            style={{
              height: 40,
              paddingLeft: 12,
              paddingRight: 32,
              borderRadius: RADIUS.input,
              border: `1px solid ${COLORS.gray[200]}`,
              fontSize: TYPE.meta,
              color: COLORS.gray[700],
              background: roleFilter !== 'all' ? accentLight : 'rgba(255,255,255,0.6)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            style={{
              height: 40,
              paddingLeft: 12,
              paddingRight: 32,
              borderRadius: RADIUS.input,
              border: `1px solid ${COLORS.gray[200]}`,
              fontSize: TYPE.meta,
              color: COLORS.gray[700],
              background: statusFilter !== 'all' ? accentLight : 'rgba(255,255,255,0.6)',
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center',
            }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* ======== MEMBER TABLE ======== */}
      <motion.div
        variants={fadeInUp}
        style={{
          ...GLASS.css.standard,
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
          overflow: 'hidden',
        }}
      >
        {/* Table Header */}
        <div
          className="hidden md:grid items-center px-5 gap-3"
          style={{
            gridTemplateColumns: '2fr 2fr 1fr 0.8fr 1fr 1fr 0.6fr 32px',
            height: 48,
            borderBottom: `1px solid ${COLORS.gray[100]}`,
            background: 'rgba(0,0,0,0.02)',
          }}
        >
          {['Name', 'Email', 'Role', 'Status', 'Joined', 'Last Login', 'Docs', ''].map((h) => (
            <span key={h} style={{ fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[500], textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {h}
            </span>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="py-16 text-center">
            <div
              className="w-8 h-8 mx-auto mb-3 rounded-full animate-spin"
              style={{ border: `3px solid ${COLORS.gray[200]}`, borderTopColor: accentColor }}
            />
            <p style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>Loading members...</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && members.length === 0 && (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: COLORS.gray[400] }} />
            <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[500] }}>
              No members found
            </p>
            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400], marginTop: 4 }}>
              {search ? 'Try adjusting your search or filters' : 'Members will appear here once added'}
            </p>
          </div>
        )}

        {/* Rows */}
        {!isLoading && members.map((member: any) => (
          <motion.div
            key={member.id}
            onClick={() => openDrawer(String(member.id))}
            className="grid items-center px-5 gap-3 cursor-pointer transition-colors"
            style={{
              gridTemplateColumns: '2fr 2fr 1fr 0.8fr 1fr 1fr 0.6fr 32px',
              minHeight: 56,
              borderBottom: `1px solid ${COLORS.gray[50]}`,
            }}
            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
          >
            {/* Name + Avatar */}
            <div className="flex items-center gap-3 py-2">
              <div
                className="flex-shrink-0 flex items-center justify-center"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: RADIUS.pill,
                  background: gradientCSS,
                  color: 'white',
                  fontSize: TYPE.micro,
                  fontWeight: 700,
                }}
              >
                {getInitials(member.firstName || member.first_name, member.lastName || member.last_name, member.username)}
              </div>
              <div className="min-w-0">
                <p className="truncate" style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[900] }}>
                  {(member.firstName || member.first_name) && (member.lastName || member.last_name)
                    ? `${member.firstName || member.first_name} ${member.lastName || member.last_name}`
                    : member.username || 'Unknown'}
                </p>
                <p className="truncate md:hidden" style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                  {member.email}
                </p>
              </div>
            </div>

            {/* Email */}
            <p className="hidden md:block truncate" style={{ fontSize: TYPE.meta, color: COLORS.gray[600] }}>
              {member.email || '--'}
            </p>

            {/* Role */}
            <div className="hidden md:block">
              <RoleBadge role={member.role || 'client'} />
            </div>

            {/* Status */}
            <div className="hidden md:block">
              <StatusDot active={(member.is_active ?? member.isActive) !== false} />
            </div>

            {/* Joined */}
            <span className="hidden md:block" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
              {formatDate(member.createdAt || member.created_at)}
            </span>

            {/* Last Login */}
            <span className="hidden md:block" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
              {formatRelative(member.lastLoginAt || member.last_login_at)}
            </span>

            {/* Docs */}
            <span className="hidden md:block" style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
              {member.documentCount ?? member.document_count ?? '--'}
            </span>

            {/* Chevron */}
            <ChevronRight className="hidden md:block w-4 h-4" style={{ color: COLORS.gray[300] }} />
          </motion.div>
        ))}

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            className="flex items-center justify-between px-5"
            style={{
              height: 52,
              borderTop: `1px solid ${COLORS.gray[100]}`,
              background: 'rgba(0,0,0,0.01)',
            }}
          >
            <span style={{ fontSize: TYPE.caption, color: COLORS.gray[500] }}>
              Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, totalCount)} of {totalCount}
            </span>
            <div className="flex items-center gap-2">
              <PaginationButton
                label="Previous"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              />
              <span style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700], minWidth: 32, textAlign: 'center' }}>
                {page}
              </span>
              <PaginationButton
                label="Next"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            </div>
          </div>
        )}
      </motion.div>

      {/* ======== DETAIL DRAWER ======== */}
      <AnimatePresence>
        {selectedMemberId && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: MOTION.duration.fast }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40"
              style={{ background: 'rgba(0,0,0,0.30)' }}
            />

            {/* Panel */}
            <motion.div
              initial={{ x: 500, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 500, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: MOTION.spring.damping,
                stiffness: MOTION.spring.stiffness,
              }}
              className="fixed top-0 right-0 z-50 h-full overflow-y-auto"
              style={{
                width: 480,
                maxWidth: '100vw',
                ...GLASS.css.light,
                borderRadius: `${RADIUS.hero}px 0 0 ${RADIUS.hero}px`,
                boxShadow: '-8px 0 32px rgba(0,0,0,0.12)',
              }}
            >
              {/* Close Button */}
              <button
                onClick={closeDrawer}
                className="absolute top-5 right-5 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" style={{ color: COLORS.gray[500] }} />
              </button>

              {/* Drawer Content */}
              <div style={{ padding: GRID.spacing.md }}>
                {/* Tab Bar */}
                <div
                  className="flex gap-1 mb-6"
                  style={{
                    background: COLORS.gray[100],
                    borderRadius: RADIUS.input,
                    padding: 3,
                  }}
                >
                  {(['profile', 'documents', 'access'] as DrawerTab[]).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setDrawerTab(tab)}
                      className="flex-1 py-2 text-center capitalize transition-all"
                      style={{
                        borderRadius: RADIUS.input - 2,
                        fontSize: TYPE.meta,
                        fontWeight: drawerTab === tab ? 600 : 500,
                        color: drawerTab === tab ? 'white' : COLORS.gray[600],
                        background: drawerTab === tab ? gradientCSS : 'transparent',
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {drawerTab === 'profile' && (
                  <ProfileTab
                    profile={profile}
                    gradientCSS={gradientCSS}
                    accentColor={accentColor}
                  />
                )}
                {drawerTab === 'documents' && (
                  <DocumentsTab documents={documents} />
                )}
                {drawerTab === 'access' && (
                  <AccessTab
                    memberId={selectedMemberId}
                    loungeAccess={loungeAccess}
                    profile={profile}
                    accentColor={accentColor}
                    accentLight={accentLight}
                    onToggleLounge={handleToggleLounge}
                    onRoleChange={handleRoleChange}
                    onDeactivate={handleDeactivate}
                    isToggling={toggleAccess.isPending}
                    isPromoting={promoteMember.isPending}
                    isDeactivating={deactivateMember.isPending}
                  />
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// STAT CARD (internal)
// ============================================
function StatCard({
  icon: Icon,
  label,
  value,
  gradientCSS,
  sub,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradientCSS: string;
  sub?: string;
}) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover, ease: MOTION.easing }}
      style={{
        ...GLASS.css.standard,
        borderRadius: RADIUS.card,
        padding: GRID.spacing.md,
        boxShadow: SHADOW.card,
        cursor: 'default',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[600] }}>{label}</h3>
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: RADIUS.input,
            background: gradientCSS,
          }}
        >
          <Icon className="w-4 h-4 text-white" />
        </div>
      </div>
      <p style={{ fontSize: TYPE.hero, fontWeight: 700, color: COLORS.gray[900] }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[500], marginTop: 4 }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ============================================
// PAGINATION BUTTON (internal)
// ============================================
function PaginationButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="transition-colors"
      style={{
        height: 34,
        padding: '0 14px',
        borderRadius: RADIUS.input,
        fontSize: TYPE.caption,
        fontWeight: 500,
        color: disabled ? COLORS.gray[300] : COLORS.gray[700],
        background: disabled ? COLORS.gray[50] : 'white',
        border: `1px solid ${disabled ? COLORS.gray[100] : COLORS.gray[200]}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

// ============================================
// PROFILE TAB
// ============================================
function ProfileTab({
  profile,
  gradientCSS,
  accentColor,
}: {
  profile: any;
  gradientCSS: string;
  accentColor: string;
}) {
  const user = profile?.user || profile;

  if (!user) {
    return (
      <div className="py-12 text-center">
        <div
          className="w-6 h-6 mx-auto mb-2 rounded-full animate-spin"
          style={{ border: `2px solid ${COLORS.gray[200]}`, borderTopColor: accentColor }}
        />
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>Loading profile...</p>
      </div>
    );
  }

  const onboarding = profile?.onboarding || {};

  return (
    <div className="space-y-6">
      {/* Header: Avatar + Identity */}
      <div className="flex items-center gap-4">
        <div
          className="flex-shrink-0 flex items-center justify-center"
          style={{
            width: 64,
            height: 64,
            borderRadius: RADIUS.pill,
            background: gradientCSS,
            color: 'white',
            fontSize: TYPE.title,
            fontWeight: 700,
          }}
        >
          {getInitials(user.firstName || user.first_name, user.lastName || user.last_name, user.username)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate" style={{ fontSize: TYPE.title, fontWeight: 700, color: COLORS.gray[900] }}>
            {(user.firstName || user.first_name) && (user.lastName || user.last_name)
              ? `${user.firstName || user.first_name} ${user.lastName || user.last_name}`
              : user.username || 'Unknown'}
          </h3>
          <p className="truncate" style={{ fontSize: TYPE.meta, color: COLORS.gray[500] }}>
            {user.email}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <RoleBadge role={user.role || 'client'} />
            <StatusDot active={(user.is_active ?? user.isActive) !== false} />
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div>
        <h4
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}
        >
          <Phone className="w-4 h-4" style={{ color: accentColor }} />
          Contact
        </h4>
        <div
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.input,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
          }}
        >
          <InfoRow label="Phone" value={user.phone || onboarding.phone || '--'} />
          <InfoRow label="Timezone" value={onboarding.timezone || user.timezone || '--'} />
          <InfoRow
            label="Location"
            value={
              [onboarding.city, onboarding.state].filter(Boolean).join(', ') ||
              user.location || '--'
            }
          />
        </div>
      </div>

      {/* Professional Section */}
      <div>
        <h4
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}
        >
          <Building2 className="w-4 h-4" style={{ color: accentColor }} />
          Professional
        </h4>
        <div
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.input,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
          }}
        >
          <InfoRow label="License Number" value={onboarding.licenseNumber || onboarding.license_number || '--'} />
          <InfoRow label="NPN" value={onboarding.npn || '--'} />
          <InfoRow
            label="Licensed States"
            value={
              Array.isArray(onboarding.licensedStates || onboarding.licensed_states)
                ? (onboarding.licensedStates || onboarding.licensed_states).join(', ')
                : onboarding.licensedStates || onboarding.licensed_states || '--'
            }
          />
          <InfoRow label="Contract Level" value={onboarding.contractLevel || onboarding.contract_level || user.contractLevel || user.contract_level || '--'} />
          <InfoRow label="Upline" value={onboarding.uplineName || onboarding.upline_name || user.uplineName || user.upline_name || '--'} />
          <InfoRow label="Hierarchy Title" value={user.hierarchyTitle || user.hierarchy_title || '--'} />
        </div>
      </div>

      {/* Onboarding Section */}
      <div>
        <h4
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}
        >
          <ClipboardCheck className="w-4 h-4" style={{ color: accentColor }} />
          Onboarding
        </h4>
        <div
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.input,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
          }}
        >
          <InfoRow
            label="Type"
            value={
              (onboarding.onboardingType || onboarding.onboarding_type || onboarding.type)
                ? (onboarding.onboardingType || onboarding.onboarding_type || onboarding.type)
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())
                : '--'
            }
          />
          <InfoRow
            label="Current Step"
            value={
              (onboarding.onboardingStep || onboarding.onboarding_step || onboarding.step)
                ? `Step ${onboarding.onboardingStep || onboarding.onboarding_step || onboarding.step}`
                : '--'
            }
          />
          <InfoRow
            label="Status"
            value={
              (onboarding.completedAt || onboarding.completed_at || onboarding.onboarding_completed_at || onboarding.onboardingCompletedAt)
                ? 'Completed'
                : (onboarding.approvalStatus || onboarding.approval_status)
                    ? (onboarding.approvalStatus || onboarding.approval_status)
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c: string) => c.toUpperCase())
                    : 'In Progress'
            }
          />
          <InfoRow
            label="Completed"
            value={formatDate(onboarding.completedAt || onboarding.completed_at || onboarding.onboarding_completed_at || onboarding.onboardingCompletedAt)}
          />
          <InfoRow
            label="Approval"
            value={
              (onboarding.approvalStatus || onboarding.approval_status)
                ? (onboarding.approvalStatus || onboarding.approval_status)
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, (c: string) => c.toUpperCase())
                : '--'
            }
          />
        </div>
      </div>

      {/* Dates Section */}
      <div>
        <h4
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}
        >
          <Calendar className="w-4 h-4" style={{ color: accentColor }} />
          Activity
        </h4>
        <div
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.input,
            padding: `${GRID.spacing.xs}px ${GRID.spacing.sm}px`,
          }}
        >
          <InfoRow label="Joined" value={formatDate(user.createdAt || user.created_at)} />
          <InfoRow label="Last Login" value={formatRelative(user.lastLoginAt || user.last_login_at)} />
          <InfoRow label="Onboarding" value={(onboarding.completedAt || onboarding.completed_at || onboarding.onboarding_completed_at || onboarding.onboardingCompletedAt) ? 'Completed' : 'In Progress'} />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-2 pt-2">
        <a
          href="/executive/lounge-access"
          className="flex items-center justify-center gap-2 transition-colors"
          style={{
            height: 38,
            borderRadius: RADIUS.input,
            fontSize: TYPE.meta,
            fontWeight: 600,
            color: accentColor,
            background: 'rgba(255,255,255,0.6)',
            border: `1px solid ${accentColor}33`,
            textDecoration: 'none',
            cursor: 'pointer',
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View Onboarding Profile
        </a>
        {(user.role === 'sales_agent' || user.role === 'manager' || user.role === 'owner' || user.role === 'system_admin') && (
          <a
            href={`/agent-lounge/command-center`}
            className="flex items-center justify-center gap-2 transition-colors"
            style={{
              height: 38,
              borderRadius: RADIUS.input,
              fontSize: TYPE.meta,
              fontWeight: 600,
              color: COLORS.gray[600],
              background: 'rgba(255,255,255,0.6)',
              border: `1px solid ${COLORS.gray[200]}`,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View in Agent Portal
          </a>
        )}
      </div>
    </div>
  );
}

// ============================================
// DOCUMENTS TAB
// ============================================
function DocumentsTab({ documents }: { documents: any }) {
  if (!documents) {
    return (
      <div className="py-12 text-center">
        <div
          className="w-6 h-6 mx-auto mb-2 rounded-full animate-spin"
          style={{ border: `2px solid ${COLORS.gray[200]}`, borderTopColor: COLORS.gray[400] }}
        />
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>Loading documents...</p>
      </div>
    );
  }

  const uploaded: any[] = documents?.uploaded || [];
  const onboarding: any[] = documents?.onboarding || [];
  const docusign: any[] = documents?.docusign || [];
  const hasAny = uploaded.length > 0 || onboarding.length > 0 || docusign.length > 0;

  if (!hasAny) {
    return (
      <div className="py-12 text-center">
        <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: COLORS.gray[400] }} />
        <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[500] }}>
          No documents found
        </p>
        <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400], marginTop: 4 }}>
          Documents will appear once uploaded during onboarding
        </p>
      </div>
    );
  }

  function openDownload(s3Key: string) {
    window.open(`/api/onboarding/download/${encodeURIComponent(s3Key)}`, '_blank');
  }

  return (
    <div className="space-y-6">
      {/* Uploaded Documents */}
      {uploaded.length > 0 && (
        <DocSection title="Uploaded Documents" count={uploaded.length}>
          {uploaded.map((doc: any, i: number) => (
            <DocumentRow
              key={doc.id || i}
              name={doc.fileName || doc.name || 'Document'}
              category={doc.category || 'Upload'}
              date={formatDate(doc.createdAt || doc.uploadedAt)}
              onDownload={doc.s3Key ? () => openDownload(doc.s3Key) : undefined}
            />
          ))}
        </DocSection>
      )}

      {/* Onboarding Documents */}
      {onboarding.length > 0 && (
        <DocSection title="Onboarding Documents" count={onboarding.length}>
          {onboarding.map((doc: any, i: number) => (
            <DocumentRow
              key={doc.id || i}
              name={doc.fileName || doc.name || 'Document'}
              category={doc.category || 'Onboarding'}
              date={formatDate(doc.createdAt || doc.uploadedAt)}
              onDownload={doc.s3Key ? () => openDownload(doc.s3Key) : undefined}
            />
          ))}
        </DocSection>
      )}

      {/* DocuSign Agreements */}
      {docusign.length > 0 && (
        <DocSection title="DocuSign Agreements" count={docusign.length}>
          {docusign.map((doc: any, i: number) => (
            <DocSignRow
              key={doc.id || doc.envelopeId || i}
              name={doc.name || doc.subject || 'Agreement'}
              signed={doc.status === 'completed' || doc.signed === true}
              onDownload={doc.s3Key ? () => openDownload(doc.s3Key) : undefined}
            />
          ))}
        </DocSection>
      )}
    </div>
  );
}

// ============================================
// DOC SECTION (internal)
// ============================================
function DocSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}>
          {title}
        </h4>
        <span
          style={{
            fontSize: TYPE.micro,
            fontWeight: 600,
            color: COLORS.gray[500],
            background: COLORS.gray[100],
            borderRadius: RADIUS.pill,
            padding: '2px 8px',
          }}
        >
          {count}
        </span>
      </div>
      <div
        style={{
          ...GLASS.css.standard,
          borderRadius: RADIUS.input,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================
// ACCESS TAB
// ============================================
function AccessTab({
  memberId,
  loungeAccess,
  profile,
  accentColor,
  accentLight,
  onToggleLounge,
  onRoleChange,
  onDeactivate,
  isToggling,
  isPromoting,
  isDeactivating,
}: {
  memberId: string;
  loungeAccess: any;
  profile: any;
  accentColor: string;
  accentLight: string;
  onToggleLounge: (userId: string, loungeKey: string, granted: boolean) => void;
  onRoleChange: (userId: string, newRole: string) => void;
  onDeactivate: (userId: string) => void;
  isToggling: boolean;
  isPromoting: boolean;
  isDeactivating: boolean;
}) {
  const [pendingRole, setPendingRole] = useState('');
  const user = profile?.user || profile;
  const lounges: any[] = loungeAccess?.lounges || [];

  return (
    <div className="space-y-6">
      {/* Lounge Access */}
      <div>
        <h4
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}
        >
          <Network className="w-4 h-4" style={{ color: accentColor }} />
          Lounge Access
        </h4>

        {lounges.length === 0 ? (
          <div
            className="py-8 text-center"
            style={{
              ...GLASS.css.standard,
              borderRadius: RADIUS.input,
            }}
          >
            <Shield className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: COLORS.gray[400] }} />
            <p style={{ fontSize: TYPE.caption, color: COLORS.gray[400] }}>
              No lounges configured
            </p>
          </div>
        ) : (
          <div
            style={{
              ...GLASS.css.standard,
              borderRadius: RADIUS.input,
              overflow: 'hidden',
            }}
          >
            {lounges.map((lounge: any, idx: number) => (
              <div
                key={lounge.key || idx}
                className="flex items-center justify-between px-4"
                style={{
                  minHeight: 52,
                  borderBottom: idx < lounges.length - 1 ? `1px solid ${COLORS.gray[100]}` : 'none',
                }}
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p style={{ fontSize: TYPE.meta, fontWeight: 500, color: COLORS.gray[900] }}>
                    {lounge.name || lounge.key}
                  </p>
                  {lounge.description && (
                    <p style={{ fontSize: TYPE.micro, color: COLORS.gray[500] }}>
                      {lounge.description}
                    </p>
                  )}
                </div>
                {/* Toggle Switch */}
                <button
                  onClick={() => onToggleLounge(memberId, lounge.key, !lounge.granted)}
                  disabled={isToggling}
                  className="relative flex-shrink-0 transition-colors"
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: RADIUS.pill,
                    background: lounge.granted ? accentColor : COLORS.gray[300],
                    cursor: isToggling ? 'wait' : 'pointer',
                    border: 'none',
                    padding: 0,
                  }}
                >
                  <span
                    className="block transition-transform"
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'white',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                      transform: lounge.granted ? 'translateX(22px)' : 'translateX(2px)',
                      marginTop: 2,
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions Section */}
      <div>
        <h4
          className="flex items-center gap-2 mb-3"
          style={{ fontSize: TYPE.meta, fontWeight: 600, color: COLORS.gray[700] }}
        >
          <Shield className="w-4 h-4" style={{ color: accentColor }} />
          Actions
        </h4>
        <div
          className="space-y-4"
          style={{
            ...GLASS.css.standard,
            borderRadius: RADIUS.input,
            padding: GRID.spacing.sm,
          }}
        >
          {/* Change Role */}
          <div>
            <label style={{ fontSize: TYPE.micro, fontWeight: 600, color: COLORS.gray[500], display: 'block', marginBottom: 6 }}>
              Change Role
            </label>
            <div className="flex gap-2">
              <select
                value={pendingRole || user?.role || ''}
                onChange={(e) => setPendingRole(e.target.value)}
                style={{
                  flex: 1,
                  height: 38,
                  paddingLeft: 12,
                  paddingRight: 28,
                  borderRadius: RADIUS.input,
                  border: `1px solid ${COLORS.gray[200]}`,
                  fontSize: TYPE.meta,
                  color: COLORS.gray[700],
                  background: 'white',
                  outline: 'none',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                {ROLE_OPTIONS.filter((r) => r.value !== 'all').map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (pendingRole && pendingRole !== user?.role) {
                    onRoleChange(memberId, pendingRole);
                  }
                }}
                disabled={isPromoting || !pendingRole || pendingRole === user?.role}
                className="transition-colors"
                style={{
                  height: 38,
                  padding: '0 16px',
                  borderRadius: RADIUS.input,
                  fontSize: TYPE.meta,
                  fontWeight: 600,
                  color: 'white',
                  background: !pendingRole || pendingRole === user?.role ? COLORS.gray[300] : accentColor,
                  border: 'none',
                  cursor: !pendingRole || pendingRole === user?.role ? 'not-allowed' : 'pointer',
                  opacity: isPromoting ? 0.7 : 1,
                }}
              >
                {isPromoting ? 'Saving...' : 'Apply'}
              </button>
            </div>
          </div>

          {/* Deactivate */}
          <div
            style={{
              borderTop: `1px solid ${COLORS.gray[100]}`,
              paddingTop: GRID.spacing.sm,
            }}
          >
            <button
              onClick={() => onDeactivate(memberId)}
              disabled={isDeactivating}
              className="w-full transition-colors"
              style={{
                height: 40,
                borderRadius: RADIUS.input,
                fontSize: TYPE.meta,
                fontWeight: 600,
                color: '#dc2626',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                cursor: isDeactivating ? 'wait' : 'pointer',
                opacity: isDeactivating ? 0.7 : 1,
              }}
            >
              {isDeactivating ? 'Deactivating...' : 'Deactivate Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
