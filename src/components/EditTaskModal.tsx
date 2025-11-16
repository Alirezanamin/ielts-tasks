"use client";

import { useState, useEffect } from "react";

interface Props {
  task: any;
  onSave: (updates: any) => void;
  onClose: () => void;
}

export default function EditTaskModal({ task, onSave, onClose }: Props) {
  if (!task) return null; // Prevents modal showing before task loads

  const [title, setTitle] = useState(task.title);
  const [category, setCategory] = useState(task.category);
  const [description, setDescription] = useState(task.description || "");
  const [date, setDate] = useState(task.task_date);
  const [expectedMinutes, setExpectedMinutes] = useState(
    task.expected_minutes ?? 30
  );
  const [feedback, setFeedback] = useState(task.feedback || "");
  const [isDone, setIsDone] = useState(task.is_done);

  // Make modal reactive when switching tasks
  useEffect(() => {
    setTitle(task.title);
    setCategory(task.category);
    setDescription(task.description || "");
    setDate(task.task_date);
    setExpectedMinutes(task.expected_minutes ?? 30);
    setFeedback(task.feedback || "");
    setIsDone(task.is_done);
  }, [task]);

  const handleSave = () => {
    onSave({
      title,
      category,
      description,
      task_date: date,
      expected_minutes: expectedMinutes,
      feedback,
      is_done: isDone,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded shadow p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Edit Task</h2>

        <div className="space-y-3">
          {/* Title */}
          <input
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />

          {/* Category */}
          <select
            className="w-full border p-2 rounded"
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

          {/* Description */}
          <textarea
            className="w-full border p-2 rounded"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />

          {/* Date */}
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          {/* Expected Minutes */}
          <div>
            <label className="text-sm">Expected time (minutes)</label>
            <input
              type="number"
              className="w-full border p-2 rounded mt-1"
              value={expectedMinutes}
              onChange={(e) => setExpectedMinutes(Number(e.target.value))}
              min={1}
            />
          </div>

          {/* Feedback */}
          <div>
            <label className="text-sm">Feedback (optional)</label>
            <textarea
              className="w-full border p-2 rounded mt-1"
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Teacher or student feedback"
            />
          </div>

          {/* Done checkbox */}
          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={isDone}
              onChange={(e) => setIsDone(e.target.checked)}
            />
            <span>Mark as Completed</span>
          </label>
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
