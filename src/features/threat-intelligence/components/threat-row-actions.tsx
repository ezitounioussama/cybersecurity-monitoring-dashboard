"use client";

import { IconDotsVertical, IconPencil, IconTrash } from "@tabler/icons-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteThreat } from "@/actions/threat.actions";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThreatFormSheet } from "@/features/threat-intelligence/components/threat-form";
import type { ThreatFeedRow } from "@/types/threat";

type Props = { threat: ThreatFeedRow; canUpdate: boolean; canDelete: boolean };

export function ThreatRowActions({ threat, canUpdate, canDelete }: Props) {
  const [pending, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await deleteThreat(threat.id);
        res.success
          ? toast.success("Threat deleted")
          : toast.error(res.error.message);
        resolve();
      });
    });
  }

  if (!canUpdate && !canDelete) return null;

  return (
    <>
      {canUpdate && (
        <ThreatFormSheet
          threat={threat}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            disabled={pending}
          >
            <IconDotsVertical className="size-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {canUpdate && (
            <DropdownMenuItem onClick={() => setEditOpen(true)}>
              <IconPencil className="size-4" /> Edit
            </DropdownMenuItem>
          )}
          {canUpdate && canDelete && <DropdownMenuSeparator />}
          {canDelete && (
            <DeleteDialog
              entityLabel="Threat"
              onConfirm={remove}
              trigger={
                <DropdownMenuItem
                  variant="destructive"
                  onSelect={(e) => e.preventDefault()}
                >
                  <IconTrash className="size-4" /> Delete
                </DropdownMenuItem>
              }
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
