# Nest Vault website and admin

Next.js 16 site with a protected CRM, blog editor, SEO settings, and Google reporting. The public site is designed for `https://nestvault.in`; the recommended deployment is Vercel with Supabase.

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
