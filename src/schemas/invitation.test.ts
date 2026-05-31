import { describe, expect, it } from "vitest";
import { invitationSchema } from "@/schemas/invitation";

describe("invitationSchema", () => {
  it("validates email format", () => {
    const result = invitationSchema.safeParse({ email: "nope", role: "member" });

    expect(result.success).toBe(false);
  });

  it("lowercases email addresses and defaults role", () => {
    const result = invitationSchema.parse({ email: "MEMBER@Example.COM" });

    expect(result).toEqual({ email: "member@example.com", role: "member" });
  });
});
