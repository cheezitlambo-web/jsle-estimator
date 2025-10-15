// app/estimate/open/page.tsx
"use client";
import Section from "@/components/ui/section";
import Button from "@/components/ui/button";
import { useEstimate } from "@/app/(app)/estimate/EstimateProvider";
import StepNav from "@/components/StepNav";

export default function OpenEstimatePage() {
  const { estimates, openEstimate, deleteEstimate } = useEstimate();

  return (
    <main className="mx-auto w-full max-w-md p-4">
      <Section title="Saved Estimates">
        <div className="space-y-2">
          {estimates.length === 0 && <div className="text-sm text-gray-500">No saved estimates yet.</div>}
          {estimates.map((e) => (
            <div key={e.id} className="border rounded-2xl p-3 flex items-center justify-between">
              <div className="text-sm">
                <div className="font-medium">
                  {e.estimateNumber || "—"} — {e.customerName || "Unnamed"} — {e.address || "No address"}
                </div>
                <div className="text-gray-500">
                  {e.createdAt ? new Date(e.createdAt).toLocaleString() : "—"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  tone="outline"
                  onClick={() => {
                    openEstimate(e.id);
                    location.href = "/estimate/new/review";
                  }}
                >
                  Open
                </Button>
                <Button tone="outline" onClick={() => deleteEstimate(e.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
        <StepNav backHref="/" />
      </Section>
    </main>
  );
}
