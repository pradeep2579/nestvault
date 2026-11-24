-- Cover foreign keys so lookups and cascading deletes stay fast as data grows.
create index if not exists lead_notes_lead_idx on public.lead_notes(lead_id, created_at desc);
create index if not exists lead_notes_author_idx on public.lead_notes(author_id);
create index if not exists leads_assigned_idx on public.leads(assigned_to);
create index if not exists posts_author_idx on public.posts(author_id);
