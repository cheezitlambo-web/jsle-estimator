"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Customer = { name?: string; phone?: string; email?: string; address?: string };

export type Billing = {
  taxRate?: number;      // legacy; prefer settings.defaultTaxRate
  terms?: string;
  monthly?: boolean;
  prepayDiscount?: boolean;
};

export type ServiceKey = "mowing" | "bed" | "applications";
export type ServiceItem = { id: string; label: string; qty: number; unitPrice: number; taxable?: boolean };

export type ServiceDetails = {
  mowing?: { acres?: number; visitsPerMonth?: number; pricePerVisit?: number };
  bed?: { sqft?: number; mulchDepthIn?: number; edgingLinearFt?: number; price?: number };
  applications?: { program?: "basic" | "plus" | "premium"; visits?: number; totalPrice?: number };
};

export type Settings = {
  companyName?: string;
  contactEmail?: string;
  currency?: string;              // "USD"
  defaultTaxRate?: number;        // 0.0925
  prepayDiscountPercent?: number; // e.g., 5
};

export type Estimate = {
  customer: Customer;
  billing: Billing;
  services: ServiceItem[];        // manual items (kept)
  selectedServices: ServiceKey[];
  serviceStepIndex: number;
  details: ServiceDetails;
  settings: Settings;
};

export type Draft = {
  id: string;
  name?: string;          // e.g., Customer + address
  address?: string;
  estimateNumber?: string;
  createdAt: string;      // ISO string
  payload: Estimate;      // full snapshot
};

type Actions = {
  setCustomer: (p: Partial<Customer>) => void;
  setBilling: (p: Partial<Billing>) => void;
  upsertService: (s: ServiceItem) => void;
  removeService: (id: string) => void;
  reset: () => void;

  setSelectedServices: (keys: ServiceKey[]) => void;
  nextServiceStep: () => void;
  prevServiceStep: () => void;
  setDetail: <K extends ServiceKey>(k: K, data: Partial<NonNullable<ServiceDetails[K]>>) => void;
  resetServiceStepper: () => void;

  setSettings: (p: Partial<Settings>) => void;

  // Drafts
  saveEstimate: () => Draft;                 // returns created draft
  openEstimate: (id: string) => void;
  deleteEstimate: (id: string) => void;
};

const initial: Estimate = {
  customer: {},
  billing: { taxRate: 0, monthly: false, prepayDiscount: false },
  services: [],
  selectedServices: [],
  serviceStepIndex: 0,
  details: {},
  settings: {
    companyName: "JSLE",
    contactEmail: "",
    currency: "USD",
    defaultTaxRate: 0.0925,
    prepayDiscountPercent: 5,
  },
};

type Store = Estimate & {
  drafts: Draft[];
} & Actions;

export const useEstimateStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initial,
      drafts: [],

      // basics
      setCustomer: (p) => set((s) => ({ customer: { ...s.customer, ...p } })),
      setBilling:  (p) => set((s) => ({ billing:  { ...s.billing,  ...p } })),
      upsertService: (svc) =>
        set((s) => {
          const i = s.services.findIndex((x) => x.id === svc.id);
          const next = [...s.services];
          if (i >= 0) next[i] = { ...next[i], ...svc };
          else next.push(svc);
          return { services: next };
        }),
      removeService: (id) => set((s) => ({ services: s.services.filter((x) => x.id !== id) })),
      reset: () => set(() => ({ ...initial })),

      // wizard
      setSelectedServices: (keys) => set(() => ({ selectedServices: keys, serviceStepIndex: 0 })),
      nextServiceStep: () => set((s) => ({ serviceStepIndex: Math.min(s.serviceStepIndex + 1, Math.max(0, s.selectedServices.length - 1)) })),
      prevServiceStep: () => set((s) => ({ serviceStepIndex: Math.max(0, s.serviceStepIndex - 1) })),
      resetServiceStepper: () => set(() => ({ serviceStepIndex: 0 })),
      setDetail: (k, data) => set((s) => ({ details: { ...s.details, [k]: { ...(s.details as any)[k], ...data } } })),

      // settings
      setSettings: (p) => set((s) => ({ settings: { ...s.settings, ...p } })),

      // drafts
      saveEstimate: () => {
        const s = get();
        const id = crypto.randomUUID();
        const payload: Estimate = {
          customer: s.customer,
          billing: s.billing,
          services: s.services,
          selectedServices: s.selectedServices,
          serviceStepIndex: s.serviceStepIndex,
          details: s.details,
          settings: s.settings,
        };
        const name = s.customer.name || "Unnamed";
        const d: Draft = {
          id,
          name,
          address: s.customer.address,
          estimateNumber: undefined,
          createdAt: new Date().toISOString(),
          payload,
        };
        set((state) => ({ drafts: [d, ...state.drafts] }));
        return d;
      },

      openEstimate: (id) => {
        const d = get().drafts.find((x) => x.id === id);
        if (!d) return;
        const p = d.payload;
        set(() => ({
          ...p,
        }));
      },

      deleteEstimate: (id) => {
        set((s) => ({ drafts: s.drafts.filter((x) => x.id !== id) }));
      },
    }),
    { name: "jsle-estimate", storage: createJSONStorage(() => localStorage) }
  )
);
