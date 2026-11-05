# Nest Vault website and admin

Next.js 16 site with a protected CRM, blog editor, SEO settings, and Google reporting. The public site is designed for `https://nestvault.in`; the recommended deployment is Vercel with Supabase.

## CRM lead import and export

In `/admin/leads`, use **All leads** for the searchable, paginated list or **Pipeline** to see lead counts and contacts grouped by stage. Drag a card into another stage, or use its **Move to** menu on touch and keyboard devices. Open a card to update its owner, follow-up, tour time, and notes. The board shows up to 100 cards per stage and links to the full filtered list when a stage has more. Download **Export all leads** to save a complete CSV, including offline and website enquiries.

To add offline contacts, download the CSV template, fill in one lead per row, and use **Import CSV**. Each row needs a name and either an email or phone number. Stage defaults to `new`; valid stages are `new`, `contacted`, `tour_scheduled`, `tour_completed`, `won`, and `lost`. Optional `follow_up_at` and `tour_at` values must be ISO 8601 dates with a timezone, such as `2026-11-06T10:00:00+05:30`. Imports accept up to 500 rows and 1 MB per file. The result reports added, duplicate, and rejected rows. Imported leads are marked `offline`.

## Local setup

Use Node.js 22.13+ LTS or 24+, then run:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Create a Supabase project directly or through the [Vercel Supabase Marketplace integration](https://vercel.com/marketplace/supabase/supabase). The Vercel integration supplies `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` when its resource is connected to the Vercel project. For local development, copy those values into `.env.local`. Legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` also work. Keep the secret key server-side. Run [`supabase/migrations/20261104_nestvault.sql`](supabase/migrations/20261104_nestvault.sql) in the project's SQL editor. The migration creates the public blog image bucket, tables, indexes, and row level security. Database access is limited to server code that checks an admin's role.

In Supabase Authentication, create the first owner user. Copy their Auth user UUID, then run:

```sql
insert into public.profiles (id, email, role)
values ('AUTH_USER_UUID', 'owner@example.com', 'owner');
```

Set the Supabase Auth Site URL to `https://nestvault.in` and add `https://nestvault.in/login/invite` to allowed redirect URLs. The owner can then invite staff and additional owners, change their roles, or disable their access from `/admin/team`. For local invitations, also allow `http://localhost:3000/login/invite` and set `NEXT_PUBLIC_SITE_URL=http://localhost:3000` locally.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `SUPABASE_SECRET_KEY` | Server-only database and storage key |
| `NEXT_PUBLIC_SITE_URL` | Public site origin, including protocol |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Optional GA4 web stream ID for page views and saved-enquiry events |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | OAuth client for read-only Search Console and GA4 reports |
| `GOOGLE_TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte key for stored Google tokens |

Generate the token encryption key with `openssl rand -base64 32`. Keep it stable after connecting Google; changing it requires reconnecting the account.

## Google reporting

In Google Cloud, enable the **Search Console API** and **Google Analytics Data API**. Create an OAuth web client and register `https://nestvault.in/api/admin/google/callback` as an authorized redirect URI. Add the client ID, secret, and encryption key to the server environment. In `/admin/analytics`, connect a Google account that can read the Search Console and GA4 properties, then enter the Search Console property URL (or `sc-domain:nestvault.in`) and the numeric GA4 property ID. The GA4 measurement ID is separate and must also be set in the environment for new page views and enquiry events.

Google reporting requests use read-only scopes. The app stores the refresh token encrypted in Supabase. The dashboard reports Search Console queries/pages and GA4 users, sessions, page views, and the `generate_lead` event emitted after an enquiry is saved.

## Deploy

Deploy this repository as a **Next.js application**, not a static export. Add the environment variables in Vercel, apply the Supabase migration, and verify the preview deployment. Test an owner login, staff restrictions, lead form submission, image upload, draft preview, scheduled publishing, sitemap, and Google connection. Once the preview is verified, connect `nestvault.in` to the Vercel project and update DNS. Scheduled articles become public automatically when their India-time publish timestamp arrives; no cron service is needed.

Run `npm run lint`, `npm run test`, and `npm run build` before deployment. Without Supabase configuration, the public site can build and show an empty blog, while admin and lead storage require the database settings.
