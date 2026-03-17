/**
 * PolicyCard — Rich policy display card for Client Lounge
 *
 * Glass card with policy type icon, status badge, coverage amount,
 * premium, beneficiary info, and next payment date.
 * Framer Motion hover animation.
 */

import { motion } from 'framer-motion';
import {
  Shield,
  Heart,
  TrendingUp,
  Flower2,
  Calendar,
  User,
  CreditCard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  LAYOUT,
  TYPE,
  RADIUS,
  MOTION,
} from '@/lib/heritageDesignSystem';
import {
  glassCard,
  fmtCurrency,
  POLICY_STATUS_COLORS,
  DEMO_CLIENT_POLICIES,
} from '../clientConstants';

const POLICY_ICONS: Record<string, typeof Shield> = {
  'Term Life': Shield,
  'Whole Life': Heart,
  'IUL': TrendingUp,
  'Final Expense': Flower2,
};

const POLICY_ICON_COLORS: Record<string, string> = {
  'Term Life': 'from-blue-500 to-blue-700',
  'Whole Life': 'from-rose-500 to-rose-700',
  'IUL': 'from-violet-500 to-violet-700',
  'Final Expense': 'from-amber-500 to-amber-700',
};

interface PolicyCardProps {
  policy: (typeof DEMO_CLIENT_POLICIES)[number];
  onClick?: () => void;
}

export function PolicyCard({ policy, onClick }: PolicyCardProps) {
  const Icon = POLICY_ICONS[policy.type] ?? Shield;
  const iconGradient = POLICY_ICON_COLORS[policy.type] ?? 'from-gray-500 to-gray-700';
  const statusColor = POLICY_STATUS_COLORS[policy.status];

  return (
    <motion.div
      whileHover={{ y: MOTION.hover.y, scale: MOTION.hover.scale }}
      transition={{ duration: MOTION.duration.hover }}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      <Card
        className="border-0 overflow-hidden"
        style={{
          ...glassCard,
          borderRadius: RADIUS.card,
          boxShadow: '0 8px 16px rgba(0, 0, 0, 0.06)',
        }}
      >
        <CardContent className="p-5">
          {/* Row 1: Icon + Policy type + Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {/* Policy type icon badge */}
              <div
                className={cn('flex items-center justify-center bg-gradient-to-br', iconGradient)}
                style={{
                  width: LAYOUT.icon.xxl,
                  height: LAYOUT.icon.xxl,
                  borderRadius: RADIUS.input,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                <Icon className="text-white" size={LAYOUT.icon.md} aria-hidden="true" />
              </div>
              <div>
                <p className="font-semibold text-gray-900" style={{ fontSize: TYPE.body }}>
                  {policy.type}
                </p>
                <p className="text-gray-500" style={{ fontSize: TYPE.caption }}>
                  {policy.policyNumber} &middot; {policy.carrier}
                </p>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-0.5 font-medium capitalize',
                statusColor.bg,
                statusColor.text,
              )}
              style={{ borderRadius: RADIUS.pill, fontSize: TYPE.caption }}
            >
              <span className={cn('w-1.5 h-1.5 rounded-full', statusColor.dot)} />
              {policy.status}
            </span>
          </div>

          {/* Row 2: Coverage amount */}
          <div className="mb-3">
            <p className="text-gray-400" style={{ fontSize: TYPE.micro, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Coverage Amount
            </p>
            <p className="font-bold text-gray-900" style={{ fontSize: TYPE.section }}>
              {fmtCurrency(policy.coverageAmount)}
            </p>
          </div>

          {/* Row 3: Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Monthly premium */}
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Monthly Premium</p>
                <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption }}>
                  ${policy.monthlyPremium}/mo
                </p>
              </div>
            </div>

            {/* Next payment */}
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Next Payment</p>
                <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption }}>
                  {policy.nextPaymentDate}
                </p>
              </div>
            </div>

            {/* Beneficiary */}
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Beneficiary</p>
                <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption }}>
                  {policy.beneficiaryName}
                </p>
              </div>
            </div>

            {/* Cash value (if applicable) */}
            {'cashValue' in policy && policy.cashValue != null && (
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Cash Value</p>
                  <p className="font-semibold text-emerald-600" style={{ fontSize: TYPE.caption }}>
                    {fmtCurrency(policy.cashValue)}
                  </p>
                </div>
              </div>
            )}

            {/* End date for term policies */}
            {'endDate' in policy && policy.endDate && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-400" style={{ fontSize: TYPE.micro }}>Term Ends</p>
                  <p className="font-semibold text-gray-700" style={{ fontSize: TYPE.caption }}>
                    {policy.endDate}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Auto-pay indicator */}
          {policy.autoPayEnabled && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <span className="inline-flex items-center gap-1.5 text-emerald-600" style={{ fontSize: TYPE.caption }}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Auto-pay enabled
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default PolicyCard;
