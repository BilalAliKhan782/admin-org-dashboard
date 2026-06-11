import { Building2, BriefcaseBusiness, GraduationCap, HeartHandshake, Users } from "lucide-react";
import type { OrganizationDirectoryItem } from "@/api/organizations";
import { Card, CardContent } from "@/components/ui/card";

interface OrgStatsProps {
  organizations: OrganizationDirectoryItem[];
}

export function OrgStats({ organizations }: OrgStatsProps) {
  const totalMembers = organizations.reduce((sum, organization) => sum + organization.member_count, 0);
  const schools = organizations.filter((organization) => organization.type === "school").length;
  const nonprofits = organizations.filter((organization) => organization.type === "nonprofit").length;
  const businesses = organizations.filter((organization) => organization.type === "business").length;
  const stats = [
    { label: "Organizations", value: organizations.length, icon: Building2 },
    { label: "Members", value: totalMembers, icon: Users },
    { label: "Schools", value: schools, icon: GraduationCap },
    { label: "Nonprofits", value: nonprofits, icon: HeartHandshake },
    { label: "Businesses", value: businesses, icon: BriefcaseBusiness },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="overflow-hidden">
          <CardContent className="min-h-28 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {stat.label}
              </p>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-3xl font-semibold leading-none">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
