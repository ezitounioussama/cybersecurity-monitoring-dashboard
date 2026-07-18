import { cn } from "@/lib/utils";

function band(score: number) {
  if (score >= 9) return "bg-red-500/15 text-red-600 dark:text-red-400";
  if (score >= 7)
    return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
  if (score >= 4) return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
  return "bg-sky-500/15 text-sky-600 dark:text-sky-400";
}

/** Color-coded CVSS score pill (design.md §6.5). */
export function CvssScore({ score }: { score: number }) {
  return (
    <span
      className={cn(
        "inline-flex min-w-11 items-center justify-center rounded-md px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
        band(score),
      )}
    >
      {score.toFixed(1)}
    </span>
  );
}
