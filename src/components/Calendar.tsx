"use client";

import { useState } from "react";
import dayjs from "dayjs";

interface CalendarProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  taskCountByDate?: Record<string, number>; // optional badge
}

export default function Calendar({
  selectedDate,
  onSelect,
  taskCountByDate = {},
}: CalendarProps) {
  const [month, setMonth] = useState(dayjs(selectedDate));

  const startOfMonth = month.startOf("month");
  const endOfMonth = month.endOf("month");

  const daysInMonth = month.daysInMonth();
  const startWeekday = startOfMonth.day(); // 0 = Sunday

  const today = dayjs().format("YYYY-MM-DD");

  const nextMonth = () => setMonth(month.add(1, "month"));
  const prevMonth = () => setMonth(month.subtract(1, "month"));

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

      {/* Grid */}
      <div className="grid grid-cols-7 text-center font-medium text-gray-600 mb-2">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 text-center gap-1">
        {/* Empty cells */}
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`empty-${i}`}></div>
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = startOfMonth.add(i, "day").format("YYYY-MM-DD");
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
              {i + 1}
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
