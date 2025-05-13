import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";

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
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>("initializing");
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  const checkAllowedEmail = async (email: string | undefined) => {
    if (!email) {
      setAuthState("denied");
      return;
    }

    setAuthState("checking");

    try {
      const { data } = await supabase
        .from("allowed_emails")
        .select("email")
        .eq("email", email)
        .single();

      const newState = data ? "allowed" : "denied";
      setAuthState(newState);
    } catch (error) {
      console.error("Error checking allowed email:", error);
      setAuthState("denied");
    } finally {
      setHasCheckedPermission(true);
    }
  };

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
        await checkAllowedEmail(session.user.email);
      }
    },
    [hasCheckedPermission],
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
  }, [updateAuthState]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthState("denied");
    setHasCheckedPermission(false);
  };

  return (
    <AuthContext.Provider value={{ user, authState, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
