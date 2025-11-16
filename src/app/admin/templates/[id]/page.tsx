"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";

type Template = {
  id: number;
  name: string;
  description: string | null;
};

type TemplateTask = {
  id: number;
  template_id: number;
  day_number: number;
  title: string;
  description: string | null;
  category: string | null;
  expected_minutes: number | null;
};

export default function TemplateDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [template, setTemplate] = useState<Template | null>(null);
  const [tasks, setTasks] = useState<TemplateTask[]>([]);
  const [loading, setLoading] = useState(true);

  // new task fields
  const [dayNumber, setDayNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("reading");
  const [description, setDescription] = useState("");
  const [expectedMinutes, setExpectedMinutes] = useState(30);

  // apply form
  const [applyStartDate, setApplyStartDate] = useState(
    dayjs().format("YYYY-MM-DD")
  );
  const [applyWeeks, setApplyWeeks] = useState(4);
  const [applying, setApplying] = useState(false);

  const loadTemplate = async () => {
    setLoading(true);
    const { data: tplData } = await supabase
      .from("templates")
      .select("*")
      .eq("id", id)
      .single();

    const { data: taskData } = await supabase
      .from("template_tasks")
      .select("*")
      .eq("template_id", id)
      .order("day_number", { ascending: true });

    setTemplate(tplData as Template);
    setTasks((taskData as TemplateTask[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!id) return;
    loadTemplate();
  }, [id]);

  const addTemplateTask = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("template_tasks").insert([
      {
        template_id: id,
        day_number: dayNumber,
        title: title.trim(),
        description: description.trim() || null,
        category,
        expected_minutes: expectedMinutes,
      },
    ]);

    if (error) {
      console.error(error);
      alert("Could not add template task");
      return;
    }

    setTitle("");
    setDescription("");
    setExpectedMinutes(30);
    loadTemplate();
  };

  const deleteTemplateTask = async (taskId: number) => {
    const { error } = await supabase
      .from("template_tasks")
      .delete()
      .eq("id", taskId);
    if (error) {
      console.error(error);
      alert("Could not delete template task");
      return;
    }
    loadTemplate();
  };

  const applyTemplate = async () => {
    if (!template) return;
    if (!applyStartDate) return;

    setApplying(true);

    const { data: templateTasks, error } = await supabase
      .from("template_tasks")
      .select("*")
      .eq("template_id", id);

    if (error) {
      console.error(error);
      alert("Could not load template tasks");
      setApplying(false);
      return;
    }

    const rowsToInsert: any[] = [];
    const baseDate = dayjs(applyStartDate);

    for (let week = 0; week < applyWeeks; week++) {
      for (const t of templateTasks || []) {
        const date = baseDate
          .add(week, "week")
          .add((t as any).day_number - 1, "day")
          .format("YYYY-MM-DD");

        rowsToInsert.push({
          task_date: date,
          title: (t as any).title,
          description: (t as any).description,
          category: (t as any).category || "other",
          expected_minutes: (t as any).expected_minutes ?? 30,
        });
      }
    }

    if (rowsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("tasks")
        .insert(rowsToInsert);
      if (insertError) {
        console.error(insertError);
        alert("Could not apply template");
        setApplying(false);
        return;
      }
    }

    setApplying(false);
    alert("Template applied successfully!");
  };

  if (loading || !template) {
    return (
      <main className="max-w-3xl mx-auto p-4">
        <p>Loading template...</p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-6">
      <section className="bg-white shadow p-4 rounded">
        <h1 className="text-2xl font-bold mb-2">{template.name}</h1>
        {template.description && (
          <p className="text-gray-700 mb-2">{template.description}</p>
        )}
      </section>

      {/* Apply template */}
      <section className="bg-white shadow p-4 rounded">
        <h2 className="text-lg font-semibold mb-2">Apply this template</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Start date</label>
            <input
              type="date"
              className="border p-2 rounded w-full"
              value={applyStartDate}
              onChange={(e) => setApplyStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Repeat weeks</label>
            <input
              type="number"
              min={1}
              max={8}
              className="border p-2 rounded w-full"
              value={applyWeeks}
              onChange={(e) => setApplyWeeks(Number(e.target.value))}
            />
          </div>
          <button
            onClick={applyTemplate}
            disabled={applying}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {applying ? "Applying..." : "Apply template"}
          </button>
        </div>
      </section>

      {/* Add template tasks */}
      <section className="bg-white shadow p-4 rounded">
        <h2 className="text-lg font-semibold mb-3">Template tasks</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-sm mb-1">Day number (1–7)</label>
            <input
              type="number"
              min={1}
              max={7}
              className="border p-2 rounded w-full"
              value={dayNumber}
              onChange={(e) => setDayNumber(Number(e.target.value))}
            />
          </div>

          <div className="md:col-span-3">
            <label className="block text-sm mb-1">Title</label>
            <input
              className="border p-2 rounded w-full"
              placeholder="e.g. Read Select Readings Unit 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm mb-1">Category</label>
            <select
              className="border p-2 rounded w-full"
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
          </div>

          <div>
            <label className="block text-sm mb-1">Expected minutes</label>
            <input
              type="number"
              min={5}
              className="border p-2 rounded w-full"
              value={expectedMinutes}
              onChange={(e) => setExpectedMinutes(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              className="border p-2 rounded w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <button
          onClick={addTemplateTask}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add template task
        </button>
      </section>

      {/* List template tasks */}
      <section className="bg-white shadow p-4 rounded">
        <h2 className="text-lg font-semibold mb-3">Existing tasks</h2>
        <div className="space-y-2">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="border rounded p-3 flex justify-between items-start"
            >
              <div>
                <p className="text-sm text-gray-500">
                  Day {t.day_number} • {t.category} • {t.expected_minutes ?? 30}{" "}
                  min
                </p>
                <p className="font-semibold">{t.title}</p>
                {t.description && (
                  <p className="text-sm mt-1">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => deleteTemplateTask(t.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
