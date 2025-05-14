import type { UserAchievement } from "~/lib/database.types";

export interface ScoreDetail {
  growth: number;
  specificity: number;
  execution: number;
  authenticity: number;
  clarity: number;
}

export interface FeedbackDetail {
  growth: string;
  specificity: string;
  execution: string;
  authenticity: string;
  clarity: string;
}

export interface AchievementMetaData {
  score_detail: ScoreDetail;
  feedback_detail: FeedbackDetail;
}

export interface ExpandedUserAchievement extends UserAchievement {
  meta_data_parsed?: AchievementMetaData;
}
