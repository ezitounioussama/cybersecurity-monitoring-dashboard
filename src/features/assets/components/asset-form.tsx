"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createAsset, updateAsset } from "@/actions/asset.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AssetCriticality, AssetStatus } from "@/generated/prisma/enums";
import { assetFormSchema, type AssetFormValues } from "@/schemas/asset.schema";
import { humanize } from "@/lib/format";
import type { AssetRow } from "@/types/asset";

const UNASSIGNED = "__none__";

type Props = {
  trigger: ReactNode;
  ownerOptions: { id: string; name: string }[];
  asset?: AssetRow;
};

export function AssetFormSheet({ trigger, ownerOptions, asset }: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(asset);
  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      hostname: asset?.hostname ?? "",
      ipAddress: asset?.ipAddress ?? "",
      operatingSystem: asset?.operatingSystem ?? "",
      criticality: asset?.criticality ?? "MEDIUM",
      status: asset?.status ?? "ACTIVE",
      ownerId: asset?.owner?.id ?? "",
    },
  });

  async function onSubmit(values: AssetFormValues) {
    const payload = {
      ...values,
      ownerId: values.ownerId === UNASSIGNED ? "" : values.ownerId,
    };
    const res = isEdit
      ? await updateAsset(asset!.id, payload)
      : await createAsset(payload);
    if (res.success) {
      toast.success(isEdit ? "Asset updated" : "Asset created");
      if (!isEdit) form.reset();
      setOpen(false);
    } else {
      toast.error(res.error.message);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit asset" : "Add asset"}</SheetTitle>
          <SheetDescription>
            {isEdit ? "Update this asset's details." : "Register a new asset in the inventory."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 px-4">
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hostname</FormLabel>
                  <FormControl><Input placeholder="web-prod-01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP address</FormLabel>
                    <FormControl><Input placeholder="10.0.1.20" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operatingSystem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating system</FormLabel>
                    <FormControl><Input placeholder="Ubuntu 22.04" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="criticality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Criticality</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(AssetCriticality).map((v) => (
                          <SelectItem key={v} value={v}>{humanize(v)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                      <SelectContent>
                        {Object.values(AssetStatus).map((v) => (
                          <SelectItem key={v} value={v}>{humanize(v)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="ownerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || UNASSIGNED}
                  >
                    <FormControl><SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                      {ownerOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add asset"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
