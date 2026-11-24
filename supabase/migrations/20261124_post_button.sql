-- Optional call-to-action button shown on a blog article.
alter table public.posts add column if not exists button_label text;
alter table public.posts add column if not exists button_url text;
