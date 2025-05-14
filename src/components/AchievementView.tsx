"use client";

import { useState, useMemo } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import type { UserAchievement } from "~/lib/database.types";
import type { AchievementMetaData } from "~/types/achievement";
import { strings } from "~/constants/strings";

interface Props {
  achievement: UserAchievement;
}

export function AchievementView({ achievement }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const metaData = useMemo<AchievementMetaData | null>(() => {
    try {
      return JSON.parse(achievement.meta_data);
    } catch {
      return null;
    }
  }, [achievement.meta_data]);

  if (!metaData) return null;

  const { score_detail, feedback_detail } = metaData;
  const totalScore = Object.values(score_detail).reduce((a, b) => a + b, 0);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className="mt-3 rounded-lg bg-gray-50 p-4">
      <button
        onClick={toggleExpanded}
        className="flex w-full cursor-pointer items-center justify-between focus:outline-none"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center space-x-2">
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-sm font-medium text-blue-800">
            {strings.snippet.achievements.score.replace(
              "{}",
              String(totalScore),
            )}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          {achievement.feedback && (
            <div className="rounded-lg bg-white p-4">
              <p className="text-left text-sm whitespace-pre-wrap text-gray-600">
                {achievement.feedback}
              </p>
            </div>
          )}
          <div className="space-y-3">
            {Object.entries(score_detail).map(([key, score]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {
                    strings.snippet.achievements.labels[
                      key as keyof typeof strings.snippet.achievements.labels
                    ]
                  }
                </span>
                <div className="flex items-center">
                  <div className="mr-2 h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${(score / 20) * 100}%` }}
                    />
                  </div>
                  <span className="min-w-[2rem] text-right text-sm font-medium text-gray-900">
                    {score}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="mb-3 font-medium text-gray-900">
              {strings.snippet.achievements.feedback}
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              {Object.entries(feedback_detail).map(([key, feedback]) => (
                <div key={key} className="text-left">
                  <span className="font-medium text-gray-700">
                    {`${strings.snippet.achievements.labels[key as keyof typeof strings.snippet.achievements.labels]}: `}
                  </span>
                  <span className="whitespace-pre-wrap">{feedback}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
