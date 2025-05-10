import { useAuth } from "~/providers/AuthProvider";
import { supabase } from "~/lib/supabase";
import { useState } from "react";
import { strings } from "~/constants/strings";

export function LoginButton() {
  const { user, authState, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : strings.auth.signIn.error.default,
      );
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <button
        disabled
        className="inline-flex cursor-not-allowed items-center rounded-full bg-gray-50 px-6 py-3 text-base font-medium text-gray-400 shadow-sm transition-all duration-200"
      >
        <span className="flex items-center space-x-2">
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{strings.auth.signIn.loading}</span>
        </span>
      </button>
    );
  }

  // Show unauthorized error and sign out button
  if (user && authState === "denied") {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">
            {strings.auth.signIn.error.unauthorized}
          </p>
        </div>
        <button
          onClick={signOut}
          className="inline-flex items-center rounded-full bg-red-500 px-6 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
        >
          {strings.auth.signOut}
        </button>
      </div>
    );
  }

  // Show sign out button in header
  if (user && authState === "allowed") {
    return (
      <button
        onClick={signOut}
        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 focus:outline-none"
      >
        {strings.auth.signOut}
      </button>
    );
  }

  // Show sign in button in main content
  return (
    <div className="space-y-4">
      <button
        onClick={handleGoogleLogin}
        className="inline-flex items-center rounded-full bg-black px-8 py-3 text-base font-medium text-white shadow-sm transition-all duration-200 hover:bg-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 focus:outline-none"
      >
        <span className="flex items-center space-x-2">
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
            />
          </svg>
          <span>{strings.auth.signIn.google}</span>
        </span>
      </button>
      {error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
