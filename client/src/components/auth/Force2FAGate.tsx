import { useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Force2FAGate — top-level wrapper that auto-redirects authenticated
 * high-trust users to the 2FA enrollment or verification page when their
 * session isn't yet 2FA-cleared.
 *
 * Without this, a founder/manager/agent lands on /crm (or wherever),
 * every API call returns 403 (REQUIRES_2FA_ENROLLMENT or REQUIRES_2FA),
 * and the page just sits there showing a wall of console errors with no
 * path to the enrollment screen. The user has no idea what to do.
 *
 * Two states this gate handles:
 *
 *   1. user.twoFactorEnabled === false → push to /ai/2fa-setup
 *      (Heritage's existing TOTP enrollment page that talks to
 *      /api/ai/2fa/setup → returns QR code → user scans → verifies
 *      → backend flips twoFactorEnabled=true and twoFactorVerified=true).
 *
 *   2. user.twoFactorEnabled && !user.twoFactorVerified → push to
 *      /ai/2fa-verify (Heritage's existing TOTP verify page that
 *      accepts a 6-digit code → marks the session verified).
 *
 * EXEMPT_PATHS lists locations where redirecting would loop or break
 * other flows — the login pages themselves, the 2FA pages, public
 * marketing routes, etc.
 *
 * Roles requiring 2FA mirror the server-side HIGH_TRUST_2FA_ROLES
 * set in server/middleware/auth.ts. Update both lists together when
 * the policy changes.
 */
const HIGH_TRUST_2FA_ROLES = new Set<string>([
  "founder",
  "owner",
  "system_admin",
  "director",
  "agency_manager",
  "manager",
  "sales_agent",
  "marketing_staff",
  "investor",
]);

// Locations we must NOT redirect away from, even if 2FA is incomplete.
// - Login pages: the user can't do anything else until they sign in.
// - 2FA pages: redirecting here from here = infinite loop.
// - Public pages: brochure-style content with no protected data.
const EXEMPT_PATHS = [
  "/agents/login",
  "/admin/login",
  "/client/login",
  "/ai/2fa-setup",
  "/ai/2fa-verify",
  "/client/2fa-setup",
  "/client/2fa-verify",
  "/forgot-password",
  "/reset-password",
];

function isExemptPath(path: string): boolean {
  return EXEMPT_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
}

export function Force2FAGate({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    if (!user) return; // Anonymous traffic — handled by RoleProtectedRoute / login redirects.
    if (!HIGH_TRUST_2FA_ROLES.has(user.role)) return; // Client role etc. — no 2FA required.
    if (isExemptPath(location)) return;

    if (!user.twoFactorEnabled) {
      setLocation("/ai/2fa-setup");
      return;
    }
    if (!user.twoFactorVerified) {
      setLocation("/ai/2fa-verify");
      return;
    }
  }, [user, isLoading, location, setLocation]);

  return <>{children}</>;
}
