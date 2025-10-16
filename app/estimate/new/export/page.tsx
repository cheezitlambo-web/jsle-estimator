"use client";
import { useRouter } from "next/navigation";
import MobileStepNav from "@/components/MobileStepNav";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";
import { buildLineItems, computeTotals, CURRENCY } from "@/app/(app)/estimate/servicesCatalog";

export default function ExportPage() {
  const router = useRouter();
  const { customer, billing, details, selectedServices, settings, saveEstimate } = useEstimateStore();

  const items = buildLineItems(details, settings);
  const totals = computeTotals(items, settings, {
    monthly: billing.monthly,
    prepayDiscount: !!billing.prepayDiscount,
  });
  const fmt = CURRENCY(settings.currency);

  const downloadCSV = () => {
    const rows = [
      ["Company", settings.companyName || ""],
      ["Customer Name", customer.name || ""],
      ["Customer Address", customer.address || ""],
      ["Customer Email", customer.email || ""],
      ["Customer Phone", customer.phone || ""],
      [],
      ["Item", "Qty", "Unit Price", "Taxable", "Line Total"],
      ...items.map((i) => [
        i.label,
        String(i.qty),
        String(i.unitPrice),
        i.taxable ? "Y" : "N",
        String((i.qty * i.unitPrice).toFixed(2)),
      ]),
      [],
      ["Subtotal", "", "", "", String(totals.subtotal.toFixed(2))],
      ["Tax", "", "", "", String(totals.tax.toFixed(2))],
      ["Prepay Discount", "", "", "", String(totals.prepayAmount.toFixed(2))],
      ["Total", "", "", "", String(totals.total.toFixed(2))],
    ];

    const csv = rows.map(r => r.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `estimate-${(customer.name || "customer").replace(/\s+/g, "-").toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printPDF = () => window.print();

  const saveDraft = () => {
    const d = saveEstimate();
    alert(`Saved draft for ${customer.name || "customer"}.\nOpen via “Open Saved” on the home screen.`);
    // optional: router.push("/estimate/open");
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-24 space-y-4">
      <header className="space-y-1 print:hidden">
        <h1 className="text-xl font-semibold">Export</h1>
        <p className="text-sm text-gray-500">
          {settings.companyName || "Company"} — {settings.contactEmail || ""}
        </p>
      </header>

      <section className="border rounded-xl p-3 space-y-1 bg-white">
        <div className="text-sm"><b>Customer</b>: {customer.name || "—"}</div>
        <div className="text-sm"><b>Address</b>: {customer.address || "—"}</div>
        <div className="text-sm"><b>Email</b>: {customer.email || "—"}</div>
        <div className="text-sm"><b>Phone</b>: {customer.phone || "—"}</div>
        <div className="text-sm"><b>Selected</b>: {selectedServices.join(", ") || "—"}</div>
        <div className="text-sm">
          <b>Payment</b>: {billing.monthly ? "Monthly" : "One-time"}
          {billing.prepayDiscount ? ` + Prepay (${settings.prepayDiscountPercent ?? 0}%)` : ""}
        </div>
      </section>

      <section className="border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Item</th>
              <th className="text-right p-2">Qty</th>
              <th className="text-right p-2">Unit</th>
              <th className="text-center p-2">Tax</th>
              <th className="text-right p-2">Line</th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-2">{i.label}</td>
                <td className="p-2 text-right">{i.qty}</td>
                <td className="p-2 text-right">{fmt.format(i.unitPrice)}</td>
                <td className="p-2 text-center">{i.taxable ? "Y" : "N"}</td>
                <td className="p-2 text-right">{fmt.format(i.qty * i.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t">
              <td className="p-2 font-medium" colSpan={4}>Subtotal</td>
              <td className="p-2 text-right">{fmt.format(totals.subtotal)}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium" colSpan={4}>Tax</td>
              <td className="p-2 text-right">{fmt.format(totals.tax)}</td>
            </tr>
            <tr>
              <td className="p-2 font-medium" colSpan={4}>Prepay Discount</td>
              <td className="p-2 text-right">- {fmt.format(totals.prepayAmount)}</td>
            </tr>
            <tr className="border-t">
              <td className="p-2 font-semibold" colSpan={4}>Total</td>
              <td className="p-2 text-right font-semibold">{fmt.format(totals.total)}</td>
            </tr>
          </tfoot>
        </table>
      </section>

      <div className="grid grid-cols-1 gap-2 print:hidden">
        <button className="px-4 py-3 rounded-xl border" onClick={saveDraft}>💾 Save Draft</button>
        <button className="px-4 py-3 rounded-xl border" onClick={downloadCSV}>⬇️ Download CSV</button>
        <button className="px-4 py-3 rounded-xl border" onClick={printPDF}>🧾 Print / PDF</button>
        <button
          className="px-4 py-3 rounded-xl border"
          onClick={() => {
            const mailto = `mailto:${customer.email || ""}?subject=Estimate&body=See attached/printed estimate.`;
            location.href = mailto;
          }}
        >
          ✉️ Email Quote
        </button>
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

function escapeCSV(val: string) {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
