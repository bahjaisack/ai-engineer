import Link from "next/link";
import ApprovalWorkflowForm from "./approvelWorkflowForm";

export default function ApprovalWorkflowPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6 md:p-10">
      <Link
        href="/"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Approval Workflow</h1>
        <p className="mt-2 text-gray-500">
          Start a workflow, then approve or reject the matching request.
        </p>
      </div>

      <ApprovalWorkflowForm />
    </main>
  );
}
