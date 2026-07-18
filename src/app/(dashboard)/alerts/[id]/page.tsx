import { IconArrowLeft, IconExternalLink } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SeverityBadge } from "@/components/shared/severity-badge";
import {
  AlertStatusBadge,
  IncidentStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { alertService } from "@/services/alert.service";
import type { AlertDetail } from "@/types/alert";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();

  let alert: AlertDetail;
  try {
    alert = await alertService.getById(ctx, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="-ml-2 h-8 text-muted-foreground"
          >
            <Link href="/alerts">
              <IconArrowLeft className="size-4" /> Back to alerts
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {alert.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge value={alert.severity} />
            <AlertStatusBadge value={alert.status} />
            <span className="text-sm text-muted-foreground">
              Detected {formatDateTime(alert.detectedAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-5">
            <p className="text-sm text-muted-foreground">{alert.description}</p>
            <dl className="grid grid-cols-2 gap-5 sm:grid-cols-3">
              <Field label="Source">{alert.source}</Field>
              <Field label="Rule">
                <span className="font-mono text-xs">{alert.rule}</span>
              </Field>
              <Field label="Source IP">
                <span className="font-mono text-xs">
                  {alert.sourceIp ?? "—"}
                </span>
              </Field>
              <Field label="Destination IP">
                <span className="font-mono text-xs">
                  {alert.destinationIp ?? "—"}
                </span>
              </Field>
              <Field label="Destination asset">
                {alert.destinationAsset?.hostname ?? "—"}
              </Field>
              <Field label="Resolved">
                {alert.resolvedAt ? formatDateTime(alert.resolvedAt) : "—"}
              </Field>
            </dl>
            {alert.rawLog && (
              <div className="space-y-1.5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Raw log
                </p>
                <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs">
                  {alert.rawLog}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Linked incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alert.incidentAlerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No linked incidents.
              </p>
            ) : (
              alert.incidentAlerts.map(({ incident }) => (
                <Link
                  key={incident.id}
                  href={`/incidents/${incident.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 text-sm hover:bg-accent/50"
                >
                  <span className="truncate font-medium">{incident.title}</span>
                  <span className="flex shrink-0 items-center gap-2">
                    <IncidentStatusBadge value={incident.status} />
                    <IconExternalLink className="size-3.5 text-muted-foreground" />
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
