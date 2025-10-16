import { create } from "zustand";

export type Customer = { name?: string; phone?: string; email?: string; address?: string };
export type Billing  = { deposit?: number; terms?: string; taxRate?: number };
export type ServiceItem = { id: string; label: string; qty: number; unitPrice: number; taxable?: boolean };

export type Estimate = {
  customer: Customer;
  billing: Billing;
  services: ServiceItem[];
};

type State = Estimate & {
  setCustomer: (p: Partial<Customer>) => void;
  setBilling:  (p: Partial<Billing>)  => void;
  upsertService: (s: ServiceItem) => void;
  removeService: (id: string) => void;
  reset: () => void;
};

const initial: Estimate = { customer: {}, billing: { taxRate: 0 }, services: [] };

export const useEstimateStore = create<State>((set) => ({
  ...initial,
  setCustomer: (p) => set((s) => ({ customer: { ...s.customer, ...p } })),
  setBilling:  (p) => set((s) => ({ billing:  { ...s.billing,  ...p } })),
  upsertService: (svc) => set((s) => {
    const i = s.services.findIndex(x => x.id === svc.id);
    const next = [...s.services];
    if (i >= 0) next[i] = { ...next[i], ...svc }; else next.push(svc);
    return { services: next };
  }),
  removeService: (id) => set((s) => ({ services: s.services.filter(x => x.id !== id) })),
  reset: () => set(() => initial),
}));
