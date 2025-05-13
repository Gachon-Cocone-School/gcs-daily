"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useTeamStore } from "@/stores/teamStore";
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

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { team, loading, error, fetchTeam } = useTeamStore();

  useEffect(() => {
    if (user?.email) {
      void fetchTeam(user.email);
    }
  }, [user?.email, fetchTeam]);

  return (
    <TeamContext.Provider
      value={{
        team,
        loading,
        error,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}
