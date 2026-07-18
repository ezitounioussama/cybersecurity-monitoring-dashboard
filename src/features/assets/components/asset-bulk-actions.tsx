"use client";

import { IconTrash } from "@tabler/icons-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAsset } from "@/actions/asset.actions";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { AssetRow } from "@/types/asset";

export function AssetBulkActions({
  rows,
  clear,
}: {
  rows: AssetRow[];
  clear: () => void;
}) {
  const [pending, startTransition] = useTransition();
  const ids = rows.map((r) => r.id);

  function bulkDelete() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        await Promise.all(ids.map((id) => deleteAsset(id)));
        toast.success(`${ids.length} deleted`);
        clear();
        resolve();
      });
    });
  }

  return (
    <ConfirmDialog
      title={`Delete ${ids.length} assets?`}
      description="This will remove the selected assets. This action cannot be undone."
      confirmLabel="Delete"
      destructive
      onConfirm={bulkDelete}
      trigger={
        <Button variant="outline" size="sm" className="h-9 text-destructive" disabled={pending}>
          <IconTrash className="size-4" /> Delete ({ids.length})
        </Button>
      }
    />
  );
}
