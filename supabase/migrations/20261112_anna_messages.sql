-- Visitor messages left for Anna. Service role only (RLS on, no policies).
create table if not exists public.anna_messages (
  id bigint generated always as identity primary key,
  visitor_name text,
  visitor_contact text,
  body text not null,
  created_at timestamp with time zone not null default now(),
  surfaced_at timestamp with time zone
);

alter table public.anna_messages enable row level security;

revoke all on table public.anna_messages from anon, authenticated, public;
grant all on table public.anna_messages to service_role;

comment on table public.anna_messages is
  'Visitor notes for Anna. Surfaced in the Agent Anna team daily report, then surfaced_at is set. No public read or write.';
