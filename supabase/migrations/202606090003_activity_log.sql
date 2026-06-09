create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_log enable row level security;

create index activity_log_organization_id_idx
  on public.activity_log(organization_id);

create index activity_log_created_at_idx
  on public.activity_log(created_at desc);

create policy "members can read activity for their organizations"
  on public.activity_log for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = activity_log.organization_id
        and organization_members.user_id = auth.uid()
        and organization_members.status = 'active'
    )
    or
    exists (
      select 1 from public.organizations
      where organizations.id = activity_log.organization_id
        and organizations.created_by = auth.uid()
    )
  );

create policy "members can write activity for their organizations"
  on public.activity_log for insert
  with check (
    user_id = auth.uid()
    and (
      exists (
        select 1 from public.organization_members
        where organization_members.organization_id = activity_log.organization_id
          and organization_members.user_id = auth.uid()
          and organization_members.status = 'active'
      )
      or
      exists (
        select 1 from public.organizations
        where organizations.id = activity_log.organization_id
          and organizations.created_by = auth.uid()
      )
    )
  );
