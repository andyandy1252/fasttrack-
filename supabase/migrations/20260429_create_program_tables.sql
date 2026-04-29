-- Creates gender-specific soccer program tables.
-- These tables are the source of truth for program availability by gender.

create table if not exists public.mens_programs (
  id bigserial primary key,
  school_name text not null,
  school_name_normalized text not null,
  division text not null, -- D1|D2|D3|NAIA|JUCO
  conference text,
  state text,
  athletics_url text,
  soccer_url text,
  source text,
  source_updated_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists mens_programs_norm_division_uq
  on public.mens_programs (school_name_normalized, division);

create index if not exists mens_programs_division_idx
  on public.mens_programs (division);

create index if not exists mens_programs_conference_idx
  on public.mens_programs (conference);

-- API access:
-- - service_role: scripts can upsert/import
-- - anon/authenticated: app can read
grant select, insert, update, delete on table public.mens_programs to service_role;
grant usage, select on sequence public.mens_programs_id_seq to service_role;
grant select on table public.mens_programs to anon, authenticated;

alter table public.mens_programs enable row level security;
drop policy if exists mens_programs_read_all on public.mens_programs;
create policy mens_programs_read_all
  on public.mens_programs
  for select
  to anon, authenticated
  using (true);


create table if not exists public.womens_programs (
  id bigserial primary key,
  school_name text not null,
  school_name_normalized text not null,
  division text not null, -- D1|D2|D3|NAIA|JUCO
  conference text,
  state text,
  athletics_url text,
  soccer_url text,
  source text,
  source_updated_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists womens_programs_norm_division_uq
  on public.womens_programs (school_name_normalized, division);

create index if not exists womens_programs_division_idx
  on public.womens_programs (division);

create index if not exists womens_programs_conference_idx
  on public.womens_programs (conference);

grant select, insert, update, delete on table public.womens_programs to service_role;
grant usage, select on sequence public.womens_programs_id_seq to service_role;
grant select on table public.womens_programs to anon, authenticated;

alter table public.womens_programs enable row level security;
drop policy if exists womens_programs_read_all on public.womens_programs;
create policy womens_programs_read_all
  on public.womens_programs
  for select
  to anon, authenticated
  using (true);

