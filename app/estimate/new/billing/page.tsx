// app/estimate/new/billing/page.tsx
"use client";

import Link from "next/link";
import Section from "@/components/ui/section";
import Button from "@/components/ui/button";

export default function BillingPage() {
  return (
    <main className="mx-auto w-full max-w-md p-4">
      <Section title="Billing">
        <p className="text-sm text-gray-600">
          Billing step placeholder. A preview + monthly/prepay options will appear here.
        </p>

        <div className="mt-4 flex gap-2">
          <Link href="/estimate/new/services">
            <Button tone="outline">Back</Button>
          </Link>
          <div className="ml-auto" />
          <Link href="/estimate/new/review">
            <Button>Next</Button>
          </Link>
        </div>
      </Section>
    </main>
  );
}
