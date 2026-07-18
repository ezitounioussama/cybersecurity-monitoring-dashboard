"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { updateIncidentStatus } from "@/actions/incident.actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IncidentStatus } from "@/generated/prisma/enums";
import { humanize } from "@/lib/format";

type Props = {
  incidentId: string;
  status: IncidentStatus;
  canUpdate: boolean;
};

export function IncidentStatusSelect({ incidentId, status, canUpdate }: Props) {
  const [pending, startTransition] = useTransition();

  function onChange(value: string) {
    startTransition(async () => {
      const res = await updateIncidentStatus(incidentId, value as IncidentStatus);
      res.success ? toast.success("Status updated") : toast.error(res.error.message);
    });
  }

  return (
    <Select value={status} onValueChange={onChange} disabled={!canUpdate || pending}>
      <SelectTrigger size="sm" className="w-44">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.values(IncidentStatus).map((v) => (
          <SelectItem key={v} value={v}>{humanize(v)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
