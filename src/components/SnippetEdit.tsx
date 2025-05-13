import { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { canEditSnippetServerTime } from "~/utils/dateTime";
import {
  fetchSnippetById,
  ensureDateString,
  createOrUpdateSnippet,
  fetchPreviousSnippet,
} from "~/utils/snippet";
import { strings } from "~/constants/strings";
import type { Snippet, SnippetEditProps } from "~/types/snippet";
import type { PostgrestError } from "@supabase/supabase-js";

export const SnippetEdit = ({
  date,
  userEmail,
  teamName,
  onSave,
  onCancel,
}: SnippetEditProps) => {
  const [content, setContent] = useState("");
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [previousContent, setPreviousContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const fetchSnippet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = await ensureDateString(date);
      const snippetData = await fetchSnippetById(userEmail, teamName, dateStr);
      if (snippetData) {
        setSnippet(snippetData);
        setContent(snippetData.content ?? "");
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [date, userEmail, teamName]);

  const fetchPreviousSnippetContent = useCallback(async () => {
    try {
      const previousSnippet = await fetchPreviousSnippet(
        userEmail,
        teamName,
        date,
      );
      // 명시적으로 이전 스니펫이 없는 경우 처리
      if (!previousSnippet) {
        setPreviousContent(null);
        return;
      }
      // 이전 스니펫은 있지만 내용이 없는 경우도 명시적으로 처리
      setPreviousContent(previousSnippet.content ?? null);
    } catch (err) {
      console.error("Error fetching previous snippet:", err);
      setPreviousContent(null);
    }
  }, [date, userEmail, teamName]);

  useEffect(() => {
    void fetchSnippet();
    void fetchPreviousSnippetContent();
  }, [fetchSnippet, fetchPreviousSnippetContent]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab" && !e.shiftKey && previousContent && !content) {
      e.preventDefault();
      setContent(previousContent);
    }
  };

  const handleCancel = () => {
    setContent(snippet?.content ?? "");
    setError(null);
    if (onCancel) {
      onCancel();
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;

    const canEdit = await canEditSnippetServerTime(date);
    if (!canEdit) {
      setError(strings.snippet.validation.past);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const dateStr = await ensureDateString(date);
      const newSnippet = {
        user_email: userEmail,
        team_name: teamName,
        snippet_date: dateStr,
        content: content || null,
      };

      const savedSnippet = await createOrUpdateSnippet(newSnippet);
      setSnippet(savedSnippet);

      if (onSave) {
        onSave();
      }
    } catch (err) {
      const isPostgrestError = (e: unknown): e is PostgrestError =>
        typeof e === "object" && e !== null && "code" in e;

      if (isPostgrestError(err)) {
        console.error("Error saving snippet:", err);
        setError(strings.snippet.status.error.default);
      } else {
        throw err;
      }
    } finally {
      setIsSaving(false);
    }
  };

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

  return (
    <div className="flex h-[calc(100vh-14rem)] flex-col space-y-4">
      <div className="flex space-x-1 border-b">
        <button
          onClick={() => setIsPreview(false)}
          className={`px-4 py-2 font-medium ${
            !isPreview
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500"
          }`}
        >
          Write
        </button>
        <button
          onClick={() => setIsPreview(true)}
          className={`px-4 py-2 font-medium ${
            isPreview
              ? "border-b-2 border-gray-900 text-gray-900"
              : "text-gray-500"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="flex-1">
        {isPreview ? (
          <div className="markdown prose h-full max-w-none overflow-auto rounded-lg bg-gray-50 p-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {content || strings.snippet.empty}
            </ReactMarkdown>
          </div>
        ) : (
          <textarea
            className="h-full w-full resize-none rounded-lg border bg-white p-2 focus:ring-2 focus:ring-gray-500 focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              previousContent
                ? `${strings.snippet.placeholder}${previousContent}`
                : strings.snippet.placeholderDefault
            }
            rows={20}
          />
        )}
      </div>

      <div className="space-x-2">
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
};
