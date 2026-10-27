"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreateUserPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function createUser() {
    if (!name.trim() || !email.trim()) {
      setMessage("Please enter both name and email.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user.");
      }

      setMessage(
        result.message || "User created and background task triggered!"
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
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
        <h1 className="text-3xl font-bold">Create User</h1>
        <p className="mt-2 text-gray-500">
          Create a user and trigger the background welcome task.
        </p>
      </div>

      <div className="max-w-lg space-y-4 rounded-xl border p-6">
        <div>
          <label htmlFor="name" className="mb-2 block font-medium">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-lg border p-3"
          />
        </div>

        <button
          onClick={createUser}
          disabled={loading}
          className="rounded-lg bg-blue-600 px-5 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create User"}
        </button>

        {message && <p role="status">{message}</p>}
      </div>
    </main>
  );
}
