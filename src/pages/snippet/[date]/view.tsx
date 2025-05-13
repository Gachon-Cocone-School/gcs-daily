"use client";

import { useRouter } from "next/router";
import Head from "next/head";
import { useState, useEffect, useMemo } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSwipeable } from "react-swipeable";
import { SnippetView } from "~/components/SnippetView";
import { LoginButton } from "~/components/LoginButton";
import { strings } from "~/constants/strings";
import AuthGuard from "~/components/AuthGuard";
import Loading from "~/components/Loading";
import { useAuth } from "~/providers/AuthProvider";
import { useTeam } from "~/providers/TeamProvider";
import { fetchTeamSnippets, deleteSnippet } from "~/utils/snippet";
import {
  formatDate,
  isFutureDate,
  canEditSnippetServerTime,
  isToday,
} from "~/utils/dateTime";
import { cn } from "~/utils/cn";
import type { Snippet } from "~/types/snippet";

export default function SnippetViewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { team, loading: teamLoading } = useTeam();

  // Parse the date from the URL
  const { date: dateString } = router.query;
  const date = useMemo(
    () => (dateString ? new Date(dateString as string) : null),
    [dateString],
  );

  // Snippets state
  const [snippets, setSnippets] = useState<Array<Snippet>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditable, setIsEditable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 편집 가능 여부와 스니펫 로드
  useEffect(() => {
    async function loadData() {
      if (!date || !team || !user?.email) return;

      setIsLoading(true);
      setError(null);

      try {
        // 편집 가능 여부 체크
        const canEdit = await canEditSnippetServerTime(date);
        setIsEditable(canEdit);

        // 스니펫 로드
        const formattedDate = formatDate(date, "yyyy-MM-dd");
        const snippets = await fetchTeamSnippets(
          team.team_name,
          formattedDate,
          user.email,
        );
        setSnippets(snippets);
      } catch (err) {
        console.error("Error fetching snippets:", err);
        setError(strings.snippet.status.error.default);
      } finally {
        setIsLoading(false);
      }
    }

    void loadData();
  }, [date, team, user?.email]);

  const handleBack = () => {
    void router.push("/");
  };

  const handleEdit = () => {
    if (typeof dateString === "string") {
      void router.push(`/snippet/${dateString}/edit`);
    }
  };

  const handlePreviousDay = () => {
    if (date) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() - 1);
      void router.push(`/snippet/${formatDate(newDate, "yyyy-MM-dd")}/view`);
    }
  };

  const handleNextDay = () => {
    if (date && !isToday(date)) {
      const newDate = new Date(date);
      newDate.setDate(date.getDate() + 1);
      void router.push(`/snippet/${formatDate(newDate, "yyyy-MM-dd")}/view`);
    }
  };

  const handleDelete = async () => {
    if (!team || !user?.email || !date) return;

    // 삭제 확인
    if (!window.confirm(strings.snippet.validation.deleteConfirm)) {
      return;
    }

    try {
      const formattedDate = formatDate(date, "yyyy-MM-dd");
      await deleteSnippet(user.email, team.team_name, formattedDate);
      // 삭제 후 목록 다시 로드
      void router.reload();
    } catch (err) {
      console.error("Error deleting snippet:", err);
      setError(strings.snippet.status.error.default);
    }
  };

  const displayDate = date ? formatDate(date, "PPP") : "";
  const userSnippet = snippets.find((s) => s.user_email === user?.email);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (date && !isToday(date)) {
        handleNextDay();
      }
    },
    onSwipedRight: () => {
      if (date) {
        handlePreviousDay();
      }
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50,
    swipeDuration: 500,
  });

  const renderActionButtons = () => {
    if (!isEditable) {
      return null;
    }

    if (!userSnippet) {
      return (
        <button
          onClick={handleEdit}
          className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        >
          {strings.snippet.action.write}
        </button>
      );
    }

    return (
      <div className="flex space-x-2">
        <button
          onClick={handleEdit}
          className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        >
          {strings.snippet.action.edit}
        </button>
        <button
          onClick={handleDelete}
          className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none"
        >
          {strings.snippet.action.delete}
        </button>
      </div>
    );
  };

  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Head>
          <title>
            {displayDate
              ? strings.snippet.title(displayDate)
              : strings.app.title}
          </title>
          <meta name="description" content={strings.app.description} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-10 border-b border-gray-100 bg-white px-4">
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

              <LoginButton />
            </div>
          </header>

          <main className="flex-1 bg-gray-50">
            {teamLoading ? (
              <Loading message={strings.app.status.loadingTeam} />
            ) : !team ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">{strings.app.noTeams}</div>
              </div>
            ) : !date ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">{strings.snippet.invalidDate}</div>
              </div>
            ) : isFutureDate(date) ? (
              <div className="flex flex-1 items-center justify-center">
                <div className="text-center">
                  {strings.snippet.validation.future}
                </div>
              </div>
            ) : (
              <div className="p-8" {...swipeHandlers}>
                <div className="mx-auto max-w-2xl space-y-4">
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          onClick={handlePreviousDay}
                          className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                          aria-label="이전 날짜"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <h2 className="text-lg font-medium text-gray-900">
                          {displayDate}
                        </h2>
                        <button
                          type="button"
                          onClick={handleNextDay}
                          className={cn(
                            "rounded-lg p-2 text-gray-600",
                            isToday(date)
                              ? "cursor-not-allowed opacity-50"
                              : "hover:bg-gray-50 active:bg-gray-100",
                          )}
                          disabled={date ? isToday(date) : false}
                          aria-label="다음 날짜"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {renderActionButtons()}
                    </div>
                    {isLoading ? (
                      <Loading message={strings.snippet.status.loading} />
                    ) : error ? (
                      <div className="text-center text-red-500">{error}</div>
                    ) : (
                      <SnippetView snippets={snippets} />
                    )}
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
