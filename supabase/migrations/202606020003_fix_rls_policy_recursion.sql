drop policy if exists "admins read members for own organizations" on public.organization_members;
drop policy if exists "admins insert members for own organizations" on public.organization_members;
drop policy if exists "admins update members for own organizations" on public.organization_members;
drop policy if exists "active members read organizations" on public.organizations;
drop policy if exists "active members read organization members" on public.organization_members;
drop policy if exists "managers can invite members" on public.organization_members;
drop policy if exists "creators and managers can remove members" on public.organization_members;

create or replace function public.is_organization_creator(p_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organizations
    where organizations.id = p_organization_id
      and organizations.created_by = auth.uid()
  );
$$;

create or replace function public.is_active_organization_member(p_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members
    where organization_members.organization_id = p_organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.status = 'active'
  );
$$;

create or replace function public.can_manage_organization_members(p_organization_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_organization_creator(p_organization_id)
    or exists (
      select 1
      from public.organization_members
      where organization_members.organization_id = p_organization_id
        and organization_members.user_id = auth.uid()
        and organization_members.role = 'manager'
        and organization_members.status = 'active'
    );
$$;

create policy "active members read organizations"
  on public.organizations for select
  using (public.is_active_organization_member(id));

create policy "admins read members for own organizations"
  on public.organization_members for select
  using (
    public.is_organization_creator(organization_id)
    or public.is_active_organization_member(organization_id)
  );

create policy "admins insert members for own organizations"
  on public.organization_members for insert
  with check (public.can_manage_organization_members(organization_id));

create policy "admins update members for own organizations"
  on public.organization_members for update
  using (public.can_manage_organization_members(organization_id))
  with check (public.can_manage_organization_members(organization_id));

create policy "creators and managers can remove members"
  on public.organization_members for delete
  using (public.can_manage_organization_members(organization_id));

grant execute on function public.is_organization_creator(uuid) to authenticated;
grant execute on function public.is_active_organization_member(uuid) to authenticated;
grant execute on function public.can_manage_organization_members(uuid) to authenticated;
