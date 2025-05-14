"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { strings } from "~/constants/strings";
import { AchievementView } from "~/components/AchievementView";
import type { UserAchievement } from "~/lib/database.types";
import type { SnippetExpanded } from "~/types/snippet";

interface Props {
  snippets?: Array<SnippetExpanded & { user_achievement?: UserAchievement }>;
}

export function SnippetView({ snippets = [] }: Props) {
  if (!snippets || snippets.length === 0) {
    return (
      <div className="rounded-lg bg-white p-4 shadow-sm">
        <div className="text-center text-gray-500">{strings.snippet.empty}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {snippets.map(
        (snippet: SnippetExpanded & { user_achievement?: UserAchievement }) => {
          return (
            <div
              key={snippet.user_email + snippet.snippet_date}
              className="rounded-lg bg-white p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-x-3">
                {snippet.avatar_url && (
                  <Image
                    src={snippet.avatar_url}
                    alt={snippet.full_name ?? snippet.user_email}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                )}
                <span className="font-medium text-gray-900">
                  {snippet.full_name ?? snippet.user_email}
                </span>
              </div>
              <div className="overflow-hidden rounded-lg bg-gray-50 px-4 py-3">
                {snippet.content ? (
                  <article className="markdown max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {snippet.content}
                    </ReactMarkdown>
                  </article>
                ) : (
                  <span className="text-gray-500">{strings.snippet.empty}</span>
                )}
              </div>
              {snippet.user_achievement && (
                <AchievementView achievement={snippet.user_achievement} />
              )}
            </div>
          );
        },
      )}
    </div>
  );
}
