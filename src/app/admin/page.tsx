"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

    setTasks(data as Task[]);
  };

  useEffect(() => {
    load();
  }, []);

  const deleteTask = async (id: number) => {
    if (!confirm("Delete this task?")) return;
    await supabase.from("tasks").delete().eq("id", id);
    load();
  };

  const saveEdit = async (updates: any) => {
    if (!editingTask) return;

    await supabase.from("tasks").update(updates).eq("id", editingTask.id);

    setEditingTask(null);
    load();
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Admin — All Tasks</h1>

      <Link
        href="/admin/calendar"
        className="inline-block mb-4 text-blue-600 underline"
      >
        Calendar Management →
      </Link>

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

      {/* EDIT MODAL — placed OUTSIDE map */}
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
