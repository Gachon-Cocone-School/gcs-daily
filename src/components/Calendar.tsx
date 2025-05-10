import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import type { FC } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { strings } from "~/constants/strings";
import { cn } from "~/utils/cn";
import {
  formatDate,
  getCurrentDate,
  isToday,
  isFutureDate,
  getThreeWeeksCalendarDays,
  isInDefaultThreeWeeks,
  canEditSnippetServerTime,
} from "~/utils/dateTime";

interface CalendarProps {
  selectedDate?: Date;
}

interface DateCellProps {
  date: Date;
  isSelected?: boolean;
}

const DateCell: FC<DateCellProps> = ({ date, isSelected }) => {
  const router = useRouter();
  const isTodayDate = isToday(date);
  const isFuture = isFutureDate(date);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const checkEditPermission = async () => {
      const canEdit = await canEditSnippetServerTime(date);
      setIsEditable(canEdit);
    };
    void checkEditPermission();
  }, [date]);

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
      className={cn("flex flex-col items-center justify-center border-t p-3", {
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
      <span
        className={cn("text-sm", {
          "rounded-full bg-gray-900 px-2 py-1 text-white": isTodayDate,
          "text-gray-400": isFuture,
        })}
      >
        {date.getDate()}
      </span>
      <span
        className={cn("h-1 w-1 rounded-full", {
          "bg-gray-900": isEditable && !isTodayDate,
          "bg-gray-300": !isEditable && !isTodayDate,
          hidden: isTodayDate,
        })}
      />
    </div>
  );
};

export const Calendar: FC<CalendarProps> = ({ selectedDate }) => {
  const [baseDate, setBaseDate] = useState(getCurrentDate);
  const isDefaultView = isInDefaultThreeWeeks(baseDate);

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

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-gray-900">
              {weekLabel}
            </span>
            {!isDefaultView && (
              <button
                type="button"
                onClick={handleTodayClick}
                className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                {strings.calendar.action.today}
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePreviousWeek}
              className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100"
              aria-label={strings.calendar.week.previous}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            {!isDefaultView && (
              <button
                type="button"
                onClick={handleNextWeek}
                className="rounded-lg p-2 text-gray-600 hover:bg-gray-50 active:bg-gray-100"
                aria-label={strings.calendar.week.next}
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-gray-200 bg-white text-center text-xs font-semibold text-gray-600">
        {strings.calendar.dayNames.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-200">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date) => (
              <DateCell
                key={date.toISOString()}
                date={date}
                isSelected={
                  selectedDate?.toDateString() === date.toDateString()
                }
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
