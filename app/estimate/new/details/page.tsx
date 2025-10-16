"use client";
import { useRouter } from "next/navigation";
import MobileStepNav from "@/components/MobileStepNav";
import { useEstimateStore, type ServiceKey } from "@/app/(app)/estimate/estimateStore";
import { serviceKeyLabel } from "@/app/(app)/estimate/steps";

export default function ServiceDetailsPage() {
  const router = useRouter();
  const {
    selectedServices, serviceStepIndex,
    setDetail, nextServiceStep, prevServiceStep,
    details
  } = useEstimateStore();

  const currentKey: ServiceKey | undefined = selectedServices[serviceStepIndex];
  const lastIndex = selectedServices.length - 1;

  // If nothing selected, bounce back
  if (!currentKey) {
    return (
      <main className="mx-auto max-w-md p-4">
        <p className="text-sm text-gray-500">No services selected.</p>
      </main>
    );
  }

  const onNext = () => {
    if (serviceStepIndex < lastIndex) nextServiceStep();
    else router.push("/estimate/new/payments");
  };

  const onBack = () => {
    if (serviceStepIndex > 0) prevServiceStep();
    else router.push("/estimate/new/services");
  };

  return (
    <main className="mx-auto max-w-md p-4 pb-24 space-y-3">
      <h1 className="text-xl font-semibold">Details — {serviceKeyLabel[currentKey]}</h1>

      {currentKey === "mowing" && <MowingForm value={details.mowing} onChange={(v) => setDetail("mowing", v)} />}
      {currentKey === "bed" && <BedForm value={details.bed} onChange={(v) => setDetail("bed", v)} />}
      {currentKey === "applications" && (
        <ApplicationsForm value={details.applications} onChange={(v) => setDetail("applications", v)} />
      )}

      <div className="text-xs text-gray-500">
        Step {serviceStepIndex + 1} of {selectedServices.length}
      </div>

      <MobileStepNav onBack={onBack} onNext={onNext} />
    </main>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <label className="block text-sm space-y-1">
      <span className="text-gray-700">{label}</span>
      <input {...rest} className="border p-3 rounded w-full" />
    </label>
  );
}

function MowingForm({ value, onChange }: { value?: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Acres" type="number" step="0.01" value={value?.acres ?? ""} onChange={(e) => onChange({ acres: Number(e.target.value) })} />
      <Field label="Visits per month" type="number" value={value?.visitsPerMonth ?? ""} onChange={(e) => onChange({ visitsPerMonth: Number(e.target.value) })} />
      <Field label="Price per visit ($)" type="number" step="0.01" value={value?.pricePerVisit ?? ""} onChange={(e) => onChange({ pricePerVisit: Number(e.target.value) })} />
    </div>
  );
}

function BedForm({ value, onChange }: { value?: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Bed SQFT" type="number" value={value?.sqft ?? ""} onChange={(e) => onChange({ sqft: Number(e.target.value) })} />
      <Field label="Mulch depth (inches)" type="number" step="0.5" value={value?.mulchDepthIn ?? ""} onChange={(e) => onChange({ mulchDepthIn: Number(e.target.value) })} />
      <Field label="Edging (linear ft)" type="number" value={value?.edgingLinearFt ?? ""} onChange={(e) => onChange({ edgingLinearFt: Number(e.target.value) })} />
      <Field label="Estimated price ($)" type="number" step="0.01" value={value?.price ?? ""} onChange={(e) => onChange({ price: Number(e.target.value) })} />
    </div>
  );
}

function ApplicationsForm({ value, onChange }: { value?: any; onChange: (v: any) => void }) {
  return (
    <div className="space-y-3">
      <label className="block text-sm space-y-1">
        <span className="text-gray-700">Program</span>
        <select
          className="border p-3 rounded w-full"
          value={value?.program ?? ""}
          onChange={(e) => onChange({ program: e.target.value as any })}
        >
          <option value="">Select…</option>
          <option value="basic">Basic</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
        </select>
      </label>
      <Field label="Visits" type="number" value={value?.visits ?? ""} onChange={(e) => onChange({ visits: Number(e.target.value) })} />
      <Field label="Total price ($)" type="number" step="0.01" value={value?.totalPrice ?? ""} onChange={(e) => onChange({ totalPrice: Number(e.target.value) })} />
    </div>
  );
}
