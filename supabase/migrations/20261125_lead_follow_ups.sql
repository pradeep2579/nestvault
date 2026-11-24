-- Follow-up 1 reuses the existing follow_up_at column; add its outcome and a second follow-up.
alter table public.leads
  add column if not exists follow_up_1_outcome text,
  add column if not exists follow_up_1_note text,
  add column if not exists follow_up_2_at timestamptz,
  add column if not exists follow_up_2_outcome text,
  add column if not exists follow_up_2_note text;
