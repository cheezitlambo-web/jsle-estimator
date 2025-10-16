"use client";

import { useRouter } from "next/navigation";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";

export default function OpenClient() {
  const router = useRouter();
  const { drafts, openEstimate, deleteEstimate } = useEstimateStore();

  return (
    <main className="mx-auto w-full max-w-2xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Saved Estimates</h1>
          <p className="text-sm text-gray-500">Open or delete a draft.</p>
        </div>
        <button className="px-3 py-2 rounded-xl border hover:bg-gray-50" onClick={() => router.push("/")}>
          ← Home
        </button>
      </header>

      <section className="space-y-3">
        {drafts.length === 0 && (
          <div className="text-sm text-gray-500 border rounded-2xl p-4">
            No saved estimates yet.
          </div>
        )}

        {drafts.map((e) => (
          <div key={e.id} className="border rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">
                {(e.estimateNumber || "—") +
                  " — " +
                  (e.name || "Unnamed") +
                  " — " +
                  (e.address || "No address")}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(e.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="px-3 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => {
                  openEstimate(e.id);
                  router.push("/estimate/new/review"); // or "/estimate/new/export"
                }}
              >
                Open
              </button>
              <button
                className="px-3 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => deleteEstimate(e.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
