import { format, formatDistanceToNow } from "date-fns";

export function formatDateTime(value: Date | string): string {
  return format(new Date(value), "MMM d, yyyy · HH:mm");
}

export function formatDate(value: Date | string): string {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatRelative(value: Date | string): string {
  return formatDistanceToNow(new Date(value), { addSuffix: true });
}

/** Human-readable label for SCREAMING_SNAKE enum values. */
export function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
