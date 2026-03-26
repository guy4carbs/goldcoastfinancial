/**
 * Compact hierarchy node card — inspired by org-chart style
 * Small rectangular card: colored dot + name + title
 * Click to expand stats panel
 */
import { memo, useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, TrendingUp, Award, Target, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { COLORS, RADIUS, SHADOW } from '@/lib/heritageDesignSystem';
import type { HierarchyNodeData } from './types';

function levelColor(cl: number | null): string {
  if (cl == null) return '#9ca3af';
  if (cl >= 100) return '#059669';
  if (cl >= 80) return '#d97706';
  return '#6b7280';
}

function roleLabel(role: string): string {
  if (role === 'owner') return 'Owner';
  if (role === 'manager' || role === 'agency_manager') return 'Manager';
  return 'Agent';
}

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
}

function fmtK(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${Math.round(n / 1000)}K`;
}

const NODE_W = 220;

function HierarchyNodeInner({ data, id, selected }: NodeProps) {
  const { member, isYou, theme } = data as HierarchyNodeData;
  const isSelected = !!selected;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div style={{ width: NODE_W }}>
      {/* Handles — visible colored dots like the reference */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          width: 8,
          height: 8,
          background: isYou ? theme.colors[500] : theme.colors[400],
          border: `2px solid ${isYou ? theme.colors[600] : theme.colors[300]}`,
          borderRadius: '50%',
          top: -4,
        }}
      />

      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative cursor-pointer"
        style={{
          width: NODE_W,
          borderRadius: RADIUS.input,
          backgroundColor: isYou ? `${theme.colors[50]}` : '#fff',
          border: `1.5px solid ${isYou ? theme.colors[400] : COLORS.gray[200]}`,
          boxShadow: isYou
            ? `0 2px 12px ${theme.colors[500]}25, 0 0 0 2px ${theme.colors[200]}50`
            : '0 1px 4px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}
      >
        {/* Accent top bar for YOU node */}
        {isYou && (
          <div
            style={{
              height: 3,
              background: theme.youBadgeGradient,
            }}
          />
        )}

        {/* Main content — compact */}
        <div className="px-3 py-2.5">
          <div className="flex items-center gap-2.5">
            {/* Avatar — small circle */}
            <div
              className="flex items-center justify-center flex-shrink-0 font-semibold"
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                fontSize: 11,
                background: isYou
                  ? `linear-gradient(135deg, ${theme.colors[500]} 0%, ${theme.colors[700]} 100%)`
                  : COLORS.gray[100],
                color: isYou ? '#fff' : COLORS.gray[600],
                border: `1px solid ${isYou ? theme.colors[400] + '60' : COLORS.gray[200]}`,
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

            {/* Info — compact */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className="font-semibold truncate"
                  style={{ fontSize: 13, color: COLORS.gray[900], lineHeight: 1.3 }}
                >
                  {member.name}
                </h3>
                {isYou && (
                  <span
                    className="flex-shrink-0 px-1.5 py-0 font-bold uppercase tracking-wider flex items-center gap-0.5"
                    style={{
                      fontSize: 8,
                      borderRadius: RADIUS.pill,
                      background: theme.youBadgeGradient,
                      color: '#fff',
                      lineHeight: '16px',
                    }}
                  >
                    {theme.name === 'orange' && <Crown className="w-2 h-2" />}
                    You
                  </span>
                )}
              </div>
              <p
                className="truncate flex items-center gap-1"
                style={{ fontSize: 11, color: COLORS.gray[500], lineHeight: 1.3, marginTop: 1 }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isYou ? theme.colors[500] : theme.colors[400] }}
                />
                {member.title}
                {member.contractLevel != null && (
                  <span style={{ color: levelColor(member.contractLevel), fontWeight: 600 }}>
                    · {member.contractLevel}%
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Expanded Stats */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-3 pb-3">
                <div className="pt-2.5 border-t" style={{ borderColor: isYou ? theme.colors[200] : COLORS.gray[150] || COLORS.gray[200] }}>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center p-1.5 rounded-lg" style={{ backgroundColor: COLORS.accent.amber[50] }}>
                      <TrendingUp className="w-3 h-3 mx-auto mb-0.5" style={{ color: COLORS.accent.amber[600] }} />
                      <p className="text-[11px] font-bold" style={{ color: COLORS.accent.amber[700] }}>
                        {fmtK(member.ytdCommission)}
                      </p>
                      <p className="text-[9px]" style={{ color: COLORS.accent.amber[500] }}>YTD</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg" style={{ backgroundColor: theme.statAccent50 }}>
                      <Award className="w-3 h-3 mx-auto mb-0.5" style={{ color: theme.statAccentIcon }} />
                      <p className="text-[11px] font-bold" style={{ color: COLORS.gray[800] }}>
                        {member.policiesSold}
                      </p>
                      <p className="text-[9px]" style={{ color: COLORS.gray[500] }}>Policies</p>
                    </div>
                    <div className="text-center p-1.5 rounded-lg" style={{ backgroundColor: '#ecfdf5' }}>
                      <Target className="w-3 h-3 mx-auto mb-0.5" style={{ color: COLORS.semantic.success }} />
                      <p className="text-[11px] font-bold" style={{ color: COLORS.gray[800] }}>
                        {member.conversionRate}%
                      </p>
                      <p className="text-[9px]" style={{ color: COLORS.gray[500] }}>Conv.</p>
                    </div>
                  </div>

                  {!isYou && (
                    <div className="flex gap-1.5" onClick={handleClick}>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-[10px] gap-1 rounded-lg"
                        style={{
                          backgroundColor: theme.colors[50],
                          color: theme.colors[700],
                          border: `1px solid ${theme.colors[200]}`,
                        }}
                        onClick={() => {
                          if (member.phone) window.location.href = `tel:${member.phone}`;
                        }}
                      >
                        <Phone className="w-3 h-3" />
                        Call
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-[10px] gap-1 rounded-lg"
                        style={{
                          backgroundColor: COLORS.accent.amber[50],
                          color: COLORS.accent.amber[700],
                          border: `1px solid ${COLORS.accent.amber[200]}`,
                        }}
                        onClick={() => {
                          window.location.href = `mailto:${member.email}`;
                        }}
                      >
                        <Mail className="w-3 h-3" />
                        Email
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          width: 8,
          height: 8,
          background: isYou ? theme.colors[500] : theme.colors[400],
          border: `2px solid ${isYou ? theme.colors[600] : theme.colors[300]}`,
          borderRadius: '50%',
          bottom: -4,
        }}
      />
    </div>
  );
}

export const HierarchyNode = memo(HierarchyNodeInner);
