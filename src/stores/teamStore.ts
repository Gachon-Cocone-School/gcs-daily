import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

interface TeamState {
  team: Team | null;
  loading: boolean;
  error: Error | null;
  fetchTeam: (email: string) => Promise<void>;
}

const STORAGE_KEY = "team-storage";

// 크로스 탭 동기화를 위한 커스텀 스토리지
const crossTabStorage: StateStorage = {
  getItem: (key): string | null => {
    const str = localStorage.getItem(key);
    if (!str) return null;
    return str;
  },
  setItem: (key, newValue): void => {
    localStorage.setItem(key, String(newValue));
    // storage 이벤트를 수동으로 발생시켜 다른 탭에 알림
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: String(newValue),
        storageArea: localStorage,
      }),
    );
  },
  removeItem: (key): void => localStorage.removeItem(key),
};

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
      name: STORAGE_KEY,
      storage: createJSONStorage(() => crossTabStorage),
      partialize: (state) => ({
        team: state.team,
      }),
    },
  ),
);
