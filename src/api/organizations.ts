import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { InvitationFormValues } from "@/schemas/invitation";
import type { OrganizationFormValues } from "@/schemas/organization";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationDirectoryItem = Database["public"]["Views"]["organization_directory"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];

export const organizationKeys = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const,
  members: (id: string) => ["organizations", id, "members"] as const,
};

export async function listOrganizations() {
  const { data, error } = await supabase
    .from("organization_directory")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export function useOrganizations() {
  return useQuery({
    queryKey: organizationKeys.all,
    queryFn: listOrganizations,
  });
}

export async function getOrganization(id: string) {
  const { data, error } = await supabase.from("organizations").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export function useOrganization(id?: string) {
  return useQuery({
    queryKey: organizationKeys.detail(id ?? ""),
    queryFn: () => getOrganization(id!),
    enabled: Boolean(id),
  });
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

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOrganization,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: organizationKeys.all });
    },
  });
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

export function useMembers(organizationId?: string) {
  return useQuery({
    queryKey: organizationKeys.members(organizationId ?? ""),
    queryFn: () => listMembers(organizationId!),
    enabled: Boolean(organizationId),
  });
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

export function useInviteMember(organizationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: InvitationFormValues) => inviteMember(organizationId!, values),
    onSuccess: async () => {
      if (!organizationId) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
      ]);
    },
  });
}
