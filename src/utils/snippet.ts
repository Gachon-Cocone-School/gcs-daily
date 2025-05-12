import { supabase } from "~/lib/supabase";
import type { Snippet, SnippetInsert } from "~/types/snippet";

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
  userEmail?: string,
): Promise<Array<Snippet>> {
  let query = supabase
    .from("snippets")
    .select()
    .eq("team_name", teamName)
    .eq("snippet_date", date);

  if (userEmail) {
    query = query.order("user_email", { ascending: userEmail === null });
  }

  query = query.order("updated_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  if (userEmail) {
    // Move user's snippet to the beginning
    const sortedData = data.sort((a, b) => {
      if (a.user_email === userEmail) return -1;
      if (b.user_email === userEmail) return 1;
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });
    return sortedData;
  }

  return data || [];
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
