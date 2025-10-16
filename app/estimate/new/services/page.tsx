"use client";
import { useEstimateStore, type ServiceItem } from "@/app/(app)/estimate/estimateStore";
import StepNav from "@/components/StepNav";
import { useState } from "react";

export default function ServicesPage() {
  const { services, upsertService, removeService } = useEstimateStore();
  const [draft, setDraft] = useState<ServiceItem>({ id: crypto.randomUUID(), label: "", qty: 1, unitPrice: 0 });

  const add = () => {
    if (!draft.label) return;
    upsertService(draft);
    setDraft({ id: crypto.randomUUID(), label: "", qty: 1, unitPrice: 0 });
  };

  const canContinue = services.length > 0;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Services</h1>

      <div className="flex gap-2">
        <input className="border p-2 rounded flex-1" placeholder="Label"
          value={draft.label} onChange={(e) => setDraft({ ...draft, label: e.target.value })} />
        <input className="border p-2 rounded w-24" type="number" min={1}
          value={draft.qty} onChange={(e) => setDraft({ ...draft, qty: Number(e.target.value) })} />
        <input className="border p-2 rounded w-32" type="number" step="0.01"
          value={draft.unitPrice} onChange={(e) => setDraft({ ...draft, unitPrice: Number(e.target.value) })} />
        <button className="px-4 py-2 rounded-xl border" onClick={add}>Add</button>
      </div>

      <ul className="divide-y border rounded">
        {services.map(s => (
          <li key={s.id} className="flex items-center justify-between p-2">
            <span>{s.label} ({s.qty} × ${s.unitPrice.toFixed(2)})</span>
            <button className="text-sm underline" onClick={() => removeService(s.id)}>remove</button>
          </li>
        ))}
      </ul>

      <StepNav canContinue={canContinue} />
    </div>
  );
}
