"use client";

import { useRouter } from "next/navigation";

export default function OpenClient() {
  const router = useRouter();

  return (
    <main className="mx-auto w-full max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Saved Estimates</h1>
        <p className="text-sm text-gray-500">Save/Open will be wired next.</p>
      </header>

      <section className="space-y-3">
        <div className="text-sm text-gray-500 border rounded-2xl p-4">
          No saved estimates yet.
        </div>
      </section>

      <div className="pt-4">
        <button
          className="px-4 py-2 rounded-xl border hover:bg-gray-50"
          onClick={() => router.push("/")}
        >
          ← Back
        </button>
      </div>
    </main>
  );
}
