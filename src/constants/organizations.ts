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
  school: "border-sky-200 bg-sky-50 text-sky-700",
  nonprofit: "border-emerald-200 bg-emerald-50 text-emerald-700",
  business: "border-violet-200 bg-violet-50 text-violet-700",
};

export const statusBadgeClasses: Record<MemberStatus, string> = {
  invited: "border-amber-200 bg-amber-50 text-amber-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
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
