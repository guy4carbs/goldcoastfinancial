import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, LoginInput, RegisterInput } from "@shared/models/auth";

interface AuthResponse {
  user: Omit<User, "password"> | null;
}

async function fetchUser(): Promise<Omit<User, "password"> | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (!response.ok) {
    return null;
  }

  const data: AuthResponse = await response.json();
  return data.user;
}

export interface LoginResult {
  user: Omit<User, "password">;
  requires_2fa_enrollment?: boolean;
  requires_2fa_verification?: boolean;
}

async function loginUser(credentials: LoginInput): Promise<LoginResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to log in");
  }

  const data = await response.json();
  return {
    user: data.user,
    requires_2fa_enrollment: !!data.requires_2fa_enrollment,
    requires_2fa_verification: !!data.requires_2fa_verification,
  };
}

async function registerUser(userData: RegisterInput): Promise<Omit<User, "password">> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create account");
  }

  const data = await response.json();
  return data.user;
}

async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to log out");
  }
}

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (result) => {
      queryClient.setQueryData(["/api/auth/user"], result.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    registerError: registerMutation.error,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
