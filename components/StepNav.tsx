"use client";
import { useRouter, usePathname } from "next/navigation";
import { nextOf, prevOf, steps, stepPath } from "@/app/(app)/estimate/steps";

export default function StepNav({ canContinue=true }: { canContinue?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const current = steps.find(s => pathname?.endsWith(s.slug))?.slug;
  const next = current && nextOf(current);
  const prev = current && prevOf(current);

  return (
    <div className="mt-8 flex justify-between">
      <button
        onClick={() => prev && router.push(stepPath(prev))}
        disabled={!prev}
        className="px-4 py-2 rounded-xl border disabled:opacity-50"
      >Back</button>

      <button
        onClick={() => next && canContinue && router.push(stepPath(next))}
        disabled={!next || !canContinue}
        className="px-4 py-2 rounded-xl border disabled:opacity-50"
      >Next</button>
    </div>
  );
}
