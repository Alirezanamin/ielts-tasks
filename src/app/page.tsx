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

    data?.forEach((t: any) => {
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
        onSelect={(d) => setSelectedDate(d)}
        taskCountByDate={taskCountByDate}
      />

      <h2 className="text-xl font-semibold mb-3">Tasks for {selectedDate}</h2>

      {tasks.length === 0 && (
        <p className="text-gray-500">No tasks for this day.</p>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 shadow rounded transition ${
              task.is_done ? "bg-green-100 border border-green-300" : "bg-white"
            }`}
          >
            <div className="flex justify-between">
              <div>
                <h3 className="text-lg font-semibold">{task.title}</h3>
                {task.category !== "other" && (
                  <span className="text-sm text-blue-600">{task.category}</span>
                )}
                {task.description && (
                  <p className="text-gray-700 mt-1">{task.description}</p>
                )}
              </div>

              <input
                type="checkbox"
                checked={task.is_done}
                onChange={() => toggleDone(task)}
                className="w-5 h-5"
              />
            </div>

            {/* Feedback button */}
            <button
              onClick={() => setFeedbackTask(task)}
              className="mt-3 text-sm text-blue-600 underline"
            >
              Add / View Feedback
            </button>

            {task.feedback && (
              <p className="mt-2 text-sm bg-blue-50 p-2 rounded">
                <strong>Your Feedback:</strong> {task.feedback}
              </p>
            )}
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
