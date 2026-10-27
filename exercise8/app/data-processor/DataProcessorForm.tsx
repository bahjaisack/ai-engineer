"use client";

import { useState } from "react";

export default function DataProcessorForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleProcess() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/data-process", {
        method: "POST",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
      }

      setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Failed to trigger workflow."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-6">
      <button
        onClick={handleProcess}
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Triggering..." : "Run Data Processor"}
      </button>

      {message && (
        <p role="status" className="mt-4 text-sm">
          {message}
        </p>
      )}
    </div>
  );
}