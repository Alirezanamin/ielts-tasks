"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import EditTaskModal from "@/components/EditTaskModal";

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

export default function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("task_date", { ascending: true });

    setTasks((data as Task[]) || []);
  };

  useEffect(() => {
    load();
  }, []);

  /**********************************************
   * DELETE TASK
   **********************************************/
  const deleteTask = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    load();
  };

  /**********************************************
   * SAVE EDIT
   **********************************************/
  const saveEdit = async (updates: any) => {
    if (!editingTask) return;

    await supabase.from("tasks").update(updates).eq("id", editingTask.id);

    setEditingTask(null);
    load();
  };

  /**********************************************
   * COUNT VOCAB WORDS BY DATE
   **********************************************/
  const [vocabCounts, setVocabCounts] = useState<Record<string, number>>({});

  const loadVocabCounts = async () => {
    const { data } = await supabase.from("vocab_words").select("created_at");

    const counts: Record<string, number> = {};

    data?.forEach((w) => {
      const d = w.created_at.slice(0, 10);
      counts[d] = (counts[d] || 0) + 1;
    });

    setVocabCounts(counts);
  };

  useEffect(() => {
    loadVocabCounts();
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-xl font-bold">Admin — All Tasks</h1>

      <Link
        href="/admin/calendar"
        className="inline-block text-blue-600 underline"
      >
        Calendar Management →
      </Link>

      {/* VOCAB QUICK VIEW */}
      <section className="bg-white shadow p-4 rounded">
        <h2 className="font-semibold mb-2">Vocabulary Progress</h2>

        <ul className="text-sm space-y-1">
          {Object.keys(vocabCounts).length === 0 && (
            <p className="text-gray-500 text-sm">No vocabulary added yet.</p>
          )}

          {Object.entries(vocabCounts).map(([date, count]) => (
            <li key={date}>
              <Link
                href={`/vocabulary?date=${date}`}
                className="text-blue-600 underline"
              >
                {date}: {count} word{count > 1 ? "s" : ""}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* TASKS LIST */}
      <ul className="space-y-3">
        {tasks.map((t) => (
          <li
            key={t.id}
            className="bg-white p-4 shadow rounded flex justify-between items-start"
          >
            <div>
              <p className="font-semibold">{t.title}</p>
              <p className="text-sm text-gray-500">
                {t.task_date} — {t.category}
              </p>

              {t.expected_minutes !== null && (
                <p className="text-xs text-gray-500">
                  Expected: {t.expected_minutes} min
                </p>
              )}
              {t.actual_minutes !== null && (
                <p className="text-xs text-gray-500">
                  Actual: {t.actual_minutes} min
                </p>
              )}

              {t.description && <p className="text-sm mt-1">{t.description}</p>}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingTask(t)}
                className="text-blue-600"
              >
                Edit
              </button>

              <button onClick={() => deleteTask(t.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* MODAL */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={saveEdit}
          onClose={() => setEditingTask(null)}
        />
      )}
    </main>
  );
}
