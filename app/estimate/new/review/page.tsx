"use client";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";

export default function ReviewPage() {
  const { customer, billing, services } = useEstimateStore();
  const subtotal = services.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = (billing.taxRate ?? 0) * subtotal;
  const total = subtotal + tax;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Review</h1>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Customer</h2>
        <pre className="text-sm">{JSON.stringify(customer, null, 2)}</pre>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Billing</h2>
        <pre className="text-sm">{JSON.stringify(billing, null, 2)}</pre>
      </section>

      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">Services</h2>
        <pre className="text-sm">{JSON.stringify(services, null, 2)}</pre>
        <div className="mt-2 text-sm">
          Subtotal: ${subtotal.toFixed(2)} — Tax: ${tax.toFixed(2)} — <b>Total: ${total.toFixed(2)}</b>
        </div>
      </section>
    </div>
  );
}
