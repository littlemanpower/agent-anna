-- Email-update subscribers. Service role only (RLS on, no policies).
-- This file is not applied until the owner approves a migration.
create table if not exists public.anna_subscribers (
  id bigint generated always as identity primary key,
  email text not null,
  email_norm text generated always as (lower(trim(email))) stored,
  consented_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now(),
  unsubscribed_at timestamp with time zone
);

create unique index if not exists anna_subscribers_email_norm_key
  on public.anna_subscribers (email_norm);

alter table public.anna_subscribers enable row level security;

revoke all on table public.anna_subscribers from anon, authenticated, public;
grant all on table public.anna_subscribers to service_role;

comment on table public.anna_subscribers is
  'Email update signups for Agent Anna. Unique on lower(trim(email)). No public read or write. Unsubscribe handling is not live yet.';
