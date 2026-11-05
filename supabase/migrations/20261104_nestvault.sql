create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'staff')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null, email text not null, phone text, company text,
  interest text, team_size text, message text,
  stage text not null default 'new' check (stage in ('new','contacted','tour_scheduled','tour_completed','won','lost')),
  assigned_to uuid references public.profiles(id) on delete set null,
  follow_up_at timestamptz, tour_at timestamptz,
  source text not null default 'website',
  dedupe_key text unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index leads_created_idx on public.leads(created_at desc);
create index leads_stage_idx on public.leads(stage);

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  body text not null, created_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null, slug text not null unique, excerpt text not null default '',
  body_html text not null default '', cover_url text, cover_alt text,
  status text not null default 'draft' check (status in ('draft','scheduled','published')),
  published_at timestamptz, author_id uuid references public.profiles(id) on delete set null,
  seo_title text, seo_description text, canonical_url text, social_image text,
  noindex boolean not null default false, schema_type text not null default 'BlogPosting',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index posts_public_idx on public.posts(status, published_at desc);

create table public.site_seo (
  page_key text primary key,
  title text not null, description text not null, canonical_url text,
  social_image text, social_image_alt text, noindex boolean not null default false,
  business_json jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now()
);
insert into public.site_seo(page_key,title,description,social_image,social_image_alt)
values ('home','Nest Vault — Premium Co-working Space in Hyderabad',
  'Private cabins, dedicated desks, meeting rooms, and virtual offices at Nest Vault in Jubilee Hills, Hyderabad.',
  '/images/lounge-wide.jpg','Nest Vault coworking lounge in Hyderabad');

create table public.redirects (
  id uuid primary key default gen_random_uuid(), source_path text not null unique,
  destination_path text not null, permanent boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.integrations (
  name text primary key, access_token_encrypted text not null,
  refresh_token_encrypted text not null, expires_at timestamptz,
  search_site text, ga4_property_id text, updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_notes enable row level security;
alter table public.posts enable row level security;
alter table public.site_seo enable row level security;
alter table public.redirects enable row level security;
alter table public.integrations enable row level security;
revoke all on public.profiles, public.leads, public.lead_notes, public.posts,
  public.site_seo, public.redirects, public.integrations from anon, authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('blog-images', 'blog-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- All table access goes through the server's service role after role checks.
-- Bootstrap the first owner after inviting their Supabase Auth user:
-- insert into public.profiles(id,email,role) values ('AUTH_USER_UUID','owner@example.com','owner');
