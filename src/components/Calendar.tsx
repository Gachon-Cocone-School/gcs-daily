"use client";

import { useRouter } from "next/navigation";
import React, { useState, useCallback, useEffect } from "react";
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
import { supabase } from "~/lib/supabase";
import { useAuth } from "~/providers/AuthProvider";
import Image from "next/image";
import type { SnippetExpanded } from "~/types/snippet";

interface CalendarProps {
  selectedDate?: Date;
}

interface DateCellProps {
  date: Date;
  isSelected?: boolean;
  snippets?: SnippetExpanded[];
}

const DateCell: FC<DateCellProps> = ({ date, isSelected, snippets = [] }) => {
  const router = useRouter();
  const isTodayDate = isToday(date);
  const isFuture = isFutureDate(date);

  // Get first snippet since all snippets in a day have the same badge value
  const badgeSnippet = snippets[0];
  const badgeValue = badgeSnippet?.badge ?? 0;

  const getDateString = () => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleClick = () => {
    if (!isFuture) {
      router.push(`/snippet/${getDateString()}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isFuture && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      router.push(`/snippet/${getDateString()}`);
    }
  };

  return (
    <div
      className={cn("date-cell flex h-full flex-col p-2 lg:p-3", {
        "cursor-pointer hover:bg-gray-50": !isFuture,
        "cursor-default opacity-50": isFuture,
        "bg-gray-50": isSelected,
      })}
      onClick={!isFuture ? handleClick : undefined}
      onKeyDown={!isFuture ? handleKeyDown : undefined}
      tabIndex={!isFuture ? 0 : -1}
      aria-label={formatDate(date, "PPP")}
      aria-disabled={isFuture}
      aria-pressed={isSelected}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        {badgeValue > 0 && (
          <div className="flex justify-center">
            <div className="relative h-10 w-10 lg:h-12 lg:w-12 xl:h-14 xl:w-14">
              <Image
                src={`/${badgeValue === 3 ? "gold" : badgeValue === 2 ? "silver" : "bronze"}_badge.svg`}
                alt={`${badgeValue === 3 ? "월간" : badgeValue === 2 ? "주간" : "일간"} 뱃지`}
                fill
                priority
                sizes="(max-width: 1024px) 40px, (max-width: 1280px) 48px, 56px"
                className="object-contain"
              />
            </div>
          </div>
        )}
        <div
          className={cn(
            "flex-wrap justify-center gap-0.5",
            badgeValue > 0 ? "hidden lg:flex" : "flex",
          )}
        >
          {snippets?.map((snippet) => (
            <div
              key={snippet.snippet_date + snippet.user_email}
              className="relative h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7"
              title={snippet.full_name}
            >
              <div className="relative h-full w-full overflow-hidden rounded-full">
                {snippet.avatar_url ? (
                  <Image
                    src={snippet.avatar_url}
                    alt={snippet.full_name}
                    fill
                    sizes="(max-width: 1024px) 20px, (max-width: 1280px) 24px, 28px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-600">
                    {snippet.full_name[0]}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
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
  const [snippetsExpanded, setSnippetsExpanded] = useState<
    Record<string, SnippetExpanded[]>
  >({});

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
        .from("snippets_expanded")
        .select()
        .eq("team_name", team.team_name)
        .gte("snippet_date", formatDate(firstDay, "yyyy-MM-dd"))
        .lte("snippet_date", formatDate(lastDay, "yyyy-MM-dd"))
        .order("snippet_date, updated_at", { ascending: true });

      if (error) {
        console.error("Error fetching snippets:", error);
        return;
      }

      // Group snippets by date
      const groupedSnippets = (data as SnippetExpanded[]).reduce<
        Record<string, SnippetExpanded[]>
      >((acc, snippet) => {
        const dateStr = snippet.snippet_date;
        acc[dateStr] ??= [];
        acc[dateStr].push(snippet);
        return acc;
      }, {});

      setSnippetsExpanded(groupedSnippets);
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

  // Disable the unbound-method rule for this specific instance
  // as we're handling the ref callback safely
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { ref: swipeableRef, ...swipeableProps } = useSwipeable({
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

  const combinedRef = useCallback(
    (el: HTMLDivElement | null) => {
      calendarRef.current = el;
      if (typeof swipeableRef === "function") {
        swipeableRef(el);
      }
    },
    [swipeableRef],
  );

  return (
    <div className="flex w-full justify-center">
      <div
        className={cn(
          "relative w-full",
          "sm:w-[640px] lg:w-[700px] xl:w-[760px]",
          {
            "aspect-square": aspectRatio === "lg",
            "aspect-[1/1.5]": aspectRatio === "md",
            "aspect-[1/2.0]": aspectRatio === "sm",
          },
        )}
      >
        <div
          ref={combinedRef}
          {...swipeableProps}
          className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-200"
        >
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
                      snippets={snippetsExpanded[dateStr]}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
