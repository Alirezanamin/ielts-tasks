"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Calendar from "@/components/Calendar";
import EditTaskModal from "@/components/EditTaskModal";

// Define the Task type
type Task = {
  id: number;
  task_date: string;
  title: string;
  description: string | null;
  category: string;
  is_done: boolean;
  feedback: string | null;
};

export default function AdminCalendar() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCountByDate, setTaskCount] = useState<Record<string, number>>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadTasks = async (date: string) => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("task_date", date);

    setTasks((data as Task[]) || []);
  };

  const saveEdit = async (updates: any) => {
    if (!editingTask) return;

    await supabase.from("tasks").update(updates).eq("id", editingTask.id);

    setEditingTask(null);
    loadTasks(selectedDate);
    loadCounts();
  };

  const loadCounts = async () => {
    const { data } = await supabase.from("tasks").select("task_date");
    const counts: Record<string, number> = {};

    data?.forEach((t: any) => {
      counts[t.task_date] = (counts[t.task_date] || 0) + 1;
    });

    setTaskCount(counts);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  useEffect(() => {
    loadTasks(selectedDate);
  }, [selectedDate]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("reading");
  const [description, setDescription] = useState("");

  const addTask = async () => {
    if (!title.trim()) return;
    await supabase.from("tasks").insert([
      {
        task_date: selectedDate,
        title,
        category,
        description,
      },
    ]);

    setTitle("");
    setDescription("");
    loadTasks(selectedDate);
    loadCounts();
  };

  const deleteTask = async (id: number) => {
    await supabase.from("tasks").delete().eq("id", id);
    loadTasks(selectedDate);
    loadCounts();
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      <Calendar
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        taskCountByDate={taskCountByDate}
      />

      <h2 className="text-lg font-semibold mb-3">
        Manage tasks for {selectedDate}
      </h2>

      {/* New task form */}
      <div className="bg-white p-4 shadow rounded mb-4">
        <h3 className="font-semibold mb-2">Add Task</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            type="text"
            placeholder="Task title"
            className="border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>reading</option>
            <option>listening</option>
            <option>speaking</option>
            <option>writing</option>
            <option>vocabulary</option>
            <option>grammar</option>
            <option>other</option>
          </select>

          <textarea
            placeholder="Description"
            className="border p-2 rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <button
          onClick={addTask}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add task
        </button>
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white p-3 shadow rounded flex justify-between"
          >
            <div>
              <p className="font-semibold">{task.title}</p>
              {task.description && (
                <p className="text-sm">{task.description}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setEditingTask(task)}
                className="text-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

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
