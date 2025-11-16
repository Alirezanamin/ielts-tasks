"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";

type Task = {
  id: number;
  task_date: string;
  is_done: boolean;
  expected_minutes: number | null;
  actual_minutes: number | null;
  category: string | null;
};

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const start = dayjs().startOf("week").format("YYYY-MM-DD");
    const end = dayjs().endOf("week").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .gte("task_date", start)
      .lte("task_date", end);

    if (!error && data) setTasks(data as Task[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const expected = tasks.reduce((sum, t) => sum + (t.expected_minutes || 0), 0);
  const actual = tasks.reduce((sum, t) => sum + (t.actual_minutes || 0), 0);
  const completed = tasks.filter((t) => t.is_done).length;
  const total = tasks.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const timeRate = expected ? Math.round((actual / expected) * 100) : 0;

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Admin — Weekly Overview</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <div className="bg-white shadow p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Time overview</h2>
            <p>Expected time: {expected} minutes</p>
            <p>Actual time: {actual} minutes</p>
            <p>
              Time completion:{" "}
              <span className="font-semibold">{timeRate}%</span>
            </p>
          </div>

          <div className="bg-white shadow p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Tasks overview</h2>
            <p>Total tasks this week: {total}</p>
            <p>Completed tasks: {completed}</p>
            <p>
              Task completion:{" "}
              <span className="font-semibold">{completionRate}%</span>
            </p>
          </div>
        </>
      )}
    </main>
  );
}
