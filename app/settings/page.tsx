// app/settings/page.tsx
"use client";
import Section from "@/components/ui/section";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  return (
    <main className="mx-auto w-full max-w-md p-4">
      <Section title="Settings">
        <p className="text-sm text-gray-600">
          Price book & app preferences coming soon.
        </p>
        <div className="mt-4">
          <Button tone="outline" onClick={() => router.push("/")}>Back</Button>
        </div>
      </Section>
    </main>
  );
}
