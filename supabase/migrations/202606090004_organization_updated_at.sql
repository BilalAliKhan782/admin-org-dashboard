alter table public.organizations
add column updated_at timestamptz not null default now();

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_organizations_updated_at
  before update on public.organizations
  for each row
  execute function public.update_updated_at_column();
