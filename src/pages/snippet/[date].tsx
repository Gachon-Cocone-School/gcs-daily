import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { DailySnippet } from "~/components/DailySnippet";
import { LoginButton } from "~/components/LoginButton";
import { strings } from "~/constants/strings";
import { useAuth } from "~/providers/AuthProvider";
import { supabase } from "~/lib/supabase";
import { formatDate, isFutureDate } from "~/utils/dateTime";
import type { Database } from "~/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export default function SnippetPage() {
  const router = useRouter();
  const { user, isAllowedEmail } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parse the date from the URL
  const { date: dateString } = router.query;
  const date = dateString ? new Date(dateString as string) : null;

  useEffect(() => {
    async function fetchUserTeams() {
      if (!user?.email) return;

      const { data: userTeams, error } = await supabase
        .from("teams")
        .select()
        .contains("emails", [user.email]);

      if (error) {
        console.error("Error fetching teams:", error);
        return;
      }

      setTeams(userTeams ?? []);
      if (userTeams && userTeams.length > 0) {
        setSelectedTeam(userTeams[0] ?? null);
      } else {
        setSelectedTeam(null);
      }
      setIsLoading(false);
    }

    void fetchUserTeams();
  }, [user?.email]);

  const handleBack = () => {
    void router.push("/");
  };

  const displayDate = date ? formatDate(date, "PPP") : "";

  return (
    <>
      <Head>
        <title>
          {displayDate ? strings.snippet.title(displayDate) : strings.app.title}
        </title>
        <meta name="description" content={strings.app.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4 shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none"
                aria-label={strings.calendar.action.back}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {strings.app.title}
              </h1>
            </div>
            {user && teams.length > 1 && (
              <select
                value={selectedTeam?.team_name ?? ""}
                onChange={(e) => {
                  const team = teams.find(
                    (t) => t.team_name === e.target.value,
                  );
                  setSelectedTeam(team ?? null);
                }}
                className="ml-4 rounded-lg border border-gray-300 bg-white py-2 pr-10 pl-3 text-sm"
                aria-label={strings.team.select}
              >
                {teams.map((team) => (
                  <option key={team.team_name} value={team.team_name}>
                    {team.team_name}
                  </option>
                ))}
              </select>
            )}
            <LoginButton />
          </div>
        </header>

        {!user || !isAllowedEmail ? (
          <main className="flex flex-1 items-center justify-center bg-gradient-to-b from-gray-50 to-white">
            <div className="text-center">
              <h2 className="mb-8 text-3xl font-semibold text-gray-900">
                {strings.app.title}
              </h2>
              <LoginButton />
            </div>
          </main>
        ) : isLoading ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">{strings.app.loading}</div>
          </main>
        ) : !selectedTeam ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">{strings.app.noTeams}</div>
          </main>
        ) : !date ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">{strings.snippet.invalidDate}</div>
          </main>
        ) : isFutureDate(date) ? (
          <main className="flex flex-1 items-center justify-center">
            <div className="text-center">
              {strings.snippet.validation.future}
            </div>
          </main>
        ) : (
          <main className="flex-1 bg-gray-50 p-8">
            <div className="mx-auto max-w-2xl space-y-4">
              <div className="rounded-lg bg-white p-6 shadow-sm">
                <h2 className="mb-6 text-lg font-medium text-gray-900">
                  {displayDate}
                </h2>
                <DailySnippet
                  date={date}
                  userEmail={user.email ?? ""}
                  teamName={selectedTeam.team_name}
                />
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  );
}
