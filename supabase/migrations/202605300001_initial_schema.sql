create type public.organization_type as enum ('school', 'nonprofit', 'business');
create type public.member_status as enum ('invited', 'active');
create type public.member_role as enum ('member', 'manager');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) >= 2),
  type public.organization_type not null,
  created_by uuid not null default auth.uid() references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  school_district text,
  tax_id text,
  business_domain text,
  constraint organizations_type_fields_check check (
    (type = 'school' and nullif(trim(coalesce(school_district, '')), '') is not null and tax_id is null and business_domain is null)
    or
    (type = 'nonprofit' and nullif(trim(coalesce(tax_id, '')), '') is not null and school_district is null and business_domain is null)
    or
    (type = 'business' and nullif(trim(coalesce(business_domain, '')), '') is not null and school_district is null and tax_id is null)
  )
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status public.member_status not null default 'invited',
  role public.member_role not null default 'member',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  constraint organization_members_email_check check (email = lower(email) and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint organization_members_unique_email unique (organization_id, email)
);

create index organizations_created_by_idx on public.organizations(created_by);
create index organization_members_organization_id_idx on public.organization_members(organization_id);

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create policy "profiles are visible to owner"
  on public.profiles for select
  using (id = auth.uid());

create policy "profiles are updated by owner"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "admins can create own organizations"
  on public.organizations for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.is_admin = true
    )
  );

create policy "admins read own organizations"
  on public.organizations for select
  using (created_by = auth.uid());

create policy "admins update own organizations"
  on public.organizations for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "admins delete own organizations"
  on public.organizations for delete
  using (created_by = auth.uid());

create policy "admins read members for own organizations"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = auth.uid()
    )
  );

create policy "admins insert members for own organizations"
  on public.organization_members for insert
  with check (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = auth.uid()
    )
  );

create policy "admins update members for own organizations"
  on public.organization_members for update
  using (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = auth.uid()
    )
  );

create or replace view public.organization_directory
with (security_invoker = true) as
select
  organizations.id,
  organizations.name,
  organizations.type,
  organizations.created_by,
  organizations.created_at,
  organizations.school_district,
  organizations.tax_id,
  organizations.business_domain,
  count(organization_members.id)::int as member_count
from public.organizations
left join public.organization_members
  on organization_members.organization_id = organizations.id
group by organizations.id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, is_admin)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data ->> 'full_name',
    false
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
