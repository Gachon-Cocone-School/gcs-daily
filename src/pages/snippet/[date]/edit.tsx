"use client";

import { useRouter } from "next/router";
import Head from "next/head";
import { SnippetEdit } from "~/components/SnippetEdit";
import { Header } from "~/components/Header";
import { strings } from "~/constants/strings";
import AuthGuard from "~/components/AuthGuard";
import Loading from "~/components/Loading";
import { useAuth } from "~/providers/AuthProvider";
import { formatDate, isFutureDate } from "~/utils/dateTime";
import { useEffect, useState, useMemo } from "react";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export default function SnippetEditPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [isFuture, setIsFuture] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Parse the date from the URL
  const { date: dateString } = router.query;
  const date = useMemo(
    () => (dateString ? new Date(dateString as string) : null),
    [dateString],
  );

  useEffect(() => {
    const checkFutureDate = () => {
      if (!date) return;
      setIsChecking(true);
      setIsFuture(isFutureDate(date));
      setIsChecking(false);
    };
    checkFutureDate();
  }, [date]);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.email) return;

      setTeamLoading(true);
      try {
        const { data: teamData, error } = await supabase
          .from("teams")
          .select("*")
          .contains("emails", [user.email])
          .single();

        if (error) {
          console.error("Error fetching team:", error);
          setTeam(null);
        } else {
          setTeam(teamData);
        }
      } catch (error) {
        console.error("Error fetching team:", error);
        setTeam(null);
      } finally {
        setTeamLoading(false);
      }
    };

    void fetchTeam();
  }, [user?.email]);

  const handleBack = () => {
    if (typeof dateString === "string") {
      void router.push(`/snippet/${dateString}/view`);
    }
  };

  const handleSave = () => {
    if (typeof dateString === "string") {
      void router.push(`/snippet/${dateString}/view`);
    }
  };

  const displayDate = date ? formatDate(date, "PPP") : "";

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Head>
          <title>
            {displayDate
              ? strings.snippet.editTitle(displayDate)
              : strings.app.title}
          </title>
          <meta name="description" content={strings.app.description} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex min-h-screen flex-col">
          <Header
            showBackButton
            onBack={handleBack}
            currentUser={user}
            loading={teamLoading}
          />

          <main className="flex-1 bg-gray-50">
            {teamLoading || isChecking ? (
              <Loading message={strings.app.status.loadingTeam} />
            ) : !team ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">{strings.app.noTeams}</div>
              </div>
            ) : !date ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">{strings.snippet.invalidDate}</div>
              </div>
            ) : isFuture ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  {strings.snippet.validation.future}
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="mx-auto max-w-2xl space-y-4">
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h2 className="mb-6 text-lg font-medium text-gray-900">
                      {displayDate}
                    </h2>
                    <SnippetEdit
                      date={date}
                      userEmail={user?.email ?? ""}
                      teamName={team.team_name}
                      onSave={handleSave}
                      onCancel={handleBack}
                    />
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
