import { createContext, useContext } from "react";
import useSWR from "swr";
import { useAuth } from "./AuthProvider";
import { supabase } from "~/lib/supabase";
import type { Tables } from "~/lib/database.types";

type User = Tables<"users">;
type UserMap = { [key: string]: User };

type UserContextType = {
  users: UserMap;
  loading: boolean;
  error: Error | null;
};

const UserContext = createContext<UserContextType>({
  users: {},
  loading: true,
  error: null,
});

export const useUsers = () => useContext(UserContext);

async function fetchUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("email, full_name, avatar_url, created_at, updated_at")
    .order("full_name");

  if (error) {
    throw error;
  }

  const userMap = data.reduce<UserMap>((acc, user) => {
    acc[user.email] = user;
    return acc;
  }, {});

  return userMap;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const {
    data: users,
    error,
    isLoading,
  } = useSWR(user ? "users" : null, fetchUsers, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  return (
    <UserContext.Provider
      value={{
        users: users ?? {},
        loading: isLoading,
        error: error ? new Error(error.message) : null,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}
