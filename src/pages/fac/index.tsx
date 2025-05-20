"use client";

import { useState, useEffect } from "react";
import Head from "next/head";
import { format } from "date-fns";
import { Header } from "~/components/Header";
import { strings } from "~/constants/strings";
import AuthGuard from "~/components/AuthGuard";
import Loading from "~/components/Loading";
import { fetchFacultySnippets } from "~/utils/snippet";
import type { SnippetExpandedByUser } from "~/utils/snippet";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { FacultySnippetView } from "~/components/FacultySnippetView";

type Team = Database["public"]["Tables"]["teams"]["Row"];

export default function FacultyPage() {
  // States for date range picker
  const [startDate, setStartDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [endDate, setEndDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );

  // States for filters and data
  const [selectedTeam, setSelectedTeam] = useState<string>("모든 팀");
  const [selectedUser, setSelectedUser] = useState<string>("모든 작성자");
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
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const { data, error } = await supabase
          .from("teams")
          .select("*")
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
        let query = supabase
          .from("users")
          .select("email, full_name")
          .order("full_name");

        // If a specific team is selected, filter users by that team
        if (selectedTeam !== "모든 팀") {
          const { data: teamData } = await supabase
            .from("teams")
            .select("emails")
            .eq("team_name", selectedTeam)
            .single();

          if (teamData?.emails && teamData.emails.length > 0) {
            query = query.in("email", teamData.emails);
          }
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        if (data) {
          setUsers(data);
          setSelectedUser("모든 작성자"); // Reset user selection when team changes
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

  // Initial fetch on component mount
  useEffect(() => {
    void fetchSnippets();
  }, []);

  // Handle date filter button click
  const handleApplyDateFilter = () => {
    void fetchSnippets();
  };

  // Group snippets by user and date
  const groupedSnippets = snippets.reduce<
    Record<string, SnippetExpandedByUser[]>
  >((acc, snippet) => {
    const key = `${snippet.full_name}_${snippet.snippet_date}`;
    acc[key] ??= [];
    acc[key].push(snippet);
    return acc;
  }, {});

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
      <div className="min-h-screen">
        <Head>
          <title>{strings.faculty.title}</title>
          <meta name="description" content={strings.app.description} />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="flex min-h-screen flex-col">
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
                      <span>{selectedTeam}</span>
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
                              {team.team_name}
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
                      <span>{selectedUser}</span>
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    </button>
                    {isUserDropdownOpen && (
                      <div className="ring-opacity-5 absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black focus:outline-none">
                        <ul className="py-1">
                          <li
                            className="cursor-pointer px-3 py-2 select-none hover:bg-gray-100"
                            onClick={() => {
                              setSelectedUser("모든 작성자");
                              setIsUserDropdownOpen(false);
                            }}
                          >
                            모든 작성자
                          </li>
                          {users.map((user) => (
                            <li
                              key={user.email}
                              className="cursor-pointer px-3 py-2 select-none hover:bg-gray-100"
                              onClick={() => {
                                setSelectedUser(user.email);
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
                  {Object.entries(groupedSnippets).map(
                    ([key, userSnippets]) => {
                      const snippet = userSnippets[0]; // Use first snippet for user info
                      return (
                        <div key={key}>
                          <FacultySnippetView snippet={snippet} />
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
