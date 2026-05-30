import { z } from "zod";

export const organizationSchema = z
  .object({
    name: z.string().trim().min(2, "Organization name must be at least 2 characters."),
    type: z.enum(["school", "nonprofit", "business"]),
    school_district: z.string().trim().optional(),
    tax_id: z.string().trim().optional(),
    business_domain: z.string().trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.type === "school" && !value.school_district) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["school_district"],
        message: "School district is required for schools.",
      });
    }
    if (value.type === "nonprofit" && !value.tax_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tax_id"],
        message: "Tax ID is required for nonprofits.",
      });
    }
    if (value.type === "business" && !value.business_domain) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["business_domain"],
        message: "Business domain is required for businesses.",
      });
    }
  });

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
