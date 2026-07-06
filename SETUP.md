# Business Manager — Setup Guide

A single-user e-commerce business manager (expenses, income, MYR insights, Excel export).
Stack: Next.js 16 + Supabase (Auth/Postgres/Storage) + Drizzle ORM, deployed on Vercel.

The application code is complete. The steps below are the **manual account setup** that
must be done with your own Supabase and Vercel accounts (these can't be automated).

---

## 1. Create the Supabase project (free tier)

1. Go to https://supabase.com → create a new project. Pick a region close to you
   (e.g. Southeast Asia / Singapore). Save the database password.
2. In **Project Settings → API**, copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret; server-only)
3. In **Project Settings → Database → Connection string**, copy the **Transaction pooler**
   string (port `6543`) → `DATABASE_URL`. Replace `[YOUR-PASSWORD]` with your DB password.

## 2. Configure local environment

Copy `.env.example` to `.env.local` and fill in the four values from step 1:

```bash
cp .env.example .env.local
# then edit .env.local
```

## 3. Create your login user

In the Supabase dashboard → **Authentication → Users → Add user**, create your
email + password. This is the only account (single-user app).

## 4. Apply the database schema

From the project directory, with `.env.local` filled in:

```bash
npm install
npm run db:migrate
```

Verify the four tables (`expenses`, `expense_attachments`, `sales`, `withdrawals`)
appear in the Supabase **Table Editor**.

## 5. Apply RLS policies + create the storage bucket

Open the Supabase **SQL Editor**, paste the contents of `supabase/policies.sql`, and run it.
This enables Row Level Security on all tables and creates the private `receipts` bucket.
Verify RLS is on for all four tables and the `receipts` bucket exists (private).

## 6. Run locally

```bash
npm run dev
```

Visit http://localhost:3000 → you'll be redirected to `/login`. Sign in with the user
from step 3. Smoke test: add an expense + upload a receipt, add sales + a withdrawal,
view Insights across Month/Year/All time, and download an Excel export.

---

## 7. Deploy to Vercel (free tier)

1. Push this repo to GitHub (if not already).
2. On https://vercel.com → **New Project** → import the repo. Framework is auto-detected
   as Next.js. If the repo root is the parent folder, set the **Root Directory** to
   `personal/business-manager`.
3. In **Settings → Environment Variables**, add the same four variables from `.env.example`
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
   `DATABASE_URL` = the Transaction pooler string).
4. Deploy. Open the production URL on your phone and PC, sign in, and re-run the smoke test.

### Optional: keep-alive
Supabase free projects pause after ~7 days of inactivity (they resume in ~1 minute on next
login). Since you'll use this regularly, this is usually a non-issue. If it bothers you,
add a scheduled ping (e.g. an external uptime pinger hitting the site) to keep it warm.

---

## Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Run the dev server |
| `npm run build` | Production build |
| `npm run test` | Run the Vitest unit tests |
| `npm run db:generate` | Regenerate migration SQL after schema changes |
| `npm run db:migrate` | Apply migrations to the database |

## Notes / current limitations

- **Currency:** amounts are entered manually in MYR; RMB is reference-only (no conversion).
- **Withdrawals** are create/delete only (no in-place edit) — to correct one, delete and re-add.
- **Sales** are one gross figure per platform per month; re-saving the same month+platform
  overwrites the previous value (upsert).
- Filtering/aggregation is done in application code (fine at single-user scale).
