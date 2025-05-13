"use client";

import { createContext, useContext, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";
import { useAuthStore } from "~/stores/authStore";

type AuthState = "initializing" | "checking" | "allowed" | "denied";

type AuthContextType = {
  user: User | null;
  authState: AuthState;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  authState: "initializing",
  signOut: async () => {
    // Default empty implementation
    return Promise.resolve();
  },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    authState,
    hasCheckedPermission,
    setUser,
    setAuthState,
    checkAllowedEmail,
    setHasCheckedPermission,
  } = useAuthStore();

  const updateAuthState = useCallback(
    async (session: { user: User | null } | null) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        setAuthState("denied");
        setHasCheckedPermission(false);
        return;
      }

      // Only check permissions if we haven't checked before
      if (!hasCheckedPermission) {
        await checkAllowedEmail(session.user.email ?? "");
      }
    },
    [
      hasCheckedPermission,
      setUser,
      setAuthState,
      setHasCheckedPermission,
      checkAllowedEmail,
    ],
  );

  useEffect(() => {
    // Initial session check
    void supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        await updateAuthState(session);
      })
      .catch((error) => {
        console.error("Error getting auth session:", error);
        setAuthState("denied");
      });

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Reset permission check on sign-in or sign-out
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        setHasCheckedPermission(false);
      }
      await updateAuthState(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [updateAuthState, setAuthState, setHasCheckedPermission]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authState,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
