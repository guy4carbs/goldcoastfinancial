import { Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { Roles, Permission, hasPermission, hasAnyPermission, hasAllPermissions, isValidRole } from "../types/permissions";

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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Authentication required" });
  if (!req.user.isActive) return res.status(403).json({ error: "Account is deactivated" });
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

export const MANAGER_PLUS = [Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER];
export const ADMIN_PLUS = [Roles.OWNER, Roles.SYSTEM_ADMIN];
