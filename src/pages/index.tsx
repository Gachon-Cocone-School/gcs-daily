import { useState, useEffect } from "react";
import Head from "next/head";
import { LoginButton } from "~/components/LoginButton";
import { Calendar } from "~/components/Calendar";
import { DailySnippet } from "~/components/DailySnippet";
import { useAuth } from "~/providers/AuthProvider";
import { strings } from "~/constants/strings";
import { getCurrentKSTDate } from "~/utils/dateTime";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export default function Home() {
  const { user, isAllowedEmail } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() => getCurrentKSTDate());
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        ) : (
          <main className="flex-1 bg-white px-4 py-8">
            <div className="container mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <Calendar
                  onSelectDate={setSelectedDate}
                  selectedDate={selectedDate}
                />
              </div>
              <div className="space-y-4">
                <DailySnippet
                  date={selectedDate}
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
