// app/estimate/new/billing/page.tsx
"use client";

// Force dynamic rendering so Vercel doesn't prerender this at build time
export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";

export default function BillingPage() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Billing</h1>
      <p style={{ color: "#4b5563", fontSize: 14 }}>
        Billing step placeholder. Monthly & prepay options will go here.
      </p>

      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <Link href="/estimate/new/services"
          style={{ border: "1px solid #d1d5db", padding: "8px 12px", borderRadius: 10 }}>
          Back
        </Link>
        <div style={{ flex: 1 }} />
        <Link href="/estimate/new/review"
          style={{ background: "#10b981", color: "white", padding: "8px 12px", borderRadius: 10 }}>
          Next
        </Link>
      </div>
    </main>
  );
}
