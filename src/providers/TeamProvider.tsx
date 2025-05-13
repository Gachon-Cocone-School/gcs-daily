import { createContext, useContext } from "react";
import useSWR from "swr";
import { useAuth } from "./AuthProvider";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

type TeamContextType = {
  team: Team | null;
  loading: boolean;
  error: Error | null;
};

const TeamContext = createContext<TeamContextType>({
  team: null,
  loading: true,
  error: null,
});

export const useTeam = () => useContext(TeamContext);

async function fetchTeam(email: string) {
  const { data, error } = await supabase
    .from("teams")
    .select()
    .contains("emails", [email])
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    data: team,
    error,
    isLoading,
  } = useSWR(
    user?.email ? ["team", user.email] : null,
    () => (user?.email ? fetchTeam(user.email) : null),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  return (
    <TeamContext.Provider
      value={{
        team: team ?? null,
        loading: isLoading,
        error: error ? new Error(error.message) : null,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
