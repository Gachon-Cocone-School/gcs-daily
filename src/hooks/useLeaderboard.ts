import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import type { Database } from "~/lib/database.types";

type TeamAchievement = Database["public"]["Tables"]["team_achievements"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type DbTeamAchievement = TeamAchievement & {
  snippet_date: string;
  team_name: string;
  point: number;
};
type DbTeam = Team & { team_name: string; team_alias: string[] | null };

interface RankingTeam {
  rank: number;
  teamName: string;
  teamAlias: string;
  point: number;
}

interface LeaderboardData {
  daily: RankingTeam[];
  weekly: RankingTeam[];
  loading: boolean;
}

// 타입 가드
function isValidTeamAchievement(
  achievement: unknown,
): achievement is DbTeamAchievement {
  if (!achievement || typeof achievement !== "object") return false;
  const a = achievement as Partial<DbTeamAchievement>;
  return (
    typeof a.snippet_date === "string" &&
    typeof a.team_name === "string" &&
    typeof a.point === "number"
  );
}

function isValidTeam(team: unknown): team is DbTeam {
  if (!team || typeof team !== "object") return false;
  const t = team as Partial<DbTeam>;
  return (
    typeof t.team_name === "string" &&
    (t.team_alias === null || Array.isArray(t.team_alias))
  );
}

// 유틸리티 함수들
function getTeamAlias(team: DbTeam | undefined, fallbackName: string): string {
  if (!team?.team_alias?.length) return fallbackName;
  return team.team_alias[team.team_alias.length - 1] ?? fallbackName;
}

function calculateRank(
  currentPoint: number,
  sortedItems: DbTeamAchievement[],
): number {
  return sortedItems.filter((item) => item.point > currentPoint).length + 1;
}

export const useLeaderboard = () => {
  const [data, setData] = useState<LeaderboardData>({
    daily: [],
    weekly: [],
    loading: true,
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get teams data for aliases (is_leaderboard가 true인 팀만)
        const { data: teamsData, error: teamsError } = await supabase
          .from("teams")
          .select("*")
          .eq("is_leaderboard", true);

        if (teamsError) throw teamsError;

        // is_leaderboard가 true인 팀만 사용
        const teams = (teamsData ?? []).filter(isValidTeam);

        // Get the latest team achievement data (latest date)
        const { data: achievementsData, error: achievementsError } =
          await supabase
            .from("team_achievements")
            .select("*")
            .order("snippet_date", { ascending: false })
            .limit(1);

        if (achievementsError) throw achievementsError;

        const latestAchievement = achievementsData?.[0];
        if (!latestAchievement || !isValidTeamAchievement(latestAchievement)) {
          setData({ daily: [], weekly: [], loading: false });
          return;
        }

        const latestDate = latestAchievement.snippet_date;
        const weekAgoDate = new Date(latestDate);
        weekAgoDate.setDate(weekAgoDate.getDate() - 6);

        const teamNames = teams.map((team) => team.team_name);

        // Get daily ranking data
        const { data: dailyData, error: dailyError } = await supabase
          .from("team_achievements")
          .select("*")
          .eq("snippet_date", latestDate)
          .in("team_name", teamNames);

        if (dailyError) throw dailyError;

        // Get weekly ranking data
        const { data: weeklyData, error: weeklyError } = await supabase
          .from("team_achievements")
          .select("*")
          .gte("snippet_date", weekAgoDate.toISOString().split("T")[0])
          .lte("snippet_date", latestDate)
          .in("team_name", teamNames);

        if (weeklyError) throw weeklyError;

        const validDailyData = (dailyData ?? []).filter(isValidTeamAchievement);
        const validWeeklyData = (weeklyData ?? []).filter(
          isValidTeamAchievement,
        );

        const dailyRankings = processDailyRankings(validDailyData, teams);
        const weeklyRankings = processWeeklyRankings(validWeeklyData, teams);

        setData({
          daily: dailyRankings,
          weekly: weeklyRankings,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        setData({ daily: [], weekly: [], loading: false });
      }
    };

    void fetchLeaderboard();
  }, []);

  return data;
};

function processDailyRankings(
  achievements: DbTeamAchievement[],
  teams: DbTeam[],
): RankingTeam[] {
  if (!achievements.length) return [];

  const sorted = [...achievements].sort((a, b) => b.point - a.point);
  const first = sorted[0];
  if (!first) return [];

  let currentRank = 1;
  let currentPoint = first.point;

  return sorted.map((achievement) => {
    if (achievement.point < currentPoint) {
      currentRank = calculateRank(achievement.point, sorted);
      currentPoint = achievement.point;
    }

    const team = teams.find((t) => t.team_name === achievement.team_name);
    const teamAlias = getTeamAlias(team, achievement.team_name);

    return {
      rank: currentRank,
      teamName: achievement.team_name,
      teamAlias,
      point: achievement.point,
    };
  });
}

function processWeeklyRankings(
  achievements: DbTeamAchievement[],
  teams: DbTeam[],
): RankingTeam[] {
  if (!achievements.length) return [];

  // Calculate total points per team
  const teamPoints = achievements.reduce<Record<string, number>>(
    (acc, { team_name, point }) => {
      acc[team_name] = (acc[team_name] ?? 0) + point;
      return acc;
    },
    {},
  );

  // Convert to array and sort by total points
  const sorted = Object.entries(teamPoints)
    .map(([teamName, point]) => ({ teamName, point }))
    .sort((a, b) => b.point - a.point);

  const first = sorted[0];
  if (!first) return [];

  let currentRank = 1;
  let currentPoint = first.point;

  return sorted.map((entry) => {
    if (entry.point < currentPoint) {
      currentRank = sorted.filter((a) => a.point > entry.point).length + 1;
      currentPoint = entry.point;
    }

    const team = teams.find((t) => t.team_name === entry.teamName);
    const teamAlias = getTeamAlias(team, entry.teamName);

    return {
      rank: currentRank,
      teamName: entry.teamName,
      teamAlias,
      point: entry.point,
    };
  });
}
