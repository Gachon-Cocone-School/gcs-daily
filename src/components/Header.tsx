"use client";

import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useEffect, useState } from "react";
import { LoginButton } from "./LoginButton";
import { strings } from "~/constants/strings";
import { useAuth } from "~/providers/AuthProvider";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type User = Database["public"]["Tables"]["users"]["Row"];

interface HeaderProps {
  showBackButton?: boolean;
  onBack?: () => void;
}

export const Header = ({ showBackButton = false, onBack }: HeaderProps) => {
  const { user, authState } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserData() {
      if (!user?.email) {
        setCurrentUser(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          return;
        }

        setCurrentUser(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    void fetchUserData();
  }, [user?.email]);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && onBack && (
            <button
              type="button"
              onClick={onBack}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
              aria-label={strings.calendar.action.back}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          )}
          <h1 className="text-xl font-semibold text-gray-900">
            {strings.app.title}
          </h1>
        </div>

        {user && authState === "allowed" && (
          <div className="flex items-center gap-3">
            {!loading && currentUser && (
              <div className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full">
                  {currentUser.avatar_url ? (
                    <Image
                      src={currentUser.avatar_url}
                      alt={currentUser.full_name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-sm text-gray-600">
                      {currentUser.full_name[0]}
                    </div>
                  )}
                </div>
                <span className="hidden text-sm text-gray-700 sm:inline-block">
                  {currentUser.full_name}
                </span>
              </div>
            )}
            <LoginButton />
          </div>
        )}
      </div>
    </header>
  );
};
