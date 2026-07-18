"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconPlus } from "@tabler/icons-react";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createThreat, updateThreat } from "@/actions/threat.actions";
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
import { IocType, ThreatConfidence, ThreatStatus } from "@/generated/prisma/enums";
import { humanize } from "@/lib/format";
import { threatFormSchema, type ThreatFormValues } from "@/schemas/threat.schema";
import type { ThreatFeedRow } from "@/types/threat";

type Props = {
  threat?: ThreatFeedRow;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function toDefaults(threat?: ThreatFeedRow): ThreatFormValues {
  return {
    ioc: threat?.ioc ?? "",
    iocType: threat?.iocType ?? "IP",
    ipAddress: threat?.ipAddress ?? "",
    domain: threat?.domain ?? "",
    hash: threat?.hash ?? "",
    source: threat?.source ?? "",
    confidence: threat?.confidence ?? "MEDIUM",
    status: threat?.status ?? "ACTIVE",
  };
}

export function ThreatFormSheet({ threat, trigger, open, onOpenChange }: Props) {
  const isEdit = Boolean(threat);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const sheetOpen = isControlled ? open : internalOpen;
  const setSheetOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<ThreatFormValues>({
    resolver: zodResolver(threatFormSchema),
    defaultValues: toDefaults(threat),
  });

  async function onSubmit(values: ThreatFormValues) {
    const res = isEdit
      ? await updateThreat(threat!.id, values)
      : await createThreat(values);
    if (res.success) {
      toast.success(isEdit ? "Threat updated" : "Threat added");
      if (!isEdit) form.reset(toDefaults());
      setSheetOpen(false);
    } else {
      toast.error(res.error.message);
    }
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      {trigger ? (
        <SheetTrigger asChild>{trigger}</SheetTrigger>
      ) : (
        !isControlled && (
          <SheetTrigger asChild>
            <Button size="sm">
              <IconPlus className="size-4" /> Add IOC
            </Button>
          </SheetTrigger>
        )
      )}
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit IOC" : "Add IOC"}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Update this threat intelligence indicator."
              : "Add a new indicator of compromise to the threat feed."}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 px-4">
            <FormField
              control={form.control}
              name="ioc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IOC</FormLabel>
                  <FormControl>
                    <Input placeholder="203.0.113.9 or evil.example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="iocType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(IocType).map((v) => (
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
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Source</FormLabel>
                    <FormControl><Input placeholder="AbuseIPDB" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ipAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP Address</FormLabel>
                    <FormControl><Input placeholder="203.0.113.9" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain</FormLabel>
                    <FormControl><Input placeholder="evil.example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="hash"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hash</FormLabel>
                  <FormControl><Input placeholder="SHA-256…" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="confidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ThreatConfidence).map((v) => (
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
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(ThreatStatus).map((v) => (
                          <SelectItem key={v} value={v}>{humanize(v)}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <SheetFooter className="px-0">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Add IOC"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
