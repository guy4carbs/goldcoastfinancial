/**
 * Access Denied Component
 * Displayed when a user doesn't have permission to access a resource
 */

import { ShieldX, ArrowLeft, Home, LogOut } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Role,
  PermissionType,
  ROLE_DISPLAY_NAMES,
  DEFAULT_ROUTE_BY_ROLE,
  isValidRole,
  Roles,
} from '@/types/permissions';

interface AccessDeniedProps {
  /**
   * Custom message to display
   */
  message?: string;
  /**
   * Current user's role (for display purposes)
   */
  userRole?: string;
  /**
   * Required roles (for display purposes)
   */
  requiredRoles?: Role[];
  /**
   * Required permissions (for display purposes)
   */
  requiredPermissions?: PermissionType[];
  /**
   * Show back button
   */
  showBackButton?: boolean;
  /**
   * Show home button
   */
  showHomeButton?: boolean;
  /**
   * Show logout button
   */
  showLogoutButton?: boolean;
}

export function AccessDenied({
  message,
  userRole,
  requiredRoles,
  requiredPermissions,
  showBackButton = true,
  showHomeButton = true,
  showLogoutButton = true,
}: AccessDeniedProps) {
  const [, setLocation] = useLocation();
  const { signOut, user } = useAuth();

  const handleBack = () => {
    window.history.back();
  };

  const handleHome = () => {
    if (user) {
      const role: Role = isValidRole(user.role) ? user.role : Roles.CLIENT;
      setLocation(DEFAULT_ROUTE_BY_ROLE[role] || '/');
    } else {
      setLocation('/');
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation('/admin/login');
  };

  const displayRole = userRole && isValidRole(userRole)
    ? ROLE_DISPLAY_NAMES[userRole]
    : userRole || 'Unknown';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <ShieldX className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">Access Denied</CardTitle>
          <CardDescription className="text-gray-600">
            {message || "You don't have permission to access this page."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Current Role */}
          {userRole && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Your Role:</span>
              <Badge variant="secondary">{displayRole}</Badge>
            </div>
          )}

          {/* Required Roles */}
          {requiredRoles && requiredRoles.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800 font-medium mb-2">
                Required Role{requiredRoles.length > 1 ? 's' : ''}:
              </p>
              <div className="flex flex-wrap gap-1">
                {requiredRoles.map((role) => (
                  <Badge key={role} variant="outline" className="bg-white">
                    {ROLE_DISPLAY_NAMES[role]}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Required Permissions */}
          {requiredPermissions && requiredPermissions.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Required Permission{requiredPermissions.length > 1 ? 's' : ''}:
              </p>
              <div className="flex flex-wrap gap-1">
                {requiredPermissions.slice(0, 5).map((permission) => (
                  <Badge key={permission} variant="outline" className="bg-white text-xs">
                    {permission}
                  </Badge>
                ))}
                {requiredPermissions.length > 5 && (
                  <Badge variant="outline" className="bg-white text-xs">
                    +{requiredPermissions.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Help Text */}
          <p className="text-sm text-gray-500 text-center">
            If you believe you should have access to this page, please contact your administrator.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          <div className="flex w-full gap-2">
            {showBackButton && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            {showHomeButton && (
              <Button
                variant="default"
                onClick={handleHome}
                className="flex-1"
              >
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            )}
          </div>
          {showLogoutButton && (
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full text-gray-500 hover:text-gray-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

export default AccessDenied;
