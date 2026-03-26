import { motion } from "framer-motion";
import { DollarSign, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RADIUS, SHADOW, fadeInUp } from "@/lib/heritageDesignSystem";

// ── Commission rate table (client-side estimation only) ──────────────
const COMMISSION_RATES: Record<string, { firstYear: number; renewal: number }> = {
  term_life: { firstYear: 0.80, renewal: 0.04 },
  whole_life: { firstYear: 1.00, renewal: 0.05 },
  iul: { firstYear: 1.10, renewal: 0.05 },
  final_expense: { firstYear: 1.10, renewal: 0.05 },
  mortgage_protection: { firstYear: 0.90, renewal: 0.04 },
  annuity: { firstYear: 0.06, renewal: 0.02 },
};

// ── Normalize free-form product type strings to rate-table keys ──────
function normalizeProductType(type: string): string {
  const t = type.toLowerCase().replace(/[\s-]+/g, "_");
  const map: Record<string, string> = {
    term: "term_life",
    term_life: "term_life",
    whole: "whole_life",
    whole_life: "whole_life",
    iul: "iul",
    indexed_universal: "iul",
    final_expense: "final_expense",
    final: "final_expense",
    mortgage_protection: "mortgage_protection",
    mortgage: "mortgage_protection",
    annuity: "annuity",
  };
  return map[t] || "term_life";
}

// ── Props ────────────────────────────────────────────────────────────
interface CommissionPreviewCardProps {
  workflow: {
    monthly_premium?: string;
    coverage_type?: string;
    policy_type?: string;
    coverage_amount?: number;
    carrier?: string;
  };
}

// ── Component ────────────────────────────────────────────────────────
export function CommissionPreviewCard({ workflow }: CommissionPreviewCardProps) {
  const monthlyPremium = parseFloat(workflow.monthly_premium || "0");
  const annualPremium = monthlyPremium * 12;
  const productType = normalizeProductType(
    workflow.policy_type || workflow.coverage_type || "term_life"
  );
  const rates = COMMISSION_RATES[productType] || COMMISSION_RATES.term_life;
  const firstYearCommission = annualPremium * rates.firstYear;
  const renewalCommission = annualPremium * rates.renewal;

  const fmt = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible">
      <Card
        className="overflow-hidden"
        style={{
          borderRadius: RADIUS.card,
          boxShadow: SHADOW.card,
        }}
      >
        {/* ── Gradient header ──────────────────────────────────── */}
        <div className="bg-gradient-to-br from-violet-500 to-purple-600 px-6 py-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-white">
            {fmt(firstYearCommission)}
          </p>
          <p className="mt-1 text-sm text-white/70">
            Estimated First-Year Commission
          </p>
        </div>

        {/* ── Breakdown section ────────────────────────────────── */}
        <div className="space-y-3 px-6 py-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Annual Premium</span>
            <span className="font-medium text-gray-900">{fmt(annualPremium)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Rate</span>
            <span className="font-medium text-gray-900">
              {(rates.firstYear * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-gray-500">
              <TrendingUp className="h-3.5 w-3.5" />
              Renewal
            </span>
            <span className="font-medium text-gray-900">
              {fmt(renewalCommission)}/year
            </span>
          </div>
        </div>

        {/* ── Disclaimer ───────────────────────────────────────── */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-400">
            Estimates only. Actual commissions depend on carrier contract
            levels, hierarchy overrides, and chargebacks.
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
