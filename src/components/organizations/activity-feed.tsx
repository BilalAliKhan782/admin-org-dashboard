import { Activity } from "lucide-react";
import { useActivityLog } from "@/api/organizations";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRelativeDate } from "@/lib/utils";

interface ActivityFeedProps {
  organizationId: string;
}

export function ActivityFeed({ organizationId }: ActivityFeedProps) {
  const activityQuery = useActivityLog(organizationId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity
        </CardTitle>
        <CardDescription>Recent organization and member changes.</CardDescription>
      </CardHeader>
      <CardContent>
        {activityQuery.isLoading ? <p className="text-sm text-muted-foreground">Loading activity...</p> : null}
        {activityQuery.data?.length === 0 ? (
          <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
        ) : null}
        <div className="space-y-3">
          {activityQuery.data?.map((activity) => (
            <div key={activity.id} className="rounded-md border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{formatActivityAction(activity.action)}</p>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(activity.created_at)}</p>
              </div>
              {activity.details && typeof activity.details === "object" ? (
                <p className="mt-1 text-sm text-muted-foreground">{formatActivityDetails(activity.details)}</p>
              ) : null}
            </div>
          ))}
        </div>
        {activityQuery.isError ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">Unable to load activity.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function formatActivityAction(action: string) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatActivityDetails(details: object) {
  return Object.entries(details)
    .map(([key, value]) => `${formatActivityAction(key)}: ${String(value)}`)
    .join(" · ");
}
