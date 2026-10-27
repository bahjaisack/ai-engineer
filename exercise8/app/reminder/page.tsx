"use client";

import Link from "next/link";
import { useState } from "react";

export default function ReminderPage() {
  const [message, setMessage] = useState("");
  const [delayMinutes, setDelayMinutes] = useState("1");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function scheduleReminder() {
    if (!message.trim()) {
      setStatus("Please enter a reminder message.");
      return;
    }

    const delay = Number(delayMinutes);

    if (!Number.isFinite(delay) || delay < 0) {
      setStatus("Enter a valid delay of zero or more minutes.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          delayMinutes: delay,
        }),
      });

      const result = await response.json();
      setStatus(result.message || "Request completed.");
    } catch {
      setStatus("Could not schedule the reminder.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back to dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Reminder</h1>
        <p className="mt-2 text-gray-500">
          Schedule a background reminder with a delay.
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border p-6">
        <div>
          <label htmlFor="message" className="mb-2 block font-medium">
            Reminder message
          </label>
          <input
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Review my course assignment"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="delay" className="mb-2 block font-medium">
            Delay in minutes
          </label>
          <input
            id="delay"
            type="number"
            min="0"
            step="1"
            value={delayMinutes}
            onChange={(e) => setDelayMinutes(e.target.value)}
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          onClick={scheduleReminder}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Scheduling..." : "Schedule Reminder"}
        </button>

        {status && <p role="status">{status}</p>}
      </div>
    </main>
  );
}
