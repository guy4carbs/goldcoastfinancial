/**
 * Frontend demo store for the Founders Lounge Access page.
 *
 * Seeds a realistic full directory (founders, managers, agents, investors,
 * admins, clients), pending registrations, lounge-access map, and audit log.
 * All approve / reject / invite / lounge-toggle mutations operate against
 * this in-memory store, so the UI is fully functional without any backend.
 *
 * State is module-level (singleton) so reads stay consistent across React
 * Query refetches; refreshing the browser resets to seed data.
 */

export interface DemoMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  role: string;
  is_active: boolean;
  approval_status?: string | null;
  last_login_at?: string | null;
  avatar_url?: string | null;
  two_factor_enabled?: boolean;
}

// Roles considered "high-trust" for the 2FA-coverage denominator.
// Anyone except external clients should have 2FA when accessing privileged tooling.
export const HIGH_TRUST_ROLES = [
  "founder",
  "owner",
  "system_admin",
  "manager",
  "sales_agent",
  "investor",
] as const;

export interface AccessKpis {
  pendingCount: number;          // pending registrations awaiting decision
  activeMembers: number;         // members with is_active === true OR last_login within 30d
  twoFactorCoverage: number;     // % of HIGH_TRUST_ROLES members with 2FA enabled (0-100, rounded)
  idle60d: number;               // members whose last_login is > 60 days ago (or never)
  twoFactorEnabledCount: number; // numerator for transparency
  highTrustMemberCount: number;  // denominator for transparency
}

export interface DemoPending {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  years_experience?: number | null;
  license_number?: string | null;
  licensed_states?: string[] | null;
  is_licensed?: boolean;
  referral_source?: string | null;
  applied_at: string;
}

export interface DemoAudit {
  id: string;
  created_at: string;
  actor_name: string;
  action_type: string;
  target_name: string;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  reason?: string | null;
}

export interface DemoLoungeAccessRow {
  lounge_key: string;
  granted: boolean;
}

const LOUNGE_KEYS = [
  "agent_lounge",
  "manager_lounge",
  "executive_lounge",
  "investor_lounge",
  "founders_lounge",
] as const;

// Strict role → default lounges. Used to seed initial access matrix.
const ROLE_LOUNGES: Record<string, string[]> = {
  founder: ["agent_lounge", "manager_lounge", "executive_lounge", "investor_lounge", "founders_lounge"],
  owner: ["agent_lounge", "manager_lounge", "executive_lounge", "founders_lounge"],
  system_admin: ["agent_lounge", "manager_lounge", "executive_lounge"],
  manager: ["agent_lounge", "manager_lounge"],
  sales_agent: ["agent_lounge"],
  investor: ["investor_lounge"],
  client: [],
};

const ACTOR = "Guy Carbonara";

// Deterministic UUID-shaped string from a seed.
function uid(seed: string): string {
  const h = Array.from(seed).reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 5381);
  const hex = h.toString(16).padStart(8, "0");
  return `00000000-0000-4000-8000-${hex.padEnd(12, "0")}`;
}

const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * 24 * 60 * 60 * 1000).toISOString();
const hoursAgo = (h: number) => new Date(now - h * 60 * 60 * 1000).toISOString();

// Deterministic 2FA assignment from email + role. Founders/owners always on;
// everyone else gets ~60% coverage based on a stable hash of their email.
function seedTwoFactor(email: string, role: string): boolean {
  if (role === "founder" || role === "owner") return true;
  const h = Array.from(email).reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  return h % 100 < 60;
}

function daysSince(iso: string | null | undefined): number {
  if (!iso) return Infinity;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return Infinity;
  return (now - t) / (24 * 60 * 60 * 1000);
}

// ─── SEED MEMBERS ───
function seedMembers(): DemoMember[] {
  const m: DemoMember[] = [];
  const push = (
    role: string,
    first_name: string,
    last_name: string,
    email: string,
    overrides: Partial<DemoMember> = {},
  ) => {
    m.push({
      id: uid(`member-${email}`),
      email,
      first_name,
      last_name,
      phone: null,
      role,
      is_active: true,
      approval_status: "approved",
      last_login_at: hoursAgo(Math.floor(Math.random() * 96)),
      two_factor_enabled: seedTwoFactor(email, role),
      ...overrides,
    });
  };

  // Founders (4)
  push("founder", "Guy", "Carbonara", "guy4carbs@gmail.com", { last_login_at: hoursAgo(1) });
  push("founder", "Jack", "Cook", "jack@goldcoastfnl.com", { last_login_at: hoursAgo(8) });
  push("founder", "Frank", "Carbonara", "frank@goldcoastfnl.com", { last_login_at: hoursAgo(20) });
  push("founder", "Nick", "Gallagher", "nick@goldcoastfnl.com", { last_login_at: hoursAgo(38) });

  // Owner (1)
  push("owner", "Administrator", "—", "admin@goldcoastfnl.com", { first_name: "System", last_name: "Owner" });

  // System admins (2)
  push("system_admin", "Diana", "Pham", "diana.pham@goldcoastfnl.com");
  push("system_admin", "Marcus", "Levy", "marcus.levy@goldcoastfnl.com");

  // Managers (5)
  push("manager", "Marcus", "Rivera", "marcus.rivera@heritagels.org");
  push("manager", "Jennifer", "Walsh", "jennifer.walsh@heritagels.org");
  push("manager", "Kevin", "Park", "kevin.park@heritagels.org");
  push("manager", "Natasha", "Romero", "natasha.romero@heritagels.org");
  push("manager", "Brandon", "Mills", "brandon.mills@heritagels.org");

  // Agents (20) — match the rankings agent pool
  const agents = [
    ["Mike", "Chen"], ["Sarah", "Johnson"], ["Linda", "Kao"], ["Marcus", "Reed"],
    ["Nicole", "Harris"], ["Amanda", "Torres"], ["Victor", "Nguyen"], ["Tina", "Brooks"],
    ["James", "Wright"], ["Priya", "Shah"], ["Daniel", "OConnor"], ["Yara", "Costa"],
    ["Eric", "Wallace"], ["Hannah", "Park"], ["Diego", "Ramos"], ["Mei", "Liu"],
    ["Olivia", "Pham"], ["Trevor", "Ng"], ["Renata", "Silva"], ["Carlos", "Vega"],
  ];
  for (const [first, last] of agents) {
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@heritagels.org`;
    push("sales_agent", first, last, email);
  }

  // Investors (5)
  push("investor", "Rebecca", "Ashworth", "r.ashworth@blackstone-cap.com");
  push("investor", "Theodore", "Klein", "t.klein@klein-capital.com");
  push("investor", "Mira", "Patel", "mira.patel@horizon-ventures.io");
  push("investor", "Charles", "Whitfield", "c.whitfield@whitfield-trust.com");
  push("investor", "Sofia", "Reyes", "sofia.reyes@reyes-holdings.co");

  // Clients (15) — sample policyholders. A handful are deliberately idle (>60d)
  // so the Access KPI strip has realistic "idle" coverage to surface.
  const clients = [
    ["Patricia", "Morales"], ["Raymond", "Dupree"], ["Natalie", "Kim"],
    ["Daniel", "Reyes"], ["Alice", "Okafor"], ["Robert", "Martinez"],
    ["Sandra", "Lewis"], ["Jamal", "Brown"], ["Wei", "Zhang"],
    ["Maria", "Garcia"], ["Henry", "Patel"], ["Emma", "Wilson"],
    ["Carlos", "Hernandez"], ["Aisha", "Mohammed"], ["Tyler", "Cooper"],
  ];
  // Indices that should be idle (>60d) or never-logged-in.
  const idleClientIdx = new Set([1, 4, 8, 11, 13]);
  const neverIdx = new Set([7]);
  clients.forEach(([first, last], i) => {
    const email = `${first.toLowerCase()}.${last.toLowerCase()}@example.com`;
    let last_login_at: string | null = null;
    if (neverIdx.has(i)) last_login_at = null;
    else if (idleClientIdx.has(i)) last_login_at = daysAgo(75 + i * 4);
    else last_login_at = daysAgo(2 + i);
    push("client", first, last, email, { last_login_at });
  });

  return m;
}

// ─── SEED PENDING REGISTRATIONS ───
function seedPending(): DemoPending[] {
  const p: DemoPending[] = [];
  const apps: Array<Partial<DemoPending> & { first_name: string; last_name: string; email: string }> = [
    {
      first_name: "Anthony", last_name: "Russo", email: "anthony.russo@gmail.com",
      phone: "(312) 555-9921", years_experience: 7, license_number: "IL-LH-348221",
      licensed_states: ["IL", "IN", "WI"], is_licensed: true, referral_source: "Mike Chen (referral)",
    },
    {
      first_name: "Devon", last_name: "Walker", email: "devon.walker@yahoo.com",
      phone: "(404) 555-2289", years_experience: 3, license_number: "GA-LH-771203",
      licensed_states: ["GA", "FL"], is_licensed: true, referral_source: "Web form",
    },
    {
      first_name: "Lucia", last_name: "Fernandez", email: "lucia.f@protonmail.com",
      phone: "(305) 555-1144", years_experience: 12, license_number: "FL-LH-559912",
      licensed_states: ["FL", "GA", "NC", "SC"], is_licensed: true, referral_source: "Heritage Lounge promo",
    },
    {
      first_name: "Jordan", last_name: "Holt", email: "j.holt.career@gmail.com",
      phone: "(214) 555-7706", years_experience: 0, license_number: null,
      licensed_states: [], is_licensed: false, referral_source: "Indeed",
    },
    {
      first_name: "Aaliyah", last_name: "Stone", email: "aaliyah.stone@outlook.com",
      phone: "(617) 555-3318", years_experience: 5, license_number: "MA-LH-227104",
      licensed_states: ["MA", "RI", "NH"], is_licensed: true, referral_source: "Nicole Harris (referral)",
    },
    {
      first_name: "Bobby", last_name: "Tan", email: "bobby.tan@gmail.com",
      phone: "(503) 555-8821", years_experience: 1, license_number: null,
      licensed_states: [], is_licensed: false, referral_source: "LinkedIn",
    },
    {
      first_name: "Grace", last_name: "Liu", email: "grace.liu@me.com",
      phone: "(415) 555-4477", years_experience: 8, license_number: "CA-LH-882011",
      licensed_states: ["CA", "NV", "AZ"], is_licensed: true, referral_source: "Jennifer Walsh (referral)",
    },
    {
      first_name: "Marcus", last_name: "Hayes", email: "marcus.hayes@gmail.com",
      phone: "(720) 555-6611", years_experience: 4, license_number: "CO-LH-440217",
      licensed_states: ["CO", "WY", "UT"], is_licensed: true, referral_source: "Web form",
    },
  ];
  for (let i = 0; i < apps.length; i++) {
    const a = apps[i];
    p.push({
      id: uid(`pending-${a.email}`),
      email: a.email,
      first_name: a.first_name,
      last_name: a.last_name,
      phone: a.phone,
      years_experience: a.years_experience ?? null,
      license_number: a.license_number ?? null,
      licensed_states: a.licensed_states ?? null,
      is_licensed: a.is_licensed ?? false,
      referral_source: a.referral_source ?? null,
      applied_at: hoursAgo(i * 6 + 2),
    });
  }
  return p;
}

// ─── SEED LOUNGE ACCESS — strict role rules + a few exceptions ───
function seedLoungeAccess(members: DemoMember[]): Record<string, Record<string, boolean>> {
  const map: Record<string, Record<string, boolean>> = {};
  for (const m of members) {
    const granted = ROLE_LOUNGES[m.role] || [];
    map[m.id] = {};
    for (const k of LOUNGE_KEYS) {
      map[m.id][k] = granted.includes(k);
    }
  }

  // A few elevated exceptions to make the matrix actually interesting:
  // Top senior agent gets manager-lounge preview.
  const mike = members.find((x) => x.email === "mike.chen@heritagels.org");
  if (mike) map[mike.id].manager_lounge = true;

  // One investor with executive read-only access (board observer).
  const charles = members.find((x) => x.email === "c.whitfield@whitfield-trust.com");
  if (charles) map[charles.id].executive_lounge = true;

  return map;
}

// ─── SEED AUDIT LOG ───
function seedAudit(members: DemoMember[]): DemoAudit[] {
  const log: DemoAudit[] = [];
  const push = (
    actor: string,
    action_type: string,
    target_name: string,
    delta: { previous_value?: any; new_value?: any; reason?: string | null },
    when: string,
  ) => {
    log.push({
      id: uid(`audit-${log.length}-${target_name}-${action_type}`),
      created_at: when,
      actor_name: actor,
      action_type,
      target_name,
      previous_value: delta.previous_value ?? null,
      new_value: delta.new_value ?? null,
      reason: delta.reason ?? null,
    });
  };

  // Recent grants matching the seeded matrix exceptions.
  push(ACTOR, "grant", "Mike Chen", { previous_value: { manager_lounge: false }, new_value: { manager_lounge: true }, reason: "Senior agent shadowing manager track" }, hoursAgo(6));
  push(ACTOR, "grant", "Charles Whitfield", { previous_value: { executive_lounge: false }, new_value: { executive_lounge: true }, reason: "Board observer access (Q2)" }, hoursAgo(28));

  // Recent approvals (members that "came in" before today).
  const recentApprovals = ["Nicole Harris", "Sarah Johnson", "Eric Wallace", "Diego Ramos"];
  recentApprovals.forEach((name, i) => {
    push(ACTOR, "approve", name, { previous_value: { approval_status: "pending" }, new_value: { approval_status: "approved" } }, daysAgo(2 + i));
  });

  // A rejection.
  push(ACTOR, "reject", "Patrick Sykes", { previous_value: { approval_status: "pending" }, new_value: { approval_status: "rejected" }, reason: "License lapsed in 3 states; advised to reapply post-renewal" }, daysAgo(3));

  // A role change.
  push("Jack Cook", "role_change", "Brandon Mills", { previous_value: { role: "sales_agent" }, new_value: { role: "manager" }, reason: "Promoted to Team Echo lead" }, daysAgo(5));

  // Older grants for managers.
  const managers = members.filter((m) => m.role === "manager");
  managers.forEach((m, i) => {
    push(ACTOR, "grant", `${m.first_name} ${m.last_name}`, { previous_value: { manager_lounge: false }, new_value: { manager_lounge: true } }, daysAgo(14 + i * 2));
  });

  // Founder onboarding events.
  ["Jack Cook", "Frank Carbonara", "Nick Gallagher"].forEach((n, i) => {
    push(ACTOR, "grant", n, { previous_value: { founders_lounge: false }, new_value: { founders_lounge: true }, reason: "Founder onboarding" }, daysAgo(45 + i));
  });

  // Investor activations.
  const investors = members.filter((m) => m.role === "investor");
  investors.forEach((m, i) => {
    push("Frank Carbonara", "grant", `${m.first_name} ${m.last_name}`, { previous_value: { investor_lounge: false }, new_value: { investor_lounge: true }, reason: "Series A capital commitment" }, daysAgo(20 + i));
  });

  // A revoke event.
  push(ACTOR, "revoke", "Ex-Agent Spencer Doyle", { previous_value: { agent_lounge: true }, new_value: { agent_lounge: false }, reason: "Termination — failed Q1 compliance review" }, daysAgo(11));

  // Recent invite.
  push(ACTOR, "invite", "Carlos Vega", { new_value: { role: "sales_agent", invited_email: "carlos.vega@heritagels.org" } }, daysAgo(1));

  // Sort newest first.
  return log.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

// ─── STORE ───
class LoungeAccessDemoStore {
  members: DemoMember[];
  pending: DemoPending[];
  audit: DemoAudit[];
  loungeAccess: Record<string, Record<string, boolean>>;

  constructor() {
    this.members = seedMembers();
    this.pending = seedPending();
    this.loungeAccess = seedLoungeAccess(this.members);
    this.audit = seedAudit(this.members);
  }

  // ─── Reads ───
  listPending(): DemoPending[] {
    return [...this.pending].sort((a, b) => (a.applied_at < b.applied_at ? 1 : -1));
  }

  listMembers(filters: { role?: string; status?: string; approval?: string }): DemoMember[] {
    return this.members.filter((m) => {
      if (filters.role && filters.role !== "all" && m.role !== filters.role) return false;
      if (filters.status === "active" && !m.is_active) return false;
      if (filters.status === "inactive" && m.is_active) return false;
      if (filters.approval && filters.approval !== "all" && m.approval_status !== filters.approval) return false;
      return true;
    });
  }

  listAudit(actionType?: string): DemoAudit[] {
    let rows = [...this.audit];
    if (actionType && actionType !== "all") {
      rows = rows.filter((r) => r.action_type === actionType);
    }
    return rows.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  }

  getLoungeAccess(userId: string): DemoLoungeAccessRow[] {
    const map = this.loungeAccess[userId] || {};
    return LOUNGE_KEYS.map((k) => ({ lounge_key: k, granted: !!map[k] }));
  }

  // ─── KPI signals (Wave 1B Access KPI strip) ───
  getAccessKpis(): AccessKpis {
    const pendingCount = this.pending.length;

    const activeMembers = this.members.filter(
      (m) => m.is_active || daysSince(m.last_login_at) <= 30,
    ).length;

    const highTrust = this.members.filter((m) =>
      (HIGH_TRUST_ROLES as readonly string[]).includes(m.role),
    );
    const twoFactorEnabledCount = highTrust.filter((m) => m.two_factor_enabled).length;
    const highTrustMemberCount = highTrust.length;
    const twoFactorCoverage =
      highTrustMemberCount === 0
        ? 0
        : Math.round((twoFactorEnabledCount / highTrustMemberCount) * 100);

    const idle60d = this.members.filter(
      (m) => !m.last_login_at || daysSince(m.last_login_at) > 60,
    ).length;

    return {
      pendingCount,
      activeMembers,
      twoFactorCoverage,
      idle60d,
      twoFactorEnabledCount,
      highTrustMemberCount,
    };
  }

  // ─── Mutations ───
  approve(pendingId: string): { ok: true; member: DemoMember } | { ok: false; error: string } {
    const idx = this.pending.findIndex((p) => p.id === pendingId);
    if (idx === -1) return { ok: false, error: "Registration not found" };
    const p = this.pending[idx];
    this.pending.splice(idx, 1);

    const member: DemoMember = {
      id: uid(`member-${p.email}`),
      email: p.email,
      first_name: p.first_name,
      last_name: p.last_name,
      phone: p.phone || null,
      role: p.is_licensed ? "sales_agent" : "sales_agent",
      is_active: true,
      approval_status: "approved",
      last_login_at: null,
      two_factor_enabled: seedTwoFactor(p.email, "sales_agent"),
    };
    this.members.push(member);

    // Default agent_lounge access.
    this.loungeAccess[member.id] = {};
    for (const k of LOUNGE_KEYS) this.loungeAccess[member.id][k] = ROLE_LOUNGES.sales_agent.includes(k);

    this.audit.unshift({
      id: uid(`audit-approve-${pendingId}-${Date.now()}`),
      created_at: new Date().toISOString(),
      actor_name: ACTOR,
      action_type: "approve",
      target_name: `${p.first_name} ${p.last_name}`,
      previous_value: { approval_status: "pending" },
      new_value: { approval_status: "approved", role: "sales_agent" },
      reason: null,
    });
    return { ok: true, member };
  }

  reject(pendingId: string, reason: string): { ok: true } | { ok: false; error: string } {
    const idx = this.pending.findIndex((p) => p.id === pendingId);
    if (idx === -1) return { ok: false, error: "Registration not found" };
    const p = this.pending[idx];
    this.pending.splice(idx, 1);

    this.audit.unshift({
      id: uid(`audit-reject-${pendingId}-${Date.now()}`),
      created_at: new Date().toISOString(),
      actor_name: ACTOR,
      action_type: "reject",
      target_name: `${p.first_name} ${p.last_name}`,
      previous_value: { approval_status: "pending" },
      new_value: { approval_status: "rejected" },
      reason,
    });
    return { ok: true };
  }

  invite(payload: { email: string; first_name: string; last_name: string; role: string }):
    { ok: true; member: DemoMember } | { ok: false; error: string } {
    if (this.members.some((m) => m.email.toLowerCase() === payload.email.toLowerCase())) {
      return { ok: false, error: "A member with that email already exists" };
    }
    const member: DemoMember = {
      id: uid(`member-${payload.email}`),
      email: payload.email,
      first_name: payload.first_name,
      last_name: payload.last_name,
      role: payload.role,
      phone: null,
      is_active: true,
      approval_status: "approved",
      last_login_at: null,
      two_factor_enabled: seedTwoFactor(payload.email, payload.role),
    };
    this.members.push(member);

    // Default lounges for the invited role.
    this.loungeAccess[member.id] = {};
    const defaults = ROLE_LOUNGES[payload.role] || [];
    for (const k of LOUNGE_KEYS) this.loungeAccess[member.id][k] = defaults.includes(k);

    this.audit.unshift({
      id: uid(`audit-invite-${member.id}-${Date.now()}`),
      created_at: new Date().toISOString(),
      actor_name: ACTOR,
      action_type: "invite",
      target_name: `${payload.first_name} ${payload.last_name}`,
      previous_value: null,
      new_value: { role: payload.role, invited_email: payload.email },
      reason: null,
    });
    return { ok: true, member };
  }

  toggleLounge(userId: string, loungeKey: string, granted: boolean): { ok: true } | { ok: false; error: string } {
    const member = this.members.find((m) => m.id === userId);
    if (!member) return { ok: false, error: "Member not found" };
    if (!this.loungeAccess[userId]) this.loungeAccess[userId] = {};
    const previous = !!this.loungeAccess[userId][loungeKey];
    this.loungeAccess[userId][loungeKey] = granted;

    this.audit.unshift({
      id: uid(`audit-toggle-${userId}-${loungeKey}-${Date.now()}`),
      created_at: new Date().toISOString(),
      actor_name: ACTOR,
      action_type: granted ? "grant" : "revoke",
      target_name: `${member.first_name} ${member.last_name}`,
      previous_value: { [loungeKey]: previous },
      new_value: { [loungeKey]: granted },
      reason: null,
    });
    return { ok: true };
  }
}

export const loungeAccessDemo = new LoungeAccessDemoStore();

// ─── KPI drill-in helpers (used by the Access KPI strip to pre-filter the
// Members tab when a tile is clicked). Pure functions, no store access. ───
export function filterMembersByTwoFactor(
  members: DemoMember[],
  state: "enabled" | "disabled",
): DemoMember[] {
  const want = state === "enabled";
  return members.filter(
    (m) =>
      (HIGH_TRUST_ROLES as readonly string[]).includes(m.role) &&
      !!m.two_factor_enabled === want,
  );
}

export function filterMembersByIdle(members: DemoMember[], days: number): DemoMember[] {
  return members.filter((m) => !m.last_login_at || daysSince(m.last_login_at) > days);
}
