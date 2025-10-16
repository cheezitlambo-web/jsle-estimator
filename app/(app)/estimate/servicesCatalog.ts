// app/(app)/estimate/servicesCatalog.ts
import type { ServiceDetails, ServiceItem } from "./estimateStore";

export type Settings = {
  companyName?: string;
  contactEmail?: string;
  currency?: string;           // e.g., "USD"
  defaultTaxRate?: number;     // e.g., 0.0925
  prepayDiscountPercent?: number; // e.g., 5
};

export const CURRENCY = (code?: string) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency: code || "USD" });

export function buildLineItems(details: ServiceDetails, _settings: Settings): ServiceItem[] {
  const items: ServiceItem[] = [];

  // Mowing
  if (details.mowing) {
    const acres = Number(details.mowing.acres || 0);
    const visitsPerMonth = Number(details.mowing.visitsPerMonth || 0);
    const pricePerVisit = Number(details.mowing.pricePerVisit || 0);
    const monthly = visitsPerMonth * pricePerVisit;
    if (monthly > 0) {
      items.push({
        id: "svc-mowing",
        label: `Mowing (${acres || 0} acres × ${visitsPerMonth}/mo)`,
        qty: 1,
        unitPrice: Number(monthly.toFixed(2)),
        taxable: true,
      });
    }
  }

  // Bed refurb
  if (details.bed) {
    const sqft = Number(details.bed.sqft || 0);
    const mulchDepthIn = Number(details.bed.mulchDepthIn || 0);
    const edgingLinearFt = Number(details.bed.edgingLinearFt || 0);
    const price = Number(details.bed.price || 0);
    if (price > 0) {
      const label = [
        `Bed refurb (${sqft || 0} sqft`,
        mulchDepthIn ? `${mulchDepthIn}" mulch` : null,
        edgingLinearFt ? `${edgingLinearFt} ft edging` : null,
        `)`,
      ].filter(Boolean).join(" ");
      items.push({ id: "svc-bed", label, qty: 1, unitPrice: Number(price.toFixed(2)), taxable: true });
    }
  }

  // Applications
  if (details.applications) {
    const program = details.applications.program || "program";
    const visits = Number(details.applications.visits || 0);
    const totalPrice = Number(details.applications.totalPrice || 0);
    if (totalPrice > 0) {
      items.push({
        id: "svc-apps",
        label: `Applications (${program}, ${visits || 0} visits)`,
        qty: 1,
        unitPrice: Number(totalPrice.toFixed(2)),
        taxable: true,
      });
    }
  }

  return items;
}

export function computeTotals(
  items: ServiceItem[],
  settings: Settings,
  opts: { monthly?: boolean; prepayDiscount?: boolean }
) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const taxRate = settings.defaultTaxRate ?? 0;
  const taxableBase = items.filter(i => i.taxable).reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = Number((taxRate * taxableBase).toFixed(2));
  const prepayPct = opts.prepayDiscount ? (settings.prepayDiscountPercent ?? 0) : 0;
  const prepayAmount = Number(((prepayPct / 100) * (subtotal + tax)).toFixed(2));
  const total = Number((subtotal + tax - prepayAmount).toFixed(2));
  return { subtotal, tax, prepayAmount, total };
}

