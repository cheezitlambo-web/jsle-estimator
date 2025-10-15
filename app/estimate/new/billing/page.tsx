// app/estimate/new/billing/page.tsx
"use client";
import Section from "@/components/ui/section";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Checkbox from "@/components/ui/checkbox";
import StepNav from "@/components/StepNav";
import { useEstimate } from "@/app/(app)/estimate/EstimateProvider";

export default function BillingStep() {
  const { draft, setDraft } = useEstimate();

  return (
    <Section title="Billing">
      <div className="grid gap-3 text-sm">
        <Checkbox
          label="Pay monthly"
          checked={!!draft.inputs.monthlyPayments}
          onChange={(e) =>
            setDraft((d) => ({
              ...d,
              inputs: { ...d.inputs, monthlyPayments: e.currentTarget.checked },
            }))
          }
        />
        <Field label="Contract months">
          <Input
            type="number"
            className="w-28"
            value={draft.inputs.months ?? 8}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                inputs: { ...d.inputs, months: +e.target.value },
              }))
            }
          />
        </Field>
        <Field label="Prepay discount %">
          <Input
            type="number"
            className="w-28"
            value={draft.inputs.prepayDiscPct ?? 0}
            onChange={(e) =>
              setDraft((d) => ({
                ...d,
                inputs: { ...d.inputs, prepayDiscPct: +e.target.value },
              }))
            }
          />
        </Field>

        {/* Phase 1: simple preview */}
        <div className="mt-2 text-gray-700">
          <div>Estimate #: <b>{draft.estimateNumber || "—"}</b></div>
          <div>Customer: <b>{draft.customerName || "—"}</b></div>
          <div>Address: <b>{draft.address || "—"}</b></div>
          <div className="mt-2 text-xs text-gray-500">
            (Totals preview will reflect service detail pages once we add them in Phase 2.)
          </div>
        </div>

        <StepNav backHref="/estimate/new/services" nextHref="/estimate/new/review" />
      </div>
    </Section>
  );
}
