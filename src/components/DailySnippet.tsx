import { useCallback, useEffect, useState } from "react";
import { formatDateKR, canEditSnippet } from "../utils/dateTime";
import { strings } from "../constants/strings";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import type { PostgrestSingleResponse } from "@supabase/supabase-js";

type Snippet = Database["public"]["Tables"]["snippets"]["Row"];
type SnippetInsert = Database["public"]["Tables"]["snippets"]["Insert"];

interface DailySnippetProps {
  date: Date;
  userEmail: string;
  teamName: string;
}

async function ensureDateString(date: Date): Promise<string> {
  const dateStr = date.toISOString().split("T")[0];
  if (!dateStr) throw new Error("Invalid date");
  return dateStr;
}

const fetchSnippetById = async (
  userEmail: string,
  teamName: string,
  date: string,
): Promise<Snippet | null> => {
  const { data, error } = await supabase
    .from("snippets")
    .select()
    .eq("user_email", userEmail)
    .eq("team_name", teamName)
    .eq("snippet_date", date)
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching snippet:", error);
    throw error;
  }

  return data;
};

const createOrUpdateSnippet = async (
  snippet: SnippetInsert,
): Promise<Snippet> => {
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
    console.error("Error saving snippet:", error);
    throw error;
  }

  if (!data) {
    throw new Error("No data returned from snippet operation");
  }

  return data;
};

export const DailySnippet = ({
  date,
  userEmail,
  teamName,
}: DailySnippetProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState("");
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditable = canEditSnippet(date);
  const formattedDate =
    formatDateKR(date, "PPP") ?? strings.snippet.placeholder;

  const fetchSnippet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = await ensureDateString(date);
      const snippetData = await fetchSnippetById(userEmail, teamName, dateStr);
      if (snippetData) {
        setSnippet(snippetData);
        setContent(snippetData.content ?? "");
      } else {
        setSnippet(null);
        setContent("");
      }
    } catch (error) {
      console.error("Error fetching snippet:", error);
      setError(strings.snippet.status.error);
    } finally {
      setIsLoading(false);
    }
  }, [date, userEmail, teamName]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(snippet?.content ?? "");
  };

  const handleSave = async () => {
    if (!isEditable) return;

    setIsSaving(true);
    setError(null);
    try {
      const dateStr = await ensureDateString(date);

      const newSnippet: SnippetInsert = {
        user_email: userEmail,
        team_name: teamName,
        snippet_date: dateStr,
        content: content || null,
      };

      const savedSnippet = await createOrUpdateSnippet(newSnippet);
      setSnippet(savedSnippet);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving snippet:", error);
      setError(strings.snippet.status.error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    void fetchSnippet();
  }, [fetchSnippet]);

  if (isLoading) {
    return <div>{strings.snippet.status.loading}</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (isEditing) {
    return (
      <div>
        <h2 className="mb-2 text-lg font-semibold">{formattedDate}</h2>
        <textarea
          className="w-full rounded-lg border p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={strings.snippet.placeholder}
          rows={4}
        />
        <div className="mt-2 space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
          >
            {isSaving
              ? strings.snippet.status.saving
              : strings.snippet.action.save}
          </button>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50"
          >
            {strings.snippet.action.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 text-lg font-semibold">{formattedDate}</h2>
      {snippet?.content ? (
        <div className="whitespace-pre-wrap">{snippet.content}</div>
      ) : (
        <div className="text-gray-500">{strings.snippet.empty}</div>
      )}
      {isEditable && (
        <button
          onClick={handleEdit}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {strings.snippet.action.edit}
        </button>
      )}
    </div>
  );
};
