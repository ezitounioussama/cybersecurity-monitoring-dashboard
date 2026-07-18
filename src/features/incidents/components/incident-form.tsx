"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { createIncident, updateIncident } from "@/actions/incident.actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { IncidentStatus, Severity } from "@/generated/prisma/enums";
import { humanize } from "@/lib/format";
import {
  type IncidentFormValues,
  incidentFormSchema,
} from "@/schemas/incident.schema";
import type { AnalystOption, IncidentRow } from "@/types/incident";

const UNASSIGNED = "__none__";

type Props = {
  trigger: ReactNode;
  analystOptions: AnalystOption[];
  incident?: IncidentRow;
};

export function IncidentFormSheet({
  trigger,
  analystOptions,
  incident,
}: Props) {
  const [open, setOpen] = useState(false);
  const isEdit = Boolean(incident);
  const form = useForm<IncidentFormValues>({
    resolver: zodResolver(incidentFormSchema),
    defaultValues: {
      title: incident?.title ?? "",
      description: incident?.description ?? "",
      severity: incident?.severity ?? "MEDIUM",
      status: incident?.status ?? "NEW",
      assignedAnalystId: incident?.assignedAnalyst?.id ?? "",
      evidenceUrls: incident?.evidenceUrls?.join("\n") ?? "",
    },
  });

  async function onSubmit(values: IncidentFormValues) {
    const payload = {
      ...values,
      assignedAnalystId:
        values.assignedAnalystId === UNASSIGNED ? "" : values.assignedAnalystId,
      evidenceUrls: values.evidenceUrls
        .split(/[\n,]/)
        .map((v) => v.trim())
        .filter(Boolean),
    };
    const res = isEdit
      ? await updateIncident(incident!.id, payload)
      : await createIncident(payload);
    if (res.success) {
      toast.success(isEdit ? "Incident updated" : "Incident created");
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
          <SheetTitle>
            {isEdit ? "Edit incident" : "Create incident"}
          </SheetTitle>
          <SheetDescription>
            Track and coordinate the response to a security incident.
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 px-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ransomware on finance subnet"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Summary of the incident…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Severity).map((v) => (
                          <SelectItem key={v} value={v}>
                            {humanize(v)}
                          </SelectItem>
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
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(IncidentStatus).map((v) => (
                          <SelectItem key={v} value={v}>
                            {humanize(v)}
                          </SelectItem>
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
              name="assignedAnalystId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned analyst</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || UNASSIGNED}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                      {analystOptions.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="evidenceUrls"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evidence links</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="https://… (one per line)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>One URL per line.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="px-0">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Create incident"}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
