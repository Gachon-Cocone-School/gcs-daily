import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAllowedEmail: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAllowedEmail: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAllowedEmail, setIsAllowedEmail] = useState(false);

  useEffect(() => {
    // Check current auth status
    void supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        void checkAllowedEmail(session?.user?.email);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error getting auth session:", error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      checkAllowedEmail(session?.user?.email);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkAllowedEmail = async (email: string | undefined) => {
    if (!email) {
      setIsAllowedEmail(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("allowed_emails")
        .select("email")
        .eq("email", email)
        .single();

      if (error) {
        console.error("Error checking allowed email:", error);
        setIsAllowedEmail(false);
        return;
      }

      setIsAllowedEmail(!!data);
    } catch (error) {
      console.error("Error checking allowed email:", error);
      setIsAllowedEmail(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAllowedEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
