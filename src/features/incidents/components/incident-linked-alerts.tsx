"use client";

import { IconExternalLink, IconPlus, IconUnlink } from "@tabler/icons-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { linkAlertToIncident, unlinkAlertFromIncident } from "@/actions/incident.actions";
import { SeverityBadge } from "@/components/shared/severity-badge";
import { AlertStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IncidentDetail } from "@/types/incident";

type AlertOption = { id: string; title: string };

type Props = {
  incidentId: string;
  linked: IncidentDetail["incidentAlerts"];
  alertOptions: AlertOption[];
  canUpdate: boolean;
};

export function IncidentLinkedAlerts({ incidentId, linked, alertOptions, canUpdate }: Props) {
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState("");
  const linkedIds = useMemo(() => new Set(linked.map((l) => l.alert.id)), [linked]);
  const available = alertOptions.filter((a) => !linkedIds.has(a.id));

  function link() {
    if (!selected) return;
    startTransition(async () => {
      const res = await linkAlertToIncident(incidentId, selected);
      res.success ? toast.success("Alert linked") : toast.error(res.error.message);
      setSelected("");
    });
  }

  function unlink(alertId: string) {
    startTransition(async () => {
      const res = await unlinkAlertFromIncident(incidentId, alertId);
      res.success ? toast.success("Alert unlinked") : toast.error(res.error.message);
    });
  }

  return (
    <div className="space-y-4">
      {canUpdate && available.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Link an existing alert…" />
            </SelectTrigger>
            <SelectContent>
              {available.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={link} disabled={!selected || pending}>
            <IconPlus className="size-4" /> Link
          </Button>
        </div>
      )}

      {linked.length === 0 ? (
        <p className="text-sm text-muted-foreground">No alerts linked to this incident.</p>
      ) : (
        <ul className="space-y-2">
          {linked.map(({ alert }) => (
            <li key={alert.id} className="flex items-center justify-between gap-2 rounded-lg border p-3">
              <Link href={`/alerts/${alert.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                <span className="truncate text-sm font-medium">{alert.title}</span>
                <IconExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
              </Link>
              <div className="flex shrink-0 items-center gap-2">
                <SeverityBadge value={alert.severity} />
                <AlertStatusBadge value={alert.status} />
                {canUpdate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground"
                    disabled={pending}
                    onClick={() => unlink(alert.id)}
                  >
                    <IconUnlink className="size-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
