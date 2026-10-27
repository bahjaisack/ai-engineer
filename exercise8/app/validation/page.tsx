"use client";

import Link from "next/link";
import { useState } from "react";

export default function ValidationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function validateEmail() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();
      setMessage(result.message || "Request completed.");
    } catch {
      setMessage("Something went wrong. Please try again.");
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
        <h1 className="text-3xl font-bold">Email Validation</h1>
        <p className="mt-2 text-gray-500">
          Test email validation and Inngest's non-retryable error handling.
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border p-6">
        <label htmlFor="email" className="block font-medium">
          Email address
        </label>

        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          className="w-full rounded-lg border p-3"
        />

        <button
          onClick={validateEmail}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Sending..." : "Validate Email"}
        </button>

        {message && <p role="status">{message}</p>}
      </div>
    </main>
  );
}
