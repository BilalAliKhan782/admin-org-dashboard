import type { MemberStatus, OrganizationType } from "@/types/database";

export const organizationTypes: Array<{
  value: OrganizationType;
  label: string;
  description: string;
  conditionalField: "school_district" | "tax_id" | "business_domain";
  conditionalLabel: string;
  conditionalPlaceholder: string;
}> = [
  {
    value: "school",
    label: "School",
    description: "Requires a district name for reporting.",
    conditionalField: "school_district",
    conditionalLabel: "School district",
    conditionalPlaceholder: "North Valley District",
  },
  {
    value: "nonprofit",
    label: "Nonprofit",
    description: "Requires a tax identifier.",
    conditionalField: "tax_id",
    conditionalLabel: "Tax ID",
    conditionalPlaceholder: "12-3456789",
  },
  {
    value: "business",
    label: "Business",
    description: "Requires a company email domain.",
    conditionalField: "business_domain",
    conditionalLabel: "Business domain",
    conditionalPlaceholder: "example.com",
  },
];

export const typeLabels = Object.fromEntries(
  organizationTypes.map((type) => [type.value, type.label]),
) as Record<OrganizationType, string>;

export const typeBadgeClasses: Record<OrganizationType, string> = {
  school: "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
  nonprofit: "border-zinc-400 bg-zinc-200 text-zinc-900 dark:border-zinc-500 dark:bg-zinc-700 dark:text-zinc-50",
  business: "border-zinc-500 bg-zinc-300 text-zinc-950 dark:border-zinc-400 dark:bg-zinc-600 dark:text-white",
};

export const statusBadgeClasses: Record<MemberStatus, string> = {
  invited: "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100",
  active: "border-zinc-500 bg-zinc-900 text-white dark:border-zinc-200 dark:bg-zinc-100 dark:text-zinc-950",
};

export function getTypeSpecificDetail(organization: {
  type: OrganizationType;
  school_district: string | null;
  tax_id: string | null;
  business_domain: string | null;
}) {
  if (organization.type === "school") {
    return { label: "School district", value: organization.school_district };
  }
  if (organization.type === "nonprofit") {
    return { label: "Tax ID", value: organization.tax_id };
  }
  return { label: "Business domain", value: organization.business_domain };
}
