import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface UsersState {
  users: Record<string, User>;
  loading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
}

export const useUsersStore = create<UsersState>()(
  persist(
    (set) => ({
      users: {},
      loading: false,
      error: null,
      fetchUsers: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from("users")
            .select("id, email, full_name, avatar_url, created_at, updated_at")
            .order("full_name");

          if (error) {
            throw error;
          }

          const userMap = data.reduce<Record<string, User>>((acc, user) => {
            acc[user.email] = user;
            return acc;
          }, {});

          set({ users: userMap, loading: false });
        } catch (err) {
          set({
            error: err instanceof Error ? err : new Error(String(err)),
            loading: false,
          });
        }
      },
    }),
    {
      name: "users-storage",
      partialize: (state) => ({ users: state.users }),
    },
  ),
);
