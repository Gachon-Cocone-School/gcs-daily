import Head from "next/head";
import { LoginButton } from "~/components/LoginButton";
import { Calendar } from "~/components/Calendar";
import { useAuth } from "~/providers/AuthProvider";
import { useTeam } from "~/hooks/useTeam";
import { strings } from "~/constants/strings";

export default function Home() {
  const { user, authState } = useAuth();
  const { team } = useTeam(user?.email);

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
            {user && authState === "allowed" && <LoginButton />}
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
