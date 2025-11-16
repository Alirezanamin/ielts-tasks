// src/components/VocabReviewCard.tsx
"use client";

import { VocabWord } from "./VocabAddEditModal";

interface Props {
  word: VocabWord & { id: string };
  onGrade: (quality: number) => void;
}

export default function VocabReviewCard({ word, onGrade }: Props) {
  return (
    <div className="border rounded p-4 shadow-sm bg-white">
      <p className="text-lg font-semibold mb-1">{word.word}</p>
      {word.part_of_speech && (
        <p className="text-xs uppercase text-gray-500 mb-2">
          {word.part_of_speech}
        </p>
      )}
      {word.meaning && (
        <p className="text-sm mb-2">
          <span className="font-semibold">Meaning:</span> {word.meaning}
        </p>
      )}
      {word.example && (
        <p className="text-sm italic mb-2">
          <span className="font-semibold not-italic">Example:</span>{" "}
          {word.example}
        </p>
      )}
      {word.notes && (
        <p className="text-xs text-gray-600 mt-1">Notes: {word.notes}</p>
      )}

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onGrade(1)}
          className="px-3 py-1 bg-red-500 text-white rounded text-sm"
        >
          Forgot
        </button>
        <button
          onClick={() => onGrade(3)}
          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm"
        >
          Okay
        </button>
        <button
          onClick={() => onGrade(5)}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm"
        >
          Easy
        </button>
      </div>
    </div>
  );
}
