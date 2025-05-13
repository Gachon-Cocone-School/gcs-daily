import { useState, useEffect } from "react";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export function useTeam(userEmail: string | undefined | null) {
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserTeam() {
      setLoading(true);
      if (!userEmail) {
        setTeam(null);
        setLoading(false);
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
        setLoading(false);
        return;
      }

      setTeam(userTeams);
      setLoading(false);
    }

    void fetchUserTeam();
  }, [userEmail]);

  return { team, loading };
}
