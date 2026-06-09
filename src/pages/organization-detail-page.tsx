import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, MailPlus, Trash2 } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { useInviteMember, useMembers, useOrganization, useRemoveMember, useUpdateMemberRole } from "@/api/organizations";
import { ActivityFeed } from "@/components/organizations/activity-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getTypeSpecificDetail, statusBadgeClasses, typeBadgeClasses, typeLabels } from "@/constants/organizations";
import { useAuth } from "@/hooks/use-auth";
import { formatRelativeDate } from "@/lib/utils";
import { invitationSchema, type InvitationFormValues } from "@/schemas/invitation";

export function OrganizationDetailPage() {
  const { organizationId } = useParams();
  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: { email: "", role: "member" },
  });

  const organizationQuery = useOrganization(organizationId);
  const membersQuery = useMembers(organizationId);
  const inviteMutation = useInviteMember(organizationId);
  const removeMemberMutation = useRemoveMember(organizationId);
  const updateRoleMutation = useUpdateMemberRole(organizationId);
  const { user } = useAuth();

  async function copyInviteLink(token: string) {
    const inviteUrl = `${window.location.origin}/accept-invitation/${token}`;
    await navigator.clipboard.writeText(inviteUrl);
  }

  function onSubmit(values: InvitationFormValues) {
    inviteMutation.mutate(values, {
      onSuccess: () => {
        form.reset({ email: "", role: "member" });
      },
    });
  }

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
  const typeDetail = getTypeSpecificDetail(organization);
  const currentMember = membersQuery.data?.find((member) => member.user_id === user?.id && member.status === "active");
  const userRole = organization.created_by === user?.id ? "creator" : currentMember?.role;
  const canManageMembers = organization.created_by === user?.id || currentMember?.role === "manager";

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{organization.name}</h1>
            <Badge className={typeBadgeClasses[organization.type]}>{typeLabels[organization.type]}</Badge>
            {userRole ? <Badge className="bg-secondary text-secondary-foreground">Your role: {userRole}</Badge> : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatRelativeDate(organization.created_at)}
          </p>
          <p className="mt-2 text-sm">
            <span className="font-medium">{typeDetail.label}:</span>{" "}
            <span className="text-muted-foreground">{typeDetail.value}</span>
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/">Back</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
          <CardDescription>Managers and organization creators can invite members.</CardDescription>
        </CardHeader>
        <CardContent>
          {canManageMembers ? (
            <>
              <form className="grid gap-4 md:grid-cols-[1fr_180px_auto]" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <FormField label="Email" htmlFor="member-email" error={form.formState.errors.email?.message}>
                  <Input id="member-email" type="email" placeholder="member@example.com" {...form.register("email")} />
                </FormField>
                <FormField label="Role" htmlFor="member-role" error={form.formState.errors.role?.message}>
                  <Controller
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="member-role">
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
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Only managers and organization creators can invite members.</p>
          )}
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
              <div key={member.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_100px_128px_140px_auto_auto] sm:items-center">
                <span className="font-medium">{member.email}</span>
                <Badge className={statusBadgeClasses[member.status]}>{member.status}</Badge>
                {canManageMembers ? (
                  <Select
                    value={member.role}
                    onValueChange={(role) =>
                      updateRoleMutation.mutate({ memberId: member.id, role: role as typeof member.role })
                    }
                    disabled={member.status !== "active" || updateRoleMutation.isPending}
                  >
                    <SelectTrigger aria-label={`Role for ${member.email}`} className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge
                    className={
                      member.role === "manager"
                        ? "w-fit bg-primary text-primary-foreground"
                        : "w-fit bg-secondary text-secondary-foreground"
                    }
                  >
                    {member.role}
                    {member.user_id === user?.id ? " (you)" : ""}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">{formatRelativeDate(member.invited_at)}</span>
                {canManageMembers && member.status === "invited" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => copyInviteLink(member.invitation_token)}
                  >
                    <Copy className="h-4 w-4" />
                    Copy link
                  </Button>
                ) : (
                  <span aria-hidden="true" />
                )}
                {canManageMembers ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMemberMutation.mutate(member.id)}
                    disabled={removeMemberMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                ) : (
                  <span aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
          {removeMemberMutation.isError ? (
            <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {removeMemberMutation.error.message}
            </p>
          ) : null}
          {updateRoleMutation.isError ? (
            <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {updateRoleMutation.error.message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {organizationId ? <ActivityFeed organizationId={organizationId} /> : null}
    </section>
  );
}
