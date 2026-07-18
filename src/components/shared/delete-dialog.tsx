"use client";

import type { ReactNode } from "react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

type DeleteDialogProps = {
  trigger: ReactNode;
  entityLabel: string;
  onConfirm: () => Promise<void> | void;
};

/** Destructive-action wrapper — no delete happens without confirmation. */
export function DeleteDialog({
  trigger,
  entityLabel,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      trigger={trigger}
      title={`Delete ${entityLabel}?`}
      description={`This will remove the ${entityLabel.toLowerCase()}. This action cannot be undone.`}
      confirmLabel="Delete"
      destructive
      onConfirm={onConfirm}
    />
  );
}
