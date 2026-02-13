/**
 * RBAC Permission System
 * Defines roles, permissions, and access control rules
 */

// =============================================================================
// ROLES
// =============================================================================

/**
 * Role hierarchy (highest to lowest):
 * Owner > SystemAdmin > AgencyManager > SalesAgent > MarketingStaff > Client > Investor
 */
export const Roles = {
  OWNER: 'owner',
  SYSTEM_ADMIN: 'system_admin',
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
  Roles.OWNER,
  Roles.SYSTEM_ADMIN,
  Roles.AGENCY_MANAGER,
  Roles.SALES_AGENT,
  Roles.MARKETING_STAFF,
  Roles.CLIENT,
  Roles.INVESTOR,
];

// =============================================================================
// PERMISSIONS
// =============================================================================

/**
 * Granular permissions for all system features
 */
export const Permission = {
  // ===== LEAD MANAGEMENT =====
  LEADS_VIEW_OWN: 'leads:view:own',
  LEADS_VIEW_ALL: 'leads:view:all',
  LEADS_CREATE: 'leads:create',
  LEADS_EDIT_OWN: 'leads:edit:own',
  LEADS_EDIT_ALL: 'leads:edit:all',
  LEADS_DELETE: 'leads:delete',
  LEADS_ASSIGN: 'leads:assign',
  LEADS_IMPORT: 'leads:import',
  LEADS_EXPORT: 'leads:export',

  // ===== POLICY MANAGEMENT =====
  POLICIES_VIEW_OWN: 'policies:view:own',
  POLICIES_VIEW_ALL: 'policies:view:all',
  POLICIES_CREATE: 'policies:create',
  POLICIES_EDIT: 'policies:edit',
  POLICIES_DELETE: 'policies:delete',

  // ===== CLIENT MANAGEMENT =====
  CLIENTS_VIEW_OWN: 'clients:view:own',
  CLIENTS_VIEW_ALL: 'clients:view:all',
  CLIENTS_EDIT: 'clients:edit',

  // ===== COMMISSIONS =====
  COMMISSIONS_VIEW_OWN: 'commissions:view:own',
  COMMISSIONS_VIEW_ALL: 'commissions:view:all',
  COMMISSIONS_MANAGE: 'commissions:manage',
  COMMISSIONS_PAYOUT: 'commissions:payout',

  // ===== APPOINTMENTS =====
  APPOINTMENTS_VIEW_OWN: 'appointments:view:own',
  APPOINTMENTS_VIEW_ALL: 'appointments:view:all',
  APPOINTMENTS_CREATE: 'appointments:create',
  APPOINTMENTS_EDIT_OWN: 'appointments:edit:own',
  APPOINTMENTS_EDIT_ALL: 'appointments:edit:all',

  // ===== ANALYTICS & REPORTING =====
  ANALYTICS_VIEW_OWN: 'analytics:view:own',
  ANALYTICS_VIEW_ALL: 'analytics:view:all',
  ANALYTICS_EXECUTIVE: 'analytics:executive',
  REPORTS_CREATE: 'reports:create',
  REPORTS_EXPORT: 'reports:export',

  // ===== AI AGENTS =====
  AI_LOUNGE_ACCESS: 'ai:lounge:access',
  AI_AGENTS_VIEW: 'ai:agents:view',
  AI_AGENTS_CONTROL: 'ai:agents:control',
  AI_AGENTS_CONFIGURE: 'ai:agents:configure',
  AI_AVATAR_COUNCIL: 'ai:avatar:council',

  // ===== CONTENT MANAGEMENT =====
  CONTENT_VIEW: 'content:view',
  CONTENT_CREATE: 'content:create',
  CONTENT_EDIT: 'content:edit',
  CONTENT_PUBLISH: 'content:publish',
  CONTENT_DELETE: 'content:delete',

  // ===== MARKETING =====
  MARKETING_CAMPAIGNS_VIEW: 'marketing:campaigns:view',
  MARKETING_CAMPAIGNS_MANAGE: 'marketing:campaigns:manage',
  MARKETING_SOCIAL_POST: 'marketing:social:post',
  MARKETING_EMAIL_SEND: 'marketing:email:send',

  // ===== SUPPORT =====
  SUPPORT_TICKETS_VIEW_OWN: 'support:tickets:view:own',
  SUPPORT_TICKETS_VIEW_ALL: 'support:tickets:view:all',
  SUPPORT_TICKETS_MANAGE: 'support:tickets:manage',
  SUPPORT_ESCALATIONS: 'support:escalations',

  // ===== USER MANAGEMENT =====
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  USERS_ROLES_MANAGE: 'users:roles:manage',

  // ===== SYSTEM ADMINISTRATION =====
  SYSTEM_SETTINGS: 'system:settings',
  SYSTEM_INTEGRATIONS: 'system:integrations',
  SYSTEM_AUDIT_LOGS: 'system:audit:logs',
  SYSTEM_SECURITY: 'system:security',
  SYSTEM_BACKUP: 'system:backup',

  // ===== FINANCIAL =====
  FINANCIAL_VIEW: 'financial:view',
  FINANCIAL_FORECASTS: 'financial:forecasts',
  FINANCIAL_INVESTOR_REPORTS: 'financial:investor:reports',

  // ===== TRAINING =====
  TRAINING_VIEW: 'training:view',
  TRAINING_CREATE: 'training:create',
  TRAINING_MANAGE: 'training:manage',

  // ===== CLAIMS =====
  CLAIMS_VIEW_OWN: 'claims:view:own',
  CLAIMS_VIEW_ALL: 'claims:view:all',
  CLAIMS_MANAGE: 'claims:manage',
} as const;

export type PermissionType = typeof Permission[keyof typeof Permission];

export const ALL_PERMISSIONS: PermissionType[] = Object.values(Permission);

// =============================================================================
// ROLE-PERMISSION MAPPING
// =============================================================================

export const ROLE_PERMISSIONS: Record<Role, PermissionType[]> = {
  // ===== OWNER - All permissions =====
  [Roles.OWNER]: ALL_PERMISSIONS,

  // ===== SYSTEM ADMIN - Almost everything except financial payouts =====
  [Roles.SYSTEM_ADMIN]: [
    // Leads
    Permission.LEADS_VIEW_ALL,
    Permission.LEADS_CREATE,
    Permission.LEADS_EDIT_ALL,
    Permission.LEADS_DELETE,
    Permission.LEADS_ASSIGN,
    Permission.LEADS_IMPORT,
    Permission.LEADS_EXPORT,
    // Policies
    Permission.POLICIES_VIEW_ALL,
    Permission.POLICIES_CREATE,
    Permission.POLICIES_EDIT,
    Permission.POLICIES_DELETE,
    // Clients
    Permission.CLIENTS_VIEW_ALL,
    Permission.CLIENTS_EDIT,
    // Commissions
    Permission.COMMISSIONS_VIEW_ALL,
    Permission.COMMISSIONS_MANAGE,
    // Appointments
    Permission.APPOINTMENTS_VIEW_ALL,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_EDIT_ALL,
    // Analytics
    Permission.ANALYTICS_VIEW_ALL,
    Permission.ANALYTICS_EXECUTIVE,
    Permission.REPORTS_CREATE,
    Permission.REPORTS_EXPORT,
    // AI
    Permission.AI_LOUNGE_ACCESS,
    Permission.AI_AGENTS_VIEW,
    Permission.AI_AGENTS_CONTROL,
    Permission.AI_AGENTS_CONFIGURE,
    Permission.AI_AVATAR_COUNCIL,
    // Content
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,
    Permission.CONTENT_DELETE,
    // Marketing
    Permission.MARKETING_CAMPAIGNS_VIEW,
    Permission.MARKETING_CAMPAIGNS_MANAGE,
    Permission.MARKETING_SOCIAL_POST,
    Permission.MARKETING_EMAIL_SEND,
    // Support
    Permission.SUPPORT_TICKETS_VIEW_ALL,
    Permission.SUPPORT_TICKETS_MANAGE,
    Permission.SUPPORT_ESCALATIONS,
    // Users
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    Permission.USERS_DELETE,
    Permission.USERS_ROLES_MANAGE,
    // System
    Permission.SYSTEM_SETTINGS,
    Permission.SYSTEM_INTEGRATIONS,
    Permission.SYSTEM_AUDIT_LOGS,
    Permission.SYSTEM_SECURITY,
    Permission.SYSTEM_BACKUP,
    // Financial
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_FORECASTS,
    // Training
    Permission.TRAINING_VIEW,
    Permission.TRAINING_CREATE,
    Permission.TRAINING_MANAGE,
    // Claims
    Permission.CLAIMS_VIEW_ALL,
    Permission.CLAIMS_MANAGE,
  ],

  // ===== AGENCY MANAGER - Team and operations management =====
  [Roles.AGENCY_MANAGER]: [
    // Leads
    Permission.LEADS_VIEW_ALL,
    Permission.LEADS_CREATE,
    Permission.LEADS_EDIT_ALL,
    Permission.LEADS_ASSIGN,
    Permission.LEADS_IMPORT,
    Permission.LEADS_EXPORT,
    // Policies
    Permission.POLICIES_VIEW_ALL,
    Permission.POLICIES_CREATE,
    Permission.POLICIES_EDIT,
    // Clients
    Permission.CLIENTS_VIEW_ALL,
    Permission.CLIENTS_EDIT,
    // Commissions
    Permission.COMMISSIONS_VIEW_ALL,
    Permission.COMMISSIONS_MANAGE,
    // Appointments
    Permission.APPOINTMENTS_VIEW_ALL,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_EDIT_ALL,
    // Analytics
    Permission.ANALYTICS_VIEW_ALL,
    Permission.ANALYTICS_EXECUTIVE,
    Permission.REPORTS_CREATE,
    Permission.REPORTS_EXPORT,
    // AI
    Permission.AI_LOUNGE_ACCESS,
    Permission.AI_AGENTS_VIEW,
    Permission.AI_AGENTS_CONTROL,
    Permission.AI_AVATAR_COUNCIL,
    // Content
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    // Marketing
    Permission.MARKETING_CAMPAIGNS_VIEW,
    Permission.MARKETING_EMAIL_SEND,
    // Support
    Permission.SUPPORT_TICKETS_VIEW_ALL,
    Permission.SUPPORT_TICKETS_MANAGE,
    Permission.SUPPORT_ESCALATIONS,
    // Users
    Permission.USERS_VIEW,
    Permission.USERS_CREATE,
    Permission.USERS_EDIT,
    // Training
    Permission.TRAINING_VIEW,
    Permission.TRAINING_CREATE,
    Permission.TRAINING_MANAGE,
    // Claims
    Permission.CLAIMS_VIEW_ALL,
    Permission.CLAIMS_MANAGE,
  ],

  // ===== SALES AGENT - Lead work and own data =====
  [Roles.SALES_AGENT]: [
    // Leads
    Permission.LEADS_VIEW_OWN,
    Permission.LEADS_CREATE,
    Permission.LEADS_EDIT_OWN,
    // Policies
    Permission.POLICIES_VIEW_OWN,
    Permission.POLICIES_CREATE,
    // Clients
    Permission.CLIENTS_VIEW_OWN,
    // Commissions
    Permission.COMMISSIONS_VIEW_OWN,
    // Appointments
    Permission.APPOINTMENTS_VIEW_OWN,
    Permission.APPOINTMENTS_CREATE,
    Permission.APPOINTMENTS_EDIT_OWN,
    // Analytics
    Permission.ANALYTICS_VIEW_OWN,
    // AI (limited)
    Permission.AI_LOUNGE_ACCESS,
    Permission.AI_AVATAR_COUNCIL,
    // Content (view only)
    Permission.CONTENT_VIEW,
    // Marketing (email only)
    Permission.MARKETING_EMAIL_SEND,
    // Training
    Permission.TRAINING_VIEW,
    // Claims
    Permission.CLAIMS_VIEW_OWN,
  ],

  // ===== MARKETING STAFF - Content and marketing focus =====
  [Roles.MARKETING_STAFF]: [
    // Content
    Permission.CONTENT_VIEW,
    Permission.CONTENT_CREATE,
    Permission.CONTENT_EDIT,
    Permission.CONTENT_PUBLISH,
    // Marketing
    Permission.MARKETING_CAMPAIGNS_VIEW,
    Permission.MARKETING_CAMPAIGNS_MANAGE,
    Permission.MARKETING_SOCIAL_POST,
    Permission.MARKETING_EMAIL_SEND,
    // Analytics (marketing metrics)
    Permission.ANALYTICS_VIEW_ALL,
    Permission.REPORTS_CREATE,
    Permission.REPORTS_EXPORT,
    // AI (for content generation)
    Permission.AI_AVATAR_COUNCIL,
    // Training
    Permission.TRAINING_VIEW,
  ],

  // ===== CLIENT - Self-service portal =====
  [Roles.CLIENT]: [
    // Own policies
    Permission.POLICIES_VIEW_OWN,
    // Own appointments
    Permission.APPOINTMENTS_VIEW_OWN,
    Permission.APPOINTMENTS_CREATE,
    // Support
    Permission.SUPPORT_TICKETS_VIEW_OWN,
    // Claims
    Permission.CLAIMS_VIEW_OWN,
    // Content (educational)
    Permission.CONTENT_VIEW,
    // Training (educational)
    Permission.TRAINING_VIEW,
  ],

  // ===== INVESTOR - Read-only financial access =====
  [Roles.INVESTOR]: [
    // Financial
    Permission.FINANCIAL_VIEW,
    Permission.FINANCIAL_FORECASTS,
    Permission.FINANCIAL_INVESTOR_REPORTS,
    // Analytics (high-level)
    Permission.ANALYTICS_EXECUTIVE,
    Permission.REPORTS_EXPORT,
  ],
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: Role, permission: PermissionType): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: Role, permissions: PermissionType[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: Role, permissions: PermissionType[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: Role): PermissionType[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Check if role A has higher or equal privileges than role B
 */
export function isRoleAtLeast(roleA: Role, roleB: Role): boolean {
  const indexA = ROLE_HIERARCHY.indexOf(roleA);
  const indexB = ROLE_HIERARCHY.indexOf(roleB);
  if (indexA === -1 || indexB === -1) return false;
  return indexA <= indexB;
}

/**
 * Check if a role is admin-level (Owner, SystemAdmin, or Manager)
 */
export function isAdminRole(role: Role): boolean {
  const adminRoles: Role[] = [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER];
  return adminRoles.includes(role);
}

/**
 * Validate that a role string is a valid role
 */
export function isValidRole(role: string): role is Role {
  return ALL_ROLES.includes(role as Role);
}

// =============================================================================
// ROUTE PROTECTION HELPERS
// =============================================================================

/**
 * Predefined role groups for common access patterns
 */
export const RoleGroups = {
  // Full admin access
  ADMINS: [Roles.OWNER, Roles.SYSTEM_ADMIN],

  // Management level
  MANAGEMENT: [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER],

  // Staff (employees)
  STAFF: [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT, Roles.MARKETING_STAFF],

  // AI Lounge access
  AI_LOUNGE: [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT],

  // External users
  EXTERNAL: [Roles.CLIENT, Roles.INVESTOR],

  // All authenticated users
  ALL: ALL_ROLES,
} as const;

export type RoleGroup = keyof typeof RoleGroups;
