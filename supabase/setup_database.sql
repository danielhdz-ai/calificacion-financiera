-- Livendia Finance: esquema completo con autenticación por usuario

create table if not exists public.clients (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collaborators (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inmobiliarios (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasadores (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notarias (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.clients add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.collaborators add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.inmobiliarios add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.tasadores add column if not exists user_id uuid references auth.users(id) on delete cascade;
alter table public.notarias add column if not exists user_id uuid references auth.users(id) on delete cascade;

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

drop trigger if exists inmobiliarios_set_updated_at on public.inmobiliarios;
create trigger inmobiliarios_set_updated_at
  before update on public.inmobiliarios
  for each row execute function public.set_updated_at();

drop trigger if exists tasadores_set_updated_at on public.tasadores;
create trigger tasadores_set_updated_at
  before update on public.tasadores
  for each row execute function public.set_updated_at();

drop trigger if exists notarias_set_updated_at on public.notarias;
create trigger notarias_set_updated_at
  before update on public.notarias
  for each row execute function public.set_updated_at();

alter table public.clients enable row level security;
alter table public.collaborators enable row level security;
alter table public.inmobiliarios enable row level security;
alter table public.tasadores enable row level security;
alter table public.notarias enable row level security;

drop policy if exists "Allow public read clients" on public.clients;
drop policy if exists "Allow public write clients" on public.clients;
drop policy if exists "Users manage own clients" on public.clients;
create policy "Users manage own clients"
  on public.clients for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Allow public read collaborators" on public.collaborators;
drop policy if exists "Allow public write collaborators" on public.collaborators;
drop policy if exists "Users manage own collaborators" on public.collaborators;
create policy "Users manage own collaborators"
  on public.collaborators for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Allow public read inmobiliarios" on public.inmobiliarios;
drop policy if exists "Allow public write inmobiliarios" on public.inmobiliarios;
drop policy if exists "Users manage own inmobiliarios" on public.inmobiliarios;
create policy "Users manage own inmobiliarios"
  on public.inmobiliarios for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Allow public read tasadores" on public.tasadores;
drop policy if exists "Allow public write tasadores" on public.tasadores;
drop policy if exists "Users manage own tasadores" on public.tasadores;
create policy "Users manage own tasadores"
  on public.tasadores for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Allow public read notarias" on public.notarias;
drop policy if exists "Allow public write notarias" on public.notarias;
drop policy if exists "Users manage own notarias" on public.notarias;
create policy "Users manage own notarias"
  on public.notarias for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop table if exists public.evaluations;
