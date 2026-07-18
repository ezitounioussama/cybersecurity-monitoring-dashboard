import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative, initials } from "@/lib/format";
import type { IncidentDetail } from "@/types/incident";

export function IncidentTimeline({ activities }: { activities: IncidentDetail["activities"] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>;
  }

  return (
    <ol className="relative space-y-5 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-border">
      {activities.map((activity) => (
        <li key={activity.id} className="relative flex gap-3">
          <Avatar className="size-8 ring-4 ring-background">
            <AvatarImage src={activity.user.avatarUrl ?? undefined} alt={activity.user.name} />
            <AvatarFallback className="text-[10px]">{initials(activity.user.name)}</AvatarFallback>
          </Avatar>
          <div className="pt-1">
            <p className="text-sm">
              <span className="font-medium">{activity.user.name}</span>{" "}
              <span className="text-muted-foreground">{activity.action}</span>
            </p>
            <p className="text-xs text-muted-foreground">{formatRelative(activity.createdAt)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
