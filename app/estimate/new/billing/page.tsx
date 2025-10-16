"use client";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";
import StepNav from "@/components/StepNav";

export default function BillingPage() {
  const { billing, setBilling } = useEstimateStore();
  const canContinue = billing.taxRate !== undefined;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Billing</h1>
      <input className="border p-2 rounded w-full" type="number" step="0.01"
        placeholder="Tax rate (e.g. 0.0925)"
        value={billing.taxRate ?? 0}
        onChange={(e) => setBilling({ taxRate: Number(e.target.value) })}
      />
      <textarea className="border p-2 rounded w-full"
        placeholder="Payment terms"
        value={billing.terms || ""}
        onChange={(e) => setBilling({ terms: e.target.value })}
      />
      <StepNav canContinue={canContinue} />
    </div>
  );
}
