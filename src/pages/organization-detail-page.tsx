import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MailPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { getOrganization, inviteMember, listMembers } from "@/api/organizations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { typeLabels } from "@/constants/organizations";
import { invitationSchema, type InvitationFormValues } from "@/schemas/invitation";

export function OrganizationDetailPage() {
  const { organizationId } = useParams();
  const queryClient = useQueryClient();
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { email: "", role: "member" },
  });

  const organizationQuery = useQuery({
    queryKey: ["organizations", organizationId],
    queryFn: () => getOrganization(organizationId!),
    enabled: Boolean(organizationId),
  });
  const membersQuery = useQuery({
    queryKey: ["organizations", organizationId, "members"],
    queryFn: () => listMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
  const inviteMutation = useMutation({
    mutationFn: (values: InvitationFormValues) => inviteMember(organizationId!, values),
    onSuccess: async () => {
      form.reset({ email: "", role: "member" });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["organizations", organizationId, "members"] }),
        queryClient.invalidateQueries({ queryKey: ["organizations"] }),
      ]);
    },
  });

  if (organizationQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading organization...</p>;
  }

  if (organizationQuery.isError || !organizationQuery.data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-destructive">Organization not found or you do not have access.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link to="/">Back to directory</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const organization = organizationQuery.data;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{organization.name}</h1>
            <Badge>{typeLabels[organization.type]}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {new Date(organization.created_at).toLocaleDateString()}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
          <CardDescription>Invitations are created through the Supabase Edge Function.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-[1fr_180px_auto]" onSubmit={form.handleSubmit((values) => inviteMutation.mutate(values))}>
            <FormField label="Email" error={form.formState.errors.email?.message}>
              <Input type="email" placeholder="member@example.com" {...form.register("email")} />
            </FormField>
            <FormField label="Role" error={form.formState.errors.role?.message}>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>
            <Button className="self-end" disabled={inviteMutation.isPending}>
              <MailPlus className="h-4 w-4" />
              {inviteMutation.isPending ? "Inviting..." : "Invite"}
            </Button>
          </form>
          {inviteMutation.isError ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{inviteMutation.error.message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Invited and active members for this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          {membersQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading members...</p> : null}
          {membersQuery.data?.length === 0 ? <p className="text-sm text-muted-foreground">No members have been invited yet.</p> : null}
          <div className="divide-y rounded-md border">
            {membersQuery.data?.map((member) => (
              <div key={member.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_100px_100px_140px] sm:items-center">
                <span className="font-medium">{member.email}</span>
                <Badge>{member.status}</Badge>
                <span className="text-sm capitalize text-muted-foreground">{member.role}</span>
                <span className="text-sm text-muted-foreground">{new Date(member.invited_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
