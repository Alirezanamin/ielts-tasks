"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import jalaliday from "jalaliday";
import "dayjs/locale/fa";

dayjs.extend(jalaliday);

interface CalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  taskCountByDate?: Record<string, number>;
  usePersianCalendar: boolean; // NEW
}

export default function Calendar({
  selectedDate,
  onSelect,
  taskCountByDate = {},
  usePersianCalendar,
}: CalendarProps) {
  /** Pick calendar mode (Gregorian / Jalali) */
  const makeDate = (d?: string) =>
    usePersianCalendar ? dayjs(d).calendar("jalali").locale("fa") : dayjs(d);

  const today = makeDate().format("YYYY-MM-DD");

  const [month, setMonth] = useState(makeDate(selectedDate));

  /** Re-sync month when toggle switches */
  useEffect(() => {
    setMonth(makeDate(selectedDate));
  }, [selectedDate, usePersianCalendar]);

  const startOfMonth = month.startOf("month");
  const daysInMonth = month.daysInMonth();
  const startWeekday = startOfMonth.day(); // Notice: Jalali uses same weekday numbering

  /** FIXED: Functional updates */
  const nextMonth = () => setMonth((m) => m.add(1, "month"));
  const prevMonth = () => setMonth((m) => m.subtract(1, "month"));

  /** Weekday labels */
  const gregorianLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const persianLabels = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  const labels = usePersianCalendar ? persianLabels : gregorianLabels;

  return (
    <div className="bg-white shadow rounded p-4 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="px-2 py-1 bg-gray-200 rounded">
          ←
        </button>

        <h2 className="text-lg font-semibold">{month.format("MMMM YYYY")}</h2>

        <button onClick={nextMonth} className="px-2 py-1 bg-gray-200 rounded">
          →
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
        {labels.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 text-center gap-1">
        {/* Empty cells */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={i} />
        ))}

        {/* Day buttons */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dateObj = startOfMonth.add(i, "day");
          const date = dateObj.calendar("gregory").format("YYYY-MM-DD");

          const isSelected = date === selectedDate;
          const isToday = date === today;
          const taskCount = taskCountByDate[date] || 0;

          return (
            <button
              key={date}
              onClick={() => onSelect(date)}
              className={`
                p-2 rounded relative
                ${isSelected ? "bg-blue-600 text-white" : "bg-gray-100"}
                ${isToday ? "border border-blue-600" : ""}
                hover:bg-blue-200 transition
              `}
            >
              {dateObj.format("D")}

              {taskCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-1 rounded-full">
                  {taskCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
