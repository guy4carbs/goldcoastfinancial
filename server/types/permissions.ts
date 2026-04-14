export enum Roles {
  OWNER = "owner",
  SYSTEM_ADMIN = "system_admin",
  AGENCY_MANAGER = "manager",
  SALES_AGENT = "sales_agent",
  MARKETING_STAFF = "marketing_staff",
  CLIENT = "client",
  INVESTOR = "investor",
}

const ROLE_HIERARCHY: Roles[] = [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT, Roles.MARKETING_STAFF, Roles.CLIENT, Roles.INVESTOR];

export enum Permission {
  LEADS_VIEW_OWN = "leads:view:own", LEADS_VIEW_ALL = "leads:view:all", LEADS_CREATE = "leads:create", LEADS_EDIT = "leads:edit", LEADS_DELETE = "leads:delete", LEADS_ASSIGN = "leads:assign",
  POLICIES_VIEW_OWN = "policies:view:own", POLICIES_VIEW_ALL = "policies:view:all", POLICIES_CREATE = "policies:create", POLICIES_EDIT = "policies:edit",
  CLIENTS_VIEW_OWN = "clients:view:own", CLIENTS_VIEW_ALL = "clients:view:all", CLIENTS_EDIT = "clients:edit",
  COMMISSIONS_VIEW_OWN = "commissions:view:own", COMMISSIONS_VIEW_ALL = "commissions:view:all", COMMISSIONS_MANAGE = "commissions:manage", COMMISSIONS_PAYOUT = "commissions:payout",
  ANALYTICS_VIEW_OWN = "analytics:view:own", ANALYTICS_VIEW_ALL = "analytics:view:all", ANALYTICS_EXECUTIVE = "analytics:executive",
  REPORTS_CREATE = "reports:create", REPORTS_EXPORT = "reports:export",
  USERS_VIEW = "users:view", USERS_CREATE = "users:create", USERS_EDIT = "users:edit", USERS_DELETE = "users:delete", USERS_ROLES_MANAGE = "users:roles:manage",
  SYSTEM_SETTINGS = "system:settings", SYSTEM_INTEGRATIONS = "system:integrations", SYSTEM_AUDIT_LOGS = "system:audit_logs",
  HIERARCHY_VIEW_OWN = "hierarchy:view:own", HIERARCHY_VIEW_ALL = "hierarchy:view:all", HIERARCHY_MANAGE = "hierarchy:manage", HIERARCHY_REQUEST_CREATE = "hierarchy:request:create", HIERARCHY_REQUEST_REVIEW = "hierarchy:request:review",
  HCMS_AGENTS_VIEW = "hcms:agents:view", HCMS_AGENTS_EDIT = "hcms:agents:edit", HCMS_CONTRACTING = "hcms:contracting",
  HCMS_COMPLIANCE_VIEW = "hcms:compliance:view", HCMS_COMPLIANCE_MANAGE = "hcms:compliance:manage",
  OPS_PRODUCTION_VIEW = "ops:production:view", OPS_ANALYTICS_VIEW = "ops:analytics:view",
}

const ALL_ADMIN_PERMS = Object.values(Permission);

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [Roles.OWNER]: ALL_ADMIN_PERMS,
  [Roles.SYSTEM_ADMIN]: ALL_ADMIN_PERMS.filter(p => p !== Permission.COMMISSIONS_PAYOUT),
  [Roles.AGENCY_MANAGER]: [
    Permission.LEADS_VIEW_ALL, Permission.LEADS_CREATE, Permission.LEADS_EDIT, Permission.LEADS_ASSIGN,
    Permission.POLICIES_VIEW_ALL, Permission.POLICIES_CREATE,
    Permission.CLIENTS_VIEW_ALL, Permission.CLIENTS_EDIT,
    Permission.COMMISSIONS_VIEW_ALL, Permission.COMMISSIONS_MANAGE,
    Permission.ANALYTICS_VIEW_ALL, Permission.REPORTS_CREATE, Permission.REPORTS_EXPORT,
    Permission.HIERARCHY_VIEW_ALL, Permission.HIERARCHY_MANAGE, Permission.HIERARCHY_REQUEST_CREATE, Permission.HIERARCHY_REQUEST_REVIEW,
    Permission.HCMS_AGENTS_VIEW, Permission.HCMS_AGENTS_EDIT, Permission.HCMS_CONTRACTING,
    Permission.HCMS_COMPLIANCE_VIEW, Permission.HCMS_COMPLIANCE_MANAGE,
    Permission.OPS_PRODUCTION_VIEW, Permission.OPS_ANALYTICS_VIEW,
    Permission.USERS_VIEW,
  ],
  [Roles.SALES_AGENT]: [
    Permission.LEADS_VIEW_OWN, Permission.LEADS_CREATE,
    Permission.POLICIES_VIEW_OWN, Permission.CLIENTS_VIEW_OWN,
    Permission.COMMISSIONS_VIEW_OWN, Permission.ANALYTICS_VIEW_OWN,
    Permission.HIERARCHY_VIEW_OWN, Permission.HIERARCHY_REQUEST_CREATE,
  ],
  [Roles.MARKETING_STAFF]: [Permission.LEADS_VIEW_ALL, Permission.ANALYTICS_VIEW_ALL, Permission.REPORTS_CREATE],
  [Roles.CLIENT]: [Permission.POLICIES_VIEW_OWN, Permission.CLIENTS_VIEW_OWN],
  [Roles.INVESTOR]: [Permission.ANALYTICS_EXECUTIVE, Permission.REPORTS_EXPORT],
};

export function hasPermission(role: string, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(p => hasPermission(role, p));
}
export function getPermissionsForRole(role: string): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
export function isRoleAtLeast(userRole: string, minRole: Roles): boolean {
  const ui = ROLE_HIERARCHY.indexOf(userRole as Roles);
  const mi = ROLE_HIERARCHY.indexOf(minRole);
  return ui >= 0 && mi >= 0 && ui <= mi;
}
export function isAdminRole(role: string): boolean {
  return role === Roles.OWNER || role === Roles.SYSTEM_ADMIN;
}
export function isValidRole(role: unknown): role is Roles {
  return typeof role === "string" && Object.values(Roles).includes(role as Roles);
}

export const RoleGroups = {
  ADMINS: [Roles.OWNER, Roles.SYSTEM_ADMIN],
  MANAGEMENT: [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER],
  STAFF: [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT, Roles.MARKETING_STAFF],
  EXTERNAL: [Roles.CLIENT, Roles.INVESTOR],
  ALL: Object.values(Roles),
};
