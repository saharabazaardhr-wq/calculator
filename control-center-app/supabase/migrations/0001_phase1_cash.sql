-- Control Center · Phase 1 (cash control) schema for Supabase / Postgres.
-- Mirrors src/lib/types.ts. Not applied yet: run when the Supabase project is created.

create extension if not exists pgcrypto;

create type level as enum ('owner', 'manager', 'staff');
create type shift_status as enum ('open', 'green', 'red');
create type review_status as enum ('pending', 'review', 'accepted');

create table roles (
  id text primary key,
  name text not null,
  level level not null,
  counter boolean not null default false
);

create table people (
  id text primary key,
  auth_user_id uuid unique references auth.users(id),
  name text not null,
  role_id text not null references roles(id),
  dept text not null default '',
  manager_id text references people(id),
  phone text,
  pin_hash text not null,            -- never store the PIN itself
  shift_start time default '09:00',
  active boolean not null default true
);

create table cash_settings (
  id int primary key default 1 check (id = 1),
  tolerance int not null default 50,
  ceiling int not null default 1000,
  timeout_min int not null default 30,
  repeat_red int not null default 3,
  default_float int not null default 5000,
  counters text[] not null,
  red_reasons text[] not null,
  out_reasons text[] not null
);

create table shifts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  counter text not null,
  cashier_id text not null references people(id),
  opened_at timestamptz not null default now(),
  float_open int not null,
  float_expected int not null,
  float_ok boolean not null,
  notes jsonb not null default '{}',     -- {"500": 24, "200": 7, ..., "coins": 40}
  modes jsonb not null default '{}',     -- {"cash": 10000, "upi": 8200, ...}  (later imported from eFacto)
  status shift_status not null default 'open',
  reason text not null default '',
  submitted_at timestamptz,
  handover_float int,
  review_status review_status,
  review_by text references people(id),
  review_at timestamptz,
  review_note text,
  escalated boolean not null default false
);
create index shifts_date_idx on shifts (date);
create index shifts_cashier_idx on shifts (cashier_id, date);
create unique index one_open_shift_per_counter on shifts (counter) where status = 'open';

create table cash_outs (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references shifts(id) on delete cascade,
  amount int not null check (amount > 0),
  reason text not null,
  at timestamptz not null default now()
);

create table activity_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  by_person text references people(id),
  action text not null,
  detail text not null default ''
);
create index activity_log_at_idx on activity_log (at desc);

-- ---------- access rules (row-level security) ----------
alter table people enable row level security;
alter table shifts enable row level security;
alter table cash_outs enable row level security;
alter table activity_log enable row level security;
alter table cash_settings enable row level security;

create or replace function me() returns people language sql stable security definer as $$
  select * from people where auth_user_id = auth.uid()
$$;

create or replace function is_owner() returns boolean language sql stable security definer as $$
  select exists (select 1 from people p join roles r on r.id = p.role_id where p.auth_user_id = auth.uid() and r.level = 'owner')
$$;

-- people the signed-in person may see: themselves and everyone below them (owner: all)
create or replace function visible_people() returns setof text language sql stable security definer as $$
  with recursive team as (
    select id from people where auth_user_id = auth.uid()
    union
    select p.id from people p join team t on p.manager_id = t.id
  )
  select id from team
  union
  select id from people where is_owner()
$$;

create policy "see team" on people for select using (id in (select visible_people()));
create policy "see team shifts" on shifts for select using (cashier_id in (select visible_people()));
create policy "cashier opens own shift" on shifts for insert with check (cashier_id = (me()).id);
-- open shifts: the cashier edits their own; locked shifts: only managers in the chain change the review; owner reopens
create policy "cashier edits own open shift" on shifts for update using (cashier_id = (me()).id and status = 'open');
create policy "managers decide red shifts" on shifts for update using (cashier_id in (select visible_people()) and cashier_id <> (me()).id and status = 'red');
create policy "see cash outs" on cash_outs for select using (shift_id in (select id from shifts));
create policy "add cash out to own open shift" on cash_outs for insert with check (shift_id in (select id from shifts where cashier_id = (me()).id and status = 'open'));
create policy "everyone reads settings" on cash_settings for select using (true);
create policy "owner changes settings" on cash_settings for update using (is_owner());
create policy "owner reads log" on activity_log for select using (is_owner());
create policy "anyone signed in writes log" on activity_log for insert with check (by_person = (me()).id);
