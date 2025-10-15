export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function ServicesPage() {
  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Services</h1>
      <p style={{ color: "#4b5563", fontSize: 14 }}>Services step placeholder.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <a
          href="/estimate/new/customer"
          style={{ border: "1px solid #d1d5db", padding: "8px 12px", borderRadius: 10 }}
        >
          Back
        </a>
        <div style={{ flex: 1 }} />
        <a
          href="/estimate/new/billing"
          style={{ background: "#10b981", color: "white", padding: "8px 12px", borderRadius: 10 }}
        >
          Next
        </a>
      </div>
    </main>
  );
}
