"use client";

import {
  IconDotsVertical,
  IconEdit,
  IconEye,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAsset } from "@/actions/asset.actions";
import { DeleteDialog } from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AssetFormSheet } from "@/features/assets/components/asset-form";
import type { AssetRow } from "@/types/asset";

type Props = {
  asset: AssetRow;
  ownerOptions: { id: string; name: string }[];
  canManage: boolean;
};

export function AssetRowActions({ asset, ownerOptions, canManage }: Props) {
  const [pending, startTransition] = useTransition();

  function remove() {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await deleteAsset(asset.id);
        res.success
          ? toast.success("Asset deleted")
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
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href={`/assets/${asset.id}`}>
            <IconEye className="size-4" /> View details
          </Link>
        </DropdownMenuItem>
        {canManage && (
          <>
            <DropdownMenuSeparator />
            <AssetFormSheet
              asset={asset}
              ownerOptions={ownerOptions}
              trigger={
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <IconEdit className="size-4" /> Edit
                </DropdownMenuItem>
              }
            />
            <DeleteDialog
              entityLabel="Asset"
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
