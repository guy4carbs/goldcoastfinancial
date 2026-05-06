/**
 * Founders Lounge — server-side demo data fallback.
 *
 * Each Founders endpoint calls its real query first. When the result is empty
 * (no teams in agent_hierarchy, no leads, no deals, etc.), the route returns
 * the matching demo object below. As soon as real data lands the demo is
 * silently replaced. Toggle the whole system off by setting
 * `FOUNDERS_DEMO_FALLBACK=false`.
 */

export const DEMO_FALLBACK_ENABLED =
  (process.env.FOUNDERS_DEMO_FALLBACK ?? "true").toLowerCase() !== "false";

const TEAM_NAMES = ["Alpha", "Beta", "Gamma", "Delta", "Echo"];
const MANAGERS = [
  { firstName: "Marcus", lastName: "Rivera", email: "marcus.rivera@heritagels.org" },
  { firstName: "Jennifer", lastName: "Walsh", email: "jennifer.walsh@heritagels.org" },
  { firstName: "Kevin", lastName: "Park", email: "kevin.park@heritagels.org" },
  { firstName: "Natasha", lastName: "Romero", email: "natasha.romero@heritagels.org" },
  { firstName: "Brandon", lastName: "Mills", email: "brandon.mills@heritagels.org" },
];
const STATUSES: Array<"on-track" | "at-risk" | "behind"> = [
  "on-track", "on-track", "on-track", "at-risk", "behind",
];

function uid(seed: string): string {
  // Deterministic UUID-shaped string from a seed.
  const h = Array.from(seed).reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const hex = h.toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.padEnd(12, "0")}`;
}

// Period multiplier used by the team-scoped demo helpers to scale YTD
// baselines down to MTD/QTD windows. Matches the front-end's MTD/QTD/YTD
// selector — not the Profit Split presets that periodScale() handles.
function periodMultiplier(period?: string): number {
  switch (period) {
    case "mtd": return 0.08;
    case "qtd": return 0.25;
    case "ytd":
    default: return 1.0;
  }
}

// ─── TEAMS / BOOK ────────────────────────────────────────────────────────────

export function demoTeams(period?: string) {
  const mult = periodMultiplier(period);
  const baseRevenues = [542000, 478000, 385000, 298000, 172000];
  const basePipelines = [1280000, 1100000, 980000, 820000, 570000];
  const baseAgents = [16, 14, 12, 11, 8];
  const baseClients = [87, 72, 58, 48, 32];
  const basePolicies = [124, 98, 76, 62, 41];
  const basePremium = [3400000, 2700000, 1900000, 1500000, 890000];
  const renewal = [94.2, 91.8, 89.5, 86.3, 82.1];
  const conversion = [24.8, 21.3, 22.1, 19.4, 16.8];

  return TEAM_NAMES.map((n, i) => {
    const id = uid(`team-${n}`);
    const scaledPolicies = Math.max(0, Math.round(basePolicies[i] * mult));
    const scaledPremium = Math.round(basePremium[i] * mult);
    const scaledPipeline = Math.round(basePipelines[i] * mult);
    const scaledRevenue = Math.round(baseRevenues[i] * mult);
    // quotaAttainment is a derived percentage scaled the same way so the
    // KPI tile and the per-team rows agree on "this period".
    const quotaAttainment = Math.round(87 * mult * 100) / 100;
    return {
      id,
      name: `Team ${n}`,
      manager: { id: uid(`mgr-${n}`), ...MANAGERS[i] },
      hierarchyTitle: i < 3 ? "Regional Manager" : "Team Lead",
      contractLevel: 100 - i * 5,
      agentCount: baseAgents[i],
      clientCount: baseClients[i],
      policyCount: scaledPolicies,
      totalPremium: scaledPremium,
      // avgPolicyValue is per-policy, so it's window-independent — derive
      // from the unscaled YTD baseline to avoid div-by-zero on MTD/QTD
      // windows where rounding could zero out scaledPolicies.
      avgPolicyValue: Math.round(basePremium[i] / basePolicies[i]),
      revenue: scaledRevenue,
      pipeline: scaledPipeline,
      conversionRate: conversion[i],
      renewalRate: renewal[i],
      pipelineValue: scaledPipeline,
      // Field name kept for FE backward compat — value is now period-scoped.
      revenueLast30: scaledRevenue,
      quotaAttainment,
      status: STATUSES[i],
    };
  });
}

// Agent pool — 4 unique agents per team × 5 teams = 20 distinct agents.
const AGENT_POOL: Array<Array<{
  firstName: string; lastName: string; role: string;
  clients: number; premium: number; retention: number; satisfaction: number;
  quotaAttainment: number; complianceScore: number;
}>> = [
  // Team Alpha
  [
    { firstName: "Mike", lastName: "Chen", role: "Senior Agent", clients: 9, premium: 384000, retention: 96.4, satisfaction: 88, quotaAttainment: 118, complianceScore: 96 },
    { firstName: "Sarah", lastName: "Johnson", role: "Senior Agent", clients: 8, premium: 312000, retention: 93.7, satisfaction: 85, quotaAttainment: 109, complianceScore: 94 },
    { firstName: "Linda", lastName: "Kao", role: "Agent", clients: 6, premium: 218000, retention: 91.2, satisfaction: 82, quotaAttainment: 96, complianceScore: 91 },
    { firstName: "Marcus", lastName: "Reed", role: "Junior Agent", clients: 4, premium: 142000, retention: 87.5, satisfaction: 78, quotaAttainment: 78, complianceScore: 88 },
  ],
  // Team Beta
  [
    { firstName: "Nicole", lastName: "Harris", role: "Senior Agent", clients: 7, premium: 296000, retention: 95.2, satisfaction: 86, quotaAttainment: 112, complianceScore: 95 },
    { firstName: "Amanda", lastName: "Torres", role: "Agent", clients: 5, premium: 198000, retention: 92.1, satisfaction: 79, quotaAttainment: 93, complianceScore: 91 },
    { firstName: "Victor", lastName: "Nguyen", role: "Junior Agent", clients: 4, premium: 152000, retention: 89.4, satisfaction: 75, quotaAttainment: 82, complianceScore: 88 },
    { firstName: "Tina", lastName: "Brooks", role: "Agent", clients: 5, premium: 184000, retention: 90.8, satisfaction: 81, quotaAttainment: 88, complianceScore: 90 },
  ],
  // Team Gamma
  [
    { firstName: "James", lastName: "Wright", role: "Senior Agent", clients: 6, premium: 224000, retention: 92.5, satisfaction: 83, quotaAttainment: 104, complianceScore: 92 },
    { firstName: "Priya", lastName: "Shah", role: "Agent", clients: 5, premium: 176000, retention: 90.7, satisfaction: 80, quotaAttainment: 91, complianceScore: 90 },
    { firstName: "Daniel", lastName: "O'Connor", role: "Agent", clients: 4, premium: 138000, retention: 88.2, satisfaction: 77, quotaAttainment: 79, complianceScore: 87 },
    { firstName: "Yara", lastName: "Costa", role: "Junior Agent", clients: 3, premium: 98000, retention: 85.1, satisfaction: 74, quotaAttainment: 68, complianceScore: 85 },
  ],
  // Team Delta
  [
    { firstName: "Eric", lastName: "Wallace", role: "Senior Agent", clients: 5, premium: 192000, retention: 91.0, satisfaction: 81, quotaAttainment: 98, complianceScore: 91 },
    { firstName: "Hannah", lastName: "Park", role: "Agent", clients: 4, premium: 144000, retention: 88.6, satisfaction: 78, quotaAttainment: 84, complianceScore: 89 },
    { firstName: "Diego", lastName: "Ramos", role: "Agent", clients: 4, premium: 132000, retention: 87.4, satisfaction: 76, quotaAttainment: 76, complianceScore: 87 },
    { firstName: "Mei", lastName: "Liu", role: "Junior Agent", clients: 2, premium: 64000, retention: 82.0, satisfaction: 71, quotaAttainment: 58, complianceScore: 83 },
  ],
  // Team Echo
  [
    { firstName: "Brandon", lastName: "Mills", role: "Agent", clients: 4, premium: 128000, retention: 87.8, satisfaction: 76, quotaAttainment: 73, complianceScore: 86 },
    { firstName: "Olivia", lastName: "Pham", role: "Agent", clients: 3, premium: 96000, retention: 84.5, satisfaction: 73, quotaAttainment: 64, complianceScore: 84 },
    { firstName: "Trevor", lastName: "Ng", role: "Junior Agent", clients: 2, premium: 58000, retention: 80.1, satisfaction: 70, quotaAttainment: 52, complianceScore: 81 },
    { firstName: "Renata", lastName: "Silva", role: "Junior Agent", clients: 2, premium: 48000, retention: 78.4, satisfaction: 68, quotaAttainment: 46, complianceScore: 79 },
  ],
];

function teamIndexFromId(teamId: string): number {
  // Match by checksum of teamId against the team uids we generate. Falls back to 0.
  for (let i = 0; i < TEAM_NAMES.length; i++) {
    if (uid(`team-${TEAM_NAMES[i]}`) === teamId) return i;
  }
  return 0;
}

export function demoTeamAgents(teamId: string, period?: string) {
  const mult = periodMultiplier(period);
  const teamIdx = teamIndexFromId(teamId);
  const teamName = `Team ${TEAM_NAMES[teamIdx]}`;
  const agents = AGENT_POOL[teamIdx] || AGENT_POOL[0];
  return agents.map((a, i) => {
    const scaledPolicyCount = Math.max(0, Math.round(a.clients * mult));
    const scaledPremium = Math.round(a.premium * mult);
    // quotaAttainment is a percentage tied to the period's revenue capture.
    const scaledQuota = Math.round(a.quotaAttainment * mult * 100) / 100;
    // revenueMtd is the field name FE consumes; value is period-scoped.
    // Baseline assumes a.premium is annual, so YTD ≈ premium itself.
    const scaledRevenue = Math.round(a.premium * mult);
    const scaledPipeline = Math.round(a.premium * mult * 1.6);
    return {
      id: uid(`agent-${teamId}-${i}`),
      firstName: a.firstName,
      lastName: a.lastName,
      email: `${a.firstName.toLowerCase()}.${a.lastName.toLowerCase()}@heritagels.org`,
      role: a.role,
      contractLevel: 80 + i * 2,
      hierarchyLevel: 6,
      hierarchyTitle: a.role,
      clientCount: a.clients,
      policyCount: scaledPolicyCount,
      totalPremium: scaledPremium,
      pipelineValue: scaledPipeline,
      retention: a.retention,
      satisfaction: a.satisfaction,
      quotaAttainment: scaledQuota,
      revenueMtd: scaledRevenue,
      complianceScore: a.complianceScore,
      team: teamName,
      status: "active",
      isActive: true,
    };
  });
}

export function demoAgentClients(agentId: string) {
  const samples = [
    { firstName: "Patricia", lastName: "Morales", policyType: "IUL", monthly: 2200, status: "active" },
    { firstName: "Raymond", lastName: "Dupree", policyType: "Annuity", monthly: 3000, status: "active" },
    { firstName: "Natalie", lastName: "Kim", policyType: "Term Life", monthly: 300, status: "active" },
    { firstName: "Daniel", lastName: "Reyes", policyType: "Whole Life", monthly: 850, status: "pending_renewal" },
    { firstName: "Alice", lastName: "Okafor", policyType: "Final Expense", monthly: 145, status: "new" },
  ];
  return samples.map((c, i) => ({
    id: uid(`client-${agentId}-${i}`),
    firstName: c.firstName,
    lastName: c.lastName,
    email: `${c.firstName.toLowerCase()}.${c.lastName.toLowerCase()}@example.com`,
    phone: "(305) 555-2247",
    city: "Miami",
    state: "FL",
    policyType: c.policyType,
    monthlyPremium: c.monthly,
    annualPremium: c.monthly * 12,
    policyCount: 1,
    totalPremium: c.monthly * 12,
    status: c.status,
  }));
}

export function demoClientDetail(clientId: string) {
  return {
    client: {
      id: clientId,
      firstName: "Patricia",
      lastName: "Morales",
      email: "patricia.morales@example.com",
      phone: "(305) 555-2247",
      streetAddress: "1450 Brickell Ave",
      addressLine2: "Apt 2201",
      city: "Miami",
      state: "FL",
      zipCode: "33131",
      mailingSameAsResidence: true,
      mailingStreetAddress: null,
      mailingCity: null,
      mailingState: null,
      mailingZipCode: null,
      dateOfBirth: "1973-06-08",
      gender: "female",
      maritalStatus: "married",
      occupation: "Senior Architect",
      employer: "Brickell Design Group",
      annualIncome: 184000,
      heightInches: 65,
      weightLbs: 142,
      smokerStatus: "non_smoker",
      healthClass: "preferred_plus",
      medicalConditions: "Mild seasonal asthma — well controlled with maintenance inhaler. No hospitalizations.",
      emergencyContactName: "Carlos Morales",
      emergencyContactPhone: "(305) 555-9118",
      emergencyContactRelationship: "Spouse",
      driversLicenseNumberMasked: "*****4421",
      driversLicenseState: "FL",
      driversLicenseExpiration: "2027-06-08",
      ssnLast4: "8842",
      ssnMasked: "***-**-8842",
      bankName: "JPMorgan Chase",
      bankAccountType: "checking",
      accountLast4: "6701",
      routingMasked: "********",
      preferredContactMethod: "email",
      doNotContact: false,
      agentNotes:
        "Long-time client. Renewed IUL in Dec 2024 with $100K coverage bump. Interested in adding term coverage for new investment property. Prefers Tuesday afternoon calls.",
      lastContactDate: "2025-03-18T15:30:00Z",
      nextContactScheduled: "2025-04-22T19:00:00Z",
      assignedAgentId: null,
      createdAt: "2019-08-12T14:22:00Z",
      status: "active",
    },
    policy: {
      id: uid(`policy-${clientId}`),
      policyType: "IUL",
      policyNumber: "HLS-2026-10016",
      carrier: "Heritage Life Solutions",
      coverageAmount: 1100000,
      monthlyPremium: 2200,
      annualPremium: 26400,
      premiumMode: "monthly",
      effectiveDate: "2024-12-01",
      renewalDate: "2025-12-01",
      applicationDate: "2024-10-15",
      issueDate: "2024-11-22",
      startDate: "2024-12-01",
      nextPaymentDate: "2025-05-01",
      status: "active",
      riskClass: "preferred_plus_non_tobacco",
      smokerStatus: "non_smoker",
      beneficiaryName: "Carlos Morales",
      beneficiaryRelationship: "Spouse",
      beneficiaryDob: "1971-02-14",
      beneficiaryPhone: "(305) 555-9118",
      beneficiaryEmail: "carlos.morales@example.com",
      beneficiarySsnMasked: "***-**-3104",
      contingentBeneficiaryName: "Sofia Morales",
      contingentBeneficiaryRelationship: "Daughter",
      contingentBeneficiaryPhone: "(305) 555-7732",
      contingentBeneficiaryEmail: "sofia.morales@example.com",
      riders: [
        { name: "Accelerated Death Benefit", type: "ADB" },
        { name: "Children's Term Rider", type: "CTR" },
      ],
      agentNotes:
        "Recommended IUL with index strategy split 70/30 S&P 500 / Multi-Index. Premium fully paid current. Annual review scheduled for Dec 2025.",
      lastContactDate: "2025-03-18T15:30:00Z",
    },
  };
}

// ─── METRICS / KPIS ──────────────────────────────────────────────────────────

export function demoTeamsKpis(period?: string) {
  const mult = periodMultiplier(period);
  return {
    // Headcount-style KPIs scale too — MTD shows "fewer agents active so
    // far this month" so the page tells a consistent narrative.
    activeAgents: Math.max(1, Math.round(61 * mult)),
    avgQuotaAttainment: Math.round(87 * mult * 100) / 100,
    topTeamName: "Team Alpha",
    topTeamRevenue: Math.round(542000 * mult),
    teamsOnTrack: Math.max(0, Math.round(3 * mult)),
    totalTeams: 5,
  };
}

export function demoTeamTrends(months = 6) {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    const label = `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
    return {
      month: label,
      Alpha: 380000 + i * 32000,
      Beta: 340000 + i * 28000,
      Gamma: 280000 + i * 21000,
      Delta: 220000 + i * 16000,
      Echo: 130000 + i * 9000,
    };
  });
}

// ─── REVENUE (oversight) ─────────────────────────────────────────────────────

export function demoRevenueKpis() {
  return { apMtd: 312000, apYtd: 1875000, overrideYtd: 312000, netMargin: 18.5 };
}

export function demoRevenuePeriodTrend() {
  const monthsBack = 12;
  const now = new Date();
  const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const current: Array<{ month: string; revenue: number }> = [];
  const prior: Array<{ month: string; revenue: number }> = [];
  // Current period: trend up 80K → 312K
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    current.push({
      month: fmt(d),
      revenue: Math.round(80000 + (monthsBack - 1 - i) * 21000 + Math.sin(i) * 10000),
    });
  }
  // Prior period: trend up 60K → 240K (equivalent months last year)
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear() - 1, now.getMonth() - i, 1);
    prior.push({
      month: fmt(d),
      revenue: Math.round(60000 + (monthsBack - 1 - i) * 16000 + Math.cos(i) * 8000),
    });
  }
  return { current, prior, periodLabel: "ytd" };
}

// ─── EXECUTIVE BRIEFING DASHBOARD ────────────────────────────────────────────
// Powers the new top-level Founders dashboard (cockpit view). Every helper
// returns a self-contained shape — the route layer is the only place that
// adds HTTP-ish wrapping. Money values are WHOLE DOLLARS (matching
// /revenue/kpis convention; lead-revenue is the only cents-shape we keep).

export function demoDashboardKpis() {
  return {
    revenue: 1875000,
    activeAgents: 61,
    cashPosition: 480000,
    founderProfit: 312000,
    leadProfit: 422,
    periodLabel: "ytd",
  };
}

export function demoDashboardAtAGlance() {
  // 30-day upward sparkline. Anchor "today" as the last point so the chart
  // visually lines up with whatever "now" is when the demo renders.
  const days = 30;
  const now = new Date();
  const sparkline = Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - i));
    // Gentle upward trend with mild noise — feels organic, not generated.
    const base = 38000 + i * 1400;
    const noise = ((i * 9301 + 49297) % 233280) / 233280; // deterministic
    const value = Math.round(base + noise * 9000 - 4500);
    return { date: d.toISOString().split("T")[0], value };
  });
  return {
    sparkline,
    newDeals: 47,
    overrideIncome: 45000,
    leadProfit: 422,
    newAgents: 4,
    periodLabel: "ytd",
  };
}

export function demoDashboardAttention() {
  return [
    {
      id: "demo-board-decisions",
      kind: "board_decision" as const,
      title: "2 board decisions awaiting quorum",
      count: 2,
      href: "/founders/access",
      urgency: "high" as const,
    },
    {
      id: "demo-carrier-onboarding",
      kind: "carrier_onboarding" as const,
      title: "3 carrier appointments in progress",
      count: 3,
      href: "/hcms/carriers",
      urgency: "low" as const,
    },
  ];
}

export function demoDashboardCompliance() {
  // Believable steady-state: 95% licenses current, full E&O, a couple of
  // pending background checks, no overdue training. Always isExample:true so
  // the UI can flag the chrome until real sources land.
  return {
    activeLicenses: { current: 58, total: 61 },
    eoCurrent: { pct: 100 },
    pendingBackgroundChecks: { count: 2 },
    overdueTraining: { count: 0 },
    isExample: true,
  };
}

export function demoDashboardQuarterlyGoals() {
  // Wired to demoDashboardKpis() so the demo "current" values stay
  // internally consistent if someone tweaks one number.
  return [
    { label: "Revenue target", current: 1875000, target: 2400000, pct: 78, unit: "$" as const, isExample: true },
    { label: "New agents", current: 4, target: 12, pct: 33, unit: "agents" as const, isExample: true },
    { label: "Override growth", current: 18, target: 25, pct: 72, unit: "%" as const, isExample: true },
  ];
}

export function demoDashboardRecentActivity() {
  const now = Date.now();
  const items: Array<{
    kind: "lead_converted" | "policy_issued" | "agent_onboarded" | "license_renewed";
    title: string;
    href: string | null;
    minutesAgo: number;
  }> = [
    { kind: "policy_issued", title: "Policy HLS-2026-80436 issued (Marcus Rivera)", href: "/ops/deals", minutesAgo: 12 },
    { kind: "lead_converted", title: "Lead converted — Patricia Morales → IUL $1.1M", href: "/ops/crm", minutesAgo: 47 },
    { kind: "agent_onboarded", title: "Agent onboarded — Trevor Ng joined Team Echo", href: "/founders/teams", minutesAgo: 95 },
    { kind: "policy_issued", title: "Policy HLS-2026-80422 issued (Sarah Johnson)", href: "/ops/deals", minutesAgo: 240 },
    { kind: "license_renewed", title: "License renewed — Mike Chen (FL Life)", href: "/hcms/licensing", minutesAgo: 312 },
    { kind: "lead_converted", title: "Lead converted — Daniel Reyes → Whole Life $400K", href: "/ops/crm", minutesAgo: 408 },
    { kind: "policy_issued", title: "Policy HLS-2026-80401 issued (Kevin Park)", href: "/ops/deals", minutesAgo: 540 },
    { kind: "agent_onboarded", title: "Agent onboarded — Renata Silva joined Team Echo", href: "/founders/teams", minutesAgo: 720 },
  ];
  return items.map((it, i) => ({
    id: uid(`exec-activity-${i}`),
    ts: new Date(now - it.minutesAgo * 60 * 1000).toISOString(),
    kind: it.kind,
    title: it.title,
    href: it.href,
  }));
}

export function demoRevenueByCarrier() {
  return [
    { carrier: "American Equity", deals: 47, ap: 612000, issuedAp: 548000 },
    { carrier: "Athene", deals: 38, ap: 495000, issuedAp: 442000 },
    { carrier: "F&G Life", deals: 29, ap: 378000, issuedAp: 339000 },
    { carrier: "North American", deals: 22, ap: 286000, issuedAp: 254000 },
    { carrier: "Mutual of Omaha", deals: 18, ap: 234000, issuedAp: 209000 },
    { carrier: "Allianz", deals: 14, ap: 195000, issuedAp: 174000 },
  ];
}

export function demoRevenueByAgent() {
  return [
    { agentId: "demo-agent-1", name: "Marcus Rivera", team: "Team Rivera", deals: 24, ap: 312000 },
    { agentId: "demo-agent-2", name: "Jennifer Walsh", team: "Team Walsh", deals: 21, ap: 273000 },
    { agentId: "demo-agent-3", name: "Kevin Park", team: "Team Park", deals: 19, ap: 247000 },
    { agentId: "demo-agent-4", name: "Natasha Romero", team: "Team Romero", deals: 17, ap: 221000 },
    { agentId: "demo-agent-5", name: "Brandon Mills", team: "Team Mills", deals: 15, ap: 195000 },
    { agentId: "demo-agent-6", name: "Sasha Chen", team: "Team Rivera", deals: 13, ap: 169000 },
    { agentId: "demo-agent-7", name: "David Patel", team: "Team Walsh", deals: 11, ap: 143000 },
    { agentId: "demo-agent-8", name: "Maya Johnson", team: "Team Park", deals: 9, ap: 117000 },
  ];
}

// ─── LEAD REVENUE ────────────────────────────────────────────────────────────

export function demoLeadRevenueKpis() {
  // 412 consolidation × $0.99 + 880 survey × $0.50 = $407.88 + $440 = $847.88 gross
  // Vendor cost: 412 × $0.50 + 880 × $0.25 = $206 + $220 = $426
  // Net profit: $421.88
  return {
    grossCents: 84788,
    vendorCostCents: 42600,
    netProfitCents: 42188,
    unitsSold: 1292,
    periodLabel: "ytd",
  };
}

export function demoLeadRevenueByProduct() {
  return [
    {
      slug: "consolidation",
      name: "Consolidation",
      units: 412,
      grossCents: 40788,
      vendorCostCents: 20600,
      netProfitCents: 20188,
      marginPct: 49.5,
    },
    {
      slug: "survey",
      name: "Survey",
      units: 880,
      grossCents: 44000,
      vendorCostCents: 22000,
      netProfitCents: 22000,
      marginPct: 50.0,
    },
  ];
}

// ─── GROWTH ──────────────────────────────────────────────────────────────────

// Single source of truth for period scaling across the growth demo helpers.
// Ratios stay independent of period (they're percentages, not totals).
function periodScale(period?: string): number {
  const p = period || "ytd";
  const map: Record<string, number> = {
    today: 0.02,
    wtd: 0.06,
    mtd: 0.15,
    qtd: 0.4,
    "6mo": 0.7,
    ytd: 1,
    all: 1.4,
    "this-month": 0.15,
    "last-month": 0.18,
    "last-3": 0.42,
    "last-6": 0.7,
    "last-year": 1.1,
  };
  return map[p] ?? 1;
}

// New pipeline-first KPI shape — Nova will code against this.
// applicantsThisPeriod / hiredThisPeriod scale with period; conversionPct
// and avgTimeToProductivityDays are ratios/durations independent of window.
export function demoGrowthKpis(period?: string) {
  const p = period || "ytd";
  const scale = periodScale(p);
  return {
    applicantsThisPeriod: Math.round(124 * scale),
    hiredThisPeriod: Math.round(38 * scale),
    conversionPct: 30.6,
    avgTimeToProductivityDays: 41,
    periodLabel: p,
  };
}

export function demoGrowthFunnel(period?: string) {
  const scale = periodScale(period);
  return [
    { stage: "Applicants", count: Math.round(124 * scale), color: "var(--gc-chart-1)" },
    { stage: "Interviewed", count: Math.round(78 * scale), color: "var(--gc-chart-2)" },
    { stage: "Offered", count: Math.round(52 * scale), color: "var(--gc-chart-3)" },
    { stage: "Hired", count: Math.round(38 * scale), color: "var(--gc-chart-4)" },
  ];
}

export function demoGrowthTeams() {
  return demoTeams().map(t => ({
    id: t.id,
    name: t.name,
    manager: `${t.manager.firstName} ${t.manager.lastName}`,
    agents: t.agentCount,
    revenue: t.revenue,
    pipeline: t.pipeline,
    conversion: t.conversionRate,
    status: t.status,
  }));
}

export function demoGrowthTopPerformers(period?: string) {
  const scale = periodScale(period);
  const base = [
    { id: uid("perf-1"), name: "Mike Chen", role: "Senior Agent", team: "Team Beta", revenue: 296000, deals: 24, trend: "up" as const },
    { id: uid("perf-2"), name: "Sarah Johnson", role: "Senior Agent", team: "Team Alpha", revenue: 284000, deals: 22, trend: "up" as const },
    { id: uid("perf-3"), name: "Nicole Harris", role: "Agent", team: "Team Beta", revenue: 242000, deals: 19, trend: "up" as const },
    { id: uid("perf-4"), name: "Amanda Torres", role: "Agent", team: "Team Beta", revenue: 198000, deals: 16, trend: "up" as const },
    { id: uid("perf-5"), name: "James Wright", role: "Agent", team: "Team Gamma", revenue: 184000, deals: 15, trend: "down" as const },
    { id: uid("perf-6"), name: "Linda Kao", role: "Senior Agent", team: "Team Alpha", revenue: 172000, deals: 14, trend: "up" as const },
    { id: uid("perf-7"), name: "Victor Nguyen", role: "Junior Agent", team: "Team Beta", revenue: 124000, deals: 11, trend: "up" as const },
    { id: uid("perf-8"), name: "Priya Shah", role: "Agent", team: "Team Gamma", revenue: 116000, deals: 10, trend: "up" as const },
    { id: uid("perf-9"), name: "Eric Wallace", role: "Senior Agent", team: "Team Delta", revenue: 108000, deals: 9, trend: "down" as const },
    { id: uid("perf-10"), name: "Hannah Park", role: "Agent", team: "Team Delta", revenue: 96000, deals: 8, trend: "up" as const },
  ];
  return base.map((p) => ({
    ...p,
    revenue: Math.round(p.revenue * scale),
    deals: Math.max(1, Math.round(p.deals * scale)),
  }));
}

export function demoGrowthHiringTrend(months = 6) {
  const counts = [4, 5, 6, 8, 7, 8];
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
    return {
      month: `${d.toLocaleString("en-US", { month: "short" })}`,
      hires: counts[i] ?? 6,
    };
  });
}

// ─── LEADS ───────────────────────────────────────────────────────────────────

export function demoLeadsKpis(period?: string) {
  const mult = periodMultiplier(period);
  return {
    // Volume KPIs scale with the selected window so MTD shows fewer leads
    // than YTD. successRate is a percentage and stays window-independent.
    total: Math.max(0, Math.round(40 * mult)),
    inPool: Math.max(0, Math.round(12 * mult)),
    fromWebsite: Math.max(0, Math.round(2 * mult)),
    distributed: Math.max(0, Math.round(28 * mult)),
    hot: Math.max(0, Math.round(5 * mult)),
    successRate: 22.6,
  };
}


export function demoLeadsDistributionHistory(limit?: number) {
  const cap = Math.min(50, Math.max(1, limit ?? 5));
  const now = Date.now();
  // Reuse demoTeams() manager identities so the page reads coherently with
  // the rest of the Founders Lounge fixtures.
  const teams = demoTeams();
  const managers = teams.slice(0, 3).map((t) => ({
    managerId: t.manager.id,
    managerName: `${t.manager.firstName} ${t.manager.lastName}`,
  }));
  const dayMs = 24 * 60 * 60 * 1000;
  // Allocations split each batch's totalLeads across the 3 demo managers.
  const batches: Array<{
    batchId: string;
    daysAgo: number;
    totalLeads: number;
    splits: number[];
  }> = [
    { batchId: "demo-batch-001", daysAgo: 3,  totalLeads: 12, splits: [4, 4, 4] },
    { batchId: "demo-batch-002", daysAgo: 8,  totalLeads: 9,  splits: [3, 3, 3] },
    { batchId: "demo-batch-003", daysAgo: 14, totalLeads: 15, splits: [5, 5, 5] },
    { batchId: "demo-batch-004", daysAgo: 22, totalLeads: 6,  splits: [2, 2, 2] },
    { batchId: "demo-batch-005", daysAgo: 30, totalLeads: 11, splits: [4, 4, 3] },
  ];
  return batches.slice(0, cap).map((b) => ({
    batchId: b.batchId,
    distributedAt: new Date(now - b.daysAgo * dayMs).toISOString(),
    totalLeads: b.totalLeads,
    managers: managers.map((m, i) => ({
      managerId: m.managerId,
      managerName: m.managerName,
      leadCount: b.splits[i] ?? 0,
    })),
  }));
}

const LEAD_SAMPLES: Array<{
  firstName: string; lastName: string; email: string; phone: string;
  city: string; state: string; source: string; priority: string;
  status: string; pipelineStage: string; coverageType: string;
  estimatedValue: number; leadScore: number; leadScoreTier: string;
}> = [
  { firstName: "Robert", lastName: "Martinez", email: "robert.martinez@example.com", phone: "(312) 555-1843", city: "Chicago", state: "IL", source: "web_form", priority: "high", status: "new", pipelineStage: "new", coverageType: "Term Life", estimatedValue: 18000, leadScore: 92, leadScoreTier: "on_fire" },
  { firstName: "Sandra", lastName: "Lewis", email: "sandra.lewis@example.com", phone: "(404) 555-9217", city: "Atlanta", state: "GA", source: "csv_import", priority: "high", status: "new", pipelineStage: "new", coverageType: "Whole Life", estimatedValue: 24000, leadScore: 78, leadScoreTier: "hot" },
  { firstName: "Jamal", lastName: "Brown", email: "jamal.brown@example.com", phone: "(214) 555-3401", city: "Dallas", state: "TX", source: "csv_import", priority: "medium", status: "new", pipelineStage: "new", coverageType: "IUL", estimatedValue: 32000, leadScore: 64, leadScoreTier: "hot" },
  { firstName: "Wei", lastName: "Zhang", email: "wei.zhang@example.com", phone: "(415) 555-7782", city: "San Francisco", state: "CA", source: "web_form", priority: "medium", status: "new", pipelineStage: "new", coverageType: "Annuity", estimatedValue: 45000, leadScore: 51, leadScoreTier: "warm" },
  { firstName: "Maria", lastName: "Garcia", email: "maria.garcia@example.com", phone: "(305) 555-1122", city: "Miami", state: "FL", source: "cold_list", priority: "low", status: "new", pipelineStage: "new", coverageType: "Final Expense", estimatedValue: 6500, leadScore: 38, leadScoreTier: "warm" },
  { firstName: "Henry", lastName: "Patel", email: "henry.patel@example.com", phone: "(617) 555-4498", city: "Boston", state: "MA", source: "csv_import", priority: "medium", status: "new", pipelineStage: "new", coverageType: "Term Life", estimatedValue: 22000, leadScore: 45, leadScoreTier: "warm" },
  { firstName: "Emma", lastName: "Wilson", email: "emma.wilson@example.com", phone: "(503) 555-6620", city: "Portland", state: "OR", source: "csv_import", priority: "low", status: "new", pipelineStage: "new", coverageType: "Whole Life", estimatedValue: 14000, leadScore: 28, leadScoreTier: "cold" },
  { firstName: "Carlos", lastName: "Hernandez", email: "carlos.hernandez@example.com", phone: "(720) 555-8814", city: "Denver", state: "CO", source: "web_form", priority: "high", status: "new", pipelineStage: "new", coverageType: "IUL", estimatedValue: 38000, leadScore: 86, leadScoreTier: "on_fire" },
  { firstName: "Aisha", lastName: "Mohammed", email: "aisha.mohammed@example.com", phone: "(202) 555-2299", city: "Washington", state: "DC", source: "partner_referral", priority: "high", status: "new", pipelineStage: "new", coverageType: "Term Life", estimatedValue: 19500, leadScore: 71, leadScoreTier: "hot" },
  { firstName: "Tyler", lastName: "Cooper", email: "tyler.cooper@example.com", phone: "(615) 555-3344", city: "Nashville", state: "TN", source: "cold_list", priority: "low", status: "new", pipelineStage: "new", coverageType: "Final Expense", estimatedValue: 4200, leadScore: 22, leadScoreTier: "cold" },
  { firstName: "Olivia", lastName: "Davis", email: "olivia.davis@example.com", phone: "(602) 555-7710", city: "Phoenix", state: "AZ", source: "csv_import", priority: "medium", status: "new", pipelineStage: "new", coverageType: "Annuity", estimatedValue: 28000, leadScore: 58, leadScoreTier: "warm" },
  { firstName: "Marcus", lastName: "Greene", email: "marcus.greene@example.com", phone: "(813) 555-1166", city: "Tampa", state: "FL", source: "web_form", priority: "high", status: "new", pipelineStage: "new", coverageType: "Whole Life", estimatedValue: 26000, leadScore: 88, leadScoreTier: "on_fire" },
];

export function demoLeadsPool() {
  const now = Date.now();
  return LEAD_SAMPLES.map((s, i) => ({
    id: uid(`lead-${i}`),
    ...s,
    createdAt: new Date(now - i * 3 * 60 * 60 * 1000).toISOString(),
  }));
}

export function demoLeadsManagers() {
  return demoTeams().map(t => ({
    id: t.manager.id,
    manager: { firstName: t.manager.firstName, lastName: t.manager.lastName, email: t.manager.email },
    hierarchyTitle: t.hierarchyTitle,
    agentCount: t.agentCount,
  }));
}

export function demoLeadsImports() {
  const now = Date.now();
  return [
    { id: uid("imp-1"), fileName: "Q1_Leads_MarketingCampaign.csv", totalRows: 15, importedRows: 15, skippedRows: 0, source: "csv_import", createdAt: new Date(now - 12 * 24 * 3600 * 1000).toISOString() },
    { id: uid("imp-2"), fileName: "Partner_Referrals_March.xlsx", totalRows: 10, importedRows: 9, skippedRows: 1, source: "csv_import", createdAt: new Date(now - 7 * 24 * 3600 * 1000).toISOString() },
    { id: uid("imp-3"), fileName: "Cold_List_Southeast.csv", totalRows: 12, importedRows: 12, skippedRows: 0, source: "csv_import", createdAt: new Date(now - 3 * 24 * 3600 * 1000).toISOString() },
  ];
}

// ─── AGENCY MANAGEMENT (Founders) ────────────────────────────────────────────
// Demo helpers for the new Founders Agency Management page. Mirror the
// existing pattern: each is a fall-through fixture used ONLY when the real
// query returns empty. Values are deterministic so screenshots stay stable.

export function demoAgencies() {
  // Single root agency, mirrors what the migration backfill seeds in DB.
  // Field names are snake_case to match the real /agencies/tree response and
  // the FE consumer (AgencyTreeFlow + AgencyDetailCard).
  const mkTeam = (seed: string, firstName: string, lastName: string, email: string, assignedAt: string) => ({
    manager_user_id: uid(seed),
    manager_name: `${firstName} ${lastName}`,
    first_name: firstName,
    last_name: lastName,
    email,
    assigned_at: assignedAt,
  });
  return [
    {
      id: "00000000-0000-4000-8000-000000000001",
      parent_agency_id: null,
      name: "Gold Coast Financial Partners LLC",
      dba_name: "Heritage Life Solutions",
      status: "active",
      state_of_formation: "FL",
      ein: "***1234",
      contact_email: "ops@heritagels.org",
      formation_date: "2018-03-15",
      teams: [
        mkTeam("mgr-Alpha", "Marcus", "Rivera", "marcus.rivera@heritagels.org", "2024-01-15T00:00:00Z"),
        mkTeam("mgr-Beta", "Jennifer", "Walsh", "jennifer.walsh@heritagels.org", "2024-01-15T00:00:00Z"),
        mkTeam("mgr-Gamma", "Kevin", "Park", "kevin.park@heritagels.org", "2024-02-01T00:00:00Z"),
        mkTeam("mgr-Delta", "Natasha", "Romero", "natasha.romero@heritagels.org", "2024-02-15T00:00:00Z"),
        mkTeam("mgr-Echo", "Brandon", "Mills", "brandon.mills@heritagels.org", "2024-03-01T00:00:00Z"),
      ],
      children: [],
    },
  ];
}

export function demoAgencyCarrierContracts() {
  // 12-month MPA windows anchored on a stable past date so screenshots don't
  // drift each time the demo renders.
  const effectiveStart = "2024-09-01";
  const effectiveEnd = "2025-09-01";
  return [
    {
      id: uid("contract-mutual-omaha"),
      agency_id: "00000000-0000-4000-8000-000000000001",
      carrier_id: uid("carrier-mutual-omaha"),
      carrier_name: "Mutual of Omaha",
      carrier_short_name: "Mutual of Omaha",
      status: "active",
      mpa_effective_date: effectiveStart,
      mpa_expiration_date: effectiveEnd,
      mpa_document_s3_key: null,
      primary_contact_name: "Susan Albright",
      primary_contact_email: "salbright@mutualofomaha.com",
      primary_contact_phone: "(402) 555-2200",
      states_authorized: null,
      notes: "Standard MPA — 9-month commission advance. Renews 09/01/2025.",
      created_at: `${effectiveStart}T12:00:00Z`,
      updated_at: `${effectiveStart}T12:00:00Z`,
    },
    {
      id: uid("contract-foresters"),
      agency_id: "00000000-0000-4000-8000-000000000001",
      carrier_id: uid("carrier-foresters"),
      carrier_name: "Foresters Financial",
      carrier_short_name: "Foresters",
      status: "active",
      mpa_effective_date: effectiveStart,
      mpa_expiration_date: effectiveEnd,
      mpa_document_s3_key: null,
      primary_contact_name: "Daniel Wei",
      primary_contact_email: "dwei@foresters.com",
      primary_contact_phone: "(416) 555-7720",
      states_authorized: ["FL", "GA", "NC", "SC", "TX"],
      notes: "Term + final expense. Limited state authorization — 5 states.",
      created_at: `${effectiveStart}T12:00:00Z`,
      updated_at: `${effectiveStart}T12:00:00Z`,
    },
    {
      id: uid("contract-americo"),
      agency_id: "00000000-0000-4000-8000-000000000001",
      carrier_id: uid("carrier-americo"),
      carrier_name: "Americo Financial Life",
      carrier_short_name: "Americo",
      status: "active",
      mpa_effective_date: effectiveStart,
      mpa_expiration_date: effectiveEnd,
      mpa_document_s3_key: null,
      primary_contact_name: "Patricia Holmes",
      primary_contact_email: "pholmes@americo.com",
      primary_contact_phone: "(816) 555-1100",
      states_authorized: null,
      notes: "Final expense + Mortgage Protection. Active in all 50 + DC.",
      created_at: `${effectiveStart}T12:00:00Z`,
      updated_at: `${effectiveStart}T12:00:00Z`,
    },
  ];
}

export function demoEntityRoster() {
  // 8 sample agents — 3 LLC, 2 S-Corp, 3 Sole Prop. Names pulled from the
  // existing AGENT_POOL so the demo is internally consistent.
  type Sample = {
    seed: string;
    firstName: string;
    lastName: string;
    dbaType: "business_entity" | "individual";
    companyType: string | null;
    dbaName: string | null;
    stateOfInc: string | null;
    einLast4: string | null;
    articlesUploaded: boolean;
    ownerCount: number;
  };
  const samples: Sample[] = [
    { seed: "roster-1", firstName: "Mike",    lastName: "Chen",     dbaType: "business_entity", companyType: "LLC",    dbaName: "Chen Wealth Strategies LLC",     stateOfInc: "CA", einLast4: "8841", articlesUploaded: true,  ownerCount: 1 },
    { seed: "roster-2", firstName: "Sarah",   lastName: "Johnson",  dbaType: "business_entity", companyType: "LLC",    dbaName: "Johnson Insurance Group LLC",    stateOfInc: "FL", einLast4: "5512", articlesUploaded: true,  ownerCount: 2 },
    { seed: "roster-3", firstName: "Nicole",  lastName: "Harris",   dbaType: "business_entity", companyType: "LLC",    dbaName: "Harris & Co Advisors LLC",       stateOfInc: "GA", einLast4: "2298", articlesUploaded: false, ownerCount: 1 },
    { seed: "roster-4", firstName: "James",   lastName: "Wright",   dbaType: "business_entity", companyType: "S-Corp", dbaName: "Wright Financial Inc",           stateOfInc: "TX", einLast4: "7704", articlesUploaded: true,  ownerCount: 1 },
    { seed: "roster-5", firstName: "Eric",    lastName: "Wallace",  dbaType: "business_entity", companyType: "S-Corp", dbaName: "Wallace Strategy Corp",          stateOfInc: "NV", einLast4: "3162", articlesUploaded: true,  ownerCount: 3 },
    { seed: "roster-6", firstName: "Linda",   lastName: "Kao",      dbaType: "individual",      companyType: null,     dbaName: null,                              stateOfInc: null, einLast4: null,   articlesUploaded: false, ownerCount: 0 },
    { seed: "roster-7", firstName: "Marcus",  lastName: "Reed",     dbaType: "individual",      companyType: null,     dbaName: null,                              stateOfInc: null, einLast4: null,   articlesUploaded: false, ownerCount: 0 },
    { seed: "roster-8", firstName: "Yara",    lastName: "Costa",    dbaType: "individual",      companyType: null,     dbaName: null,                              stateOfInc: null, einLast4: null,   articlesUploaded: false, ownerCount: 0 },
  ];
  return samples.map((s) => ({
    id: uid(s.seed),
    agentName: `${s.firstName} ${s.lastName}`,
    email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@heritagels.org`,
    agencyName: "Gold Coast Financial Partners LLC",
    dbaType: s.dbaType,
    companyType: s.companyType,
    dbaName: s.dbaName,
    stateOfInc: s.stateOfInc,
    einMasked: s.einLast4 ? `***${s.einLast4}` : null,
    articlesUploaded: s.articlesUploaded,
    ownerCount: s.ownerCount,
  }));
}

// ─── DASHBOARD AGGREGATOR ────────────────────────────────────────────────────

export function demoDashboardActivity() {
  const now = Date.now();
  const types = ["conversion", "lead_imported", "deal_submitted", "agent_hired", "policy_issued"];
  return Array.from({ length: 8 }, (_, i) => ({
    id: uid(`activity-${i}`),
    lead_id: uid(`lead-act-${i}`),
    activity_type: types[i % types.length],
    description: `${types[i % types.length].replace("_", " ")} — Patricia Morales`,
    created_at: new Date(now - i * 2 * 60 * 60 * 1000).toISOString(),
    user_id: uid(`actor-${i % 3}`),
  }));
}
