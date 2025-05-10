import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";
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
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>("initializing");

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

      setAuthState(data ? "allowed" : "denied");
    } catch (error) {
      console.error("Error checking allowed email:", error);
      setAuthState("denied");
    }
  };

  const updateAuthState = useCallback(
    async (session: { user: User | null } | null) => {
      setUser(session?.user ?? null);

      if (!session?.user) {
        setAuthState("initializing");
        return;
      }

      await checkAllowedEmail(session.user.email);
    },
    [],
  );

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        await updateAuthState(session);
      })
      .catch((error) => {
        console.error("Error getting auth session:", error);
        setAuthState("denied");
      });
  }, [updateAuthState]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthState("initializing");
  };

  return (
    <AuthContext.Provider value={{ user, authState, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
