// src/app/admin/vocabulary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import dayjs from "dayjs";
import Link from "next/link";
import VocabStats from "@/components/VocabStats";
import { VocabWord } from "@/components/VocabAddEditModal";

type DBVocab = VocabWord & {
  id: string;
  mastery_level: number;
  next_review_date: string | null;
  created_at: string;
};

export default function AdminVocabPage() {
  const [words, setWords] = useState<DBVocab[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWords = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("vocab_words")
      .select("*")
      .order("created_at", { ascending: false });

    setWords((data as DBVocab[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    loadWords();
  }, []);

  const total = words.length;
  const newCount = words.filter((w) => w.mastery_level === 0).length;
  const learningCount = words.filter((w) => w.mastery_level === 1).length;
  const masteredCount = words.filter((w) => w.mastery_level === 2).length;
  const today = dayjs().format("YYYY-MM-DD");
  const dueToday = words.filter(
    (w) => w.next_review_date && w.next_review_date <= today
  ).length;

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Admin — Vocabulary</h1>
          <p className="text-sm text-gray-600">
            Monitor student’s vocabulary progress.
          </p>
        </div>
        <Link
          href="/student/vocabulary"
          className="text-sm text-blue-600 underline"
        >
          Go to student vocab →
        </Link>
      </header>

      <VocabStats
        total={total}
        newCount={newCount}
        learningCount={learningCount}
        masteredCount={masteredCount}
        dueToday={dueToday}
      />

      {loading && <p>Loading...</p>}

      {!loading && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-3 text-lg">Recent words</h2>
          {words.length === 0 && (
            <p className="text-sm text-gray-500">No words yet.</p>
          )}

          <ul className="space-y-2">
            {words.slice(0, 40).map((w) => (
              <li
                key={w.id}
                className="flex justify-between border-b last:border-b-0 pb-2"
              >
                <div>
                  <p className="font-semibold">{w.word}</p>
                  {w.meaning && (
                    <p className="text-xs text-gray-700">{w.meaning}</p>
                  )}
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>
                    Level:{" "}
                    {w.mastery_level === 0
                      ? "New"
                      : w.mastery_level === 1
                      ? "Learning"
                      : "Mastered"}
                  </p>
                  <p>Added: {dayjs(w.created_at).format("YYYY-MM-DD")}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
