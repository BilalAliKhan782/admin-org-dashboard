alter table public.organization_members
add column invitation_token uuid not null unique default gen_random_uuid();

create index organization_members_invitation_token_idx
  on public.organization_members(invitation_token);

create policy "active members read organizations"
  on public.organizations for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = organizations.id
        and organization_members.user_id = auth.uid()
        and organization_members.status = 'active'
    )
  );

create policy "active members read organization members"
  on public.organization_members for select
  using (
    exists (
      select 1 from public.organization_members as active_members
      where active_members.organization_id = organization_members.organization_id
        and active_members.user_id = auth.uid()
        and active_members.status = 'active'
    )
  );

create or replace function public.get_invitation_by_token(p_token uuid)
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  email text,
  role public.member_role,
  status public.member_status,
  invited_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    organization_members.id,
    organization_members.organization_id,
    organizations.name as organization_name,
    organization_members.email,
    organization_members.role,
    organization_members.status,
    organization_members.invited_at
  from public.organization_members
  join public.organizations
    on organizations.id = organization_members.organization_id
  where organization_members.invitation_token = p_token
  limit 1;
$$;

create or replace function public.accept_invitation(p_token uuid)
returns table (organization_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  accepted_organization_id uuid;
  authenticated_email text;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to accept an invitation.';
  end if;

  authenticated_email := lower(coalesce(auth.jwt() ->> 'email', ''));

  update public.organization_members
  set
    user_id = auth.uid(),
    status = 'active',
    joined_at = now()
  where invitation_token = p_token
    and status = 'invited'
    and lower(email) = authenticated_email
  returning public.organization_members.organization_id into accepted_organization_id;

  if accepted_organization_id is null then
    raise exception 'Invitation not found, already accepted, or assigned to a different email.';
  end if;

  return query select accepted_organization_id;
end;
$$;

grant execute on function public.get_invitation_by_token(uuid) to anon, authenticated;
grant execute on function public.accept_invitation(uuid) to authenticated;
