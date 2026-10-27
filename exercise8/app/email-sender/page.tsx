import Link from "next/link";
import EmailSenderForm from "./emailSenderForm";

export default function EmailSenderPage() {
  return (
    <main className="mx-auto max-w-2xl p-6 md:p-10">
      <Link href="/" className="text-sm text-blue-600">
        ← Back to dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Email Sender
      </h1>

      <p className="mt-3 text-gray-500">
        Trigger a background workflow that processes multiple
        email addresses with a two-second delay between them.
      </p>

      <EmailSenderForm />
    </main>
  );
}
