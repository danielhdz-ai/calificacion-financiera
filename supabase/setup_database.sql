-- GSCAPITAL: esquema completo

create table if not exists public.clients (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collaborators (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasadores (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists clients_set_updated_at on public.clients;
create trigger clients_set_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

drop trigger if exists collaborators_set_updated_at on public.collaborators;
create trigger collaborators_set_updated_at
  before update on public.collaborators
  for each row execute function public.set_updated_at();

drop trigger if exists tasadores_set_updated_at on public.tasadores;
create trigger tasadores_set_updated_at
  before update on public.tasadores
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.collaborators enable row level security;
alter table public.tasadores enable row level security;

drop policy if exists "Allow public read clients" on public.clients;
create policy "Allow public read clients"
  on public.clients for select to anon, authenticated using (true);

drop policy if exists "Allow public write clients" on public.clients;
create policy "Allow public write clients"
  on public.clients for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow public read collaborators" on public.collaborators;
create policy "Allow public read collaborators"
  on public.collaborators for select to anon, authenticated using (true);

drop policy if exists "Allow public write collaborators" on public.collaborators;
create policy "Allow public write collaborators"
  on public.collaborators for all to anon, authenticated using (true) with check (true);

drop policy if exists "Allow public read tasadores" on public.tasadores;
create policy "Allow public read tasadores"
  on public.tasadores for select to anon, authenticated using (true);

drop policy if exists "Allow public write tasadores" on public.tasadores;
create policy "Allow public write tasadores"
  on public.tasadores for all to anon, authenticated using (true) with check (true);

drop table if exists public.evaluations;
