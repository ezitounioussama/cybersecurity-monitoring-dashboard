"use client";

import { IconCircleCheck, IconTrash } from "@tabler/icons-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAlert, updateAlertStatus } from "@/actions/alert.actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { AlertWithAsset } from "@/types/alert";

type Props = {
  rows: AlertWithAsset[];
  clear: () => void;
  canUpdate: boolean;
  canDelete: boolean;
};

export function AlertBulkActions({ rows, clear, canUpdate, canDelete }: Props) {
  const [pending, startTransition] = useTransition();
  const ids = rows.map((r) => r.id);

  function bulkResolve() {
    startTransition(async () => {
      const results = await Promise.all(
        ids.map((id) => updateAlertStatus(id, "RESOLVED")),
      );
      const failed = results.filter((r) => !r.success).length;
      failed
        ? toast.error(`${failed} could not be resolved`)
        : toast.success(`${ids.length} resolved`);
      clear();
    });
  }

  function bulkDelete() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await Promise.all(ids.map((id) => deleteAlert(id)));
        toast.success(`${ids.length} deleted`);
        clear();
        resolve();
      });
    });
  }

  return (
    <div className="flex items-center gap-2">
      {canUpdate && (
        <Button
          variant="outline"
          size="sm"
          className="h-9"
          disabled={pending}
          onClick={bulkResolve}
        >
          <IconCircleCheck className="size-4" /> Resolve ({ids.length})
        </Button>
      )}
      {canDelete && (
        <ConfirmDialog
          title={`Delete ${ids.length} alerts?`}
          description="This will remove the selected alerts. This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={bulkDelete}
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-destructive"
              disabled={pending}
            >
              <IconTrash className="size-4" /> Delete ({ids.length})
            </Button>
          }
        />
      )}
    </div>
  );
}
