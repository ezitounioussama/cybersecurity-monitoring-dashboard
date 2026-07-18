import { Skeleton } from "@/components/ui/skeleton";

const keys = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix}-${i}`);

/** Table skeleton used inside Suspense/loading.tsx boundaries. */
export function TableLoadingState({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="rounded-xl border">
        <Skeleton className="h-11 w-full rounded-b-none" />
        <div className="divide-y">
          {keys("row", rows).map((key) => (
            <div key={key} className="flex items-center gap-4 p-4">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CardsLoadingState({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {keys("card", count).map((key) => (
        <Skeleton key={key} className="h-28 rounded-xl" />
      ))}
    </div>
  );
}
