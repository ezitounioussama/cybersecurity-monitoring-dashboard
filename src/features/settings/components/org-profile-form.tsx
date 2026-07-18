"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateOrgName } from "@/actions/settings.actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orgProfileSchema, type OrgProfileValues } from "@/schemas/settings.schema";

type OrgProfileFormProps = {
  canManage: boolean;
  org: { name: string; slug: string; plan: string };
};

/** Admin-only Organization card. Non-admins see a read-only view. */
export function OrgProfileForm({ canManage, org }: OrgProfileFormProps) {
  const form = useForm<OrgProfileValues>({
    resolver: zodResolver(orgProfileSchema),
    defaultValues: { name: org.name },
  });

  async function onSubmit(values: OrgProfileValues) {
    const res = await updateOrgName(values.name);
    if (res.success) {
      toast.success("Organization updated");
      form.reset({ name: values.name });
    } else {
      toast.error(res.error.message);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization</CardTitle>
        <CardDescription>
          {canManage
            ? "Manage your organization profile. These settings apply to everyone."
            : "Your organization profile. Only administrators can change these."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {canManage ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid max-w-md gap-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Acme Security" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <ReadOnlyRow label="Slug" value={org.slug} mono />
              <ReadOnlyRow label="Plan" value={org.plan} capitalize />
              <div>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting || !form.formState.isDirty}
                >
                  {form.formState.isSubmitting ? "Saving…" : "Save changes"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="grid max-w-md gap-4">
            <ReadOnlyRow label="Name" value={org.name} />
            <ReadOnlyRow label="Slug" value={org.slug} mono />
            <ReadOnlyRow label="Plan" value={org.plan} capitalize />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReadOnlyRow({
  label,
  value,
  mono,
  capitalize,
}: {
  label: string;
  value: string;
  mono?: boolean;
  capitalize?: boolean;
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-muted-foreground">{label}</Label>
      <p
        className={[
          "text-sm",
          mono ? "font-mono" : "",
          capitalize ? "capitalize" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </p>
    </div>
  );
}
