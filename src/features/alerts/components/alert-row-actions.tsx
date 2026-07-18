"use client";

import {
  IconChecks,
  IconCircleCheck,
  IconDotsVertical,
  IconEye,
  IconTrash,
  IconXboxX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAlert, updateAlertStatus } from "@/actions/alert.actions";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AlertStatus } from "@/generated/prisma/enums";
import type { AlertWithAsset } from "@/types/alert";

type Props = { alert: AlertWithAsset; canUpdate: boolean; canDelete: boolean };

export function AlertRowActions({ alert, canUpdate, canDelete }: Props) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: AlertStatus, label: string) {
    startTransition(async () => {
      const res = await updateAlertStatus(alert.id, status);
      res.success ? toast.success(label) : toast.error(res.error.message);
    });
  }

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await deleteAlert(alert.id);
        res.success
          ? toast.success("Alert deleted")
          : toast.error(res.error.message);
        resolve();
      });
    });
  }

  return (
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
        <DropdownMenuItem asChild>
          <Link href={`/alerts/${alert.id}`}>
            <IconEye className="size-4" /> View details
          </Link>
        </DropdownMenuItem>
        {canUpdate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setStatus("ACKNOWLEDGED", "Alert acknowledged")}
            >
              <IconChecks className="size-4" /> Acknowledge
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatus("RESOLVED", "Alert resolved")}
            >
              <IconCircleCheck className="size-4" /> Resolve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                setStatus("FALSE_POSITIVE", "Marked as false positive")
              }
            >
              <IconXboxX className="size-4" /> False positive
            </DropdownMenuItem>
          </>
        )}
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DeleteDialog
              entityLabel="Alert"
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
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
