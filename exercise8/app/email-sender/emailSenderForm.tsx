"use client";

import { useState } from "react";

export default function EmailSenderForm() {
  const [emails, setEmails] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const emailList = emails
      .split(/[\n,;]/)
      .map((email) => email.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/email-sender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emails: emailList }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Request failed.");
      }

      setMessage(result.message);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label htmlFor="emails" className="block font-medium">
        Email addresses
      </label>

      <textarea
        id="emails"
        value={emails}
        onChange={(e) => setEmails(e.target.value)}
        placeholder={"alice@example.com\nbob@example.com"}
        rows={5}
        required
        className="w-full rounded-lg border p-3"
      />

      <p className="text-sm text-gray-500">
        Enter one address per line, or separate addresses with commas.
      </p>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Triggering..." : "Run Email Sender"}
      </button>

      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
