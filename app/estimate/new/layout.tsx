import Link from "next/link";
import { baseSteps, stepPath } from "@/app/(app)/estimate/steps";

export default function NewEstimateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center gap-4 overflow-x-auto">
        {baseSteps.map((s, i) => (
          <Link key={s.slug} href={stepPath(s.slug)} className="flex items-center gap-2 group shrink-0">
            <span className="inline-flex h-8 w-8 rounded-full border items-center justify-center text-sm font-medium group-hover:bg-gray-100">
              {i + 1}
            </span>
            <span className="text-sm">{s.label}</span>
            {i < baseSteps.length - 1 && <span className="mx-2 opacity-40">›</span>}
          </Link>
        ))}
      </header>
      <main>{children}</main>
    </div>
  );
}
