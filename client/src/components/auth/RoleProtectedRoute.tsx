/**
 * Role-Protected Route Component
 * Handles authentication, role-based access, and 2FA verification
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useLoungeAccess } from '@/hooks/useLoungeAccess';
import {
  Role,
  PermissionType,
  hasAnyPermission,
  hasAllPermissions,
  DEFAULT_ROUTE_BY_ROLE,
  isValidRole,
  Roles,
} from '@/types/permissions';
import { AccessDenied } from './AccessDenied';
import { Loader2 } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Roles that are allowed to access this route
   */
  allowedRoles?: Role[];
  /**
   * Permissions required (user needs ALL if requireAll is true, ANY otherwise)
   */
  requiredPermissions?: PermissionType[];
  /**
   * If true, user needs ALL required permissions. If false, ANY permission suffices.
   * Default: false (ANY)
   */
  requireAll?: boolean;
  /**
   * If true, 2FA verification is required for this route
   */
  require2FA?: boolean;
  /**
   * Path to redirect to if access is denied
   * If not provided, shows AccessDenied component
   */
  fallbackPath?: string;
  /**
   * Show AccessDenied component instead of redirecting
   */
  showAccessDenied?: boolean;
  /**
   * Custom message to show on AccessDenied page
   */
  accessDeniedMessage?: string;
  /**
   * DB lounge key to check access against (e.g., 'manager_lounge')
   * If provided, user must have DB-level lounge access in addition to role
   */
  loungeKey?: string;
}

export function RoleProtectedRoute({
  children,
  allowedRoles,
  requiredPermissions,
  requireAll = false,
  require2FA = false,
  fallbackPath,
  showAccessDenied = true,
  accessDeniedMessage,
  loungeKey,
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [accessState, setAccessState] = useState<'checking' | 'allowed' | 'denied' | 'needs-login' | 'needs-2fa'>('checking');
  const { hasAccessByKey, isLoading: loungeLoading } = useLoungeAccess();

  useEffect(() => {
    // Still loading auth state
    if (isLoading) {
      setAccessState('checking');
      return;
    }

    // Not authenticated
    if (!user) {
      setAccessState('needs-login');
      return;
    }

    // Get user's role (with fallback)
    const userRole: Role = isValidRole(user.role) ? user.role : Roles.CLIENT;

    // Check 2FA requirement
    if (require2FA && user.twoFactorEnabled && !user.twoFactorVerified) {
      setAccessState('needs-2fa');
      return;
    }

    // Check role-based access
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(userRole)) {
        setAccessState('denied');
        return;
      }
    }

    // Check permission-based access
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAccess = requireAll
        ? hasAllPermissions(userRole, requiredPermissions)
        : hasAnyPermission(userRole, requiredPermissions);

      if (!hasAccess) {
        setAccessState('denied');
        return;
      }
    }

    // Check DB-level lounge access if loungeKey is specified
    if (loungeKey && !loungeLoading) {
      if (!hasAccessByKey(loungeKey)) {
        setAccessState('denied');
        return;
      }
    }

    // Still waiting for lounge access data
    if (loungeKey && loungeLoading) {
      setAccessState('checking');
      return;
    }

    // All checks passed
    setAccessState('allowed');
  }, [user, isLoading, allowedRoles, requiredPermissions, requireAll, require2FA, loungeKey, loungeLoading, hasAccessByKey]);

  // Handle different access states
  useEffect(() => {
    if (accessState === 'needs-login') {
      // Store the current path for redirect after login
      const currentPath = window.location.pathname;
      sessionStorage.setItem('redirectAfterLogin', currentPath);
      setLocation('/agents/login');
      return;
    }

    if (accessState === 'needs-2fa') {
      setLocation('/ai/2fa-verify');
      return;
    }

    if (accessState === 'denied' && fallbackPath && !showAccessDenied) {
      setLocation(fallbackPath);
      return;
    }

    if (accessState === 'denied' && !showAccessDenied && user) {
      // Redirect to user's default route based on their role
      const userRole: Role = isValidRole(user.role) ? user.role : Roles.CLIENT;
      const defaultRoute = DEFAULT_ROUTE_BY_ROLE[userRole] || '/';
      setLocation(defaultRoute);
    }
  }, [accessState, fallbackPath, showAccessDenied, setLocation, user]);

  // Loading state
  if (accessState === 'checking') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Access denied with component display
  if (accessState === 'denied' && showAccessDenied) {
    return (
      <AccessDenied
        message={accessDeniedMessage}
        userRole={user?.role}
        requiredRoles={allowedRoles}
        requiredPermissions={requiredPermissions}
      />
    );
  }

  // Waiting for redirect (needs-login, needs-2fa, or denied without showing component)
  if (accessState !== 'allowed') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Access granted
  return <>{children}</>;
}

// =============================================================================
// CONVENIENCE COMPONENTS
// =============================================================================

/**
 * Route protected for admin users only (Owner, SystemAdmin, Manager)
 */
export function AdminRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute
      allowedRoles={[Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER]}
      {...props}
    >
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Route protected for super admins only (Owner, SystemAdmin)
 */
export function SuperAdminRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute
      allowedRoles={[Roles.OWNER, Roles.SYSTEM_ADMIN]}
      {...props}
    >
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Route protected for owner only
 */
export function OwnerRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute allowedRoles={[Roles.OWNER]} {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Route protected for AI Lounge access
 */
export function AILoungeRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles' | 'require2FA'>) {
  return (
    <RoleProtectedRoute
      allowedRoles={[Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT]}
      require2FA={true}
      {...props}
    >
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Route protected for staff (all internal users)
 */
export function StaffRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute
      allowedRoles={[Roles.OWNER, Roles.SYSTEM_ADMIN, Roles.AGENCY_MANAGER, Roles.SALES_AGENT, Roles.MARKETING_STAFF]}
      {...props}
    >
      {children}
    </RoleProtectedRoute>
  );
}

/**
 * Route for authenticated users only (no role restriction)
 */
export function AuthenticatedRoute({ children, ...props }: Omit<RoleProtectedRouteProps, 'allowedRoles'>) {
  return (
    <RoleProtectedRoute {...props}>
      {children}
    </RoleProtectedRoute>
  );
}

export default RoleProtectedRoute;
