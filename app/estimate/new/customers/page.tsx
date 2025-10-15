// app/customers/page.tsx
"use client";
import Section from "@/components/ui/section";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CustomersPage() {
  const router = useRouter();
  return (
    <main className="mx-auto w-full max-w-md p-4">
      <Section title="Customers">
        <p className="text-sm text-gray-600">
          Customer list coming soon. You’ll be able to open previous estimates from each customer here.
        </p>
        <div className="mt-4">
          <Button tone="outline" onClick={() => router.push("/")}>Back</Button>
        </div>
      </Section>
    </main>
  );
}
