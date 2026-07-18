import { Skeleton } from "@/components/ui/skeleton";

const STAT_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6"];
const CHART_KEYS = ["c1", "c2", "c3"];

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_KEYS.map((key) => (
          <Skeleton key={key} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {CHART_KEYS.map((key) => (
          <Skeleton key={key} className="h-80 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
