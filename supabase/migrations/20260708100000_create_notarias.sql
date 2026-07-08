-- Tabla de colaboradores notarías para Livendia Finance

create table if not exists public.notarias (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notarias add column if not exists user_id uuid references auth.users(id) on delete cascade;

drop trigger if exists notarias_set_updated_at on public.notarias;
create trigger notarias_set_updated_at
  before update on public.notarias
  for each row execute function public.set_updated_at();

alter table public.notarias enable row level security;

drop policy if exists "Users manage own notarias" on public.notarias;
create policy "Users manage own notarias"
  on public.notarias for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
