import type { OrganizationType } from "@/types/database";

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
