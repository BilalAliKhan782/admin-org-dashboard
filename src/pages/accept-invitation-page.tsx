import { CheckCircle2, Mail, UserPlus } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAcceptInvitation, useInvitation } from "@/api/organizations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { statusBadgeClasses } from "@/constants/organizations";
import { useAuth } from "@/hooks/use-auth";
import { formatRelativeDate } from "@/lib/utils";

export function AcceptInvitationPage() {
  const { token } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading: isAuthLoading } = useAuth();
  const invitationQuery = useInvitation(token);
  const acceptMutation = useAcceptInvitation();

  function acceptInvite() {
    if (!token) return;

    acceptMutation.mutate(token, {
      onSuccess: (result) => {
        navigate(`/organizations/${result.organization_id}`, { replace: true });
      },
    });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UserPlus className="h-6 w-6" />
          </div>
          <CardTitle>Accept invitation</CardTitle>
          <CardDescription>Review your invitation and sign in with the invited email to join.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {invitationQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading invitation...</p> : null}

          {invitationQuery.isError || (!invitationQuery.isLoading && !invitationQuery.data) ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              This invitation link is invalid or no longer available.
            </p>
          ) : null}

          {invitationQuery.data ? (
            <div className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-lg font-semibold">{invitationQuery.data.organization_name}</h1>
                  <Badge className={statusBadgeClasses[invitationQuery.data.status]}>
                    {invitationQuery.data.status}
                  </Badge>
                </div>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {invitationQuery.data.email}
                  </p>
                  <p>
                    Role: <span className="capitalize text-foreground">{invitationQuery.data.role}</span>
                  </p>
                  <p>Invited {formatRelativeDate(invitationQuery.data.invited_at)}</p>
                </div>
              </div>

              {!isAuthLoading && !user ? (
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link to="/auth" state={{ from: location }}>
                      Sign in to accept
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/auth" state={{ from: location }}>
                      Sign up
                    </Link>
                  </Button>
                </div>
              ) : null}

              {user ? (
                <div className="space-y-3">
                  <Button onClick={acceptInvite} disabled={acceptMutation.isPending}>
                    <CheckCircle2 className="h-4 w-4" />
                    {acceptMutation.isPending ? "Accepting..." : "Accept invitation"}
                  </Button>
                  {acceptMutation.isError ? (
                    <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                      {acceptMutation.error.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
