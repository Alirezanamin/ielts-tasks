"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import Calendar from "@/components/Calendar";
import EditTaskModal from "@/components/EditTaskModal";

// ------------------ Types --------------------
export type Task = {
  id: number;
  task_date: string;
  title: string;
  description: string | null;
  category: string;
  expected_minutes: number | null;
};

type RepeatHistoryEntry = {
  batch_id: string;
  created_at: string;
  count: number;
};

type InsertTaskRow = {
  task_date: string;
  title: string;
  description: string | null;
  category: string;
  expected_minutes: number | null;
  batch_id: string;
};

type PreviewRow = Task & { targetDate: string };

type UpdateTaskFields = Partial<
  Pick<Task, "title" | "description" | "category" | "expected_minutes">
>;

// ------------------ Weekday List --------------------
const weekdays = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export default function AdminCalendar() {
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskCountByDate, setTaskCount] = useState<Record<string, number>>({});
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // -------- Repeat Feature States --------
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [excludeHolidays, setExcludeHolidays] = useState(true);
  const [everyXDays, setEveryXDays] = useState(0);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [usePersianCalendar] = useState(false);

  // ------------------ Load Tasks --------------------
  const loadTasks = async (date: string) => {
    const { data } = await supabase
      .from<Task>("tasks")
      .select("*")
      .eq("task_date", date);

    setTasks(data ?? []);
  };

  const loadCounts = async () => {
    const { data } = await supabase
      .from<{ task_date: string }>("tasks")
      .select("task_date");

    const counts: Record<string, number> = {};
    (data ?? []).forEach((t) => {
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

  // ------------------ Toggle Weekday --------------------
  const toggleWeekday = (value: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // ------------------ Generate Preview --------------------
  const generatePreview = async () => {
    const { data: sourceTasks } = await supabase
      .from<Task>("tasks")
      .select("*")
      .eq("task_date", selectedDate);

    if (!sourceTasks || sourceTasks.length === 0) {
      alert("No tasks on selected day.");
      return;
    }

    const rows: PreviewRow[] = [];
    const base = dayjs(selectedDate);

    // --------- Repeat Every X days ----------
    if (everyXDays > 0) {
      for (let i = 1; i <= repeatWeeks; i++) {
        const targetDate = base.add(i * everyXDays, "day").format("YYYY-MM-DD");
        if (excludeHolidays && holidays.includes(targetDate)) continue;

        rows.push(
          ...sourceTasks.map((t) => ({ ...t, targetDate } as PreviewRow))
        );
      }
    } else {
      // --------- Repeat on Weekdays ----------
      for (let week = 0; week < repeatWeeks; week++) {
        for (const wd of selectedWeekdays) {
          const date = base.add(week, "week").day(wd).format("YYYY-MM-DD");
          if (excludeHolidays && holidays.includes(date)) continue;

          rows.push(
            ...sourceTasks.map(
              (t) => ({ ...t, targetDate: date } as PreviewRow)
            )
          );
        }
      }
    }

    setPreviewRows(rows);
    setPreviewOpen(true);
  };

  // ------------------ Execute Repeat --------------------
  const repeatTasks = async () => {
    if (previewRows.length === 0) {
      alert("No tasks to repeat.");
      return;
    }

    // avoid duplicates
    const { data: existing } = await supabase
      .from<{ task_date: string; title: string }>("tasks")
      .select("task_date, title");

    const existingSet = new Set(
      (existing ?? []).map((e) => `${e.task_date}---${e.title}`)
    );

    const batchId = crypto.randomUUID();
    const rowsToInsert: InsertTaskRow[] = [];

    previewRows.forEach((row) => {
      const key = `${row.targetDate}---${row.title}`;
      if (!existingSet.has(key)) {
        rowsToInsert.push({
          task_date: row.targetDate,
          title: row.title,
          description: row.description,
          category: row.category,
          expected_minutes: row.expected_minutes,
          batch_id: batchId,
        });
      }
    });

    if (rowsToInsert.length > 0) {
      await supabase.from("tasks").insert(rowsToInsert);
      await supabase
        .from("task_repeat_history")
        .insert([{ batch_id: batchId, count: rowsToInsert.length }]);
    }

    setPreviewOpen(false);
    loadCounts();
    alert("Tasks repeated!");
  };

  // ------------------ Add New Task --------------------
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
        expected_minutes: 30,
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

  const saveEdit = async (updates: UpdateTaskFields) => {
    if (!editingTask) return;

    await supabase.from("tasks").update(updates).eq("id", editingTask.id);

    setEditingTask(null);
    loadTasks(selectedDate);
    loadCounts();
  };

  // ------------------ UI --------------------
  return (
    <main className="max-w-4xl mx-auto p-4">
      <Calendar
        selectedDate={selectedDate}
        onSelect={setSelectedDate}
        taskCountByDate={taskCountByDate}
        usePersianCalendar={usePersianCalendar}
      />

      {/* ---------------- Repeat Section ---------------- */}
      <div className="bg-white p-4 rounded shadow mt-4 mb-6">
        <h3 className="font-semibold mb-2">Repeat Tasks</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="text-sm">Repeat for weeks</label>
            <input
              type="number"
              min={1}
              className="border p-2 rounded w-full"
              value={repeatWeeks}
              onChange={(e) => setRepeatWeeks(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="text-sm">Every X days (optional)</label>
            <input
              type="number"
              min={0}
              className="border p-2 rounded w-full"
              value={everyXDays}
              onChange={(e) => setEveryXDays(Number(e.target.value))}
            />
            <p className="text-xs text-gray-500">
              Leave 0 to use weekdays below.
            </p>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              checked={excludeHolidays}
              onChange={() => setExcludeHolidays(!excludeHolidays)}
            />
            <span>Exclude holidays</span>
          </div>
        </div>

        {/* Weekday selector */}
        {everyXDays === 0 && (
          <div className="flex flex-wrap gap-4 mb-3">
            {weekdays.map((d) => (
              <label key={d.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedWeekdays.includes(d.value)}
                  onChange={() => toggleWeekday(d.value)}
                />
                {d.label}
              </label>
            ))}
          </div>
        )}

        <button
          onClick={generatePreview}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Preview Repeat
        </button>
      </div>

      {/* ---------------- Preview Modal ---------------- */}
      {previewOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded shadow p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Preview Tasks</h2>

            <div className="max-h-80 overflow-y-auto border p-2 rounded">
              {previewRows.map((row, i) => (
                <p key={i} className="text-sm mb-1">
                  {row.targetDate} — {row.title}
                </p>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setPreviewOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={repeatTasks}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Apply Repeat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Task List ---------------- */}
      <h2 className="text-lg font-semibold mb-3">
        Manage tasks for {selectedDate}
      </h2>

      {/* Add task */}
      <div className="bg-white p-4 shadow rounded mb-4">
        <h3 className="font-semibold mb-2">Add Task</h3>

        <div className="grid grid-cols-1 md-grid-cols-3 gap-3 mb-3">
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
