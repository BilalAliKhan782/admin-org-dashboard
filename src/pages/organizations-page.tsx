import { useMemo, useState } from "react";
import { Building2, ChevronRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useOrganizations } from "@/api/organizations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { typeBadgeClasses, typeLabels } from "@/constants/organizations";
import { formatRelativeDate } from "@/lib/utils";
import type { OrganizationType } from "@/types/database";

type TypeFilter = OrganizationType | "all";
type SortBy = "newest" | "oldest" | "members";

export function OrganizationsPage() {
  const organizationsQuery = useOrganizations();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const filteredOrgs = useMemo(() => {
    const organizations = organizationsQuery.data ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = organizations.filter((organization) => {
      const matchesSearch = normalizedSearch
        ? organization.name.toLowerCase().includes(normalizedSearch)
        : true;
      const matchesType = typeFilter === "all" ? true : organization.type === typeFilter;

      return matchesSearch && matchesType;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }

      if (sortBy === "members") {
        return b.member_count - a.member_count;
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [organizationsQuery.data, searchTerm, typeFilter, sortBy]);

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

      {organizationsQuery.data?.length ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="max-w-xs"
            />
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="school">School</SelectItem>
                <SelectItem value="nonprofit">Nonprofit</SelectItem>
                <SelectItem value="business">Business</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortBy)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="members">Most Members</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Showing {filteredOrgs.length} of {organizationsQuery.data.length} organizations
          </p>
        </div>
      ) : null}

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

      {organizationsQuery.data?.length && filteredOrgs.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">No organizations match your filters.</CardContent>
        </Card>
      ) : null}

      {organizationsQuery.data?.length ? (
        <div className="overflow-hidden rounded-lg border bg-card">
          {filteredOrgs.map((organization) => (
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
            <Badge className={typeBadgeClasses[organization.type]}>{typeLabels[organization.type]}</Badge>
            <span className="text-sm text-muted-foreground">{organization.member_count} members</span>
            <span className="text-sm text-muted-foreground">{formatRelativeDate(organization.created_at)}</span>
            <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
          </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
