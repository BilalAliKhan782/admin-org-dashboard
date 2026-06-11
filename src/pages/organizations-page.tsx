import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronLeft, ChevronRight, Copy, Plus, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useOrganizations } from "@/api/organizations";
import { getMyProfile } from "@/api/profile";
import { ExportButton } from "@/components/organizations/export-button";
import { OrgContextMenu } from "@/components/organizations/org-context-menu";
import { OrgCardSkeleton } from "@/components/organizations/org-card-skeleton";
import { OrgStats } from "@/components/organizations/org-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { FAB } from "@/components/ui/fab";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { typeBadgeClasses, typeLabels } from "@/constants/organizations";
import { useDebounce } from "@/hooks/use-debounce";
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";
import { formatRelativeDate } from "@/lib/utils";
import type { OrganizationType } from "@/types/database";

type TypeFilter = OrganizationType | "all";
type SortBy = "newest" | "oldest" | "members";

export function OrganizationsPage() {
  const navigate = useNavigate();
  const organizationsQuery = useOrganizations();
  const profileQuery = useQuery({ queryKey: ["profile"], queryFn: getMyProfile });
  const canCreateOrganizations = profileQuery.data?.is_admin === true;
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 250);
  const pageSize = 6;
  const { isRefreshing, pullDistance } = usePullToRefresh(async () => {
    await organizationsQuery.refetch();
  });

  const filteredOrgs = useMemo(() => {
    const organizations = organizationsQuery.data ?? [];
    const normalizedSearch = debouncedSearchTerm.trim().toLowerCase();

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
  }, [organizationsQuery.data, debouncedSearchTerm, typeFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredOrgs.length / pageSize));
  const visibleOrgs = filteredOrgs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  function updateSearch(value: string) {
    setSearchTerm(value);
    setCurrentPage(1);
  }

  function updateTypeFilter(value: TypeFilter) {
    setTypeFilter(value);
    setCurrentPage(1);
  }

  function updateSort(value: SortBy) {
    setSortBy(value);
    setCurrentPage(1);
  }

  async function copyOrganizationId(id: string) {
    const copied = await copyToClipboard(id);

    toast({
      title: copied ? "Organization ID copied" : "Unable to copy",
      description: copied ? "The organization ID is ready to paste." : "Please copy the ID manually.",
      variant: copied ? "success" : "destructive",
    });
  }

  return (
    <section className="space-y-5">
      {(pullDistance > 0 || isRefreshing) ? (
        <div
          className="fixed left-1/2 top-3 z-50 -translate-x-1/2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground shadow-sm md:hidden"
          style={{ opacity: Math.min(1, Math.max(0.35, pullDistance / 80)) }}
        >
          {isRefreshing ? "Refreshing..." : pullDistance > 80 ? "Release to refresh" : "Pull to refresh"}
        </div>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Organization Directory</h1>
          <p className="mt-1 text-sm text-muted-foreground">Organizations created by the signed-in admin.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton organizations={filteredOrgs} />
          {canCreateOrganizations ? (
            <Button asChild>
              <Link to="/organizations/new">
                <Plus className="h-4 w-4" />
                New organization
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {organizationsQuery.data?.length ? <OrgStats organizations={organizationsQuery.data} /> : null}

      {organizationsQuery.data?.length ? (
        <div className="rounded-lg border bg-card p-3 shadow-[0_8px_20px_hsl(var(--foreground)/0.08)] dark:shadow-[0_8px_20px_hsl(0_0%_0%/0.35)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(event) => updateSearch(event.target.value)}
              className="max-w-xs"
            />
            <Select value={typeFilter} onValueChange={(value) => updateTypeFilter(value as TypeFilter)}>
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
            <Select value={sortBy} onValueChange={(value) => updateSort(value as SortBy)}>
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
          <p className="mt-3 text-sm text-muted-foreground">
            Showing {visibleOrgs.length} of {filteredOrgs.length} filtered organizations
          </p>
        </div>
      ) : null}

      {organizationsQuery.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <OrgCardSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {organizationsQuery.isError ? (
        <Card>
          <CardContent className="p-6 text-sm text-destructive">Unable to load organizations.</CardContent>
        </Card>
      ) : null}

      {organizationsQuery.data?.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={canCreateOrganizations ? "No organizations yet" : "No organizations yet"}
          description={
            canCreateOrganizations
              ? "Create your first organization to start managing members and invitations."
              : "You will see organizations here after you accept an invitation."
          }
          action={
            canCreateOrganizations
              ? { label: "Create organization", onClick: () => (window.location.href = "/organizations/new") }
              : undefined
          }
        />
      ) : null}

      {organizationsQuery.data?.length && filteredOrgs.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No matching organizations"
          description="Adjust your search, type filter, or sort option to find what you need."
        />
      ) : null}

      {organizationsQuery.data?.length ? (
        <div className="overflow-hidden rounded-lg border bg-card shadow-[0_8px_20px_hsl(var(--foreground)/0.12)] dark:shadow-[0_8px_20px_hsl(0_0%_0%/0.45)]">
          <div className="hidden grid-cols-[1fr_120px_100px_130px_64px_24px] border-b bg-muted/70 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid">
            <span>Organization</span>
            <span>Type</span>
            <span>Members</span>
            <span>Created</span>
            <span>Actions</span>
            <span aria-hidden="true" />
          </div>
          {visibleOrgs.map((organization) => (
          <OrgContextMenu
            key={organization.id}
            organization={organization}
            onCopyId={() => void copyOrganizationId(organization.id)}
            onView={() => navigate(`/organizations/${organization.id}`)}
          >
            <Link
              to={`/organizations/${organization.id}`}
              className="grid gap-3 border-b p-3 transition-all duration-200 last:border-b-0 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-muted/70 hover:shadow-md sm:grid-cols-[1fr_120px_100px_130px_64px_24px] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{organization.name}</p>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {organization.member_count} {organization.member_count === 1 ? "member" : "members"}
                  </p>
                </div>
              </div>
              <Badge className={typeBadgeClasses[organization.type]}>{typeLabels[organization.type]}</Badge>
              <span className="text-sm text-muted-foreground sm:text-xs">{organization.member_count} members</span>
              <span className="text-sm text-muted-foreground sm:text-xs">{formatRelativeDate(organization.created_at)}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Copy ID for ${organization.name}`}
                      onClick={(event) => {
                        event.preventDefault();
                        void copyOrganizationId(organization.id);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy organization ID</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <ChevronRight className="hidden h-5 w-5 text-muted-foreground sm:block" />
            </Link>
          </OrgContextMenu>
          ))}
        </div>
      ) : null}

      {filteredOrgs.length > pageSize ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}
      {canCreateOrganizations ? (
        <FAB onClick={() => navigate("/organizations/new")} label="New" icon={<Plus className="h-5 w-5" />} />
      ) : null}
    </section>
  );
}
