import {
  IconAlertTriangle,
  IconBell,
  IconBug,
  IconFileText,
  IconLayoutDashboard,
  IconRadar2,
  IconServer2,
  IconSettings,
  IconShieldBolt,
  IconUsers,
  type Icon,
} from "@tabler/icons-react";
import type { Role } from "@/generated/prisma/enums";

export type NavItem = {
  label: string;
  href: string;
  icon: Icon;
  /** Roles allowed to see this item. Omit → visible to all authenticated roles. */
  roles?: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: IconLayoutDashboard },
  { label: "Alerts", href: "/alerts", icon: IconAlertTriangle },
  { label: "Incidents", href: "/incidents", icon: IconShieldBolt },
  { label: "Assets", href: "/assets", icon: IconServer2 },
  { label: "Vulnerabilities", href: "/vulnerabilities", icon: IconBug },
  { label: "Threat Intelligence", href: "/threat-intelligence", icon: IconRadar2 },
  {
    label: "Audit Logs",
    href: "/audit-logs",
    icon: IconFileText,
    roles: ["ADMIN", "ANALYST"],
  },
  { label: "Notifications", href: "/notifications", icon: IconBell },
  { label: "Users", href: "/users", icon: IconUsers, roles: ["ADMIN"] },
  { label: "Settings", href: "/settings", icon: IconSettings },
];

export function visibleNavItems(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(role));
}
