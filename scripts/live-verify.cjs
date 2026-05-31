const fs = require("node:fs");
const { createClient } = require("@supabase/supabase-js");

const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const results = [];

function pass(name, detail) {
  results.push({ name, status: "PASS", detail });
}

function fail(name, detail) {
  results.push({ name, status: "FAIL", detail });
}

async function verifyVercel(target) {
  try {
    const response = await fetch(target, { redirect: "follow" });
    const body = await response.text();
    const hasRoot = body.includes("<div id=\"root\">");

    if (response.ok && hasRoot) {
      pass(`Vercel ${target}`, `HTTP ${response.status}, Vite root present`);
      return;
    }

    fail(`Vercel ${target}`, `HTTP ${response.status}, root present=${hasRoot}`);
  } catch (error) {
    fail(`Vercel ${target}`, error.message);
  }
}

async function main() {
  await verifyVercel("https://admin-org-dashboard.vercel.app");
  await verifyVercel("https://admin-org-dashboard-development.vercel.app");

  const anonInsert = await supabase
    .from("organizations")
    .insert({ name: "Anon RLS Probe", type: "business", business_domain: "anon.invalid" })
    .select("id")
    .single();

  if (anonInsert.error) {
    pass("Supabase unauthenticated organization insert blocked", anonInsert.error.message);
  } else {
    fail("Supabase unauthenticated organization insert blocked", `Unexpected insert id ${anonInsert.data.id}`);
  }

  const auth = await supabase.auth.signInWithPassword({
    email: "reviewer@adminorg.dev",
    password: "BilalAdmin!2026",
  });

  if (auth.error || !auth.data.session) {
    fail("Supabase reviewer sign-in", auth.error?.message ?? "No session");
    console.table(results);
    process.exit(1);
  }

  pass("Supabase reviewer sign-in", `Authenticated as ${auth.data.user.email}`);

  const profile = await supabase.from("profiles").select("email,is_admin").single();
  if (profile.error) {
    fail("Supabase profile read", profile.error.message);
  } else if (profile.data.is_admin) {
    pass("Supabase reviewer admin profile", `${profile.data.email} is admin`);
  } else {
    fail("Supabase reviewer admin profile", `${profile.data.email} is not admin`);
  }

  const stamp = Date.now();
  const created = await supabase
    .from("organizations")
    .insert({
      name: `Live Verification ${stamp}`,
      type: "business",
      business_domain: `verify-${stamp}.example`,
    })
    .select("*")
    .single();

  const organizationId = created.data?.id;
  if (created.error) {
    fail("Supabase admin organization create", created.error.message);
  } else {
    pass("Supabase admin organization create", `${created.data.name} (${created.data.id})`);
  }

  if (organizationId) {
    const directory = await supabase
      .from("organization_directory")
      .select("id,name,member_count")
      .eq("id", organizationId)
      .single();

    if (directory.error) {
      fail("Supabase organization_directory read", directory.error.message);
    } else {
      pass("Supabase organization_directory read", `${directory.data.name}, members=${directory.data.member_count}`);
    }

    const inviteEmail = `live.verify+${stamp}@example.com`;
    const invite = await supabase.functions.invoke("invite-member", {
      body: { organization_id: organizationId, email: inviteEmail, role: "manager" },
    });

    if (invite.error) {
      fail("Supabase invite-member function", invite.error.message);
    } else {
      pass("Supabase invite-member function", `${invite.data.email} / ${invite.data.role} / ${invite.data.status}`);
    }

    const duplicate = await supabase.functions.invoke("invite-member", {
      body: { organization_id: organizationId, email: inviteEmail, role: "member" },
    });

    if (duplicate.error) {
      pass("Supabase duplicate invitation blocked", duplicate.error.message);
    } else {
      fail("Supabase duplicate invitation blocked", "Unexpected duplicate response");
    }

    const members = await supabase
      .from("organization_members")
      .select("email,status,role")
      .eq("organization_id", organizationId);

    if (members.error) {
      fail("Supabase members read", members.error.message);
    } else if (members.data.some((member) => member.email === inviteEmail)) {
      pass("Supabase members read", "Found invited member");
    } else {
      fail("Supabase members read", "Invited member not found");
    }

    const cleanup = await supabase.from("organizations").delete().eq("id", organizationId);
    if (cleanup.error) {
      fail("Supabase cleanup organization delete", cleanup.error.message);
    } else {
      pass("Supabase cleanup organization delete", organizationId);
    }
  }

  await supabase.auth.signOut();
  console.table(results);

  if (results.some((result) => result.status === "FAIL")) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
