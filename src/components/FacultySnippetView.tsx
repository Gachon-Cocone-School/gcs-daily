"use client";

import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { strings } from "~/constants/strings";
import type { SnippetExpandedByUser } from "~/utils/snippet";

interface FacultySnippetViewProps {
  snippet: SnippetExpandedByUser;
}

export const FacultySnippetView = ({ snippet }: FacultySnippetViewProps) => {
  const DEFAULT_DATE = new Date(2025, 1, 1);

  // Get snippet date or use default date if not available
  const snippetDate =
    snippet.snippet_date && !isNaN(new Date(snippet.snippet_date).getTime())
      ? new Date(snippet.snippet_date)
      : DEFAULT_DATE;

  if (!snippet.content) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <div className="text-center text-gray-500">{strings.snippet.empty}</div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow-sm">
      <div className="mb-4 border-b border-gray-200 pb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {snippet.full_name}{" "}
              <span className="font-normal text-gray-500">
                /{" "}
                {Array.isArray(snippet.team_alias)
                  ? snippet.team_alias[snippet.team_alias.length - 1]
                  : snippet.team_alias}
              </span>
            </h2>
            <p className="text-gray-500">
              {format(snippetDate, "yyyy년 MM월 dd일")}
            </p>
          </div>
          {snippet.point > 0 && (
            <div className="mt-2 md:mt-0">
              <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-sm font-medium text-green-800">
                {strings.faculty.point}: {snippet.point}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="markdown max-w-none text-gray-600">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          >
            {snippet.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};
