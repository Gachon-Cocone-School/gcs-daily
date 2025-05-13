"use client";

import Head from "next/head";
import Image from "next/image";
import { LoginButton } from "~/components/LoginButton";
import { Calendar } from "~/components/Calendar";
import { useAuth } from "~/providers/AuthProvider";
import { useTeam } from "~/providers/TeamProvider";
import { useUsers } from "~/providers/UserProvider";
import { strings } from "~/constants/strings";

export default function Home() {
  const { user, authState } = useAuth();
  const { team, loading: teamLoading } = useTeam();
  const { users } = useUsers();
  const currentUser = user?.email ? users[user.email] : null;

  return (
    <>
      <Head>
        <title>{strings.app.title}</title>
        <meta name="description" content={strings.app.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              {strings.app.title}
            </h1>
            {user && authState === "allowed" && (
              <div className="flex items-center gap-3">
                {currentUser && (
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

        {!user || authState === "denied" ? (
          <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center">
              <h2 className="mb-8 text-3xl font-semibold text-gray-900">
                {strings.app.title}
              </h2>
              <LoginButton />
            </div>
          </main>
        ) : authState === "initializing" || authState === "checking" ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
              <p className="text-gray-600">{strings.app.status[authState]}</p>
            </div>
          </main>
        ) : teamLoading ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="space-y-4 text-center">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-900 border-t-transparent"></div>
              <p className="text-gray-600">{strings.app.status.loadingTeam}</p>
            </div>
          </main>
        ) : !team ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">{strings.app.noTeams}</div>
          </main>
        ) : (
          <main className="flex-1 bg-gray-50 p-8">
            <div className="mx-auto max-w-lg">
              <Calendar />
            </div>
          </main>
        )}
      </div>
    </>
  );
}
