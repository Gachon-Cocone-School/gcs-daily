"use client";

import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import {
  persist,
  createJSONStorage,
  type StateStorage,
} from "zustand/middleware";
import { supabase } from "@/lib/supabase";

type AuthState = "initializing" | "checking" | "allowed" | "denied";

interface AuthStoreState {
  user: User | null;
  authState: AuthState;
  hasCheckedPermission: boolean;
  loading: boolean;
  checkAllowedEmail: (email: string) => Promise<boolean>;
  setUser: (user: User | null) => void;
  setAuthState: (state: AuthState) => void;
  setHasCheckedPermission: (checked: boolean) => void;
}

const STORAGE_KEY = "auth-storage";

// 크로스 탭 동기화를 위한 커스텀 스토리지
const crossTabStorage: StateStorage = {
  getItem: (key): string | null => {
    if (typeof window === "undefined") return null;
    const str = localStorage.getItem(key);
    if (!str) return null;
    return str;
  },
  setItem: (key, newValue): void => {
    if (typeof window === "undefined") return;
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
  removeItem: (key): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(key);
  },
};

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      user: null,
      authState: "initializing",
      hasCheckedPermission: false,
      loading: false,

      setUser: (user) => set({ user }),
      setAuthState: (state) => set({ authState: state }),
      setHasCheckedPermission: (checked) =>
        set({ hasCheckedPermission: checked }),

      checkAllowedEmail: async (email: string) => {
        if (!email) {
          set({ authState: "denied" });
          return false;
        }

        set({ authState: "checking", loading: true });

        try {
          const { data } = await supabase
            .from("allowed_emails")
            .select("email")
            .eq("email", email)
            .single();

          const isAllowed = Boolean(data);
          set({
            authState: isAllowed ? "allowed" : "denied",
            hasCheckedPermission: true,
          });
          return isAllowed;
        } catch (error) {
          console.error("Error checking allowed email:", error);
          set({ authState: "denied" });
          return false;
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => crossTabStorage),
      partialize: (state) => ({
        user: state.user,
        authState: state.authState,
        hasCheckedPermission: state.hasCheckedPermission,
      }),
    },
  ),
);
