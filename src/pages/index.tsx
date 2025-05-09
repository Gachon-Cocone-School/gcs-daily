import Head from "next/head";
import { LoginButton } from "~/components/LoginButton";
import { useAuth } from "~/providers/AuthProvider";
import { strings } from "~/constants/strings";

export default function Home() {
  const { user, isAllowedEmail } = useAuth();

  return (
    <>
      <Head>
        <title>{strings.app.title}</title>
        <meta name="description" content={strings.app.description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto flex max-w-4xl flex-col items-center justify-center gap-12 px-4 py-24">
          <h1 className="text-center text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl">
            {strings.app.title}
          </h1>
          <div className="flex w-full max-w-sm flex-col items-center">
            <LoginButton />
            {user && isAllowedEmail && (
              <div className="mt-8 text-center">
                <p className="text-lg text-gray-900">
                  {strings.auth.welcome.message(user.email)}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  {strings.auth.welcome.authorized}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
