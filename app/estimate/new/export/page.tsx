"use client";
import { useRouter } from "next/navigation";
import MobileStepNav from "@/components/MobileStepNav";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";

export default function ExportPage() {
  const router = useRouter();
  const { customer, billing, details, selectedServices } = useEstimateStore();

  const saveDraft = () => {
    // TODO: wire to real persistence (e.g., API route / DB)
    alert("Saved draft (placeholder).");
  };

  const exportPDF = () => {
    // TODO: implement /print route or client-side PDF (e.g., print CSS)
    window.print();
  };

  const emailQuote = () => {
    const mailto = `mailto:${customer.email || ""}?subject=Estimate&body=Attached%20estimate.%0A(placeholder)`;
    location.href = mailto;
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-24 space-y-4">
      <h1 className="text-xl font-semibold">Export</h1>

      <div className="border rounded-xl p-3 text-sm space-y-1">
        <div><b>Customer</b>: {customer.name || "—"}</div>
        <div><b>Services</b>: {selectedServices.join(", ") || "—"}</div>
        <div><b>Payments</b>: {billing.monthly ? "Monthly" : "One-time"}{billing.prepayDiscount ? " + Prepay Discount" : ""}</div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button className="px-4 py-3 rounded-xl border" onClick={saveDraft}>💾 Save</button>
        <button className="px-4 py-3 rounded-xl border" onClick={exportPDF}>🧾 Export to PDF</button>
        <button className="px-4 py-3 rounded-xl border" onClick={emailQuote}>✉️ Email Quote</button>
      </div>

      <MobileStepNav
        backLabel="Back to Payments"
        nextLabel="Done"
        onBack={() => router.push("/estimate/new/payments")}
        onNext={() => router.push("/")}
      />
    </main>
  );
}

