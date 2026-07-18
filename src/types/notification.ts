import type { NotificationType } from "@/generated/prisma/enums";

/** Wire-format notification (dates serialized to ISO strings for the client). */
export type NotificationDTO = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
  createdAt: string;
};
