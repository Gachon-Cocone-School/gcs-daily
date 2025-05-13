import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import type { FC } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useSwipeable } from "react-swipeable";
import { strings } from "~/constants/strings";
import { cn } from "~/utils/cn";
import {
  formatDate,
  getCurrentDate,
  isToday,
  isFutureDate,
  getThreeWeeksCalendarDays,
  isInDefaultThreeWeeks,
} from "~/utils/dateTime";
import { useTeam } from "~/hooks/useTeam";
import { useUsers } from "~/hooks/useUsers";
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/providers/AuthProvider";
import Image from "next/image";
import type { Tables } from "~/lib/database.types";

type Snippet = Tables<"snippets">;

interface CalendarProps {
  selectedDate?: Date;
}

interface DateCellProps {
  date: Date;
  isSelected?: boolean;
  snippets?: Snippet[];
}

const DateCell: FC<DateCellProps> = ({ date, isSelected, snippets = [] }) => {
  const router = useRouter();
  const isTodayDate = isToday(date);
  const isFuture = isFutureDate(date);
  const { users } = useUsers();

  const getDateString = () => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleClick = () => {
    if (!isFuture) {
      void router.push(`/snippet/${getDateString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFuture && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      void router.push(`/snippet/${getDateString()}`);
    }
  };

  return (
    <div
      className={cn(
        "date-cell flex h-full flex-col justify-between p-2 lg:p-3",
        {
          "cursor-pointer hover:bg-gray-50": !isFuture,
          "cursor-default opacity-50": isFuture,
          "bg-gray-50": isSelected,
        },
      )}
      onClick={!isFuture ? handleClick : undefined}
      onKeyDown={!isFuture ? handleKeyDown : undefined}
      tabIndex={!isFuture ? 0 : -1}
      aria-label={formatDate(date, "PPP")}
      aria-disabled={isFuture}
      aria-pressed={isSelected}
    >
      <div className="flex flex-wrap gap-0.5">
        {snippets?.map((snippet) => {
          const user = users[snippet.user_email ?? ""];
          if (!user) return null;

          return (
            <div
              key={snippet.snippet_date + snippet.user_email}
              className="relative h-5 w-5 overflow-hidden rounded-full"
              title={user.full_name}
            >
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.full_name}
                  fill
                  sizes="20px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-600">
                  {user.full_name[0]}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span
        className={cn("block text-center text-sm lg:text-base", {
          "font-medium text-blue-600": isTodayDate,
          "text-gray-400": isFuture,
        })}
      >
        {date.getDate()}
      </span>
    </div>
  );
};

export const Calendar: FC<CalendarProps> = ({ selectedDate }) => {
  const [baseDate, setBaseDate] = useState(getCurrentDate);
  const calendarRef = React.useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState("lg");
  const isDefaultView = isInDefaultThreeWeeks(baseDate);
  const { user } = useAuth();
  const { team } = useTeam(user?.email);
  const [snippets, setSnippets] = useState<Record<string, Snippet[]>>({});

  useEffect(() => {
    const checkCellWidth = () => {
      if (!calendarRef.current) return;
      const gridElement = calendarRef.current.querySelector(".grid-cols-7");
      if (!gridElement) return;

      const cellWidth = gridElement.getBoundingClientRect().width / 7;
      if (cellWidth < 30) setAspectRatio("sm");
      else if (cellWidth < 60) setAspectRatio("md");
      else setAspectRatio("lg");
    };

    const resizeObserver = new ResizeObserver(checkCellWidth);
    if (calendarRef.current) {
      resizeObserver.observe(calendarRef.current);
      checkCellWidth(); // Initial check
    }

    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    async function fetchSnippets() {
      if (!team) return;

      const weeks = getThreeWeeksCalendarDays(baseDate);
      const firstDay = weeks[0]?.[0];
      const lastDay = weeks[weeks.length - 1]?.[6];

      if (!firstDay || !lastDay) return;

      const { data, error } = await supabase
        .from("snippets")
        .select()
        .eq("team_name", team.team_name)
        .gte("snippet_date", formatDate(firstDay, "yyyy-MM-dd"))
        .lte("snippet_date", formatDate(lastDay, "yyyy-MM-dd"))
        .order("snippet_date, updated_at", { ascending: true });

      if (error) {
        console.error("Error fetching snippets:", error);
        return;
      }

      // 날짜별로 스니펫 그룹화
      const groupedSnippets = data.reduce<Record<string, Snippet[]>>(
        (acc, snippet) => {
          const date = snippet.snippet_date;
          acc[date] ??= [];
          acc[date].push(snippet);
          return acc;
        },
        {},
      );

      setSnippets(groupedSnippets);
    }

    void fetchSnippets();
  }, [baseDate, team]);

  const handlePreviousWeek = () => {
    setBaseDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() - 7);
      return newDate;
    });
  };

  const handleNextWeek = () => {
    if (!isDefaultView) {
      setBaseDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + 7);
        return newDate;
      });
    }
  };

  const handleTodayClick = () => {
    const currentDate = getCurrentDate();
    const startOfCurrentWeek = new Date(currentDate);
    startOfCurrentWeek.setDate(currentDate.getDate() - currentDate.getDay());
    setBaseDate(startOfCurrentWeek);
  };

  // Set the base date to show previous, current, and next week
  useEffect(() => {
    handleTodayClick();
  }, []);

  const weeks = getThreeWeeksCalendarDays(baseDate);
  const weekLabel = formatDate(baseDate, "yyyy년 MM월");

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (!isDefaultView) {
        handleNextWeek();
      }
    },
    onSwipedRight: () => {
      handlePreviousWeek();
    },
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50, // Minimum swipe distance required (in px)
    swipeDuration: 500, // Maximum time to swipe (in ms)
  });

  const { ref: swipeRef, ...swipeProps } = swipeHandlers;
  const attachRef = (el: HTMLDivElement | null) => {
    swipeRef(el);
    calendarRef.current = el;
  };

  return (
    <div
      className={cn("mx-auto w-full max-w-screen-sm", {
        "aspect-square": aspectRatio === "lg",
        "aspect-[1/1.3]": aspectRatio === "md",
        "aspect-[1/1.6]": aspectRatio === "sm",
      })}
    >
      <div
        ref={attachRef}
        {...swipeProps}
        className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
        <div className="px-5 py-4">
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100"
              aria-label={strings.calendar.week.previous}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {weekLabel}
              </span>
              <button
                type="button"
                onClick={handleTodayClick}
                className={cn(
                  "rounded-lg px-3 py-1 text-sm font-medium",
                  isDefaultView
                    ? "cursor-not-allowed bg-gray-50 text-gray-400"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200",
                )}
                disabled={isDefaultView}
              >
                {strings.calendar.action.today}
              </button>
            </div>
            <button
              type="button"
              onClick={handleNextWeek}
              className={cn(
                "rounded-lg p-2 text-gray-600",
                isDefaultView
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-gray-50 active:bg-gray-100",
              )}
              disabled={isDefaultView}
              aria-label={strings.calendar.week.next}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-t border-b border-gray-200 bg-white text-center text-xs font-semibold text-gray-600">
          {strings.calendar.dayNames.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-7 divide-x divide-y divide-gray-200">
          {weeks.map((week, weekIndex) => (
            <React.Fragment key={weekIndex}>
              {week.map((date) => {
                const dateStr = formatDate(date, "yyyy-MM-dd");
                return (
                  <DateCell
                    key={dateStr}
                    date={date}
                    isSelected={
                      selectedDate?.toDateString() === date.toDateString()
                    }
                    snippets={snippets[dateStr]}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
