"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationDTO } from "@/types/notification";

type RecentResponse = { items: NotificationDTO[]; unreadCount: number };

async function fetchRecent(): Promise<RecentResponse> {
  const res = await fetch("/api/notifications?scope=recent");
  if (!res.ok) throw new Error("Failed to load notifications");
  const json = await res.json();
  return json.data as RecentResponse;
}

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: fetchRecent,
    refetchInterval: 30_000,
    retry: false,
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return {
    items: query.data?.items ?? [],
    unreadCount: query.data?.unreadCount ?? 0,
    isLoading: query.isLoading,
    markAllRead,
  };
}
