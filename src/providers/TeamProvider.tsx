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
    error: swrError,
    isLoading,
  } = useSWR<Team | null, Error>(
    user?.email ? ["team", user.email] : null,
    async ([_, email]: [string, string]) => {
      try {
        return await fetchTeam(email);
      } catch (err) {
        throw err instanceof Error ? err : new Error(String(err));
      }
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const error = swrError instanceof Error ? swrError : null;

  return (
    <TeamContext.Provider
      value={{
        team: team ?? null,
        loading: isLoading,
        error,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
