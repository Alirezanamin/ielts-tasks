// src/components/VocabStats.tsx
"use client";

interface Props {
  total: number;
  newCount: number;
  learningCount: number;
  masteredCount: number;
  dueToday: number;
}

export default function VocabStats({
  total,
  newCount,
  learningCount,
  masteredCount,
  dueToday,
}: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
      <div className="bg-white p-3 rounded shadow-sm">
        <p className="text-xs text-gray-500">Total words</p>
        <p className="text-xl font-semibold">{total}</p>
      </div>
      <div className="bg-white p-3 rounded shadow-sm">
        <p className="text-xs text-gray-500">New</p>
        <p className="text-xl font-semibold">{newCount}</p>
      </div>
      <div className="bg-white p-3 rounded shadow-sm">
        <p className="text-xs text-gray-500">Learning</p>
        <p className="text-xl font-semibold">{learningCount}</p>
      </div>
      <div className="bg-white p-3 rounded shadow-sm">
        <p className="text-xs text-gray-500">Mastered</p>
        <p className="text-xl font-semibold">{masteredCount}</p>
      </div>
      <div className="bg-white p-3 rounded shadow-sm md:col-span-4">
        <p className="text-xs text-gray-500">Due for review today</p>
        <p className="text-xl font-semibold">{dueToday}</p>
      </div>
    </div>
  );
}
