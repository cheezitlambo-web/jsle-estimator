"use client";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";

export default function SettingsPage() {
  const { settings, setSettings } = useEstimateStore();

  return (
    <main className="mx-auto max-w-md p-4 space-y-4">
      <h1 className="text-xl font-semibold">Settings</h1>

      <Field label="Company Name">
        <input className="border p-3 rounded w-full"
          value={settings.companyName || ""}
          onChange={(e) => setSettings({ companyName: e.target.value })}
          placeholder="JSLE" />
      </Field>

      <Field label="Contact Email">
        <input className="border p-3 rounded w-full"
          value={settings.contactEmail || ""}
          onChange={(e) => setSettings({ contactEmail: e.target.value })}
          placeholder="you@company.com" />
      </Field>

      <Field label="Currency Code">
        <input className="border p-3 rounded w-full"
          value={settings.currency || "USD"}
          onChange={(e) => setSettings({ currency: e.target.value.toUpperCase() })}
          placeholder="USD" />
      </Field>

      <Field label="Default Tax Rate">
        <input className="border p-3 rounded w-full" type="number" step="0.0001"
          value={settings.defaultTaxRate ?? 0}
          onChange={(e) => setSettings({ defaultTaxRate: Number(e.target.value) })}
          placeholder="0.0925" />
      </Field>

      <Field label="Prepay Discount (%)">
        <input className="border p-3 rounded w-full" type="number" step="0.1"
          value={settings.prepayDiscountPercent ?? 0}
          onChange={(e) => setSettings({ prepayDiscountPercent: Number(e.target.value) })}
          placeholder="5" />
      </Field>

      <div className="text-xs text-gray-500">Changes save automatically.</div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm space-y-1">
      <span className="text-gray-700">{label}</span>
      {children}
    </label>
  );
}
