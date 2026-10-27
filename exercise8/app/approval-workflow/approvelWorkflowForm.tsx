"use client";

import { useState } from "react";

export default function ApprovalWorkflowForm() {
  const [requestId, setRequestId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendAction(
    action: "start" | "approve",
    approved?: boolean
  ) {
    if (!requestId.trim()) {
      setMessage("Please enter a request ID.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/approval-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, requestId: requestId.trim(), approved }),
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
    <div className="max-w-lg space-y-5 rounded-xl border p-6">
      <div>
        <label htmlFor="requestId" className="mb-2 block font-medium">
          Request ID
        </label>
        <input
          id="requestId"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          placeholder="e.g. REQ-001"
          className="w-full rounded-lg border p-3"
        />
      </div>

      <button
        onClick={() => sendAction("start")}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 p-3 text-white disabled:opacity-50"
      >
        {loading ? "Processing..." : "Start Workflow"}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => sendAction("approve", true)}
          disabled={loading}
          className="rounded-lg bg-green-600 p-3 text-white disabled:opacity-50"
        >
          Approve
        </button>

        <button
          onClick={() => sendAction("approve", false)}
          disabled={loading}
          className="rounded-lg bg-red-600 p-3 text-white disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </div>
  );
}
