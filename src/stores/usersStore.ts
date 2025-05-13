import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface UsersState {
  users: Record<string, User>;
  loading: boolean;
  error: Error | null;
  fetchUsers: () => Promise<void>;
}

const STORAGE_KEY = "users-storage";

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
      name: STORAGE_KEY,
      storage: createJSONStorage(() => crossTabStorage),
      partialize: (state) => ({
        users: state.users,
      }),
    },
  ),
);
