import { z } from "zod";

const nameSchema = z.string().trim().min(2, "Organization name must be at least 2 characters.");
const requiredText = (message: string) => z.string().trim().min(1, message);

export const organizationSchema = z.discriminatedUnion("type", [
  z.object({
    name: nameSchema,
    type: z.literal("school"),
    school_district: requiredText("School district is required for schools."),
    tax_id: z.string().trim().optional(),
    business_domain: z.string().trim().optional(),
  }),
  z.object({
    name: nameSchema,
    type: z.literal("nonprofit"),
    school_district: z.string().trim().optional(),
    tax_id: requiredText("Tax ID is required for nonprofits."),
    business_domain: z.string().trim().optional(),
  }),
  z.object({
    name: nameSchema,
    type: z.literal("business"),
    school_district: z.string().trim().optional(),
    tax_id: z.string().trim().optional(),
    business_domain: requiredText("Business domain is required for businesses."),
  }),
]);

export type OrganizationFormValues = z.infer<typeof organizationSchema>;
