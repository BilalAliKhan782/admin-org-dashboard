create index if not exists organization_members_manager_lookup_idx
  on public.organization_members(organization_id, user_id, role, status)
  where role = 'manager' and status = 'active';

create index if not exists organizations_created_by_idx
  on public.organizations(created_by);

create policy "creators and managers can update member roles"
  on public.organization_members for update
  using (
    exists (
      select 1 from public.organization_members as current_member
      where current_member.organization_id = organization_members.organization_id
        and current_member.user_id = auth.uid()
        and current_member.role = 'manager'
        and current_member.status = 'active'
    )
    or
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.organization_members as current_member
      where current_member.organization_id = organization_members.organization_id
        and current_member.user_id = auth.uid()
        and current_member.role = 'manager'
        and current_member.status = 'active'
    )
    or
    exists (
      select 1 from public.organizations
      where organizations.id = organization_members.organization_id
        and organizations.created_by = auth.uid()
    )
  );
