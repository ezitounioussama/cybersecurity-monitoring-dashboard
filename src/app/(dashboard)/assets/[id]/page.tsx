import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CriticalityBadge,
  SeverityBadge,
} from "@/components/shared/severity-badge";
import {
  AlertStatusBadge,
  AssetStatusBadge,
  PatchStatusBadge,
} from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import { formatDate, formatRelative } from "@/lib/format";
import { assetService } from "@/services/asset.service";
import type { AssetDetail } from "@/types/asset";

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

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAuthContext();

  let asset: AssetDetail;
  try {
    asset = await assetService.getById(ctx, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="-ml-2 h-8 text-muted-foreground"
        >
          <Link href="/assets">
            <IconArrowLeft className="size-4" /> Back to assets
          </Link>
        </Button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {asset.hostname}
          </h1>
          <CriticalityBadge value={asset.criticality} />
          <AssetStatusBadge value={asset.status} />
        </div>
        <p className="font-mono text-sm text-muted-foreground">
          {asset.ipAddress}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Field label="Operating system">{asset.operatingSystem}</Field>
            <Field label="Owner">{asset.owner?.name ?? "Unassigned"}</Field>
            <Field label="Last scan">
              {asset.lastScanAt ? formatDate(asset.lastScanAt) : "Never"}
            </Field>
            <Field label="Registered">{formatDate(asset.createdAt)}</Field>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Vulnerabilities ({asset.vulnerabilities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {asset.vulnerabilities.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No known vulnerabilities.
              </p>
            ) : (
              asset.vulnerabilities.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-medium">{v.cve}</p>
                    <p className="text-xs text-muted-foreground">
                      CVSS {v.cvssScore.toFixed(1)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <SeverityBadge value={v.severity} />
                    <PatchStatusBadge value={v.patchStatus} />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Recent alerts ({asset.alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {asset.alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No alerts for this asset.
              </p>
            ) : (
              asset.alerts.map((a) => (
                <Link
                  key={a.id}
                  href={`/alerts/${a.id}`}
                  className="flex items-center justify-between gap-2 rounded-lg border p-3 hover:bg-accent/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatRelative(a.detectedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <SeverityBadge value={a.severity} />
                    <AlertStatusBadge value={a.status} />
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
