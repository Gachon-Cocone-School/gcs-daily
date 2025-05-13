import { memo, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "~/providers/AuthProvider";
import Loading from "./Loading";
import { strings } from "~/constants/strings";

type AuthGuardProps = {
  children: React.ReactNode;
};

const AuthGuard = memo(function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const { authState } = useAuth();

  useEffect(() => {
    if (authState === "denied") {
      void router.push("/");
    }
  }, [authState, router]);

  if (authState === "initializing" || authState === "checking") {
    return (
      <Loading
        message={
          authState === "initializing"
            ? strings.app.status.initializing
            : authState === "checking"
              ? strings.app.status.checking
              : undefined
        }
      />
    );
  }

  if (authState === "denied") {
    return null;
  }

  return <>{children}</>;
});

export default AuthGuard;
