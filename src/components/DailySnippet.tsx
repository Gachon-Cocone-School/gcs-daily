import { useCallback, useEffect, useState } from "react";
import { formatDate, canEditSnippetServerTime } from "../utils/dateTime";
import { strings } from "../constants/strings";
import { supabase } from "../lib/supabase";
import type { Database } from "../lib/database.types";
import type { PostgrestError } from "@supabase/supabase-js";

type Snippet = Database["public"]["Tables"]["snippets"]["Row"];
type SnippetInsert = Database["public"]["Tables"]["snippets"]["Insert"];

interface DailySnippetProps {
  date: Date;
  userEmail: string;
  teamName: string;
}

async function ensureDateString(date: Date): Promise<string> {
  const localDate = new Date(date);
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, "0");
  const day = String(localDate.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;
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
    // Supabase error 객체 구조에 맞게 에러 메시지 추출
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
  const [isEditable, setIsEditable] = useState(false);
  const formattedDate = formatDate(date, "PPP") ?? strings.snippet.placeholder;

  useEffect(() => {
    const checkEditPermission = async () => {
      const canEdit = await canEditSnippetServerTime(date);
      setIsEditable(canEdit);
    };
    void checkEditPermission();
  }, [date]);

  const handleEdit = () => {
    if (!isEditable) {
      setError(strings.snippet.validation.past);
      return;
    }
    setError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setContent(snippet?.content ?? "");
    setError(null);
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    // 저장 시점에 서버 시간으로 한번 더 체크
    const canEdit = await canEditSnippetServerTime(date);
    if (!canEdit) {
      setError(strings.snippet.validation.past);
      return;
    }

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
    } catch (err: unknown) {
      // PostgrestError type guard
      const isPostgrestError = (e: unknown): e is PostgrestError =>
        typeof e === "object" && e !== null && "code" in e;

      if (isPostgrestError(err)) {
        setError(
          err.message || err.details || err.hint || "Unknown database error",
        );
      } else if (err instanceof Error) {
        setError(err.message || "Unknown error");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsSaving(false);
    }
  };

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
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [date, userEmail, teamName]);

  useEffect(() => {
    void fetchSnippet();
  }, [fetchSnippet]);

  if (isLoading) {
    return <div>{strings.snippet.status.loading}</div>;
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <div className="flex">
          <div className="flex-1">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div>
        <h2 className="mb-2 text-lg font-semibold">{formattedDate}</h2>
        <textarea
          className="w-full rounded-lg border bg-white p-2 focus:ring-2 focus:ring-gray-500 focus:outline-none"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={strings.snippet.placeholder}
          rows={4}
        />
        <div className="mt-2 space-x-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none disabled:opacity-50"
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
          className="mt-2 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:outline-none"
        >
          {strings.snippet.action.edit}
        </button>
      )}
    </div>
  );
};
