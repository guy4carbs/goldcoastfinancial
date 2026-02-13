import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Role, isValidRole, Roles } from "@/types/permissions";

/**
 * Extended user interface with RBAC fields
 */
export interface AppUser {
  // Firebase fields
  uid: string;
  email: string | null;
  displayName: string | null;

  // Database profile fields (fetched from backend)
  id?: string;
  firstName?: string;
  lastName?: string;
  role: Role;
  isActive: boolean;
  twoFactorEnabled: boolean;
  twoFactorVerified: boolean;
  phone?: string;
  avatarUrl?: string;
  timezone?: string;
}

interface AuthContextType {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  set2FAVerified: (verified: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Fetch user profile from backend database
 */
async function fetchUserProfile(email: string): Promise<Partial<AppUser> | null> {
  try {
    const response = await fetch('/api/auth/user');
    if (response.ok) {
      const data = await response.json();
      if (data.user) {
        return {
          id: data.user.id,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: isValidRole(data.user.role) ? data.user.role : Roles.CLIENT,
          isActive: data.user.isActive ?? true,
          twoFactorEnabled: data.user.twoFactorEnabled ?? false,
          twoFactorVerified: false, // Needs to be verified separately
          phone: data.user.phone,
          avatarUrl: data.user.avatarUrl,
          timezone: data.user.timezone,
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [twoFactorVerified, setTwoFactorVerified] = useState(false);

  // Build AppUser from Firebase user and profile data
  const buildAppUser = (
    fbUser: FirebaseUser,
    profile: Partial<AppUser> | null
  ): AppUser => {
    return {
      uid: fbUser.uid,
      email: fbUser.email,
      displayName: fbUser.displayName,
      id: profile?.id,
      firstName: profile?.firstName || fbUser.displayName?.split(' ')[0],
      lastName: profile?.lastName || fbUser.displayName?.split(' ').slice(1).join(' '),
      role: profile?.role || Roles.CLIENT,
      isActive: profile?.isActive ?? true,
      twoFactorEnabled: profile?.twoFactorEnabled ?? false,
      twoFactorVerified: twoFactorVerified,
      phone: profile?.phone,
      avatarUrl: profile?.avatarUrl,
      timezone: profile?.timezone || 'America/Chicago',
    };
  };

  // Check for existing session on mount
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      // First check for session-based auth
      try {
        const response = await fetch('/api/auth/user', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          if (data.user && mounted) {
            setUser({
              uid: data.user.id,
              email: data.user.email,
              displayName: `${data.user.firstName} ${data.user.lastName}`,
              id: data.user.id,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
              role: isValidRole(data.user.role) ? data.user.role : Roles.CLIENT,
              isActive: data.user.isActive ?? true,
              twoFactorEnabled: data.user.twoFactorEnabled ?? false,
              twoFactorVerified: false,
              phone: data.user.phone,
              avatarUrl: data.user.avatarUrl,
              timezone: data.user.timezone || 'America/Chicago',
            });
            setLoading(false);
            return; // Session found, don't check Firebase
          }
        }
      } catch (err) {
        console.log('Session check failed');
      }

      // No session, set up Firebase listener
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (!mounted) return;

        setFirebaseUser(fbUser);

        if (fbUser) {
          const profile = await fetchUserProfile(fbUser.email || '');
          if (mounted) {
            setUser(buildAppUser(fbUser, profile));
          }
        } else {
          setUser(null);
          setTwoFactorVerified(false);
        }

        setLoading(false);
      });

      return unsubscribe;
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Try session-based auth first (for admin users in PostgreSQL)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          // Session-based login successful - set user directly
          setUser({
            uid: data.user.id,
            email: data.user.email,
            displayName: `${data.user.firstName} ${data.user.lastName}`,
            id: data.user.id,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            role: isValidRole(data.user.role) ? data.user.role : Roles.CLIENT,
            isActive: data.user.isActive ?? true,
            twoFactorEnabled: data.user.twoFactorEnabled ?? false,
            twoFactorVerified: false,
            phone: data.user.phone,
            avatarUrl: data.user.avatarUrl,
            timezone: data.user.timezone || 'America/Chicago',
          });
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.log('Session auth failed, trying Firebase...');
    }

    // Fall back to Firebase auth
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    // Clear session-based auth
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.log('Session logout error:', err);
    }

    // Clear Firebase auth
    await firebaseSignOut(auth);
    setUser(null);
    setTwoFactorVerified(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (firebaseUser) {
      const profile = await fetchUserProfile(firebaseUser.email || '');
      setUser(buildAppUser(firebaseUser, profile));
    }
  };

  const set2FAVerified = (verified: boolean) => {
    setTwoFactorVerified(verified);
    if (user) {
      setUser({ ...user, twoFactorVerified: verified });
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isLoading: loading,
    isAuthenticated: !!user,
    login: signIn,
    logout: signOut,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
    set2FAVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
