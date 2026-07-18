import { IconSettings } from "@tabler/icons-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Separator } from "@/components/ui/separator";
import { NotificationPreferences } from "@/features/settings/components/notification-preferences";
import { OrgProfileForm } from "@/features/settings/components/org-profile-form";
import { ThemePreference } from "@/features/settings/components/theme-preference";
import { getAuthContext } from "@/lib/auth";
import { organizationRepository } from "@/repositories/organization.repository";
import { can } from "@/services/authorization.service";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const ctx = await getAuthContext();
  const org = await organizationRepository.findById(ctx.organizationId);
  if (!org) notFound();

  const canManage = can(ctx.role, "settings:manage");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your organization and personal preferences."
        icon={<IconSettings className="size-5" />}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Organization</h2>
          <p className="text-sm text-muted-foreground">
            {canManage
              ? "Admin-only settings that apply across your organization."
              : "Read-only — only administrators can change these settings."}
          </p>
        </div>
        <OrgProfileForm
          canManage={canManage}
          org={{ name: org.name, slug: org.slug, plan: org.plan }}
        />
      </section>

      <Separator />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Preferences</h2>
          <p className="text-sm text-muted-foreground">
            Personal settings that apply only to your account.
          </p>
        </div>
        <ThemePreference />
        <NotificationPreferences />
      </section>
    </div>
  );
}
