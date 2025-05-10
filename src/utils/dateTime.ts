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
 * Checks if a date is in the future (after today)
 */
export const isFutureDate = (date: Date): boolean => {
  const today = getCurrentDate();
  const targetDate = new Date(date);

  return targetDate > today;
};

/**
 * Get calendar days for the month view, limited to 2 weeks before and 1 week after current date
 */
export const getCalendarDays = (month: Date): Date[][] => {
  const today = getCurrentDate();
  const targetDate = new Date(month);
  const year = targetDate.getFullYear();
  const monthIndex = targetDate.getMonth();

  // Get the first day of the month
  const firstDay = new Date(year, monthIndex, 1);
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Calculate the starting date of the calendar grid
  const start = new Date(year, monthIndex, 1 - firstDayOfWeek);

  // Calculate valid date range
  const twoWeeksAgo = new Date(today);
  twoWeeksAgo.setDate(today.getDate() - 14); // 2 weeks before today
  const oneWeekAhead = new Date(today);
  oneWeekAhead.setDate(today.getDate() + 7); // 1 week after today

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Generate 6 weeks of dates
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(start.getTime());
    currentDate.setDate(start.getDate() + i);

    if (i % 7 === 0 && i > 0) {
      // Only add the week if it contains at least one day within our valid range
      if (
        currentWeek.some((date) => date >= twoWeeksAgo && date <= oneWeekAhead)
      ) {
        weeks.push(currentWeek);
      }
      currentWeek = [];
    }

    currentWeek.push(new Date(currentDate));
  }

  if (
    currentWeek.length > 0 &&
    currentWeek.some((date) => date >= twoWeeksAgo && date <= oneWeekAhead)
  ) {
    weeks.push(currentWeek);
  }

  return weeks;
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
 * - All other snippets cannot be edited
 */
export const canEditSnippetServerTime = async (
  date: Date,
): Promise<boolean> => {
  const serverTime = await getServerTime();
  if (!serverTime) return false; // 서버 시간을 가져오지 못하면 수정 불가

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  const serverDate = new Date(serverTime);
  serverDate.setHours(0, 0, 0, 0);

  // 내일 날짜 계산
  const tomorrow = new Date(serverDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 오늘이거나 내일인 경우 수정 가능
  return (
    serverDate.getTime() === targetDate.getTime() ||
    tomorrow.getTime() === targetDate.getTime()
  );
};
