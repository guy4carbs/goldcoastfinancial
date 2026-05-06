import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { Roles, Permission, hasPermission, hasAnyPermission, hasAllPermissions, isValidRole, ROLES_REQUIRING_2FA_SET } from "../types/permissions";

export interface AuthenticatedUser {
  id: string; email: string; firstName: string; lastName: string;
  role: string; isActive: boolean; twoFactorEnabled?: boolean;
  avatarUrl?: string; assignedAgentId?: string;
}

declare global {
  namespace Express {
    interface Request { user?: AuthenticatedUser; }
  }
}

export async function attachUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = (req.session as any)?.userId;
    if (userId) {
      const user = await storage.getUserById(userId);
      if (user) {
        const u = user as any;
        req.user = {
          id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
          role: isValidRole(u.role) ? u.role : Roles.CLIENT,
          isActive: u.isActive !== false,
          twoFactorEnabled: u.twoFactorEnabled ?? false,
          avatarUrl: u.avatarUrl, assignedAgentId: u.assignedAgentId,
        };
      }
    }
  } catch (e) { /* non-blocking */ }
  next();
}

// Roles for whom 2FA is mandatory (must enroll + verify on every login).
// Single source of truth: ROLES_REQUIRING_2FA in server/types/permissions.ts.
// To add a new role to the 2FA mandate, edit ONLY that array.
const HIGH_TRUST_2FA_ROLES = ROLES_REQUIRING_2FA_SET;

// Endpoints exempt from the 2FA gate so a user can actually enroll/verify.
const TWO_FA_EXEMPT_PATHS = [
  "/api/auth/2fa/enroll/begin",
  "/api/auth/2fa/enroll/verify",
  "/api/auth/2fa/verify",
  "/api/auth/2fa/recovery",
  "/api/auth/webauthn/register/begin",
  "/api/auth/webauthn/register/finish",
  "/api/auth/webauthn/auth/begin",
  "/api/auth/webauthn/auth/finish",
  "/api/auth/webauthn/credentials",
  "/api/auth/logout",
  "/api/auth/user",
  "/api/csrf-token",
];

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (!req.user.isActive) return res.status(403).json({ error: "Account is deactivated" });

  // 2FA gate. If this user is in a high-trust role:
  //   - If they haven't enrolled yet → return 403 with `requires_2fa_enrollment`
  //     so the SPA can route to /auth/2fa/enroll.
  //   - If they've enrolled but this session hasn't verified yet → return 403
  //     with `requires_2fa` so the SPA can route to /auth/2fa.
  // Both checks are skipped for the exempt endpoints above.
  if (HIGH_TRUST_2FA_ROLES.has(req.user.role)) {
    const session = req.session as any;
    // Use originalUrl so this works regardless of mount point. Strip query.
    const fullPath = (req.originalUrl || req.url || req.path || "").split("?")[0];
    const isExempt = TWO_FA_EXEMPT_PATHS.some((p) => fullPath === p || fullPath.startsWith(`${p}/`));
    if (!isExempt) {
      if (!req.user.twoFactorEnabled) {
        return res.status(403).json({
          error: "2FA enrollment required",
          code: "REQUIRES_2FA_ENROLLMENT",
        });
      }
      if (!session?.twoFactorVerified) {
        return res.status(403).json({
          error: "2FA verification required",
          code: "REQUIRES_2FA",
        });
      }
    }
  }

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden", code: "INSUFFICIENT_ROLE", requiredRoles: roles, userRole: req.user.role });
    }
    next();
  };
}

export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({ error: "Forbidden", code: "INSUFFICIENT_PERMISSION", required: permission });
    }
    next();
  };
}

export function requireAnyPermission(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({ error: "Forbidden", code: "INSUFFICIENT_PERMISSION" });
    }
    next();
  };
}

export function requireAllPermissions(...permissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    if (!hasAllPermissions(req.user.role, permissions)) {
      return res.status(403).json({ error: "Forbidden", code: "INSUFFICIENT_PERMISSION" });
    }
    next();
  };
}

export function require2FA(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  const session = req.session as any;
  if (req.user.twoFactorEnabled && !session?.twoFactorVerified) {
    return res.status(403).json({ error: "Two-factor authentication required" });
  }
  next();
}

export function requireOwnership(getOwnerId: (req: Request) => string | undefined) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: "Authentication required" });
    const ownerId = getOwnerId(req);
    if (ownerId && ownerId !== req.user.id && !hasPermission(req.user.role, Permission.USERS_EDIT)) {
      return res.status(403).json({ error: "Forbidden", code: "NOT_OWNER" });
    }
    next();
  };
}

// Founder sits above Owner — implicitly passes every downstream role gate.
// Roles.MANAGER is included alongside Roles.AGENCY_MANAGER for backward compat
// with rows predating the 0009_add_director_role migration.
export const MANAGER_PLUS = [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR, Roles.AGENCY_MANAGER, Roles.MANAGER];
export const DIRECTOR_PLUS = [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.DIRECTOR];
export const ADMIN_PLUS = [Roles.FOUNDER, Roles.OWNER, Roles.SYSTEM_ADMIN];
export const FOUNDERS_ONLY = [Roles.FOUNDER];

/**
 * Blocks non-GET writes whenever a Founder is actively impersonating another user
 * via the `/api/founders/viewas/session/start` flow.
 *
 * Mounted GLOBALLY on the Express app (see server/routes.ts) so that every write
 * endpoint — HCMS, Finance, Ops, Founders, etc. — is covered. A Founder under
 * view-as carries their founder role server-side; without this guard the
 * "read-only impersonation" contract advertised by Sentinel/Helix would be
 * trivially violated by POST/PATCH/DELETE to any non-founders route.
 *
 * Carve-outs:
 *   - GET/HEAD/OPTIONS always pass (reads are the whole point of view-as).
 *   - /api/founders/viewas/session/end MUST remain writable so the founder can
 *     exit view-as mode. Also allow /session/start and auth logout for safety
 *     (you can still log out to escape a stuck session).
 */
const VIEW_AS_WRITE_ALLOWLIST = new Set<string>([
  "/api/founders/viewas/session/end",
  "/api/founders/viewas/session/start",
  "/api/auth/logout",
]);

export function blockWritesDuringViewAs(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return next();

  const viewingAs = (req.session as any)?.viewingAs;
  if (!viewingAs) return next();

  // Normalize path (strip trailing slash)
  const path = req.originalUrl?.split("?")[0]?.replace(/\/$/, "") || req.path;
  if (VIEW_AS_WRITE_ALLOWLIST.has(path)) return next();

  return res.status(403).json({
    error: "Writes disabled under view-as session",
    code: "VIEW_AS_READ_ONLY",
  });
}
