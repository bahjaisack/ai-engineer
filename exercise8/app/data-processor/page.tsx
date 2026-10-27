import Link from "next/link";
import DataProcessorForm from "./DataProcessorForm";

export default function DataProcessorPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 md:p-10">
      <Link href="/" className="text-sm text-blue-600">
        ← Back to dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Data Processor</h1>

      <p className="mt-3 text-gray-500">
        Fetch sample users, transform them into email records, and simulate
        saving the results.
      </p>

      <DataProcessorForm />
    </main>
  );
}
