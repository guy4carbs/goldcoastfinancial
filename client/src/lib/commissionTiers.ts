/**
 * Heritage Life Solutions — Commission Tier Structure
 * Single source of truth for compensation levels across the platform.
 * Used by: AgentCommissions, AgentGuidelines, manager views, hierarchy
 */

export interface CommissionTier {
  apThreshold: number;    // AP in dollars (0 = starting)
  apLabel: string;        // Display label
  rate: number;           // Contract level percentage
  downlines: string | null;
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { apThreshold: 0,         apLabel: 'Starting',    rate: 65,  downlines: null },
  { apThreshold: 5000,      apLabel: '$5,000',      rate: 70,  downlines: null },
  { apThreshold: 10000,     apLabel: '$10,000',     rate: 75,  downlines: null },
  { apThreshold: 15000,     apLabel: '$15,000',     rate: 80,  downlines: null },
  { apThreshold: 25000,     apLabel: '$25,000',     rate: 85,  downlines: null },
  { apThreshold: 50000,     apLabel: '$50,000',     rate: 90,  downlines: null },
  { apThreshold: 75000,     apLabel: '$75,000',     rate: 95,  downlines: null },
  { apThreshold: 100000,    apLabel: '$100,000',    rate: 100, downlines: null },
  { apThreshold: 150000,    apLabel: '$150,000',    rate: 105, downlines: '5 active downlines at $10K each' },
  { apThreshold: 200000,    apLabel: '$200,000',    rate: 110, downlines: '8 active downlines at $10K each' },
  { apThreshold: 250000,    apLabel: '$250,000',    rate: 115, downlines: '10 active downlines at $10K each' },
  { apThreshold: 300000,    apLabel: '$300,000',    rate: 120, downlines: '15 active downlines at $10K each' },
  { apThreshold: 500000,    apLabel: '$500,000',    rate: 125, downlines: '20 active downlines at $10K each' },
  { apThreshold: 750000,    apLabel: '$750,000',    rate: 130, downlines: '25 active downlines at $10K each' },
];

export const AGENCY_TIERS: CommissionTier[] = [
  { apThreshold: 1000000,   apLabel: '$1,000,000',  rate: 135, downlines: '40 active downlines at $10K each' },
  { apThreshold: 1500000,   apLabel: '$1,500,000',  rate: 140, downlines: '50 active downlines at $10K each' },
  { apThreshold: 2000000,   apLabel: '$2,000,000',  rate: 145, downlines: '80 active downlines at $10K each' },
];

export const ALL_TIERS = [...COMMISSION_TIERS, ...AGENCY_TIERS];

/**
 * Given a current contract level %, return the next tier info.
 * Returns null if already at max.
 */
export function getNextTier(currentRate: number): CommissionTier | null {
  return ALL_TIERS.find((t) => t.rate > currentRate) ?? null;
}

/**
 * Given a current contract level %, return the current tier info.
 */
export function getCurrentTier(currentRate: number): CommissionTier | null {
  // Find the highest tier that matches or is below the current rate
  for (let i = ALL_TIERS.length - 1; i >= 0; i--) {
    if (ALL_TIERS[i].rate <= currentRate) return ALL_TIERS[i];
  }
  return ALL_TIERS[0];
}
