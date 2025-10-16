"use client";
import { useRouter } from "next/navigation";
import { useEstimateStore, type ServiceKey } from "@/app/(app)/estimate/estimateStore";
import MobileStepNav from "@/components/MobileStepNav";
import { serviceKeyLabel } from "@/app/(app)/estimate/steps";
import { useMemo, useState } from "react";

const ALL: ServiceKey[] = ["mowing", "bed", "applications"];

export default function ServicesSelectPage() {
  const router = useRouter();
  const { selectedServices, setSelectedServices, resetServiceStepper } = useEstimateStore();
  const [localSel, setLocalSel] = useState<ServiceKey[]>(selectedServices ?? []);

  const toggle = (k: ServiceKey) =>
    setLocalSel((arr) => (arr.includes(k) ? arr.filter((x) => x !== k) : [...arr, k]));

  const canNext = localSel.length > 0;
  const ordered = useMemo(() => localSel, [localSel]);

  return (
    <main className="mx-auto max-w-md p-4 pb-24 space-y-3">
      <h1 className="text-xl font-semibold">Select Services</h1>

      <ul className="space-y-2">
        {ALL.map((k) => (
          <li key={k} className="flex items-center gap-3 border rounded-xl p-3">
            <input
              id={k}
              type="checkbox"
              className="h-5 w-5"
              checked={localSel.includes(k)}
              onChange={() => toggle(k)}
            />
            <label htmlFor={k} className="text-sm">{serviceKeyLabel[k]}</label>
          </li>
        ))}
      </ul>

      {ordered.length > 0 && (
        <div className="text-xs text-gray-500">Order: {ordered.map((k) => serviceKeyLabel[k]).join(" → ")}</div>
      )}

      <MobileStepNav
        onBack={() => router.push("/estimate/new/customers")}
        onNext={() => {
          setSelectedServices(ordered);
          resetServiceStepper();
          router.push("/estimate/new/details");
        }}
        canNext={canNext}
      />
    </main>
  );
}
