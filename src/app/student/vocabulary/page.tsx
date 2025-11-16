// src/app/vocabulary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import VocabAddEditModal, { VocabWord } from "@/components/VocabAddEditModal";
import { useSearchParams } from "next/navigation";

type DBVocab = VocabWord & {
  id: string;
  mastery_level: number;
  next_review_date: string | null;
  created_at: string;
};

export default function VocabularyPage() {
  const params = useSearchParams();
  const filterDate = params.get("date"); // YYYY-MM-DD

  const [words, setWords] = useState<DBVocab[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DBVocab | null>(null);

  const [filter, setFilter] = useState<"all" | "new" | "learning" | "mastered">(
    "all"
  );

  /****************************************************
   * LOAD VOCABULARY
   ****************************************************/
  const loadWords = async () => {
    setLoading(true);

    let query = supabase
      .from("vocab_words")
      .select("*")
      .order("created_at", { ascending: false });

    if (filterDate) {
      query = query
        .gte("created_at", `${filterDate} 00:00:00`)
        .lte("created_at", `${filterDate} 23:59:59`);
    }

    const { data } = await query;

    setWords((data as DBVocab[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadWords();
  }, [filterDate]);

  /****************************************************
   * FILTER BY MASTERY LEVEL
   ****************************************************/
  const filteredWords = words.filter((w) => {
    if (filter === "all") return true;
    if (filter === "new") return w.mastery_level === 0;
    if (filter === "learning") return w.mastery_level === 1;
    if (filter === "mastered") return w.mastery_level === 2;
    return true;
  });

  /****************************************************
   * ADD / UPDATE WORD
   ****************************************************/
  const handleSave = async (data: VocabWord) => {
    if (data.id) {
      // update
      await supabase
        .from("vocab_words")
        .update({
          word: data.word,
          meaning: data.meaning,
          example: data.example,
          part_of_speech: data.part_of_speech,
          notes: data.notes,
        })
        .eq("id", data.id);
    } else {
      // insert
      await supabase.from("vocab_words").insert([
        {
          word: data.word,
          meaning: data.meaning,
          example: data.example,
          part_of_speech: data.part_of_speech,
          notes: data.notes,
          mastery_level: 0,
        },
      ]);
    }

    setShowModal(false);
    setEditing(null);
    loadWords();
  };

  /****************************************************
   * DELETE
   ****************************************************/
  const deleteWord = async (id: string) => {
    if (!confirm("Delete this word?")) return;
    await supabase.from("vocab_words").delete().eq("id", id);
    loadWords();
  };

  return (
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      {/* HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary</h1>

          {!filterDate && (
            <p className="text-sm text-gray-600">
              Track and review your words.
            </p>
          )}

          {filterDate && (
            <p className="text-sm text-blue-600">
              Showing words added on <strong>{filterDate}</strong>
            </p>
          )}
        </div>

        <Link
          href="/student/review"
          className="text-sm text-blue-600 underline"
        >
          Review today →
        </Link>
      </header>

      {/* FILTERS + NEW WORD BUTTON */}
      <div className="flex justify-between items-center">
        <div className="space-x-2 text-sm">
          {["all", "new", "learning", "mastered"].map((f) => (
            <button
              key={f}
              onClick={() =>
                setFilter(f as "all" | "new" | "learning" | "mastered")
              }
              className={`px-2 py-1 rounded ${
                filter === f ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
        >
          + New word
        </button>
      </div>

      {/* LIST */}
      {loading && <p>Loading...</p>}

      {!loading && filteredWords.length === 0 && (
        <p className="text-gray-500 text-sm">No words found.</p>
      )}

      <ul className="space-y-2">
        {filteredWords.map((w) => (
          <li
            key={w.id}
            className="bg-white p-3 rounded shadow flex justify-between"
          >
            <div>
              <p className="font-semibold">{w.word}</p>

              {w.meaning && (
                <p className="text-sm text-gray-700">{w.meaning}</p>
              )}

              {w.example && (
                <p className="text-xs italic text-gray-600 mt-1">
                  Example: {w.example}
                </p>
              )}

              <p className="text-xs text-gray-500 mt-1">
                Level:{" "}
                {w.mastery_level === 0
                  ? "New"
                  : w.mastery_level === 1
                  ? "Learning"
                  : "Mastered"}
                {w.next_review_date && ` • Next review: ${w.next_review_date}`}
              </p>

              <p className="text-[11px] text-gray-400 mt-1">
                Added: {w.created_at.slice(0, 10)}
              </p>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <button
                onClick={() => {
                  setEditing(w);
                  setShowModal(true);
                }}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => deleteWord(w.id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* MODAL */}
      {showModal && (
        <VocabAddEditModal
          initial={editing}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}
    </main>
  );
}
