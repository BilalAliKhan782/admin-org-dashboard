import { describe, expect, it } from "vitest";
import { organizationSchema } from "@/schemas/organization";

describe("organizationSchema", () => {
  it("validates organization name length", () => {
    const result = organizationSchema.safeParse({
      name: "A",
      type: "school",
      school_district: "North Valley",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe("Organization name must be at least 2 characters.");
  });

  it("validates school-specific fields", () => {
    const result = organizationSchema.safeParse({
      name: "River School",
      type: "school",
      school_district: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["school_district"]);
  });

  it("validates nonprofit-specific fields", () => {
    const result = organizationSchema.safeParse({
      name: "Community Fund",
      type: "nonprofit",
      tax_id: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["tax_id"]);
  });

  it("validates business-specific fields", () => {
    const result = organizationSchema.safeParse({
      name: "Acme Ops",
      type: "business",
      business_domain: "",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["business_domain"]);
  });
});
