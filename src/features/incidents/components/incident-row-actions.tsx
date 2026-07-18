"use client";

import { IconDotsVertical, IconEdit, IconEye, IconTrash } from "@tabler/icons-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteIncident } from "@/actions/incident.actions";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IncidentFormSheet } from "@/features/incidents/components/incident-form";
import type { AnalystOption, IncidentRow } from "@/types/incident";

type Props = {
  incident: IncidentRow;
  analystOptions: AnalystOption[];
  canUpdate: boolean;
  canDelete: boolean;
};

export function IncidentRowActions({ incident, analystOptions, canUpdate, canDelete }: Props) {
  const [pending, startTransition] = useTransition();

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await deleteIncident(incident.id);
        res.success ? toast.success("Incident deleted") : toast.error(res.error.message);
        resolve();
      });
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8" disabled={pending}>
          <IconDotsVertical className="size-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/incidents/${incident.id}`}>
            <IconEye className="size-4" /> View details
          </Link>
        </DropdownMenuItem>
        {canUpdate && (
          <>
            <DropdownMenuSeparator />
            <IncidentFormSheet
              incident={incident}
              analystOptions={analystOptions}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <IconEdit className="size-4" /> Edit
                </DropdownMenuItem>
              }
            />
          </>
        )}
        {canDelete && (
          <DeleteDialog
            entityLabel="Incident"
            onConfirm={remove}
            trigger={
              <DropdownMenuItem variant="destructive" onSelect={(e) => e.preventDefault()}>
                <IconTrash className="size-4" /> Delete
              </DropdownMenuItem>
            }
          />
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
