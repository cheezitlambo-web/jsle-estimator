"use client";

import { useRouter } from "next/navigation";
import { useEstimate } from "@/app/(app)/estimate/EstimateProvider";

export default function OpenClient() {
  const router = useRouter();
  const { estimates, openEstimate, deleteEstimate } = useEstimate();

  return (
    <main className="mx-auto w-full max-w-2xl p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Saved Estimates</h1>
        <p className="text-sm text-gray-500">Open or delete a previously saved draft.</p>
      </header>

      <section className="space-y-3">
        {(!estimates || estimates.length === 0) && (
          <div className="text-sm text-gray-500 border rounded-2xl p-4">
            No saved estimates yet.
          </div>
        )}

        {estimates?.map((e) => (
          <div
            key={e.id}
            className="border rounded-2xl p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0">
              <div className="font-medium truncate">
                {(e.estimateNumber || "—") +
                  " — " +
                  (e.customerName || "Unnamed") +
                  " — " +
                  (e.address || "No address")}
              </div>
              <div className="text-xs text-gray-500">
                {e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                className="px-3 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => {
                  openEstimate(e.id);
                  router.push("/estimate/new/review");
                }}
                aria-label="Open estimate"
              >
                Open
              </button>
              <button
                className="px-3 py-2 rounded-xl border hover:bg-gray-50"
                onClick={() => deleteEstimate(e.id)}
                aria-label="Delete estimate"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
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
