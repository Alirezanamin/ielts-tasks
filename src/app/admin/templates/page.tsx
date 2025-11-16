"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Template = {
  id: number;
  name: string;
  description: string | null;
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = async () => {
    const { data, error } = await supabase
      .from("templates")
      .select("*")
      .order("id", { ascending: true });

    if (!error) setTemplates(data as Template[]);
  };

  useEffect(() => {
    load();
  }, []);

  const createTemplate = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("templates").insert([
      {
        name: name.trim(),
        description: description.trim() || null,
      },
    ]);
    if (error) {
      console.error(error);
      alert("Could not create template");
      return;
    }
    setName("");
    setDescription("");
    load();
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm("Delete this template?")) return;
    const { error } = await supabase.from("templates").delete().eq("id", id);
    if (error) {
      console.error(error);
      alert("Could not delete template");
      return;
    }
    load();
  };

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin — Templates</h1>

      {/* Create template */}
      <div className="bg-white shadow p-4 rounded mb-6">
        <h2 className="text-lg font-semibold mb-2">Create new template</h2>
        <div className="space-y-2">
          <input
            className="w-full border p-2 rounded"
            placeholder='e.g. "Week 1 Foundation"'
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <textarea
            className="w-full border p-2 rounded"
            placeholder="Short description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            onClick={createTemplate}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Create template
          </button>
        </div>
      </div>

      {/* List templates */}
      <ul className="space-y-3">
        {templates.map((tpl) => (
          <li
            key={tpl.id}
            className="bg-white shadow p-4 rounded flex justify-between items-start"
          >
            <div>
              <Link
                href={`/admin/templates/${tpl.id}`}
                className="font-semibold text-blue-700 underline"
              >
                {tpl.name}
              </Link>
              {tpl.description && (
                <p className="text-sm text-gray-600 mt-1">{tpl.description}</p>
              )}
            </div>
            <button
              onClick={() => deleteTemplate(tpl.id)}
              className="text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
