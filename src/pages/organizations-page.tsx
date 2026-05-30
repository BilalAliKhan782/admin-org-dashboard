import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { listOrganizations } from "@/api/organizations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { typeLabels } from "@/constants/organizations";

export function OrganizationsPage() {
  const organizationsQuery = useQuery({
    queryKey: ["organizations"],
    queryFn: listOrganizations,
  });

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organization Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organizations created by the signed-in admin.</p>
        </div>
        <Button asChild>
          <Link to="/organizations/new">
            <Plus className="h-4 w-4" />
            New organization
          </Link>
        </Button>
      </div>

      {organizationsQuery.isLoading ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading organizations...</CardContent>
        </Card>
      ) : null}

      {organizationsQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Unable to load organizations.</CardContent>
        </Card>
      ) : null}

      {organizationsQuery.data?.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No organizations yet</CardTitle>
            <CardDescription>Create the first organization to start inviting members.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/organizations/new">Create organization</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="overflow-hidden rounded-lg border bg-card">
        {organizationsQuery.data?.map((organization) => (
          <Link
            key={organization.id}
            to={`/organizations/${organization.id}`}
            className="grid gap-3 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/60 sm:grid-cols-[1fr_140px_120px_140px_24px] sm:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{organization.name}</p>
                <p className="text-sm text-muted-foreground">
                  {organization.member_count} {organization.member_count === 1 ? "member" : "members"}
                </p>
              </div>
            </div>
            <Badge className="w-fit">{typeLabels[organization.type]}</Badge>
            <span className="text-sm text-muted-foreground">{organization.member_count} members</span>
            <span className="text-sm text-muted-foreground">{new Date(organization.created_at).toLocaleDateString()}</span>
            <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
          </Link>
        ))}
      </div>
    </section>
  );
}
