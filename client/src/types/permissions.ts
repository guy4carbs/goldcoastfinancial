/**
 * RBAC Permission System - Frontend Types
 * Mirror of server-side permissions for client-side route protection
 */

// =============================================================================
// ROLES
// =============================================================================

export const Roles = {
  FOUNDER: 'founder',
  OWNER: 'owner',
  SYSTEM_ADMIN: 'system_admin',
  DIRECTOR: 'director',
  AGENCY_MANAGER: 'manager',
  SALES_AGENT: 'sales_agent',
  MARKETING_STAFF: 'marketing_staff',
  CLIENT: 'client',
  INVESTOR: 'investor',
} as const;

export type Role = typeof Roles[keyof typeof Roles];

export const ALL_ROLES: Role[] = Object.values(Roles);

// Role hierarchy for comparisons (lower index = higher privilege)
export const ROLE_HIERARCHY: Role[] = [
  Roles.FOUNDER,
  Roles.OWNER,
  Roles.SYSTEM_ADMIN,
  Roles.DIRECTOR,
  Roles.AGENCY_MANAGER,
  Roles.SALES_AGENT,
  Roles.MARKETING_STAFF,
  Roles.CLIENT,
  Roles.INVESTOR,
];

// =============================================================================
// PERMISSIONS (subset needed for frontend)
// =============================================================================

export const Permission = {
  // AI Access
  AI_LOUNGE_ACCESS: 'ai:lounge:access',
  AI_AGENTS_VIEW: 'ai:agents:view',
  AI_AGENTS_CONTROL: 'ai:agents:control',
  AI_AGENTS_CONFIGURE: 'ai:agents:configure',
  AI_AVATAR_COUNCIL: 'ai:avatar:council',

  // Analytics
  ANALYTICS_VIEW_OWN: 'analytics:view:own',
  ANALYTICS_VIEW_ALL: 'analytics:view:all',
  ANALYTICS_EXECUTIVE: 'analytics:executive',

  // Content
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_PUBLISH: 'content:publish',

  // Leads
  LEADS_VIEW_OWN: 'leads:view:own',
  LEADS_VIEW_ALL: 'leads:view:all',

  // Financial
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_INVESTOR_REPORTS: 'financial:investor:reports',

  // System
  SYSTEM_SETTINGS: 'system:settings',
  USERS_VIEW: 'users:view',
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

// =============================================================================
// ROLE-PERMISSION MAPPING (frontend subset)
// =============================================================================

export const ROLE_PERMISSIONS: Record<Role, PermissionType[]> = {
  [Roles.FOUNDER]: Object.values(Permission),

  [Roles.OWNER]: Object.values(Permission),

  [Roles.DIRECTOR]: [],

  [Roles.SYSTEM_ADMIN]: [
    Permission.AI_LOUNGE_ACCESS,
    Permission.AI_AGENTS_VIEW,
    Permission.AI_AGENTS_CONTROL,
    Permission.AI_AGENTS_CONFIGURE,
    Permission.AI_AVATAR_COUNCIL,
    Permission.ANALYTICS_VIEW_ALL,
    Permission.ANALYTICS_EXECUTIVE,
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,
    Permission.LEADS_VIEW_ALL,
    Permission.FINANCIAL_VIEW,
    Permission.SYSTEM_SETTINGS,
    Permission.USERS_VIEW,
  ],

  [Roles.AGENCY_MANAGER]: [
    Permission.AI_LOUNGE_ACCESS,
    Permission.AI_AGENTS_VIEW,
    Permission.AI_AGENTS_CONTROL,
    Permission.AI_AVATAR_COUNCIL,
    Permission.ANALYTICS_VIEW_ALL,
    Permission.ANALYTICS_EXECUTIVE,
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.LEADS_VIEW_ALL,
    Permission.USERS_VIEW,
  ],

  [Roles.SALES_AGENT]: [
    Permission.AI_LOUNGE_ACCESS,
    Permission.AI_AVATAR_COUNCIL,
    Permission.ANALYTICS_VIEW_OWN,
    Permission.CONTENT_VIEW,
    Permission.LEADS_VIEW_OWN,
  ],

  [Roles.MARKETING_STAFF]: [
    Permission.AI_AVATAR_COUNCIL,
    Permission.ANALYTICS_VIEW_ALL,
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,
  ],

  [Roles.CLIENT]: [
    Permission.CONTENT_VIEW,
  ],

  [Roles.INVESTOR]: [
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_INVESTOR_REPORTS,
    Permission.ANALYTICS_EXECUTIVE,
  ],
};

// Post-hoc: DIRECTOR inherits the full AGENCY_MANAGER permission set.
// Mirrors server/types/permissions.ts:449 to keep the source of truth singular.
ROLE_PERMISSIONS[Roles.DIRECTOR] = [...ROLE_PERMISSIONS[Roles.AGENCY_MANAGER]];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function hasPermission(role: Role, permission: PermissionType): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: PermissionType[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: PermissionType[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

export function isRoleAtLeast(roleA: Role, roleB: Role): boolean {
  const indexA = ROLE_HIERARCHY.indexOf(roleA);
  const indexB = ROLE_HIERARCHY.indexOf(roleB);
  if (indexA === -1 || indexB === -1) return false;
  return indexA <= indexB;
}

export function isAdminRole(role: Role): boolean {
  const adminRoles: Role[] = [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER];
  return adminRoles.includes(role);
}

export function isValidRole(role: string): role is Role {
  // Accept both the legacy DB value 'manager' (4 active users) and the
  // current canonical 'agency_manager' (3 active users). The server-side
  // permissions.ts emits 'agency_manager' as Roles.AGENCY_MANAGER, but
  // this frontend's Roles.AGENCY_MANAGER constant is still the legacy
  // string 'manager' — so without this branch, every 'agency_manager'
  // user hitting RoleProtectedRoute would fall back to Roles.CLIENT and
  // see "no access" UI on every protected page.
  return ALL_ROLES.includes(role as Role) || role === 'agency_manager';
}

/**
 * Normalize any incoming role string to a canonical Role.
 * - 'agency_manager' (server canonical) → Roles.AGENCY_MANAGER (= 'manager')
 *   so existing role checks against Roles.AGENCY_MANAGER keep working.
 * - Anything else valid → returned as-is.
 * - Anything unrecognized → Roles.CLIENT (lowest-privilege safe default).
 */
export function normalizeRole(role: string | undefined | null): Role {
  if (role === 'agency_manager') return Roles.AGENCY_MANAGER;
  if (role && isValidRole(role)) return role;
  return Roles.CLIENT;
}

// =============================================================================
// ROLE GROUPS (for route protection)
// =============================================================================

export const RoleGroups = {
  ADMINS: [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN] as Role[],
  MANAGEMENT: [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR, Roles.AGENCY_MANAGER] as Role[],
  STAFF: [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR, Roles.AGENCY_MANAGER, Roles.SALES_AGENT, Roles.MARKETING_STAFF] as Role[],
  AI_LOUNGE: [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR, Roles.AGENCY_MANAGER, Roles.SALES_AGENT] as Role[],
  EXTERNAL: [Roles.CLIENT, Roles.INVESTOR] as Role[],
  ALL: ALL_ROLES,
} as const;

export type RoleGroup = keyof typeof RoleGroups;

// =============================================================================
// DEFAULT ROUTES BY ROLE
// =============================================================================

export const DEFAULT_ROUTE_BY_ROLE: Record<Role, string> = {
  [Roles.FOUNDER]: '/admin',
  [Roles.OWNER]: '/admin',
  [Roles.SYSTEM_ADMIN]: '/admin',
  [Roles.DIRECTOR]: '/manager/dashboard',
  [Roles.AGENCY_MANAGER]: '/manager/dashboard',
  [Roles.SALES_AGENT]: '/agents',
  [Roles.MARKETING_STAFF]: '/admin/content',
  [Roles.CLIENT]: '/portal',
  [Roles.INVESTOR]: '/investor',
};

// =============================================================================
// ROLE DISPLAY NAMES
// =============================================================================

export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  [Roles.FOUNDER]: 'Founder',
  [Roles.OWNER]: 'Owner',
  [Roles.SYSTEM_ADMIN]: 'System Administrator',
  [Roles.DIRECTOR]: 'Director',
  [Roles.AGENCY_MANAGER]: 'Agency Manager',
  [Roles.SALES_AGENT]: 'Sales Agent',
  [Roles.MARKETING_STAFF]: 'Marketing Staff',
  [Roles.CLIENT]: 'Client',
  [Roles.INVESTOR]: 'Investor',
};
