import { createClient } from "https://esm.sh/@supabase/supabase-js@2.46.1";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const inviteSchema = z.object({
  organization_id: z.string().uuid(),
  email: z.string().trim().email().toLowerCase(),
  role: z.enum(["member", "manager"]).default("member"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: "Supabase environment is not configured." }, 500);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return json({ error: "Missing authorization header." }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return json({ error: "Invalid user session." }, 401);
  }

  const parsed = inviteSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return json({ error: parsed.error.issues[0]?.message ?? "Invalid request body." }, 400);
  }

  const { data: organization, error: organizationError } = await adminClient
    .from("organizations")
    .select("id, created_by")
    .eq("id", parsed.data.organization_id)
    .single();

  if (organizationError || !organization) {
    return json({ error: "Organization not found." }, 404);
  }

  const { data: managerMembership, error: managerMembershipError } = await adminClient
    .from("organization_members")
    .select("id")
    .eq("organization_id", parsed.data.organization_id)
    .eq("user_id", user.id)
    .eq("role", "manager")
    .eq("status", "active")
    .maybeSingle();

  if (managerMembershipError) {
    return json({ error: managerMembershipError.message }, 400);
  }

  if (organization.created_by !== user.id && !managerMembership) {
    return json({ error: "You can only invite members to organizations you manage." }, 403);
  }

  const { data, error } = await adminClient
    .from("organization_members")
    .insert({
      organization_id: parsed.data.organization_id,
      email: parsed.data.email,
      role: parsed.data.role,
      status: "invited",
      invitation_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return json({ error: "This email has already been invited to the organization." }, 409);
    }
    return json({ error: error.message }, 400);
  }

  const origin = req.headers.get("Origin") ?? Deno.env.get("SITE_URL") ?? "";
  const invitationUrl = origin ? `${origin}/accept-invitation/${data.invitation_token}` : undefined;

  return json({ ...data, invitation_url: invitationUrl }, 201);
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
