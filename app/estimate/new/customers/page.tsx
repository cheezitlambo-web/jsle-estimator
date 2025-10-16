"use client";
import { useRouter } from "next/navigation";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";
import MobileStepNav from "@/components/MobileStepNav";

export default function CustomersPage() {
  const router = useRouter();
  const { customer, setCustomer } = useEstimateStore();
  const canNext = Boolean(customer.name && customer.address);

  return (
    <main className="mx-auto max-w-md p-4 pb-24 space-y-3">
      <h1 className="text-xl font-semibold">Customer</h1>
      <input className="border p-3 rounded w-full" placeholder="Name"
        value={customer.name || ""} onChange={(e) => setCustomer({ name: e.target.value })} />
      <input className="border p-3 rounded w-full" placeholder="Address"
        value={customer.address || ""} onChange={(e) => setCustomer({ address: e.target.value })} />
      <input className="border p-3 rounded w-full" placeholder="Email"
        value={customer.email || ""} onChange={(e) => setCustomer({ email: e.target.value })} />
      <input className="border p-3 rounded w-full" placeholder="Phone"
        value={customer.phone || ""} onChange={(e) => setCustomer({ phone: e.target.value })} />

      <MobileStepNav
        onBack={() => router.push("/")}
        onNext={() => router.push("/estimate/new/services")}
        canNext={canNext}
      />
    </main>
  );
}
