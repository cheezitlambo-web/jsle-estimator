export const steps = [
  { slug: "customers", label: "Customer" },
  { slug: "billing",   label: "Billing"  },
  { slug: "services",  label: "Services" },
  { slug: "review",    label: "Review"   },
] as const;

export const stepPath = (slug: string) => `/estimate/new/${slug}`;
export const nextOf  = (slug: string) => steps[steps.findIndex(s => s.slug === slug) + 1]?.slug;
export const prevOf  = (slug: string) => steps[steps.findIndex(s => s.slug === slug) - 1]?.slug;

