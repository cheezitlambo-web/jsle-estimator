"use client";
import { useRouter } from "next/navigation";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";
import MobileStepNav from "@/components/MobileStepNav";

export default function PaymentsPage() {
  const router = useRouter();
  const { billing, setBilling } = useEstimateStore();

  return (
    <main className="mx-auto max-w-md p-4 pb-24 space-y-3">
      <h1 className="text-xl font-semibold">Payments</h1>
      <label className="flex items-center gap-3 border rounded-xl p-3">
        <input type="checkbox" checked={!!billing.monthly} onChange={(e) => setBilling({ monthly: e.target.checked })} />
        <span className="text-sm">Monthly payment option</span>
      </label>
      <label className="flex items-center gap-3 border rounded-xl p-3">
        <input type="checkbox" checked={!!billing.prepayDiscount} onChange={(e) => setBilling({ prepayDiscount: e.target.checked })} />
        <span className="text-sm">Prepay discount</span>
      </label>

      <MobileStepNav
        onBack={() => router.push("/estimate/new/details")}
        onNext={() => router.push("/estimate/new/export")}
        nextLabel="Continue"
      />
    </main>
  );
}

