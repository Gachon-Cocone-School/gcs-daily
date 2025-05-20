"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "~/providers/AuthProvider";
import Loading from "~/components/Loading";
import { supabase } from "~/lib/supabase";
import { strings } from "~/constants/strings";

type FacultyGuardProps = {
  children: React.ReactNode;
};

export default function FacultyGuard({ children }: FacultyGuardProps) {
  const { user, authState } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isFaculty, setIsFaculty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFacultyAccess = async () => {
      if (!user?.email || authState !== "allowed") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // 교수진 팀의 이메일 목록 가져오기
        const { data: facultyTeam, error: teamError } = await supabase
          .from("teams")
          .select("emails")
          .eq("team_name", "교수진")
          .single();

        if (teamError) throw teamError;

        // 사용자 이메일이 교수진 팀에 포함되어 있는지 확인
        const emailsArray = (facultyTeam?.emails as string[]) || [];
        const hasFacultyAccess = emailsArray.includes(user.email);
        setIsFaculty(Boolean(hasFacultyAccess));
        setIsLoading(false);
      } catch (err) {
        console.error("팀 접근 권한 확인 중 오류 발생:", err);
        setError(strings.faculty.errorCheckingAccess);
        setIsLoading(false);
      }
    };

    void checkFacultyAccess();
  }, [user, authState]);

  if (isLoading) {
    return <Loading message={strings.faculty.loading} />;
  }

  if (!isFaculty) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <div className="mb-4 text-center text-red-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-center text-2xl font-bold text-gray-800">
            접근 권한 없음
          </h2>
          <p className="mb-6 text-center text-gray-600">
            {strings.faculty.accessDeniedMessage} 접근 권한이 필요한 경우
            관리자에게 문의하세요.
          </p>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
          <div className="text-center">
            <Link
              href="/"
              className="inline-block rounded-md bg-gray-900 px-5 py-2 text-center text-sm font-medium text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-600 focus:ring-offset-2 focus:outline-none"
            >
              {strings.faculty.goHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
