import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/database";
import type { InvitationFormValues } from "@/schemas/invitation";
import type { OrganizationFormValues } from "@/schemas/organization";

export type Organization = Database["public"]["Tables"]["organizations"]["Row"];
export type OrganizationDirectoryItem = Database["public"]["Views"]["organization_directory"]["Row"];
export type OrganizationMember = Database["public"]["Tables"]["organization_members"]["Row"];
export type ActivityLogItem = Database["public"]["Tables"]["activity_log"]["Row"];
export type InvitationDetails = Database["public"]["Functions"]["get_invitation_by_token"]["Returns"][number];
export type InviteMemberResult = OrganizationMember & {
  email_sent?: boolean;
  invitation_url?: string;
};

export const organizationKeys = {
  all: ["organizations"] as const,
  detail: (id: string) => ["organizations", id] as const,
  members: (id: string) => ["organizations", id, "members"] as const,
  activity: (id: string) => ["organizations", id, "activity"] as const,
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
  await logActivity(data.id, "organization_created", { name: data.name, type: data.type });
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

export async function listActivityLog(organizationId: string) {
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export function useActivityLog(organizationId?: string) {
  return useQuery({
    queryKey: organizationKeys.activity(organizationId ?? ""),
    queryFn: () => listActivityLog(organizationId!),
    enabled: Boolean(organizationId),
  });
}

export async function inviteMember(organizationId: string, values: InvitationFormValues) {
  const { data, error } = await supabase.functions.invoke<InviteMemberResult>("invite-member", {
    body: {
      organization_id: organizationId,
      email: values.email,
      role: values.role,
    },
  });

  if (error) throw new Error(await getFunctionErrorMessage(error));
  return data;
}

export function useInviteMember(organizationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: InvitationFormValues) => inviteMember(organizationId!, values),
    onSuccess: async () => {
      if (!organizationId) return;
      await logActivity(organizationId, "member_invited");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.activity(organizationId) }),
      ]);
    },
  });
}

export async function getInvitationByToken(token: string) {
  const { data, error } = await supabase.rpc("get_invitation_by_token", { p_token: token });
  if (error) throw error;
  return data[0] ?? null;
}

export function useInvitation(token?: string) {
  return useQuery({
    queryKey: ["invitation", token],
    queryFn: () => getInvitationByToken(token!),
    enabled: Boolean(token),
  });
}

export async function removeMember(memberId: string) {
  const { error } = await supabase.from("organization_members").delete().eq("id", memberId);
  if (error) throw error;
}

export function useRemoveMember(organizationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeMember,
    onSuccess: async () => {
      if (!organizationId) return;
      await logActivity(organizationId, "member_removed");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.activity(organizationId) }),
      ]);
    },
  });
}

export async function updateMemberRole(memberId: string, role: OrganizationMember["role"]) {
  const { error } = await supabase.from("organization_members").update({ role }).eq("id", memberId);
  if (error) throw error;
}

export function useUpdateMemberRole(organizationId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: OrganizationMember["role"] }) =>
      updateMemberRole(memberId, role),
    onSuccess: async (_data, variables) => {
      if (!organizationId) return;
      await logActivity(organizationId, "member_role_updated", { role: variables.role });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationKeys.members(organizationId) }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.all }),
        queryClient.invalidateQueries({ queryKey: organizationKeys.activity(organizationId) }),
      ]);
    },
  });
}

export async function acceptInvitation(token: string) {
  const { data, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error) throw error;
  return data[0];
}

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: acceptInvitation,
  });
}

async function getFunctionErrorMessage(error: Error & { context?: Response }) {
  if (error.context instanceof Response) {
    const body = await error.context
      .clone()
      .json()
      .catch(() => null);

    if (body && typeof body.error === "string") {
      return body.error;
    }
  }

  return error.message;
}

async function logActivity(organizationId: string, action: string, details: Record<string, string> = {}) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("activity_log").insert({
    organization_id: organizationId,
    user_id: user.id,
    action,
    details,
  });

  if (error) {
    console.warn("Failed to record activity", error);
  }
}
