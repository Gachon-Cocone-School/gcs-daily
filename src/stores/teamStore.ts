import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface TeamState {
  team: Team | null;
  loading: boolean;
  error: Error | null;
  fetchTeam: (email: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      team: null,
      loading: false,
      error: null,
      fetchTeam: async (email: string) => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from("teams")
            .select()
            .contains("emails", [email])
            .single();

          if (error) {
            throw error;
          }

          set({ team: data, loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          });
        }
      },
    }),
    {
      name: "team-storage",
      partialize: (state) => ({ team: state.team }),
    },
  ),
);
