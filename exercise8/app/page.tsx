import Link from "next/link";

const functions = [
  {
    title: "Create User",
    description: "Create a user and trigger the welcome task.",
    href: "/create-user",
  },
  {
    title: "Data Processor",
    description: "Fetch, transform, and save sample data.",
    href: "/data-processor",
  },
  {
    title: "Email Sender",
    description: "Process multiple email addresses.",
    href: "/email-sender",
  },
  {
    title: "Approval Workflow",
    description: "Start a request and wait for approval.",
    href: "/approval-workflow",
  },
  {
    title: "API Fetcher",
    description: "Test retries when an API fails.",
    href: "/api-fetcher",
  },
  {
    title: "Email Validation",
    description: "Validate email addresses.",
    href: "/validation",
  },
  {
    title: "Reminder",
    description: "Schedule a delayed reminder.",
    href: "/reminder",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl p-6 md:p-10">
      <h1 className="text-3xl font-bold">
        Inngest Workflow Dashboard
      </h1>

      <p className="mt-2 mb-8 text-gray-500">
        Select a workflow to test its background processing.
      </p>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {functions.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border p-5 transition hover:shadow-md"
          >
            <h2 className="text-lg font-semibold">
              {item.title}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {item.description}
            </p>

            <p className="mt-4 text-sm font-medium">
              Open workflow →
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
