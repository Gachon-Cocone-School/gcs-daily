import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export function useTeam(userEmail: string | undefined | null) {
  const [team, setTeam] = useState<Team | null>(null);

  useEffect(() => {
    async function fetchUserTeam() {
      if (!userEmail) {
        setTeam(null);
        return;
      }

      const { data: userTeams, error } = await supabase
        .from("teams")
        .select()
        .contains("emails", [userEmail])
        .single();

      if (error) {
        console.error("Error fetching team:", error);
        setTeam(null);
        return;
      }

      setTeam(userTeams);
    }

    void fetchUserTeam();
  }, [userEmail]);

  return { team };
}
