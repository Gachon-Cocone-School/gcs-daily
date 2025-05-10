import React, { useState } from "react";
import type { FC } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { strings } from "~/constants/strings";
import { cn } from "~/utils/cn";
import {
  canEditSnippet,
  formatDateKR,
  getCalendarDays,
  getCurrentKSTDate,
  isToday,
} from "~/utils/dateTime";

interface CalendarProps {
  onSelectDate: (date: Date) => void;
  selectedDate?: Date;
}

interface DateCellProps {
  date: Date;
  isSelected?: boolean;
  onSelect: (date: Date) => void;
}

const DateCell: FC<DateCellProps> = ({ date, isSelected, onSelect }) => {
  const handleClick = () => {
    onSelect(date);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(date);
    }
  };

  const isCurrentMonth =
    date.getMonth() === new Date().getMonth() &&
    date.getFullYear() === new Date().getFullYear();
  const isEditable = canEditSnippet(date);
  const isTodayDate = isToday(date);

  return (
    <button
      className={cn(
        "group relative flex h-14 w-full flex-col items-center justify-center gap-0.5 border-0 p-2",
        "hover:bg-gray-800/50 focus:ring-2 focus:ring-gray-700 focus:outline-none",
        "transition-colors duration-200 ease-in-out",
        {
          "text-gray-200": isCurrentMonth,
          "text-gray-600": !isCurrentMonth,
          "font-semibold": isTodayDate || isSelected,
        },
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={formatDateKR(date, "PPP")}
      aria-pressed={isSelected}
    >
      <span
        className={cn("text-sm", {
          "rounded-full bg-blue-500 px-2 py-1 text-white": isTodayDate,
        })}
      >
        {date.getDate()}
      </span>
      <span
        className={cn("h-1 w-1 rounded-full", {
          "bg-blue-500": isEditable && !isTodayDate,
          "bg-gray-600": !isEditable && !isTodayDate,
          hidden: isTodayDate,
        })}
      />
    </button>
  );
};

export const Calendar: FC<CalendarProps> = ({ onSelectDate, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(() => getCurrentKSTDate());

  const handlePreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
    );
  };

  const weeks = getCalendarDays(currentMonth);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-gray-200">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold text-gray-900">
            {formatDateKR(currentMonth, "yyyy년 MM월")}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePreviousMonth}
              className={cn(
                "rounded-lg p-2 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none",
              )}
              aria-label={strings.calendar.month.previous}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className={cn(
                "rounded-lg p-2 text-gray-600 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none",
              )}
              aria-label={strings.calendar.month.next}
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t border-gray-800 bg-gray-900 text-center text-xs font-semibold text-gray-400">
        {strings.calendar.dayNames.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 divide-x divide-y divide-gray-800">
        {weeks.map((week, weekIndex) => (
          <React.Fragment key={weekIndex}>
            {week.map((date) => (
              <DateCell
                key={date.toISOString()}
                date={date}
                isSelected={
                  selectedDate?.toDateString() === date.toDateString()
                }
                onSelect={onSelectDate}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
