/**
 * Utility functions for handling dates and times in local timezone
 */
import { supabase } from "../lib/supabase";

/**
 * Gets current date/time in local timezone
 */
export const getCurrentDate = (): Date => {
  return new Date();
};

/**
 * Format date for display in Korean locale
 */
export const formatDate = (date: Date, formatStr: string): string => {
  const localDate = new Date(date);

  if (formatStr === "yyyy년 MM월") {
    return localDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
  }

  if (formatStr === "PPP") {
    return localDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  if (formatStr === "yyyy-MM-dd") {
    return `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, "0")}-${String(localDate.getDate()).padStart(2, "0")}`;
  }

  return localDate.toLocaleDateString("ko-KR");
};

/**
 * Checks if a date is today
 */
export const isToday = (date: Date): boolean => {
  const today = getCurrentDate();
  const targetDate = new Date(date);

  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  );
};

/**
 * Checks if a date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  const today = getCurrentDate();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return targetDate > today;
};

/**
 * Get calendar days for three weeks view (previous, current, next week)
 */
export const getThreeWeeksCalendarDays = (baseDate: Date): Date[][] => {
  const targetDate = new Date(baseDate);

  // Move to the beginning of the previous week (Sunday)
  const startDate = new Date(targetDate);
  startDate.setDate(targetDate.getDate() - targetDate.getDay() - 7);

  // Create arrays for each week (previous, current, next)
  const weeks: Date[][] = [];
  for (let weekIdx = 0; weekIdx < 3; weekIdx++) {
    const week: Date[] = [];
    for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + dayIdx + weekIdx * 7);
      week.push(new Date(currentDate));
    }
    weeks.push(week);
  }

  return weeks;
};

/**
 * Check if a date is in the default three weeks view
 * (previous week, current week, next week)
 */
export const isInDefaultThreeWeeks = (date: Date): boolean => {
  const today = getCurrentDate();
  const targetDate = new Date(date);

  const prevWeekStart = new Date(today);
  prevWeekStart.setDate(today.getDate() - today.getDay() - 7);

  const nextWeekEnd = new Date(today);
  nextWeekEnd.setDate(today.getDate() + (13 - today.getDay())); // 7 days in next week + remaining days in current week

  return targetDate >= prevWeekStart && targetDate <= nextWeekEnd;
};

/**
 * Fetches the current server time
 */
const getServerTime = async (): Promise<Date | null> => {
  try {
    const { data: server_time, error } = await supabase.rpc("get_server_time");
    if (error) {
      console.error("Error fetching server time:", error);
      return null;
    }
    return new Date(server_time);
  } catch (error) {
    console.error("Error fetching server time:", error);
    return null;
  }
};

/**
 * Determines if a snippet for a given date can be edited based on server time
 * Rules:
 * - If server time cannot be fetched, editing is not allowed
 * - Today's snippet can always be edited
 * - Yesterday's snippet can be edited until 9am
 * - Tomorrow's snippet cannot be edited
 */
export const canEditSnippetServerTime = async (
  date: Date,
): Promise<boolean> => {
  const serverTime = await getServerTime();
  if (!serverTime) return false; // 서버 시간을 가져오지 못하면 수정 불가

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const serverDate = new Date(serverTime);
  const currentHour = serverDate.getHours();
  serverDate.setHours(0, 0, 0, 0);

  // 어제 날짜 계산
  const yesterday = new Date(serverDate);
  yesterday.setDate(yesterday.getDate() - 1);

  // 오늘이면 수정 가능
  // 어제인 경우 오전 9시 이전이면 수정 가능
  return (
    serverDate.getTime() === targetDate.getTime() || // 오늘
    (yesterday.getTime() === targetDate.getTime() && currentHour < 9) // 어제 (9시 이전)
  );
};
