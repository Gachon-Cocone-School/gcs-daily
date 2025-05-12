import { useRouter } from "next/router";
import Head from "next/head";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { SnippetEdit } from "~/components/SnippetEdit";
import { LoginButton } from "~/components/LoginButton";
import { strings } from "~/constants/strings";
import { useAuth } from "~/providers/AuthProvider";
import { useTeam } from "~/hooks/useTeam";
import { formatDate, isFutureDate } from "~/utils/dateTime";

export default function SnippetEditPage() {
  const router = useRouter();
  const { user, authState } = useAuth();
  const { team } = useTeam(user?.email);

  // Parse the date from the URL
  const { date: dateString } = router.query;
  const date = dateString ? new Date(dateString as string) : null;

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
    <>
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

            <LoginButton />
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
        ) : !team ? (
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
                <SnippetEdit
                  date={date}
                  userEmail={user.email ?? ""}
                  teamName={team.team_name}
                  onSave={handleSave}
                  onCancel={handleBack}
                />
              </div>
            </div>
          </main>
        )}
      </div>
    </>
  );
}
