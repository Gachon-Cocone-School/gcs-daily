"use client";

import { createContext, useContext, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useUsersStore } from "@/stores/usersStore";
import type { Database } from "~/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

type UsersContextType = {
  users: Record<string, User>;
  loading: boolean;
  error: Error | null;
};

const UsersContext = createContext<UsersContextType>({
  users: {},
  loading: true,
  error: null,
});

export const useUsers = () => useContext(UsersContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { users, loading, error, fetchUsers } = useUsersStore();

  useEffect(() => {
    if (user) {
      void fetchUsers();
    }
  }, [user, fetchUsers]);

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}
