"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import Calendar from "@/components/Calendar";
import FeedbackModal from "@/components/FeedbackModal";

type Task = {
  id: number;
  task_date: string;
  title: string;
  description: string | null;
  category: string;
  is_done: boolean;
  feedback: string | null;
  expected_minutes: number | null;
  actual_minutes: number | null;
};

export default function StudentHome() {
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCountByDate, setTaskCount] = useState<Record<string, number>>({});
  const [feedbackTask, setFeedbackTask] = useState<Task | null>(null);

  const loadTasks = async (date: string) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("task_date", date)
      .order("id", { ascending: true });

    setTasks((data as Task[]) || []);
  };

  const loadTaskCounts = async () => {
    const { data } = await supabase.from("tasks").select("task_date");
    const counts: Record<string, number> = {};
    data?.forEach((t) => {
      counts[t.task_date] = (counts[t.task_date] || 0) + 1;
    });
    setTaskCount(counts);
  };

  useEffect(() => {
    loadTaskCounts();
  }, []);

  useEffect(() => {
    loadTasks(selectedDate);
  }, [selectedDate]);

  const toggleDone = async (task: Task) => {
    await supabase
      .from("tasks")
      .update({ is_done: !task.is_done })
      .eq("id", task.id);

    loadTasks(selectedDate);
  };

  const updateActualMinutes = async (taskId: number, minutes: number) => {
    if (!minutes || minutes <= 0) return;

    await supabase
      .from("tasks")
      .update({ actual_minutes: minutes })
      .eq("id", taskId);

    loadTasks(selectedDate);
  };

  const saveFeedback = async (feedback: string) => {
    if (!feedbackTask) return;

    await supabase.from("tasks").update({ feedback }).eq("id", feedbackTask.id);

    setFeedbackTask(null);
    loadTasks(selectedDate);
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <Calendar
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        taskCountByDate={taskCountByDate}
      />

      <h2 className="text-xl font-semibold mb-3">Tasks for {selectedDate}</h2>

      {tasks.length === 0 && (
        <p className="text-gray-500">No tasks for this day.</p>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 shadow rounded border ${
              task.is_done ? "bg-green-100 border-green-300" : "bg-white"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{task.title}</p>
                {task.description && (
                  <p className="text-sm text-gray-700">{task.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Expected: {task.expected_minutes ?? 30} min
                </p>
                {task.actual_minutes && (
                  <p className="text-xs text-gray-500">
                    Actual: {task.actual_minutes} min
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => toggleDone(task)}
                  className={`px-2 py-1 rounded text-sm ${
                    task.is_done
                      ? "bg-yellow-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {task.is_done ? "Undo" : "Done"}
                </button>

                <button
                  onClick={() => setFeedbackTask(task)}
                  className="px-2 py-1 bg-blue-600 text-white rounded text-sm"
                >
                  Feedback
                </button>
              </div>
            </div>

            <input
              type="number"
              placeholder="Actual minutes"
              className="mt-3 border p-2 w-40 rounded"
              defaultValue={task.actual_minutes ?? ""}
              onBlur={(e) =>
                updateActualMinutes(task.id, Number(e.target.value))
              }
            />
          </div>
        ))}
      </div>

      {feedbackTask && (
        <FeedbackModal
          initial={feedbackTask.feedback}
          onSave={saveFeedback}
          onClose={() => setFeedbackTask(null)}
        />
      )}
    </main>
  );
}
