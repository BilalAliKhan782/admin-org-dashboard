create policy "managers can invite members"
  on public.organization_members for insert
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

create policy "creators and managers can remove members"
  on public.organization_members for delete
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
  );
