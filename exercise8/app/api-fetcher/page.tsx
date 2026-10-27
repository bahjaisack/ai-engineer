"use client";

import Link from "next/link";
import { useState } from "react";

export default function ApiFetcherPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function runFetcher() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/api-fetcher", {
        method: "POST",
      });

      const result = await response.json();
      setMessage(result.message || "Request completed.");
    } catch {
      setMessage("Could not trigger the API Fetcher.");
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
        <h1 className="text-3xl font-bold">API Fetcher</h1>
        <p className="mt-2 text-gray-500">
          Trigger a simulated API request and observe automatic retries.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border p-6">
        <button
          onClick={runFetcher}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Triggering..." : "Run API Fetcher"}
        </button>

        {message && <p role="status">{message}</p>}
      </div>
    </main>
  );
}
