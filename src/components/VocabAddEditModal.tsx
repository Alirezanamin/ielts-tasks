// src/components/VocabAddEditModal.tsx
"use client";

import { useState, useEffect } from "react";

export type VocabWord = {
  id?: string;
  word: string;
  meaning: string;
  example: string;
  part_of_speech: string;
  notes: string;
  mastery_level?: number;
  next_review_date?: string;
};

interface Props {
  initial?: VocabWord | null;
  onSave: (data: VocabWord) => void;
  onClose: () => void;
}

export default function VocabAddEditModal({ initial, onSave, onClose }: Props) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [pos, setPos] = useState("verb");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (initial) {
      setWord(initial.word || "");
      setMeaning(initial.meaning || "");
      setExample(initial.example || "");
      setPos(initial.part_of_speech || "verb");
      setNotes(initial.notes || "");
    }
  }, [initial]);

  const handleSave = () => {
    if (!word.trim()) return;
    onSave({
      id: initial?.id,
      word: word.trim(),
      meaning: meaning.trim(),
      example: example.trim(),
      part_of_speech: pos,
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {initial ? "Edit word" : "Add new word"}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm">Word</label>
            <input
              className="border p-2 rounded w-full"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-sm">Meaning</label>
            <textarea
              className="border p-2 rounded w-full"
              rows={2}
              value={meaning}
              onChange={(e) => setMeaning(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Example sentence</label>
            <textarea
              className="border p-2 rounded w-full"
              rows={2}
              value={example}
              onChange={(e) => setExample(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm">Part of speech</label>
            <select
              className="border p-2 rounded w-full"
              value={pos}
              onChange={(e) => setPos(e.target.value)}
            >
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="phrase">Phrase</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="text-sm">Notes (optional)</label>
            <textarea
              className="border p-2 rounded w-full"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
