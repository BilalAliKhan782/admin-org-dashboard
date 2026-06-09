alter table public.organization_members
add column if not exists invitation_expires_at timestamptz not null default (now() + interval '7 days');

create index if not exists organization_members_invitation_expires_at_idx
  on public.organization_members(invitation_expires_at)
  where status = 'invited';

drop function if exists public.get_invitation_by_token(uuid);

create or replace function public.get_invitation_by_token(p_token uuid)
returns table (
  id uuid,
  organization_id uuid,
  organization_name text,
  email text,
  role public.member_role,
  status public.member_status,
  invited_at timestamptz,
  invitation_expires_at timestamptz
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
    organization_members.invited_at,
    organization_members.invitation_expires_at
  from public.organization_members
  join public.organizations
    on organizations.id = organization_members.organization_id
  where organization_members.invitation_token = p_token
  limit 1;
$$;

grant execute on function public.get_invitation_by_token(uuid) to anon, authenticated;

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
    and invitation_expires_at > now()
    and lower(email) = authenticated_email
  returning public.organization_members.organization_id into accepted_organization_id;

  if accepted_organization_id is null then
    raise exception 'Invitation not found, expired, already accepted, or assigned to a different email.';
  end if;

  return query select accepted_organization_id;
end;
$$;

grant execute on function public.accept_invitation(uuid) to authenticated;
