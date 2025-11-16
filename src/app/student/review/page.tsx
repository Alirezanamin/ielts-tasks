// src/app/vocabulary/review/page.tsx
"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import VocabReviewCard from "@/components/VocabReviewCard";
import { VocabWord } from "@/components/VocabAddEditModal";

type DBVocab = VocabWord & {
  id: string;
  mastery_level: number;
  next_review_date: string | null;
};

export default function VocabReviewPage() {
  const [dueWords, setDueWords] = useState<DBVocab[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);

  const loadDueWords = async () => {
    setLoading(true);
    const today = dayjs().format("YYYY-MM-DD");

    const { data } = await supabase
      .from("vocab_words")
      .select("*")
      .lte("next_review_date", today)
      .order("next_review_date", { ascending: true });

    setDueWords((data as DBVocab[]) || []);
    setIndex(0);
    setLoading(false);
  };

  useEffect(() => {
    loadDueWords();
  }, []);

  const handleGrade = async (quality: number) => {
    const current = dueWords[index];
    if (!current) return;

    const today = dayjs();
    let intervalDays = 1;

    if (quality <= 2) intervalDays = 1;
    else if (quality === 3) intervalDays = 3;
    else if (quality === 4) intervalDays = 7;
    else if (quality === 5) intervalDays = 30;

    const nextDate = today.add(intervalDays, "day").format("YYYY-MM-DD");

    let newMastery = current.mastery_level;
    if (quality >= 4 && current.mastery_level < 2) {
      newMastery = current.mastery_level + 1;
    }
    if (quality <= 2 && current.mastery_level > 0) {
      newMastery = current.mastery_level - 1;
    }

    await supabase.from("vocab_reviews").insert([
      {
        vocab_id: current.id,
        quality,
        interval_days: intervalDays,
        updated_mastery: newMastery,
      },
    ]);

    await supabase
      .from("vocab_words")
      .update({
        mastery_level: newMastery,
        next_review_date: nextDate,
      })
      .eq("id", current.id);

    if (index + 1 < dueWords.length) {
      setIndex(index + 1);
    } else {
      loadDueWords();
    }
  };

  const current = dueWords[index];

  return (
    <main className="max-w-xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Review vocabulary</h1>
          <p className="text-sm text-gray-600">
            Review words that are due today using spaced repetition.
          </p>
        </div>
        <Link
          href="/student/vocabulary"
          className="text-sm text-blue-600 underline"
        >
          Back to list
        </Link>
      </header>

      {loading && <p>Loading...</p>}

      {!loading && dueWords.length === 0 && (
        <p className="text-gray-500 text-sm">
          No words due for review today. 🎉
        </p>
      )}

      {!loading && current && (
        <>
          <p className="text-sm text-gray-500 mb-2">
            Word {index + 1} of {dueWords.length}
          </p>

          <VocabReviewCard word={current} onGrade={(q) => handleGrade(q)} />
        </>
      )}
    </main>
  );
}
