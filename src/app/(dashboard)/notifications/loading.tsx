import { Skeleton } from "@/components/ui/skeleton";

const ROW_KEYS = ["n1", "n2", "n3", "n4", "n5", "n6"];

export default function Loading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="divide-y rounded-xl border">
        {ROW_KEYS.map((key) => (
          <div key={key} className="flex items-start gap-3 p-4">
            <Skeleton className="size-9 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
