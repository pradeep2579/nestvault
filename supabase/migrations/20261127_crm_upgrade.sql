-- CRM upgrade: qualification, attribution, lost reason, deal details, test flag, response time, activity log.
alter table public.leads
  add column if not exists lost_reason text,
  add column if not exists tour_completed_at timestamptz,
  add column if not exists won_plan text,
  add column if not exists won_value numeric(12,2),
  add column if not exists won_seats integer,
  add column if not exists won_start_date date,
  add column if not exists move_in text,
  add column if not exists budget text,
  add column if not exists channel text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists referrer text,
  add column if not exists is_test boolean not null default false,
  add column if not exists first_contacted_at timestamptz;

-- Last 10 digits of the phone number, used to spot the same person typed two different ways.
alter table public.leads
  add column if not exists phone_key text generated always as (right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10)) stored;
create index if not exists leads_phone_key_idx on public.leads(phone_key) where phone_key <> '';
create index if not exists leads_email_lower_idx on public.leads(lower(email)) where email <> '';
create index if not exists leads_follow_up_idx on public.leads(follow_up_at) where follow_up_at is not null;

update public.leads set first_contacted_at = updated_at where stage <> 'new' and first_contacted_at is null;
update public.leads set tour_completed_at = coalesce(tour_at, updated_at) where stage = 'tour_completed' and tour_completed_at is null;
update public.leads set channel = case when source = 'offline' then 'Other' else 'Direct / unknown' end where channel is null;

create table if not exists public.lead_activity (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  kind text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists lead_activity_lead_idx on public.lead_activity(lead_id, created_at desc);
create index if not exists lead_activity_actor_idx on public.lead_activity(actor_id);
alter table public.lead_activity enable row level security;
revoke all on public.lead_activity from anon, authenticated;
