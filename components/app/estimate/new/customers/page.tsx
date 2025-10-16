"use client";
import { useEstimateStore } from "@/app/(app)/estimate/estimateStore";
import StepNav from "@/components/StepNav";

export default function CustomersPage() {
  const { customer, setCustomer } = useEstimateStore();
  const canContinue = Boolean(customer.name && customer.address);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customer</h1>

      <input className="border p-2 rounded w-full"
        placeholder="Name"
        value={customer.name || ""}
        onChange={(e) => setCustomer({ name: e.target.value })}
      />
      <input className="border p-2 rounded w-full"
        placeholder="Address"
        value={customer.address || ""}
        onChange={(e) => setCustomer({ address: e.target.value })}
      />
      <input className="border p-2 rounded w-full"
        placeholder="Email"
        value={customer.email || ""}
        onChange={(e) => setCustomer({ email: e.target.value })}
      />

      <StepNav canContinue={canContinue} />
    </div>
  );
}
