/* eslint-disable @typescript-eslint/no-explicit-any */ 
"use client";
import { useEffect, useMemo, useState } from "react";
import AddressAutocomplete from "@/components/AddressAutocomplete";

// Micro UI imports
import Section from "@/components/ui/section";
import Field from "@/components/ui/field";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import Checkbox from "@/components/ui/checkbox";
import Button from "@/components/ui/button";
import { PrintOnly, ScreenOnly } from "@/components/ui/visibility";

/** =========================
 * Types
 * ========================= */
type ServiceType =
  | "LANDSCAPE" // labeled “Mowing & Bed Refurbishing”
  | "APPLICATIONS"
  | "HARDSCAPE"
  | "MAINTENANCE"
  | "SEASONAL";

type Estimate = {
  id: string; // set after mount to avoid SSR mismatch
  estimateNumber: string; // set after mount to avoid SSR mismatch
  createdAt: number; // set after mount to avoid SSR mismatch
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address: string;
  services: Record<ServiceType, boolean>;
  inputs: {
    // Mowing & Bed Refurbishing (formerly Landscape)
    mowSqft?: number;
    yardNotes?: string;
    bedCount?: number;
    bedCover?: "mulch" | "rock" | "topsoil" | "";
    bedAvgDepthIn?: number;
    bedSqftTotal?: number;
    sodSqft?: number;
    edgingFt?: number;

    // APPLICATIONS
    applicationSqft?: number; // per-sqft sizing for apps

    // Per-sqft application toggles
    applyFertilizeLT?: boolean;
    applyWeedLT?: boolean;
    applyPestLT?: boolean;
    applyDiseaseLT?: boolean;
    applyAerationLT?: boolean;
    applyOverseedLT?: boolean;

    // Per-year application counts (multiplier)
    appFertilizeCountMN?: 0 | 1 | 2 | 3 | 4;
    appWeedCountMN?: 0 | 1 | 2 | 3 | 4;
    appPestCountMN?: 0 | 1 | 2 | 3 | 4;
    appDiseaseCountMN?: 0 | 1 | 2 | 3 | 4;
    appAerationCountMN?: 0 | 1 | 2 | 3 | 4;
    appOverseedCountMN?: 0 | 1 | 2 | 3 | 4;

    // Hardscape
    patioSqft?: number;
    paverTier?: "economy" | "mid" | "premium" | "";
    borderFt?: number;
    drainageFt?: number;
    stepsCount?: number;
    lightingCount?: number;
    accessDifficulty?: "none" | "moderate" | "steep";

    // Maintenance
    maintTier?: "S" | "M" | "L" | "XL" | "";
    includeTrim?: boolean;
    includeBeds?: boolean;
    includeEdge?: boolean;

    // per-subservice frequency
    frequencyBase?: "weekly" | "biweekly" | "monthly" | "";
    frequencyTrim?: "weekly" | "biweekly" | "monthly" | "";
    frequencyBeds?: "weekly" | "biweekly" | "monthly" | "";
    frequencyEdge?: "weekly" | "biweekly" | "monthly" | "";

    // Global billing controls (moved here)
    months?: number; // used for maintenance visit counts and global monthly split
    prepayDiscPct?: number; // GLOBAL prepay discount % (applies to whole subtotal when monthly is OFF)
    monthlyPayments?: boolean; // GLOBAL monthly toggle

    // Seasonal
    leafDepth?: "light" | "medium" | "heavy" | "";
    cleanBedsCount?: number;
    gutterClean?: boolean;
    haulAway?: boolean;
    limbVolumeYd3?: number;
  };
};

// Snapshot stored with each customer entry
type EstimateSnapshot = {
  estimateId: string;
  estimateNumber: string;
  createdAt: number;
  services: Record<ServiceType, boolean>;
  inputs: Estimate["inputs"];
  totals: {
    landscape: number;
    applications: number;
    hardscape: number;
    maintenance: number;
    seasonal: number;
    subBeforeDiscount: number;
    prepayDiscount: number;
    sub: number;
    tax: number;
    total: number;
  };
};

type Customer = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  // Saved handy fields
  applicationSqft?: number;
  mowSqft?: number;
  edgingFt?: number;
  maintTier?: "S" | "M" | "L" | "XL" | "";
  estimates: EstimateSnapshot[];
};

/** =========================
 * Defaults / Constants
 * ========================= */

// Define the shape as numbers (not literals)
type PriceBook = {
  LABOR_PER_HOUR: number;
  MULCH_PER_YD3: number;
  ROCK_PER_YD3: number;
  TOPSOIL_PER_YD3: number;
  SOD_PER_SQFT: number;
  PAVER_ECON_PER_SQFT: number;
  PAVER_MID_PER_SQFT: number;
  PAVER_PREM_PER_SQFT: number;
  EDGING_STEEL_PER_FT: number;
  DISPOSAL_GREEN_WASTE_PER_YD3: number;
  TAX_RATE: number;
  DEFAULT_MARGIN: number;

  // Productivity used to derive mowing labor $
  MOW_PRODUCTIVITY_SQFT_PER_HR: number;

  // Application pricing (per sqft)
  APP_FERTILIZATION_PER_SQFT: number;
  APP_WEED_CONTROL_PER_SQFT: number;
  APP_PEST_CONTROL_PER_SQFT: number;
  APP_DISEASE_CONTROL_PER_SQFT: number;
  APP_AERATION_PER_SQFT: number;
  APP_OVERSEEDING_PER_SQFT: number;
};

const DEFAULT_PRICE: PriceBook = {
  LABOR_PER_HOUR: 55,
  MULCH_PER_YD3: 38,
  ROCK_PER_YD3: 120,
  TOPSOIL_PER_YD3: 32,
  SOD_PER_SQFT: 0.52,
  PAVER_ECON_PER_SQFT: 12,
  PAVER_MID_PER_SQFT: 18,
  PAVER_PREM_PER_SQFT: 24,
  EDGING_STEEL_PER_FT: 2.4,
  DISPOSAL_GREEN_WASTE_PER_YD3: 95,
  TAX_RATE: 0.0,
  DEFAULT_MARGIN: 0.35,

  // Productivity used to derive mowing labor $
  MOW_PRODUCTIVITY_SQFT_PER_HR: 12000,

  // Application pricing (per sqft)
  APP_FERTILIZATION_PER_SQFT: 0.012,
  APP_WEED_CONTROL_PER_SQFT: 0.010,
  APP_PEST_CONTROL_PER_SQFT: 0.009,
  APP_DISEASE_CONTROL_PER_SQFT: 0.011,
  APP_AERATION_PER_SQFT: 0.016,
  APP_OVERSEEDING_PER_SQFT: 0.020,
};




/** =========================
 * Utils
 * ========================= */
function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
function formatMoney(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
function moneyLabel(n: number) {
  return `$${formatMoney(n)}`;
}
function freqToVisitsPerMonth(f?: "" | "weekly" | "biweekly" | "monthly") {
  return f === "weekly" ? 4 : f === "biweekly" ? 2 : f === "monthly" ? 1 : 0;
}
function todayYMD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}
// SSR-safe: only call in the browser
function nextEstimateNumber() {
  try {
    const seqRaw = localStorage.getItem("jsle_estimate_seq");
    const seq = (seqRaw ? parseInt(seqRaw, 10) : 0) + 1;
    localStorage.setItem("jsle_estimate_seq", String(seq));
    return `EST-${todayYMD()}-${String(seq).padStart(4, "0")}`;
  } catch {
    return `EST-${todayYMD()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;
  }
}

/** =========================
 * Quote text (totals at bottom; prepay/monthly in totals)
 * ========================= */
function quoteText(
  current: Estimate,
  totals: {
    landscape: number;
    applications: number;
    hardscape: number;
    maintenance: number;
    seasonal: number;
    subBeforeDiscount: number;
    prepayDiscount: number;
    prepayPotential: number; // show potential savings even if monthly on
    sub: number;
    tax: number;
    total: number;
    monthlyGlobal?: { enabled: boolean; months: number; amountPerMonth: number };
  }
) {
  const lines: string[] = [];
  lines.push(`JS Land Escapes — Estimate`);
  lines.push(`Estimate #: ${current.estimateNumber || "—"}`);
  lines.push(``); // full blank line after estimate #
  lines.push(`Date: ${new Date().toLocaleDateString()}`);
  lines.push(`Customer: ${current.customerName || "—"}`);
  lines.push(`Phone: ${current.customerPhone || "—"}`);
  lines.push(`Email: ${current.customerEmail || "—"}`);
  lines.push(`Address: ${current.address || "—"}`);
  lines.push(``);

  const svc = current.services;
  if (svc.LANDSCAPE)
    lines.push(`Mowing & Bed Refurbishing: ${moneyLabel(totals.landscape)}`);
  if (svc.APPLICATIONS)
    lines.push(`Applications: ${moneyLabel(totals.applications)}`);
  if (svc.HARDSCAPE) lines.push(`Hardscape: ${moneyLabel(totals.hardscape)}`);
  if (svc.MAINTENANCE) lines.push(`Maintenance: ${moneyLabel(totals.maintenance)}`);
  if (svc.SEASONAL) lines.push(`Seasonal: ${moneyLabel(totals.seasonal)}`);

  lines.push(``);

  lines.push(`Subtotal (before discount): ${moneyLabel(totals.subBeforeDiscount)}`);
  if (totals.prepayDiscount > 0) {
    lines.push(`Prepay discount: -${moneyLabel(totals.prepayDiscount)}`);
  }
  lines.push(`Subtotal: ${moneyLabel(totals.sub)}`);
  lines.push(`Tax: ${moneyLabel(totals.tax)}`);
  lines.push(`Total: ${moneyLabel(totals.total)}`);

  if (totals.monthlyGlobal?.enabled) {
    lines.push(
      `Monthly payments selected (estimate-wide): ${totals.monthlyGlobal.months} months @ ${moneyLabel(
        totals.monthlyGlobal.amountPerMonth
      )} each (pre-tax).`
    );
    if (totals.prepayPotential > 0) {
      lines.push(
        `Prepay savings (if paid upfront): ${moneyLabel(totals.prepayPotential)}.`
      );
    }
  }

  lines.push(``);
  lines.push(`Notes: ${current.inputs.yardNotes || "—"}`);
  lines.push(``);
  lines.push(`Thank you for the opportunity!`);
  return lines.join("\n");
}

/** =========================
 * Line items (no drive-time/avg time)
 * ========================= */
function buildLineItems(current: Estimate, PB: PriceBook) {
  const i = current.inputs;
  const groups: { title: string; rows: { label: string; amount: number }[] }[] =
    [];

  // --- MOWING & BED REFURBISHING ---
  if (current.services.LANDSCAPE) {
    const rows: { label: string; amount: number }[] = [];

    const wasteMulch = 1.1;
    const bedDepth = (i.bedAvgDepthIn || 0) / 12;
    const yards =
      (((i.bedSqftTotal || 0) * bedDepth) / 27) * (i.bedCover ? wasteMulch : 1);

    const mulch =
      i.bedCover === "mulch"
        ? yards * PB.MULCH_PER_YD3 * (1 + PB.DEFAULT_MARGIN)
        : 0;
    const rock =
      i.bedCover === "rock"
        ? yards * PB.ROCK_PER_YD3 * (1 + PB.DEFAULT_MARGIN)
        : 0;
    const topsoil =
      i.bedCover === "topsoil"
        ? yards * PB.TOPSOIL_PER_YD3 * (1 + PB.DEFAULT_MARGIN)
        : 0;

    const sod = (i.sodSqft || 0) * PB.SOD_PER_SQFT * (1 + PB.DEFAULT_MARGIN);
    const edging =
      (i.edgingFt || 0) * PB.EDGING_STEEL_PER_FT * (1 + PB.DEFAULT_MARGIN);

    // Mowing labor via productivity (not shown as time)
    const mowSqft = i.mowSqft || 0;
    const mowingHours =
      mowSqft > 0 && PB.MOW_PRODUCTIVITY_SQFT_PER_HR > 0
        ? mowSqft / PB.MOW_PRODUCTIVITY_SQFT_PER_HR
        : 0;
    const mowingLabor = mowingHours * PB.LABOR_PER_HOUR;

    // Additional labor heuristics
    const laborHrsOther =
      yards * 0.6 + (i.sodSqft || 0) * 0.015 + (i.edgingFt || 0) * 0.01;
    const laborOther = laborHrsOther * PB.LABOR_PER_HOUR;

    const disposal =
      yards > 1 ? yards * PB.DISPOSAL_GREEN_WASTE_PER_YD3 * 0.5 : 0;

    if (mowingLabor > 0)
      rows.push({
        label: `Mowing labor (${mowingHours.toFixed(2)} hrs)`,
        amount: mowingLabor,
      });
    if (mulch > 0)
      rows.push({
        label: `Mulch (${yards.toFixed(2)} yd³ incl. waste)`,
        amount: mulch,
      });
    if (rock > 0)
      rows.push({
        label: `Rock (${yards.toFixed(2)} yd³ incl. waste)`,
        amount: rock,
      });
    if (topsoil > 0)
      rows.push({
        label: `Topsoil (${yards.toFixed(2)} yd³ incl. waste)`,
        amount: topsoil,
      });
    if (sod > 0) rows.push({ label: `Sod (${i.sodSqft || 0} sqft)`, amount: sod });
    if (edging > 0)
      rows.push({
        label: `Edging & weed whipping (${i.edgingFt || 0} ft)`,
        amount: edging,
      });
    if (laborOther > 0)
      rows.push({
        label: `Install labor (${laborHrsOther.toFixed(1)} hrs)`,
        amount: laborOther,
      });
    if (disposal > 0)
      rows.push({ label: `Green waste disposal (est.)`, amount: disposal });

    const clean = rows.filter((r) => Math.abs(r.amount) > 0.009);
    if (clean.length)
      groups.push({ title: "Mowing & Bed Refurbishing", rows: clean });
  }

  // --- APPLICATIONS (sqft × per-sqft rate × apps/year) ---
  if (current.services.APPLICATIONS) {
    const rows: { label: string; amount: number }[] = [];
    const sqft = (i.applicationSqft ?? i.mowSqft) || 0;

    type AppRow = {
      enabled: boolean | undefined;
      count: number;
      label: string;
      rate: number;
    };

    const apps: AppRow[] = [
      {
        enabled: i.applyFertilizeLT,
        count: i.appFertilizeCountMN ?? 0,
        label: "Fertilization",
        rate: PB.APP_FERTILIZATION_PER_SQFT,
      },
      {
        enabled: i.applyWeedLT,
        count: i.appWeedCountMN ?? 0,
        label: "Weed control",
        rate: PB.APP_WEED_CONTROL_PER_SQFT,
      },
      {
        enabled: i.applyPestLT,
        count: i.appPestCountMN ?? 0,
        label: "Pest control",
        rate: PB.APP_PEST_CONTROL_PER_SQFT,
      },
      {
        enabled: i.applyDiseaseLT,
        count: i.appDiseaseCountMN ?? 0,
        label: "Disease control",
        rate: PB.APP_DISEASE_CONTROL_PER_SQFT,
      },
      {
        enabled: i.applyAerationLT,
        count: i.appAerationCountMN ?? 0,
        label: "Aeration",
        rate: PB.APP_AERATION_PER_SQFT,
      },
      {
        enabled: i.applyOverseedLT,
        count: i.appOverseedCountMN ?? 0,
        label: "Overseeding",
        rate: PB.APP_OVERSEEDING_PER_SQFT,
      },
    ];

    for (const a of apps) {
      if (a.enabled && sqft > 0 && a.count > 0 && a.rate > 0) {
        const amount = sqft * a.rate * a.count;
        rows.push({
          label: `${a.label} (${a.count} app${a.count === 1 ? "" : "s"} × ${sqft} sqft)`,
          amount,
        });
      }
    }

    const clean = rows.filter((r) => Math.abs(r.amount) > 0.009);
    if (clean.length) groups.push({ title: "Applications", rows: clean });
  }

  // --- HARDSCAPE ---
  if (current.services.HARDSCAPE) {
    const rows: { label: string; amount: number }[] = [];
    const tier = i.paverTier || "economy";
    const rate =
      tier === "premium"
        ? PB.PAVER_PREM_PER_SQFT
        : tier === "mid"
        ? PB.PAVER_MID_PER_SQFT
        : PB.PAVER_ECON_PER_SQFT;

    const patio = (i.patioSqft || 0) * rate;
    const border = (i.borderFt || 0) * 6;
    const drainage = (i.drainageFt || 0) * 8;
    const steps = (i.stepsCount || 0) * 120;
    const lighting = (i.lightingCount || 0) * 85;

    const subtotal = patio + border + drainage + steps + lighting;
    const accessMul =
      i.accessDifficulty === "moderate" ? 1.1 : i.accessDifficulty === "steep" ? 1.2 : 1.0;
    const accessAdj = subtotal * (accessMul - 1);

    if (patio > 0)
      rows.push({
        label: `Paver surface (${i.patioSqft || 0} sqft @ $${rate}/sqft, ${tier})`,
        amount: patio,
      });
    if (border > 0)
      rows.push({ label: `Paver border (${i.borderFt || 0} ft)`, amount: border });
    if (drainage > 0)
      rows.push({ label: `Drainage (${i.drainageFt || 0} ft)`, amount: drainage });
    if (steps > 0) rows.push({ label: `Steps (${i.stepsCount || 0})`, amount: steps });
    if (lighting > 0)
      rows.push({
        label: `Lighting fixtures (${i.lightingCount || 0})`,
        amount: lighting,
      });
    if (accessAdj > 0)
      rows.push({ label: `Access difficulty adjustment`, amount: accessAdj });

    const clean = rows.filter((r) => Math.abs(r.amount) > 0.009);
    if (clean.length) groups.push({ title: "Hardscape", rows: clean });
  }

  // --- MAINTENANCE (no prepay here; global in Totals) ---
  if (current.services.MAINTENANCE) {
    const rows: { label: string; amount: number }[] = [];

    const baseTime =
      i.maintTier === "S"
        ? 0.6
        : i.maintTier === "M"
        ? 1.0
        : i.maintTier === "L"
        ? 1.6
        : i.maintTier === "XL"
        ? 2.4
        : 0;

    const months = i.months ?? 8;

    const vBase = freqToVisitsPerMonth(i.frequencyBase);
    const vTrim = i.includeTrim ? freqToVisitsPerMonth(i.frequencyTrim) : 0;
    const vBeds = i.includeBeds ? freqToVisitsPerMonth(i.frequencyBeds) : 0;
    const vEdge = i.includeEdge ? freqToVisitsPerMonth(i.frequencyEdge) : 0;

    const totalBaseVisits = vBase * months;
    const totalTrimVisits = vTrim * months;
    const totalBedsVisits = vBeds * months;
    const totalEdgeVisits = vEdge * months;

    const tripPad = 10; // flat per base visit
    const laborPerVisitBase = baseTime * PB.LABOR_PER_HOUR;

    const trimAdd = 0.2;
    const bedsAdd = 0.3;
    const edgeAdd = 0.1;

    const laborBase = totalBaseVisits > 0 ? laborPerVisitBase * totalBaseVisits : 0;
    const laborTrim =
      totalTrimVisits > 0 ? trimAdd * PB.LABOR_PER_HOUR * totalTrimVisits : 0;
    const laborBeds =
      totalBedsVisits > 0 ? bedsAdd * PB.LABOR_PER_HOUR * totalBedsVisits : 0;
    const laborEdge =
      totalEdgeVisits > 0 ? edgeAdd * PB.LABOR_PER_HOUR * totalEdgeVisits : 0;
    const trips = totalBaseVisits;
    const tripCost = trips * tripPad;

    if (laborBase > 0)
      rows.push({
        label: `Mowing labor (${baseTime.toFixed(1)} hrs/visit × ${totalBaseVisits} visits)`,
        amount: laborBase,
      });
    if (laborTrim > 0)
      rows.push({
        label: `Shrub trimming (${trimAdd.toFixed(1)} hrs/visit × ${totalTrimVisits} visits)`,
        amount: laborTrim,
      });
    if (laborBeds > 0)
      rows.push({
        label: `Bed touch-ups (${bedsAdd.toFixed(1)} hrs/visit × ${totalBedsVisits} visits)`,
        amount: laborBeds,
      });
    if (laborEdge > 0)
      rows.push({
        label: `Edging & Weed Whipping (${edgeAdd.toFixed(1)} hrs/visit × ${totalEdgeVisits} visits)`,
        amount: laborEdge,
      });
    if (tripCost > 0)
      rows.push({
        label: `Trip/consumables ($${formatMoney(tripPad)} × ${trips} base visits)`,
        amount: tripCost,
      });

    const clean = rows.filter((r) => Math.abs(r.amount) > 0.009);
    if (clean.length) groups.push({ title: "Maintenance", rows: clean });
  }

  // --- SEASONAL ---
  if (current.services.SEASONAL) {
    const rows: { label: string; amount: number }[] = [];
    const leafMul =
      i.leafDepth === "light" ? 1.0 : i.leafDepth === "medium" ? 1.5 : i.leafDepth === "heavy" ? 2.2 : 0;

    const baseHours = leafMul * 3;
    const extrasHours = (i.cleanBedsCount || 0) * 0.25 + (i.gutterClean ? 0.75 : 0);
    const laborHours = baseHours + extrasHours;
    const labor = laborHours * PB.LABOR_PER_HOUR;
    const disposal = i.haulAway
      ? (i.limbVolumeYd3 || 0) * PB.DISPOSAL_GREEN_WASTE_PER_YD3
      : 0;

    if (labor > 0)
      rows.push({
        label: `Cleanup labor (${laborHours.toFixed(1)} hrs)`,
        amount: labor,
      });
    if (i.cleanBedsCount)
      rows.push({
        label: `Bed cleanup (${i.cleanBedsCount} beds)`,
        amount: (i.cleanBedsCount || 0) * 0.25 * PB.LABOR_PER_HOUR,
      });
    if (i.gutterClean)
      rows.push({ label: `Gutter cleaning`, amount: 0.75 * PB.LABOR_PER_HOUR });
    if (disposal > 0)
      rows.push({
        label: `Haul away / disposal (${i.limbVolumeYd3 || 0} yd³)`,
        amount: disposal,
      });

    const clean = rows.filter((r) => Math.abs(r.amount) > 0.009);
    if (clean.length) groups.push({ title: "Seasonal", rows: clean });
  }

  return groups;
}

/** =========================
 * Page
 * ========================= */
export default function Home() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Price Book (editable)
  const [PB, setPB] = useState<PriceBook>(() => {
    try {
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("jsle_pricebook")
          : null;
      return raw ? { ...DEFAULT_PRICE, ...JSON.parse(raw) } : DEFAULT_PRICE;
    } catch {
      return DEFAULT_PRICE;
    }
  });

  // Hydration-safe initial estimate
  const [current, setCurrent] = useState<Estimate>(() => ({
    id: "",
    estimateNumber: "",
    createdAt: 0,
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    address: "",
    services: {
      LANDSCAPE: true,
      APPLICATIONS: true,
      HARDSCAPE: false,
      MAINTENANCE: false,
      SEASONAL: false,
    },
    inputs: {
      bedCover: "",
      paverTier: "",
      accessDifficulty: "none",
      maintTier: "",
      frequencyBase: "",
      frequencyTrim: "",
      frequencyBeds: "",
      frequencyEdge: "",
      months: undefined,
      prepayDiscPct: undefined, // GLOBAL
      monthlyPayments: false, // GLOBAL

      // Applications defaults
      applicationSqft: undefined,
      applyFertilizeLT: false,
      applyWeedLT: false,
      applyPestLT: false,
      applyDiseaseLT: false,
      applyAerationLT: false,
      applyOverseedLT: false,

      appFertilizeCountMN: 0,
      appWeedCountMN: 0,
      appPestCountMN: 0,
      appDiseaseCountMN: 0,
      appAerationCountMN: 0,
      appOverseedCountMN: 0,

      leafDepth: "",
    },
  }));

  const [showSettings, setShowSettings] = useState(false);

  // After mount: fill dynamic fields to avoid SSR mismatch
  useEffect(() => {
    setCurrent((cur) => {
      if (cur.id && cur.estimateNumber && cur.createdAt) return cur;
      return {
        ...cur,
        id: cur.id || uid(),
        estimateNumber: cur.estimateNumber || nextEstimateNumber(),
        createdAt: cur.createdAt || Date.now(),
      };
    });
  }, []);

  // Load persisted data
  useEffect(() => {
    try {
      const rawE = localStorage.getItem("jsle_estimates");
      if (rawE) setEstimates(JSON.parse(rawE));
    } catch {}
    try {
      const rawC = localStorage.getItem("jsle_customers");
      if (rawC) setCustomers(JSON.parse(rawC));
    } catch {}
  }, []);

  // Persist data
  useEffect(() => {
    try {
      localStorage.setItem("jsle_estimates", JSON.stringify(estimates));
    } catch {}
  }, [estimates]);
  useEffect(() => {
    try {
      localStorage.setItem("jsle_customers", JSON.stringify(customers));
    } catch {}
  }, [customers]);
  useEffect(() => {
    try {
      localStorage.setItem("jsle_pricebook", JSON.stringify(PB));
    } catch {}
  }, [PB]);

  /** =========================
   * Calculations
   * ========================= */
  const calc = useMemo(() => {
    const groups = buildLineItems(current, PB);

    const sumGroup = (title: string) =>
      groups.find((g) => g.title === title)?.rows.reduce((s, r) => s + r.amount, 0) || 0;

    const landscape = sumGroup("Mowing & Bed Refurbishing");
    const applications = sumGroup("Applications");
    const hardscape = sumGroup("Hardscape");
    const maintenance = sumGroup("Maintenance");
    const seasonal = sumGroup("Seasonal");

    const subBeforeDiscount =
      landscape + applications + hardscape + maintenance + seasonal;

    // GLOBAL prepay discount
    const prepayRate = current.inputs.prepayDiscPct
      ? current.inputs.prepayDiscPct / 100
      : 0;
    const prepayPotential =
      prepayRate > 0 ? subBeforeDiscount * prepayRate : 0; // shown even when monthly is ON
    const prepayAllowed = !current.inputs.monthlyPayments && prepayRate > 0;
    const prepayDiscount = prepayAllowed ? prepayPotential : 0;

    const sub = subBeforeDiscount - prepayDiscount;
    const tax = sub * PB.TAX_RATE;
    const total = sub + tax;

    // Global monthly payments (pre-tax; discount disabled while monthly is ON)
    const months = current.inputs.months || 8;
    const monthlyEnabled = !!current.inputs.monthlyPayments && months > 0;
    const monthlyAmountGlobal = monthlyEnabled ? subBeforeDiscount / months : 0;

    return {
      landscape,
      applications,
      hardscape,
      maintenance,
      seasonal,
      subBeforeDiscount,
      prepayPotential,
      prepayDiscount,
      sub,
      tax,
      total,
      monthlyGlobal: {
        enabled: monthlyEnabled,
        months,
        amountPerMonth: monthlyAmountGlobal,
      },
    };
  }, [current, PB]);

  /** =========================
   * Customer DB helpers
   * ========================= */
  function normalizeName(name: string) {
    return (name || "").trim().toLowerCase();
  }

  function upsertCustomerWithEstimate(e: Estimate) {
    const key = normalizeName(e.customerName);
    if (!key) return;

    const snapshot: EstimateSnapshot = {
      estimateId: e.id,
      estimateNumber: e.estimateNumber,
      createdAt: e.createdAt,
      services: e.services,
      inputs: e.inputs,
      totals: {
        landscape: calc.landscape,
        applications: calc.applications,
        hardscape: calc.hardscape,
        maintenance: calc.maintenance,
        seasonal: calc.seasonal,
        subBeforeDiscount: calc.subBeforeDiscount,
        prepayDiscount: calc.prepayDiscount,
        sub: calc.sub,
        tax: calc.tax,
        total: calc.total,
      },
    };

    setCustomers((prev) => {
      const idx = prev.findIndex((c) => normalizeName(c.name) === key);
      if (idx === -1) {
        const newCustomer: Customer = {
          id: uid(),
          name: e.customerName.trim(),
          phone: e.customerPhone || "",
          email: e.customerEmail || "",
          address: e.address || "",
          applicationSqft: e.inputs.applicationSqft ?? e.inputs.mowSqft ?? 0,
          mowSqft: e.inputs.mowSqft || 0,
          edgingFt: e.inputs.edgingFt || 0,
          maintTier: e.inputs.maintTier || "",
          estimates: [snapshot],
        };
        return [newCustomer, ...prev];
      } else {
        const list = [...prev];
        const c = { ...list[idx] };
        c.phone = e.customerPhone || c.phone || "";
        c.email = e.customerEmail || c.email || "";
        c.address = e.address || c.address || "";
        c.applicationSqft =
          e.inputs.applicationSqft ??
          e.inputs.mowSqft ??
          c.applicationSqft ??
          0;
        c.mowSqft = e.inputs.mowSqft ?? c.mowSqft ?? 0;
        c.edgingFt = e.inputs.edgingFt ?? c.edgingFt ?? 0;
        c.maintTier = e.inputs.maintTier ?? c.maintTier ?? "";
        const exists = c.estimates.some((s) => s.estimateId === e.id);
        c.estimates = exists
          ? c.estimates.map((s) => (s.estimateId === e.id ? snapshot : s))
          : [snapshot, ...c.estimates];
        list[idx] = c;
        return list;
      }
    });
  }

  function getCustomerByName(name: string): Customer | undefined {
    const key = normalizeName(name);
    if (!key) return undefined;
    return customers.find((c) => normalizeName(c.name) === key);
  }

  /** =========================
   * UI helpers
   * ========================= */
  function newEstimate() {
    setCurrent({
      id: uid(),
      estimateNumber: nextEstimateNumber(),
      createdAt: Date.now(),
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      address: "",
      services: {
        LANDSCAPE: true,
        APPLICATIONS: true,
        HARDSCAPE: false,
        MAINTENANCE: false,
        SEASONAL: false,
      },
      inputs: {
        bedCover: "",
        paverTier: "",
        accessDifficulty: "none",
        maintTier: "",
        frequencyBase: "",
        frequencyTrim: "",
        frequencyBeds: "",
        frequencyEdge: "",
        months: undefined,
        prepayDiscPct: undefined,
        monthlyPayments: false,

        applicationSqft: undefined,
        applyFertilizeLT: false,
        applyWeedLT: false,
        applyPestLT: false,
        applyDiseaseLT: false,
        applyAerationLT: false,
        applyOverseedLT: false,

        appFertilizeCountMN: 0,
        appWeedCountMN: 0,
        appPestCountMN: 0,
        appDiseaseCountMN: 0,
        appAerationCountMN: 0,
        appOverseedCountMN: 0,

        leafDepth: "",
      },
    });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Autocomplete names
  const customerNames = useMemo(
    () =>
      Array.from(new Set(customers.map((c) => c.name))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [customers]
  );

  // Action handlers
  const handleSave = () => {
    setEstimates((prev) => [current, ...prev.filter((e) => e.id !== current.id)]);
    upsertCustomerWithEstimate(current);
    alert(
      `Saved estimate ${current.estimateNumber || "(pending)"} to this device.`
    );
  };
  const handlePrint = () => typeof window !== "undefined" && window.print();
  const currentQuoteText = () =>
    quoteText(current, {
      landscape: calc.landscape,
      applications: calc.applications,
      hardscape: calc.hardscape,
      maintenance: calc.maintenance,
      seasonal: calc.seasonal,
      subBeforeDiscount: calc.subBeforeDiscount,
      prepayDiscount: calc.prepayDiscount,
      prepayPotential: calc.prepayPotential,
      sub: calc.sub,
      tax: calc.tax,
      total: calc.total,
      monthlyGlobal: calc.monthlyGlobal,
    });
  const handleCopyQuote = () =>
    navigator.clipboard
      .writeText(currentQuoteText())
      .then(
        () => alert("Quote copied to clipboard."),
        () => alert("Could not copy.")
      );
  const handleEmailQuote = () => {
    const subject = encodeURIComponent(
      `Estimate ${current.estimateNumber || ""} — ${
        current.customerName || "Customer"
      }`
    );
    const body = encodeURIComponent(currentQuoteText());
    window.location.href = `mailto:${current.customerEmail || ""}?subject=${subject}&body=${body}`;
  };
  const handleDuplicate = () => {
    const copy: Estimate = {
      ...current,
      id: uid(),
      estimateNumber: nextEstimateNumber(),
      createdAt: Date.now(),
      customerName: (current.customerName || "Customer") + " (Copy)",
    };
    setEstimates((prev) => [copy, ...prev]);
    setCurrent(copy);
    alert(`Duplicated as ${copy.estimateNumber}. You're editing the copy.`);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="mx-auto w-full max-w-md md:max-w-2xl p-4 pb-28">
      {/* Print Letterhead */}
      <PrintOnly>
        <div className="text-sm mb-2 border-b pb-2">
          Josh Swain — JS Land Escapes — 217-572-7257
        </div>
      </PrintOnly>

      {/* Customer */}
      <Section
        title="Customer"
        actions={
          <div className="text-sm text-gray-600">
            Estimate #: <b>{current.estimateNumber || "—"}</b>
          </div>
        }
      >
        {/* full blank line after estimate # on print */}
        <PrintOnly>
          <div className="h-4" />
        </PrintOnly>

        {/* PRINT-ONLY (no duplicate Estimate #) */}
        <PrintOnly>
          <div className="text-sm space-y-1">
            <div>
              <b>Customer:</b> {current.customerName || "—"}
            </div>
            <div>
              <b>Phone:</b> {current.customerPhone || "—"}
            </div>
            <div>
              <b>Email:</b> {current.customerEmail || "—"}
            </div>
            <div>
              <b>Address:</b> {current.address || "—"}
            </div>
          </div>
        </PrintOnly>

        {/* Editable inputs — screen only */}
        <ScreenOnly>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <Input
                placeholder="Customer name"
                list="customer-name-list"
                value={current.customerName}
                onChange={(e) => {
                  const name = e.target.value;
                  let updated = { ...current, customerName: name };
                  const match = getCustomerByName(name);
                  if (
                    match &&
                    (match.name || "").toLowerCase() === name.trim().toLowerCase()
                  ) {
                    updated = {
                      ...updated,
                      customerPhone: match.phone || "",
                      customerEmail: match.email || "",
                      address: match.address || "",
                    };
                  }
                  setCurrent(updated);
                }}
                onBlur={(e) => {
                  const name = e.target.value;
                  const match = getCustomerByName(name);
                  if (
                    match &&
                    (match.name || "").toLowerCase() === name.trim().toLowerCase()
                  ) {
                    setCurrent((cur) => ({
                      ...cur,
                      customerPhone: match.phone || cur.customerPhone || "",
                      customerEmail: match.email || cur.customerEmail || "",
                      address: match.address || cur.address || "",
                    }));
                  }
                }}
              />
              <datalist id="customer-name-list">
                {customerNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </div>

            <Input
              placeholder="Phone"
              value={current.customerPhone}
              onChange={(e) =>
                setCurrent({ ...current, customerPhone: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={current.customerEmail}
              onChange={(e) =>
                setCurrent({ ...current, customerEmail: e.target.value })
              }
            />
            <div className="rounded-xl border">
              <AddressAutocomplete
                value={current.address}
                onPick={(data: any) => {
                  setCurrent({
                    ...current,
                    address: data.formattedAddress || data.address || "",
                  });
                }}
                placeholder="Address"
              />
            </div>
          </div>
        </ScreenOnly>
      </Section>

      {/* Services */}
      <ScreenOnly>
        <Section title="Services">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                "LANDSCAPE",
                "APPLICATIONS",
                "HARDSCAPE",
                "MAINTENANCE",
                "SEASONAL",
              ] as ServiceType[]
            ).map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 border rounded-xl p-2 cursor-pointer"
                title={s === "LANDSCAPE" ? "Mowing & Bed Refurbishing" : s}
              >
                <input
                  type="checkbox"
                  className="size-5 rounded border-gray-300 accent-emerald-600"
                  checked={current.services[s]}
                  onChange={() =>
                    setCurrent({
                      ...current,
                      services: {
                        ...current.services,
                        [s]: !current.services[s],
                      },
                    })
                  }
                />
                <span>
                  {s === "LANDSCAPE" ? "Mowing & Bed Refurbishing" : s}
                </span>
              </label>
            ))}
          </div>
        </Section>
      </ScreenOnly>

      {/* Mowing & Bed Refurbishing */}
      {current.services.LANDSCAPE && (
        <ScreenOnly>
          <Section title="Mowing & Bed Refurbishing">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mowable sqft">
                <Input
                  type="number"
                  value={current.inputs.mowSqft || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: { ...current.inputs, mowSqft: +e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Beds (count)">
                <Input
                  type="number"
                  value={current.inputs.bedCount || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: { ...current.inputs, bedCount: +e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Bed cover">
                <Select
                  value={current.inputs.bedCover || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        bedCover: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="mulch">Mulch</option>
                  <option value="rock">Rock</option>
                  <option value="topsoil">Topsoil</option>
                </Select>
              </Field>
              <Field label="Bed avg depth (in)">
                <Input
                  type="number"
                  value={current.inputs.bedAvgDepthIn || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        bedAvgDepthIn: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Bed sqft total">
                <Input
                  type="number"
                  value={current.inputs.bedSqftTotal || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        bedSqftTotal: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Sod sqft">
                <Input
                  type="number"
                  value={current.inputs.sodSqft || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: { ...current.inputs, sodSqft: +e.target.value },
                    })
                  }
                />
              </Field>
              <Field label="Edging & weed whipping (ft)">
                <Input
                  type="number"
                  value={current.inputs.edgingFt || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: { ...current.inputs, edgingFt: +e.target.value },
                    })
                  }
                />
              </Field>
            </div>

            <Field className="mt-3" label="Yard notes">
              <Textarea
                rows={3}
                placeholder="Trees, tight gates, slope, pets, etc."
                value={current.inputs.yardNotes || ""}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: { ...current.inputs, yardNotes: e.target.value },
                  })
                }
              />
            </Field>
          </Section>
        </ScreenOnly>
      )}

      {/* Applications */}
      {current.services.APPLICATIONS && (
        <ScreenOnly>
          <Section title="Applications">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Applications sqft (blank = use mow sqft)">
                <Input
                  type="number"
                  value={current.inputs.applicationSqft ?? ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        applicationSqft:
                          e.target.value === "" ? undefined : +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                {[
                  ["applyFertilizeLT", "Fertilization"],
                  ["applyWeedLT", "Weed control"],
                  ["applyPestLT", "Pest control"],
                  ["applyDiseaseLT", "Disease control"],
                  ["applyAerationLT", "Aeration"],
                  ["applyOverseedLT", "Overseeding"],
                ].map(([k, label]) => (
                  <Checkbox
                    key={k}
                    label={`${label} (per sqft × apps/year)`}
                    checked={!!(current.inputs as any)[k]}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        inputs: {
                          ...(current.inputs as any),
                          [k]: e.currentTarget.checked,
                        } as any,
                      })
                    }
                  />
                ))}
              </div>
            </div>

            {/* Per-application yearly counts (multiplier) */}
            <div className="mt-4 col-span-2 grid grid-cols-2 gap-2">
              {(
                [
                  {
                    key: "appFertilizeCountMN",
                    label: "Fertilization (applications/year)",
                  },
                  {
                    key: "appWeedCountMN",
                    label: "Weed control (applications/year)",
                  },
                  {
                    key: "appPestCountMN",
                    label: "Pest control (applications/year)",
                  },
                  {
                    key: "appDiseaseCountMN",
                    label: "Disease control (applications/year)",
                  },
                  { key: "appAerationCountMN", label: "Aeration (applications/year)" },
                  {
                    key: "appOverseedCountMN",
                    label: "Overseeding (applications/year)",
                  },
                ] as const
              ).map((a) => (
                <Field key={a.key} row>
                  <span className="text-gray-700">{a.label}</span>
                  <Select
                    className="w-28"
                    value={(current.inputs as any)[a.key] ?? 0}
                    onChange={(e) =>
                      setCurrent({
                        ...current,
                        inputs: {
                          ...current.inputs,
                          [a.key]: +e.target.value as 0 | 1 | 2 | 3 | 4,
                        },
                      })
                    }
                  >
                    <option value={0}>0×</option>
                    <option value={1}>1×</option>
                    <option value={2}>2×</option>
                    <option value={3}>3×</option>
                    <option value={4}>4×</option>
                  </Select>
                </Field>
              ))}
            </div>
          </Section>
        </ScreenOnly>
      )}

      {/* Hardscape */}
      {current.services.HARDSCAPE && (
        <ScreenOnly>
          <Section title="Hardscape">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Patio/Walkway sqft">
                <Input
                  type="number"
                  value={current.inputs.patioSqft || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        patioSqft: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Paver tier">
                <Select
                  value={current.inputs.paverTier || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        paverTier: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="economy">Economy</option>
                  <option value="mid">Mid</option>
                  <option value="premium">Premium</option>
                </Select>
              </Field>
              <Field label="Borders (ft)">
                <Input
                  type="number"
                  value={current.inputs.borderFt || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        borderFt: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Drainage (ft)">
                <Input
                  type="number"
                  value={current.inputs.drainageFt || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        drainageFt: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Steps (count)">
                <Input
                  type="number"
                  value={current.inputs.stepsCount || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        stepsCount: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Lighting (fixtures)">
                <Input
                  type="number"
                  value={current.inputs.lightingCount || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        lightingCount: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Field label="Access">
                <Select
                  value={current.inputs.accessDifficulty || "none"}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        accessDifficulty: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="none">None</option>
                  <option value="moderate">Moderate</option>
                  <option value="steep">Steep/tight</option>
                </Select>
              </Field>
            </div>
          </Section>
        </ScreenOnly>
      )}

      {/* Maintenance */}
      {current.services.MAINTENANCE && (
        <ScreenOnly>
          <Section title="Maintenance (contract)">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Mowable tier">
                <Select
                  value={current.inputs.maintTier || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        maintTier: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="S">S (≤7k sqft)</option>
                  <option value="M">M (7–15k)</option>
                  <option value="L">L (15–30k)</option>
                  <option value="XL">XL (&gt;30k)</option>
                </Select>
              </Field>

              <Field label="Base mowing frequency">
                <Select
                  value={current.inputs.frequencyBase || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        frequencyBase: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>

              <Checkbox
                label="Shrub trimming"
                checked={!!current.inputs.includeTrim}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: {
                      ...current.inputs,
                      includeTrim: e.currentTarget.checked,
                    },
                  })
                }
              />
              <Field label="Trimming frequency">
                <Select
                  value={current.inputs.frequencyTrim || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        frequencyTrim: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>

              <Checkbox
                label="Bed touch-ups"
                checked={!!current.inputs.includeBeds}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: {
                      ...current.inputs,
                      includeBeds: e.currentTarget.checked,
                    },
                  })
                }
              />
              <Field label="Beds frequency">
                <Select
                  value={current.inputs.frequencyBeds || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        frequencyBeds: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>

              <Checkbox
                label="Edging & Weed Whipping"
                checked={!!current.inputs.includeEdge}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: {
                      ...current.inputs,
                      includeEdge: e.currentTarget.checked,
                    },
                  })
                }
              />
              <Field label="Edging/whip frequency">
                <Select
                  value={current.inputs.frequencyEdge || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        frequencyEdge: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </Select>
              </Field>

              {/* Months (used for visit counts and also global monthly split) */}
              <Field label="Contract months (e.g., 8)">
                <Input
                  type="number"
                  value={current.inputs.months || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: { ...current.inputs, months: +e.target.value },
                    })
                  }
                />
              </Field>
            </div>
          </Section>
        </ScreenOnly>
      )}

      {/* Seasonal */}
      {current.services.SEASONAL && (
        <ScreenOnly>
          <Section title="Seasonal Cleanup">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Leaf depth">
                <Select
                  value={current.inputs.leafDepth || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        leafDepth: e.target.value as any,
                      },
                    })
                  }
                >
                  <option value="">—</option>
                  <option value="light">Light</option>
                  <option value="medium">Medium</option>
                  <option value="heavy">Heavy</option>
                </Select>
              </Field>
              <Field label="Clean beds (count)">
                <Input
                  type="number"
                  value={current.inputs.cleanBedsCount || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        cleanBedsCount: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
              <Checkbox
                label="Gutter clean"
                checked={!!current.inputs.gutterClean}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: {
                      ...current.inputs,
                      gutterClean: e.currentTarget.checked,
                    },
                  })
                }
              />
              <Checkbox
                label="Haul away"
                checked={!!current.inputs.haulAway}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: {
                      ...current.inputs,
                      haulAway: e.currentTarget.checked,
                    },
                  })
                }
              />
              <Field label="Limb volume (yd³)">
                <Input
                  type="number"
                  value={current.inputs.limbVolumeYd3 || ""}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      inputs: {
                        ...current.inputs,
                        limbVolumeYd3: +e.target.value,
                      },
                    })
                  }
                />
              </Field>
            </div>
          </Section>
        </ScreenOnly>
      )}

      {/* Totals + Settings */}
      <Section
        title="Totals"
        actions={
          <ScreenOnly>
            <Button
              tone="outline"
              className="text-sm"
              onClick={() => setShowSettings((s) => !s)}
            >
              {showSettings ? "Close Settings" : "Settings"}
            </Button>
          </ScreenOnly>
        }
      >
        {/* Per-service quick totals */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {current.services.LANDSCAPE && (
            <div>
              Mowing &amp; Bed Refurbishing:{" "}
              <b>{moneyLabel(calc.landscape)}</b>
            </div>
          )}
          {current.services.APPLICATIONS && (
            <div>
              Applications: <b>{moneyLabel(calc.applications)}</b>
            </div>
          )}
          {current.services.HARDSCAPE && (
            <div>
              Hardscape: <b>{moneyLabel(calc.hardscape)}</b>
            </div>
          )}
          {current.services.MAINTENANCE && (
            <div>
              Maintenance: <b>{moneyLabel(calc.maintenance)}</b>
            </div>
          )}
          {current.services.SEASONAL && (
            <div>
              Seasonal: <b>{moneyLabel(calc.seasonal)}</b>
            </div>
          )}
        </div>

        {/* GLOBAL Prepay + Monthly controls */}
        <ScreenOnly>
          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <Checkbox
              label="Pay monthly (estimate-wide; splits subtotal by contract months; disables prepay discount)"
              checked={!!current.inputs.monthlyPayments}
              onChange={(e) =>
                setCurrent({
                  ...current,
                  inputs: {
                    ...current.inputs,
                    monthlyPayments: e.currentTarget.checked,
                  },
                })
              }
            />

            <div className="flex items-center gap-2 flex-wrap">
              <span>Contract months:</span>
              <Input
                className="w-24"
                type="number"
                value={current.inputs.months || ""}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: { ...current.inputs, months: +e.target.value },
                  })
                }
              />
              {current.inputs.monthlyPayments && current.inputs.months ? (
                <span>
                  → <b>{moneyLabel(calc.monthlyGlobal.amountPerMonth)}</b> per
                  month (pre-tax)
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span>Prepay discount % (global):</span>
              <Input
                className="w-24"
                type="number"
                value={current.inputs.prepayDiscPct ?? ""}
                onChange={(e) =>
                  setCurrent({
                    ...current,
                    inputs: {
                      ...current.inputs,
                      prepayDiscPct:
                        e.target.value === "" ? undefined : +e.target.value,
                    },
                  })
                }
              />
              {!current.inputs.monthlyPayments && calc.prepayDiscount > 0 ? (
                <span>
                  → saves <b>{moneyLabel(calc.prepayDiscount)}</b>
                </span>
              ) : null}
            </div>
          </div>
        </ScreenOnly>

        {/* Line items header: hide text on print, keep spacer on PDF */}
        <ScreenOnly>
          <div className="text-base font-semibold mb-1">Line items</div>
        </ScreenOnly>
        <PrintOnly>
          <div className="h-4" />
        </PrintOnly>

        {/* Line Items */}
        <div className="mt-1">
          {(() => {
            const groups = buildLineItems(current, PB);
            return groups.length === 0 ? (
              <div className="text-sm text-gray-500">No billable sub-items yet.</div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.title}>
                    <div className="text-sm font-medium">{group.title}</div>
                    <ul className="text-sm pl-4">
                      {group.rows.map((r, idx) => (
                        <li
                          key={group.title + idx}
                          className="flex items-center justify-between"
                        >
                          <span>{r.label}</span>
                          <span>{moneyLabel(r.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Settings panel (hidden on print) */}
        {showSettings && (
          <ScreenOnly>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Labor per hour">
                <Input
                  type="number"
                  step="0.01"
                  value={PB.LABOR_PER_HOUR}
                  onChange={(e) =>
                    setPB({ ...PB, LABOR_PER_HOUR: +e.target.value })
                  }
                />
              </Field>
              <Field label="Mowing productivity (sqft/hr)">
                <Input
                  type="number"
                  step="1"
                  value={PB.MOW_PRODUCTIVITY_SQFT_PER_HR}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      MOW_PRODUCTIVITY_SQFT_PER_HR: +e.target.value,
                    })
                  }
                />
              </Field>

              {/* Materials & per-sqft app rates */}
              <Field label="Mulch per yd³">
                <Input
                  type="number"
                  step="0.01"
                  value={PB.MULCH_PER_YD3}
                  onChange={(e) =>
                    setPB({ ...PB, MULCH_PER_YD3: +e.target.value })
                  }
                />
              </Field>
              <Field label="Rock per yd³">
                <Input
                  type="number"
                  step="0.01"
                  value={PB.ROCK_PER_YD3}
                  onChange={(e) =>
                    setPB({ ...PB, ROCK_PER_YD3: +e.target.value })
                  }
                />
              </Field>
              <Field label="Topsoil per yd³">
                <Input
                  type="number"
                  step="0.01"
                  value={PB.TOPSOIL_PER_YD3}
                  onChange={(e) =>
                    setPB({ ...PB, TOPSOIL_PER_YD3: +e.target.value })
                  }
                />
              </Field>
              <Field label="Sod per sqft">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.SOD_PER_SQFT}
                  onChange={(e) =>
                    setPB({ ...PB, SOD_PER_SQFT: +e.target.value })
                  }
                />
              </Field>
              <Field label="Edging (steel) per ft">
                <Input
                  type="number"
                  step="0.01"
                  value={PB.EDGING_STEEL_PER_FT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      EDGING_STEEL_PER_FT: +e.target.value,
                    })
                  }
                />
              </Field>

              <div className="col-span-2 font-medium mt-2">
                Application rates — per sqft
              </div>
              <Field label="Fertilization">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.APP_FERTILIZATION_PER_SQFT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      APP_FERTILIZATION_PER_SQFT: +e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Weed control">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.APP_WEED_CONTROL_PER_SQFT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      APP_WEED_CONTROL_PER_SQFT: +e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Pest control">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.APP_PEST_CONTROL_PER_SQFT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      APP_PEST_CONTROL_PER_SQFT: +e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Disease control">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.APP_DISEASE_CONTROL_PER_SQFT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      APP_DISEASE_CONTROL_PER_SQFT: +e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Aeration">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.APP_AERATION_PER_SQFT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      APP_AERATION_PER_SQFT: +e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Overseeding">
                <Input
                  type="number"
                  step="0.001"
                  value={PB.APP_OVERSEEDING_PER_SQFT}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      APP_OVERSEEDING_PER_SQFT: +e.target.value,
                    })
                  }
                />
              </Field>

              <Field label="Green waste disposal per yd³">
                <Input
                  type="number"
                  step="0.01"
                  value={PB.DISPOSAL_GREEN_WASTE_PER_YD3}
                  onChange={(e) =>
                    setPB({
                      ...PB,
                      DISPOSAL_GREEN_WASTE_PER_YD3: +e.target.value,
                    })
                  }
                />
              </Field>
              <Field label="Default material margin (0–1)">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={PB.DEFAULT_MARGIN}
                  onChange={(e) =>
                    setPB({ ...PB, DEFAULT_MARGIN: +e.target.value })
                  }
                />
              </Field>
              <Field label="Tax rate (0–1)">
                <Input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={PB.TAX_RATE}
                  onChange={(e) => setPB({ ...PB, TAX_RATE: +e.target.value })}
                />
              </Field>

              <div className="col-span-2 flex gap-2">
                <Button tone="outline" onClick={() => setPB(DEFAULT_PRICE)}>
                  Reset to defaults
                </Button>
                <Button
                  tone="outline"
                  onClick={() => alert("Saved. (Stored on this device)")}
                >
                  Save
                </Button>
              </div>
            </div>
          </ScreenOnly>
        )}

        {/* Actions */}
        <ScreenOnly>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Button onClick={handleSave}>Save Estimate</Button>
            <Button tone="outline" onClick={handlePrint}>
              Print / PDF
            </Button>
            <Button tone="outline" onClick={handleCopyQuote}>
              Copy Quote Text
            </Button>
            <Button tone="outline" onClick={handleEmailQuote}>
              Email Quote
            </Button>
            <Button tone="outline" onClick={handleDuplicate}>
              Duplicate
            </Button>
            <Button tone="outline" onClick={newEstimate}>
              New Estimate
            </Button>
          </div>
        </ScreenOnly>
      </Section>

      {/* Saved Estimates */}
      <ScreenOnly>
        <h2 className="text-lg font-semibold mt-6 mb-2">Saved on this device</h2>
        <div className="space-y-2">
          {estimates.length === 0 && (
            <div className="text-sm text-gray-500">No saved estimates yet.</div>
          )}
          {estimates.map((e) => (
            <div
              key={e.id || e.estimateNumber}
              className="border rounded-2xl p-3 flex items-center justify-between"
            >
              <div className="text-sm">
                <div className="font-medium">
                  {e.estimateNumber || "—"} — {e.customerName || "Unnamed"} —{" "}
                  {e.address || "No address"}
                </div>
                <div className="text-gray-500">
                  {e.createdAt
                    ? new Date(e.createdAt).toLocaleString()
                    : "—"}
                </div>
              </div>
              <div className="flex gap-2">
                <Button tone="outline" onClick={() => setCurrent(e)}>
                  Open
                </Button>
                <Button
                  tone="outline"
                  onClick={() => {
                    setEstimates((prev) => prev.filter((x) => x.id !== e.id));
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScreenOnly>

      {/* Customers DB (read-only preview) */}
      <ScreenOnly>
        <h2 className="text-lg font-semibold mt-6 mb-2">Customers (local)</h2>
        <div className="space-y-2 text-sm">
          {customers.length === 0 && (
            <div className="text-gray-500">No customers yet.</div>
          )}
          {customers.map((c) => (
            <div key={c.id} className="border rounded-2xl p-3">
              <div className="font-medium">{c.name}</div>
              <div className="text-gray-600">
                {c.phone ? `📞 ${c.phone}  ` : ""}
                {c.email ? `📧 ${c.email}  ` : ""}
                {c.address ? `📍 ${c.address}` : ""}
              </div>
              <div className="mt-1">
                <div className="text-gray-700">
                  App sqft: <b>{c.applicationSqft ?? 0}</b> • Mowable sqft:{" "}
                  <b>{c.mowSqft ?? 0}</b> • Edging (ft):{" "}
                  <b>{c.edgingFt ?? 0}</b> • Mowable tier:{" "}
                  <b>{c.maintTier || "—"}</b>
                </div>
                <div className="mt-1">
                  Estimates: {c.estimates.map((s) => s.estimateNumber).join(", ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScreenOnly>

      {/* === FINAL SUMMARY (always at bottom; shows on print) === */}
      <Section title="Summary">
        <div className="text-sm space-y-1">
          {/* Hide Estimate # in Summary on print; keep visible on screen */}
          <ScreenOnly>
            <div>
              Estimate #: <b>{current.estimateNumber || "—"}</b>
              {/* full blank line after estimate # (screen only) */}
              <div className="h-4" />
            </div>
          </ScreenOnly>

          {/* Totals moved to the very bottom, including global prepay/discount */}
          <div>
            Subtotal (before discount):{" "}
            <b>{moneyLabel(calc.subBeforeDiscount)}</b>
          </div>
          {calc.prepayDiscount > 0 && !current.inputs.monthlyPayments && (
            <div>
              Prepay discount: <b>-{moneyLabel(calc.prepayDiscount)}</b>
            </div>
          )}
          <div>
            Subtotal: <b>{moneyLabel(calc.sub)}</b>
          </div>
          <div>
            Tax: <b>{moneyLabel(calc.tax)}</b>
          </div>
          <div>
            Total: <b>{moneyLabel(calc.total)}</b>
          </div>

          {calc.monthlyGlobal.enabled && (
            <>
              {/* full blank line after monthly note */}
              <div className="h-4" />
              <div>
                Monthly payments (estimate-wide): {calc.monthlyGlobal.months} months @{" "}
                <b>{moneyLabel(calc.monthlyGlobal.amountPerMonth)}</b> each
                (pre-tax).
              </div>
              {/* Show potential prepay savings on PDF (and screen) even when monthly is ON */}
              {calc.prepayPotential > 0 && (
                <div>
                  Prepay savings (if paid upfront):{" "}
                  <b>{moneyLabel(calc.prepayPotential)}</b>.
                </div>
              )}
            </>
          )}
        </div>
      </Section>

      {/* Sticky bottom bar (mobile), print-safe */}
      <ScreenOnly>
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 p-3">
          <div className="mx-auto flex w-full max-w-md md:max-w-2xl gap-2">
            <Button tone="outline" onClick={handleDuplicate}>
              Duplicate
            </Button>
            <Button tone="outline" onClick={handleCopyQuote}>
              Copy Quote
            </Button>
            <Button tone="outline" onClick={handlePrint}>
              Print
            </Button>
            <Button tone="primary" className="ml-auto" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </ScreenOnly>

      <div className="h-24" />
    </main>
  );
}

