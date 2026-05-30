import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { InvitationFormValues } from "@/schemas/invitation";
import type { OrganizationFormValues } from "@/schemas/organization";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationDirectoryItem = Database["public"]["Views"]["organization_directory"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];

export async function listOrganizations() {
  const { data, error } = await supabase
    .from("organization_directory")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getOrganization(id: string) {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function createOrganization(values: OrganizationFormValues) {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) throw new Error("You must be signed in to create an organization.");

  const payload = {
    name: values.name,
    type: values.type,
    school_district: values.type === "school" ? values.school_district : null,
    tax_id: values.type === "nonprofit" ? values.tax_id : null,
    business_domain: values.type === "business" ? values.business_domain : null,
  };

  const { data, error } = await supabase.from("organizations").insert(payload).select("*").single();
  if (error) throw error;
  return data;
}

export async function listMembers(organizationId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", organizationId)
    .order("invited_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function inviteMember(organizationId: string, values: InvitationFormValues) {
  const { data, error } = await supabase.functions.invoke<OrganizationMember>("invite-member", {
    body: {
      organization_id: organizationId,
      email: values.email,
      role: values.role,
    },
  });

  if (error) throw error;
  return data;
}
