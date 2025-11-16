"use client";

import { useState } from "react";

interface Props {
  initial: string | null;
  onSave: (feedback: string) => void;
  onClose: () => void;
}

export default function FeedbackModal({ initial, onSave, onClose }: Props) {
  const [text, setText] = useState(initial || "");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Your Feedback</h2>

        <textarea
          className="w-full border rounded p-2 min-h-[120px]"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1 bg-gray-200 rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded"
            onClick={() => onSave(text)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
