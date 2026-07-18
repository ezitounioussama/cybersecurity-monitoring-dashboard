import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncidentLinkedAlerts } from "@/features/incidents/components/incident-linked-alerts";
import { IncidentStatusSelect } from "@/features/incidents/components/incident-status-select";
import { IncidentTimeline } from "@/features/incidents/components/incident-timeline";
import { getAuthContext } from "@/lib/auth";
import { formatDateTime, initials } from "@/lib/format";
import { alertService } from "@/services/alert.service";
import { can } from "@/services/authorization.service";
import { incidentService } from "@/services/incident.service";
import type { IncidentDetail } from "@/types/incident";

export default async function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();

  let incident: IncidentDetail;
  try {
    incident = await incidentService.getById(ctx, id);
  } catch {
    notFound();
  }

  const canUpdate = can(ctx.role, "incident:update");
  const alertOptions = canUpdate
    ? (await alertService.options(ctx)).map((a) => ({ id: a.id, title: a.title }))
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground">
            <Link href="/incidents"><IconArrowLeft className="size-4" /> Back to incidents</Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{incident.title}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge value={incident.severity} />
            <span className="text-sm text-muted-foreground">
              Opened {formatDateTime(incident.createdAt)}
            </span>
          </div>
        </div>
        <IncidentStatusSelect incidentId={incident.id} status={incident.status} canUpdate={canUpdate} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Linked Alerts ({incident.incidentAlerts.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidence ({incident.evidenceUrls.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">{incident.description}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Assignee</CardTitle></CardHeader>
              <CardContent>
                {incident.assignedAnalyst ? (
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                      <AvatarImage src={incident.assignedAnalyst.avatarUrl ?? undefined} alt={incident.assignedAnalyst.name} />
                      <AvatarFallback>{initials(incident.assignedAnalyst.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{incident.assignedAnalyst.name}</p>
                      <p className="text-xs text-muted-foreground">{incident.assignedAnalyst.email}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <IncidentLinkedAlerts
                incidentId={incident.id}
                linked={incident.incidentAlerts}
                alertOptions={alertOptions}
                canUpdate={canUpdate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <IncidentTimeline activities={incident.activities} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evidence" className="mt-4">
          <Card>
            <CardContent className="space-y-2 pt-6">
              {incident.evidenceUrls.length === 0 ? (
                <p className="text-sm text-muted-foreground">No evidence attached.</p>
              ) : (
                incident.evidenceUrls.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:bg-accent/50"
                  >
                    <IconExternalLink className="size-4 shrink-0 text-muted-foreground" />
                    <span className="truncate font-mono text-xs">{url}</span>
                  </a>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
