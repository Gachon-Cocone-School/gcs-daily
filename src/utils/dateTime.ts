/**
 * Utility functions for handling dates and times in KST timezone
 */

// KST offset in minutes
const KST_OFFSET = 9 * 60;

/**
 * Gets current date/time in KST
 */
export const getCurrentKSTDate = (): Date => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + KST_OFFSET * 60000);
};

/**
 * Converts a date to KST
 */
export const toKSTDate = (date: Date): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + KST_OFFSET * 60000);
};

/**
 * Format date for display in Korean locale
 */
export const formatDateKR = (date: Date, formatStr: string): string => {
  const kstDate = toKSTDate(date);

  if (formatStr === "yyyy년 MM월") {
    return kstDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
    });
  }

  if (formatStr === "PPP") {
    return kstDate.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  }

  return kstDate.toLocaleDateString("ko-KR");
};

/**
 * Checks if a date is today in KST
 */
export const isToday = (date: Date): boolean => {
  const today = getCurrentKSTDate();
  const targetDate = toKSTDate(date);

  return (
    today.getFullYear() === targetDate.getFullYear() &&
    today.getMonth() === targetDate.getMonth() &&
    today.getDate() === targetDate.getDate()
  );
};

/**
 * Checks if a date is yesterday in KST
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = getCurrentKSTDate();
  yesterday.setDate(yesterday.getDate() - 1);
  const targetDate = toKSTDate(date);

  return (
    yesterday.getFullYear() === targetDate.getFullYear() &&
    yesterday.getMonth() === targetDate.getMonth() &&
    yesterday.getDate() === targetDate.getDate()
  );
};

/**
 * Checks if current time is before 9 AM KST
 */
export const isBeforeKST9AM = (): boolean => {
  const now = getCurrentKSTDate();
  return now.getHours() < 9;
};

/**
 * Determines if a snippet for a given date can be edited
 * Rules:
 * - Today's snippet can always be edited
 * - Yesterday's snippet can be edited before 9 AM KST
 * - Older snippets cannot be edited
 */
export const canEditSnippet = (date: Date): boolean => {
  if (isToday(date)) return true;
  if (isYesterday(date) && isBeforeKST9AM()) return true;
  return false;
};

/**
 * Get calendar days for the month view
 */
export const getCalendarDays = (month: Date): Date[][] => {
  const kstDate = toKSTDate(month);
  const year = kstDate.getFullYear();
  const monthIndex = kstDate.getMonth();

  // Get the first day of the month
  const firstDay = new Date(year, monthIndex, 1);
  // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
  const firstDayOfWeek = firstDay.getDay();

  // Calculate the starting date of the calendar grid
  const start = new Date(year, monthIndex, 1 - firstDayOfWeek);

  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  // Generate 6 weeks of dates
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(start.getTime());
    currentDate.setDate(start.getDate() + i);

    if (i % 7 === 0 && i > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentWeek.push(currentDate);
  }

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return weeks;
};
