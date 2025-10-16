import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">JSLE Estimator</h1>

      <nav className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/estimate/new/customers"
          className="px-4 py-3 rounded-xl border text-center hover:bg-gray-50"
        >
          ➕ New Estimate
        </Link>
        <Link
          href="/estimate/open"
          className="px-4 py-3 rounded-xl border text-center hover:bg-gray-50"
        >
          📂 Open Saved
        </Link>
      </nav>
    </main>
  );
}
