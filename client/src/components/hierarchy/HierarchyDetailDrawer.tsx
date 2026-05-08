/**
 * Hierarchy node detail drawer — slide-in panel from the right when a
 * hierarchy node is clicked. Mirrors the Gold Coast AgentDetailDrawer
 * pattern (hierarchy summary + contact actions + team stats), but
 * styled in the Heritage violet→purple→amber gradient language used
 * throughout the lobby and stat cards so it reads as part of the same
 * design system.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, X, TrendingUp, Award, Target, Users, Crown, Layers } from 'lucide-react';
import { COLORS, RADIUS } from '@/lib/heritageDesignSystem';
import type { HierarchyMember } from './types';

const AMBER = COLORS.accent.amber;
const VIOLET = COLORS.primary.violet;
const HERO_GRADIENT = COLORS.gradients.heroWithAccent;
const SUBTLE_GRADIENT = COLORS.gradients.subtle;

function fmtMoney(n: number): string {
  if (!n || n <= 0) return '$0';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000).toLocaleString()}K`;
  return `$${n.toLocaleString()}`;
}

function getInitials(name: string): string {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?'
  );
}

interface Props {
  member: HierarchyMember | null;
  isYou: boolean;
  parentContractLevel: number | null;
  onClose: () => void;
}

export function HierarchyDetailDrawer({ member, isYou, parentContractLevel, onClose }: Props) {
  const open = !!member;
  const override =
    member && parentContractLevel != null && member.contractLevel != null
      ? Math.max(0, parentContractLevel - member.contractLevel)
      : 0;

  return (
    <AnimatePresence>
      {open && member && (
        <>
          {/* Scrim — soft violet tint, not pure black */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background:
                'radial-gradient(circle at 70% 30%, rgba(124, 58, 237, 0.18), rgba(0, 0, 0, 0.42))',
              zIndex: 1000,
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
            }}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 280 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(440px, 92vw)',
              backgroundColor: '#ffffff',
              boxShadow: '-16px 0 48px rgba(91, 33, 182, 0.22)',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              fontFamily: 'inherit',
            }}
          >
            {/* Header — Heritage hero gradient with decorative blurs */}
            <header
              style={{
                position: 'relative',
                background: HERO_GRADIENT,
                color: '#fff',
                padding: '28px 24px 22px',
                overflow: 'hidden',
              }}
            >
              {/* Decorative orbs to mirror the page hero treatment */}
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  top: -36,
                  right: -28,
                  width: 140,
                  height: 140,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  filter: 'blur(20px)',
                }}
              />
              <span
                aria-hidden
                style={{
                  position: 'absolute',
                  bottom: -22,
                  left: -16,
                  width: 90,
                  height: 90,
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.22)',
                  filter: 'blur(16px)',
                }}
              />

              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  borderRadius: '50%',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'background 120ms ease, transform 120ms ease',
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.32)';
                  e.currentTarget.style.transform = 'rotate(90deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.18)';
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
              >
                <X className="w-4 h-4" />
              </button>

              <div style={{ position: 'relative', zIndex: 1 }} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center font-semibold flex-shrink-0"
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.18)',
                    color: '#fff',
                    fontSize: 19,
                    border: '2px solid rgba(255,255,255,0.4)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.18)',
                  }}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    getInitials(member.name)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                      {member.name}
                    </h2>
                    {isYou && (
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase',
                          padding: '3px 8px',
                          borderRadius: RADIUS.pill,
                          background: 'rgba(255,255,255,0.25)',
                          border: '1px solid rgba(255,255,255,0.32)',
                          color: '#fff',
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 13, opacity: 0.92, marginTop: 3 }}>{member.title}</p>
                </div>
              </div>
            </header>

            {/* Body — scrollable */}
            <div
              className="flex-1 overflow-y-auto"
              style={{
                padding: '20px 24px 28px',
                background: SUBTLE_GRADIENT,
              }}
            >
              {/* Hierarchy summary */}
              <Section title="Hierarchy" icon={Crown}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <StatTile
                    label="Contract"
                    value={`${member.contractLevel ?? 0}%`}
                    accent="violet"
                    icon={Layers}
                  />
                  <StatTile
                    label="Override spread"
                    value={override > 0 ? `${override}%` : '—'}
                    accent={override > 0 ? 'amber' : 'muted'}
                  />
                  <StatTile
                    label="Level"
                    value={String(member.level ?? 0)}
                    accent="violet"
                  />
                  <StatTile
                    label="Team size"
                    value={String(member.teamSize ?? 0)}
                    accent="violet"
                    icon={Users}
                  />
                </div>
              </Section>

              {/* Performance */}
              <Section title="Performance" icon={TrendingUp}>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: 10,
                  }}
                >
                  <StatTile
                    label="YTD"
                    value={fmtMoney(member.ytdCommission || 0)}
                    accent="amber"
                    icon={TrendingUp}
                  />
                  <StatTile
                    label="Policies"
                    value={String(member.policiesSold ?? 0)}
                    accent="violet"
                    icon={Award}
                  />
                  <StatTile
                    label="Conv."
                    value={`${member.conversionRate ?? 0}%`}
                    accent="success"
                    icon={Target}
                  />
                </div>
              </Section>

              {/* Contact */}
              {!isYou && (
                <Section title="Contact" icon={Phone}>
                  <div className="grid grid-cols-2 gap-2.5">
                    <ContactButton
                      label="Call"
                      icon={Phone}
                      enabled={!!member.phone}
                      href={member.phone ? `tel:${member.phone}` : undefined}
                      tone="violet"
                    />
                    <ContactButton
                      label="Email"
                      icon={Mail}
                      enabled={!!member.email}
                      href={member.email ? `mailto:${member.email}` : undefined}
                      tone="amber"
                    />
                  </div>
                  {(member.email || member.phone) && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: '10px 12px',
                        background: '#fff',
                        border: `1px solid ${VIOLET[100]}`,
                        borderRadius: RADIUS.input,
                        fontSize: 12,
                        color: COLORS.gray[600],
                        lineHeight: 1.6,
                      }}
                    >
                      {member.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 flex-shrink-0" style={{ color: VIOLET[500] }} />
                          <span style={{ wordBreak: 'break-all' }}>{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-2" style={{ marginTop: member.email ? 4 : 0 }}>
                          <Phone className="w-3 h-3 flex-shrink-0" style={{ color: AMBER[600] }} />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </Section>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Section wrapper ────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: typeof Crown;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 22 }}>
      <h3
        className="flex items-center gap-1.5"
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: COLORS.gray[500],
          marginBottom: 12,
        }}
      >
        {Icon && <Icon className="w-3 h-3" style={{ color: VIOLET[500] }} />}
        {title}
      </h3>
      {children}
    </section>
  );
}

// ─── Stat tile ──────────────────────────────────────────────────────────

type Tone = 'violet' | 'amber' | 'success' | 'muted';

function StatTile({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent: Tone;
  icon?: typeof TrendingUp;
}) {
  const palette = {
    violet: {
      iconColor: VIOLET[500],
      valueColor: VIOLET[700],
      bg: '#ffffff',
      border: VIOLET[100],
      labelColor: VIOLET[400],
    },
    amber: {
      iconColor: AMBER[600],
      valueColor: AMBER[700],
      bg: '#ffffff',
      border: AMBER[100],
      labelColor: AMBER[500],
    },
    success: {
      iconColor: COLORS.semantic.success,
      valueColor: '#047857',
      bg: '#ffffff',
      border: '#a7f3d0',
      labelColor: '#10b981',
    },
    muted: {
      iconColor: COLORS.gray[400],
      valueColor: COLORS.gray[400],
      bg: '#ffffff',
      border: COLORS.gray[200],
      labelColor: COLORS.gray[400],
    },
  }[accent];

  return (
    <div
      style={{
        padding: '11px 13px',
        borderRadius: RADIUS.input,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
      }}
    >
      <div
        className="flex items-center gap-1"
        style={{
          fontSize: 9,
          color: palette.labelColor,
          marginBottom: 5,
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        {Icon && <Icon className="w-3 h-3" style={{ color: palette.iconColor }} />}
        <span>{label}</span>
      </div>
      <div
        style={{
          fontSize: 17,
          fontWeight: 700,
          color: palette.valueColor,
          lineHeight: 1.1,
          fontFamily: "'Playfair Display', Georgia, serif",
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Contact button ─────────────────────────────────────────────────────

function ContactButton({
  label,
  icon: Icon,
  enabled,
  href,
  tone,
}: {
  label: string;
  icon: typeof Phone;
  enabled: boolean;
  href?: string;
  tone: 'violet' | 'amber';
}) {
  const palette =
    tone === 'violet'
      ? {
          bg: enabled ? `linear-gradient(135deg, ${VIOLET[600]} 0%, ${VIOLET[500]} 100%)` : COLORS.gray[100],
          color: enabled ? '#fff' : COLORS.gray[400],
          shadow: enabled ? '0 4px 14px rgba(124, 58, 237, 0.32)' : 'none',
          border: enabled ? 'transparent' : COLORS.gray[200],
        }
      : {
          bg: enabled ? `linear-gradient(135deg, ${AMBER[500]} 0%, ${AMBER[600]} 100%)` : COLORS.gray[100],
          color: enabled ? '#fff' : COLORS.gray[400],
          shadow: enabled ? '0 4px 14px rgba(245, 158, 11, 0.34)' : 'none',
          border: enabled ? 'transparent' : COLORS.gray[200],
        };

  return (
    <a
      href={href}
      onClick={(e) => {
        if (!enabled) e.preventDefault();
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        padding: '11px 14px',
        fontSize: 13,
        fontWeight: 600,
        borderRadius: RADIUS.input,
        background: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        boxShadow: palette.shadow,
        textDecoration: 'none',
        cursor: enabled ? 'pointer' : 'not-allowed',
        transition: 'transform 120ms ease, box-shadow 120ms ease, filter 120ms ease',
      }}
      onMouseEnter={(e) => {
        if (enabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.filter = 'brightness(1.06)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.filter = 'brightness(1)';
      }}
    >
      <Icon className="w-4 h-4" />
      {label}
    </a>
  );
}
