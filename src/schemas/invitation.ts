import { z } from "zod";

export const invitationSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").toLowerCase(),
  role: z.enum(["member", "manager"]).default("member"),
});

export type InvitationFormValues = z.infer<typeof invitationSchema>;
