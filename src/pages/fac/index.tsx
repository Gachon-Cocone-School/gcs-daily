"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { format } from "date-fns";
import { Header } from "~/components/Header";
import { strings } from "~/constants/strings";
import AuthGuard from "~/components/AuthGuard";
import FacultyGuard from "~/components/FacultyGuard";
import Loading from "~/components/Loading";
import { fetchFacultySnippets } from "~/utils/snippet";
import type { SnippetExpandedByUser } from "~/utils/snippet";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FacultySnippetView } from "~/components/FacultySnippetView";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export default function FacultyPage() {
  // Function to get yesterday's date formatted as yyyy-MM-dd
  const getYesterdayFormatted = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return format(yesterday, "yyyy-MM-dd");
  };

  // States for date range picker - default to yesterday
  const [startDate, setStartDate] = useState<string>(getYesterdayFormatted());
  const [endDate, setEndDate] = useState<string>(getYesterdayFormatted());

  // States for filters and data
  const [selectedTeam, setSelectedTeam] = useState<string>("모든 팀");
  const [selectedUser, setSelectedUser] = useState<string>("모든 작성자");
  const [selectedUserDisplay, setSelectedUserDisplay] =
    useState<string>("모든 작성자");
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<{ email: string; full_name: string }[]>(
    [],
  );
  const [snippets, setSnippets] = useState<SnippetExpandedByUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States for dropdowns
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState<boolean>(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState<boolean>(false);

  // Fetch teams data on component mount
  // Helper function to get the team display name (last item in team_alias array)
  const getTeamDisplayName = (team: Team): string => {
    if (!team.team_alias?.length) return team.team_name;
    return team.team_alias[team.team_alias.length - 1] ?? team.team_name;
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
          .neq("team_name", "교수진") // Exclude "교수진" team
          .order("team_name");

        if (error) {
          throw error;
        }

        if (data) {
          setTeams(data);
        }
      } catch (err) {
        console.error("Error fetching teams:", err);
        setError("팀 정보를 불러오는데 실패했습니다.");
      }
    };

    void fetchTeams();
  }, []);

  // Fetch users based on selected team
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // 특정 팀이 선택된 경우
        if (selectedTeam !== "모든 팀") {
          const { data: teamData } = await supabase
            .from("teams")
            .select("emails")
            .eq("team_name", selectedTeam)
            .single();

          if (teamData?.emails && teamData.emails.length > 0) {
            // 팀에 속한 사용자만 가져오기
            const { data, error } = await supabase
              .from("users")
              .select("email, full_name")
              .in("email", teamData.emails)
              .order("full_name");

            if (error) throw error;

            if (data) {
              setUsers(data);
              setSelectedUser("모든 작성자");
              setSelectedUserDisplay("모든 작성자");
            }
          } else {
            // 팀에 사용자가 없으면 빈 배열 설정
            setUsers([]);
          }
        } else {
          // "모든 팀"이 선택된 경우 - 교수진 제외한 모든 사용자 표시

          // 1. 먼저 교수진 팀의 이메일 목록 가져오기
          const { data: facultyTeam } = await supabase
            .from("teams")
            .select("emails")
            .eq("team_name", "교수진")
            .single();

          // 2. 모든 사용자 가져오기
          const { data: allUsers, error: usersError } = await supabase
            .from("users")
            .select("email, full_name")
            .order("full_name");

          if (usersError) throw usersError;

          if (allUsers) {
            // 3. 교수진 이메일 목록이 있으면 필터링하여 제외
            let filteredUsers = allUsers;

            if (facultyTeam?.emails && facultyTeam.emails.length > 0) {
              // 교수진 이메일에 포함되지 않은 사용자만 필터링
              filteredUsers = allUsers.filter(
                (user) =>
                  !facultyTeam.emails ||
                  !Array.isArray(facultyTeam.emails) ||
                  !facultyTeam.emails.includes(user.email),
              );
            }

            setUsers(filteredUsers);
            setSelectedUser("모든 작성자");
            setSelectedUserDisplay("모든 작성자");
          }
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("사용자 정보를 불러오는데 실패했습니다.");
      }
    };

    void fetchUsers();
  }, [selectedTeam]);

  // Fetch snippets data
  const fetchSnippets = async () => {
    setLoading(true);
    setError(null);

    try {
      const snippetsData = await fetchFacultySnippets(
        startDate,
        endDate,
        selectedTeam,
        selectedUser,
      );
      setSnippets(snippetsData);
    } catch (err) {
      console.error("Error fetching snippets:", err);
      setError("스니펫을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // Handle date filter button click
  const handleApplyDateFilter = () => {
    void fetchSnippets();
  };

  // Initial fetch on component mount
  useEffect(() => {
    void fetchSnippets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Group snippets by user and date using Map to preserve order
  const groupedSnippetsMap = new Map<string, SnippetExpandedByUser[]>();
  snippets.forEach((snippet) => {
    const key = `${snippet.full_name}_${snippet.snippet_date}`;
    if (!groupedSnippetsMap.has(key)) {
      groupedSnippetsMap.set(key, []);
    }
    groupedSnippetsMap.get(key)?.push(snippet);
  });

  // Toggle dropdowns
  const handleTeamDropdownToggle = () => {
    setIsTeamDropdownOpen(!isTeamDropdownOpen);
    if (isUserDropdownOpen) setIsUserDropdownOpen(false);
  };

  const handleUserDropdownToggle = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    if (isTeamDropdownOpen) setIsTeamDropdownOpen(false);
  };

  return (
    <AuthGuard>
      <FacultyGuard>
        <div className="flex min-h-screen flex-col">
          <Head>
            <title>{strings.faculty.title}</title>
            <meta name="description" content={strings.app.description} />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <Header />

          <main className="flex-1 bg-gray-50 p-4 md:p-8">
            <div className="mx-auto max-w-7xl">
              <h1 className="mb-6 text-3xl font-bold text-gray-900">
                {strings.faculty.title}
              </h1>

              {/* Filters Section */}
              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <label
                    htmlFor="start-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {strings.faculty.fromDate}
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="end-date"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {strings.faculty.toDate}
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {strings.faculty.teamFilter}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleTeamDropdownToggle}
                      className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      aria-haspopup="listbox"
                      aria-expanded={isTeamDropdownOpen}
                    >
                      <span>
                        {selectedTeam === "모든 팀"
                          ? "모든 팀"
                          : (() => {
                              const team = teams.find(
                                (t) => t.team_name === selectedTeam,
                              );
                              return team
                                ? getTeamDisplayName(team)
                                : selectedTeam;
                            })()}
                      </span>
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </button>
                    {isTeamDropdownOpen && (
                      <div className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none">
                        <ul className="py-1">
                          <li
                            className="cursor-pointer px-3 py-2 select-none hover:bg-gray-100"
                            onClick={() => {
                              setSelectedTeam("모든 팀");
                              setIsTeamDropdownOpen(false);
                            }}
                          >
                            모든 팀
                          </li>
                          {teams.map((team) => (
                            <li
                              key={team.team_name}
                              className="cursor-pointer px-3 py-2 select-none hover:bg-gray-100"
                              onClick={() => {
                                setSelectedTeam(team.team_name);
                                setIsTeamDropdownOpen(false);
                              }}
                            >
                              {getTeamDisplayName(team)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    {strings.faculty.userFilter}
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={handleUserDropdownToggle}
                      className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white p-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                      aria-haspopup="listbox"
                      aria-expanded={isUserDropdownOpen}
                    >
                      <span>{selectedUserDisplay}</span>
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none">
                        <ul className="py-1">
                          <li
                            className="cursor-pointer px-3 py-2 select-none hover:bg-gray-100"
                            onClick={() => {
                              setSelectedUser("모든 작성자");
                              setSelectedUserDisplay("모든 작성자");
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            모든 작성자
                          </li>
                          {users
                            .slice() // 원본 배열을 변경하지 않기 위해 복사
                            .sort((a, b) =>
                              a.full_name.localeCompare(b.full_name, "ko"),
                            ) // 한국어 정렬
                            .map((user) => (
                              <li
                                key={user.email}
                                className="cursor-pointer px-3 py-2 select-none hover:bg-gray-100"
                                onClick={() => {
                                  setSelectedUser(user.email);
                                  setSelectedUserDisplay(user.full_name);
                                  setIsUserDropdownOpen(false);
                                }}
                              >
                                {user.full_name}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <button
                  onClick={handleApplyDateFilter}
                  className="rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
                >
                  {strings.faculty.applyDateFilter}
                </button>
              </div>

              {/* Snippets Display */}
              {loading ? (
                <Loading message={strings.faculty.loading} />
              ) : error ? (
                <div className="rounded-lg bg-red-100 p-4 text-red-700">
                  {error}
                </div>
              ) : snippets.length === 0 ? (
                <div className="rounded-lg bg-white p-6 text-center text-gray-500 shadow-sm">
                  {strings.faculty.noSnippets}
                </div>
              ) : (
                <div className="space-y-8">
                  {(() => {
                    // 정렬된 배열로 변환
                    return Array.from(groupedSnippetsMap.entries())
                      .sort(([, snippetsA], [, snippetsB]) => {
                        // 1. 팀 이름으로 정렬
                        const teamNameA = snippetsA[0]?.team_name ?? "";
                        const teamNameB = snippetsB[0]?.team_name ?? "";
                        const teamComparison =
                          teamNameA.localeCompare(teamNameB);
                        if (teamComparison !== 0) return teamComparison;

                        // 2. 팀이 같으면 사용자 이름으로 정렬
                        const fullNameA = snippetsA[0]?.full_name ?? "";
                        const fullNameB = snippetsB[0]?.full_name ?? "";
                        const nameComparison =
                          fullNameA.localeCompare(fullNameB);
                        if (nameComparison !== 0) return nameComparison;

                        // 3. 사용자도 같으면 날짜 역순으로 정렬 (최신 날짜가 먼저)
                        const dateA = snippetsA[0]?.snippet_date ?? "";
                        const dateB = snippetsB[0]?.snippet_date ?? "";
                        return dateB.localeCompare(dateA); // 내림차순
                      })
                      .map(([key, userSnippets]) => {
                        // 첫 번째 스니펫이 확실히 존재하는지 확인
                        const snippet = userSnippets[0];
                        if (!snippet) return null;

                        return (
                          <div key={key}>
                            <FacultySnippetView snippet={snippet} />
                          </div>
                        );
                      })
                      .filter(Boolean); // null 값은 필터링
                  })()}
                </div>
              )}
            </div>
          </main>
        </div>
      </FacultyGuard>
    </AuthGuard>
  );
}
