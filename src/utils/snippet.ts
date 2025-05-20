import { supabase } from "~/lib/supabase";
import type {
  Snippet,
  SnippetInsert,
  UserAchievement,
  Database,
} from "~/lib/database.types";
import type { SnippetExpanded } from "~/types/snippet";
import { strings } from "~/constants/strings";

export async function ensureDateString(date: Date): Promise<string> {
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
  if (!dateStr) throw new Error("Invalid date");
  return dateStr;
}

export async function fetchSnippetById(
  userEmail: string,
  teamName: string,
  date: string,
): Promise<Snippet | null> {
  const { data, error } = await supabase
    .from("snippets")
    .select()
    .eq("user_email", userEmail)
    .eq("team_name", teamName)
    .eq("snippet_date", date)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

export async function fetchTeamSnippets(
  teamName: string,
  date: string,
  _userEmail?: string, // Prefixed with _ to indicate it's intentionally unused
): Promise<Array<SnippetExpanded & { user_achievement?: UserAchievement }>> {
  // Fetch snippets from expanded view
  const { data: snippets, error: snippetsError } = await supabase
    .from("snippets_expanded")
    .select()
    .eq("team_name", teamName)
    .eq("snippet_date", date);

  if (snippetsError) {
    throw snippetsError;
  }

  // Fetch achievements for this date
  const { data: achievements, error: achievementsError } = await supabase
    .from("user_achievements")
    .select()
    .eq("snippet_date", date);

  if (achievementsError) {
    throw achievementsError;
  }

  // Map achievements to snippets
  const achievementsByEmail = achievements?.reduce<
    Record<string, UserAchievement>
  >((acc, achievement) => {
    acc[achievement.user_email] = achievement;
    return acc;
  }, {});

  return (snippets as SnippetExpanded[]).map((snippet) => ({
    ...snippet,
    user_achievement: achievementsByEmail?.[snippet.user_email],
  }));
}

export async function fetchPreviousSnippet(
  userEmail: string,
  teamName: string,
  date: Date,
): Promise<Snippet | null> {
  const dateStr = await ensureDateString(date);

  const { data, error } = await supabase
    .from("snippets")
    .select()
    .eq("user_email", userEmail)
    .eq("team_name", teamName)
    .lt("snippet_date", dateStr)
    .order("snippet_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return data;
}

export async function createOrUpdateSnippet(
  snippet: SnippetInsert,
): Promise<Snippet> {
  const { user_email, team_name, snippet_date, content } = snippet;

  if (!user_email || !team_name || !snippet_date) {
    throw new Error("Missing required fields");
  }

  const { data, error } = await supabase
    .from("snippets")
    .upsert({
      user_email,
      team_name,
      snippet_date,
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("No data returned from snippet operation");
  }

  return data;
}

export async function deleteSnippet(
  userEmail: string,
  teamName: string,
  date: string,
): Promise<void> {
  const { error } = await supabase
    .from("snippets")
    .delete()
    .eq("user_email", userEmail)
    .eq("team_name", teamName)
    .eq("snippet_date", date);

  if (error) {
    throw error;
  }
}

export type SnippetExpandedByUser =
  Database["public"]["Views"]["snippets_expanded_by_user"]["Row"];

/**
 * Fetches snippets for faculty view from snippets_expanded_by_user view
 * with optional filtering by team and user
 */
export async function fetchFacultySnippets(
  dateFrom: string,
  dateTo: string,
  teamName?: string,
  userEmail?: string,
): Promise<Database["public"]["Views"]["snippets_expanded_by_user"]["Row"][]> {
  let query = supabase
    .from("snippets_expanded_by_user")
    .select()
    .gte("snippet_date", dateFrom)
    .lte("snippet_date", dateTo)
    .neq("team_name", "교수진") // Exclude "교수진" team
    .order("team_name", { ascending: true })
    .order("full_name", { ascending: true })
    .order("snippet_date", { ascending: false });

  if (teamName && teamName !== strings.faculty.allTeams) {
    query = query.eq("team_name", teamName);
  }

  if (userEmail && userEmail !== strings.faculty.allUsers) {
    query = query.eq("user_email", userEmail);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data || [];
}
