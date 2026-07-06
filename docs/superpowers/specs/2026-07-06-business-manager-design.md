# Business Manager — Design Spec

**Date:** 2026-07-06
**Status:** Approved for planning
**Owner:** Sai Ming Lam

## 1. Purpose

A personal e-commerce business management system for a single seller. It records
costing (expenses) and income (gross sales + actual withdrawals), surfaces business
insights, and exports expense reports to Excel. All statistics and business insights
are displayed in **MYR**. The app is mobile-first (usable on phone and PC) and hosted
free on cloud infrastructure.

## 2. Goals & Success Criteria

- Record expenses with mandatory Order ID and support attaching proof-of-payment /
  receipt files during or after record creation.
- Record income as two distinct concepts: monthly gross **Sales** (per platform) and
  actual **Withdrawals** (per payout).
- View monthly / yearly / all-time insights for sales, income, expenses, and net profit.
- Export expenses to Excel filtered by month/year, sorted by order date ascending.
- Runs on free-tier cloud hosting and works well on a mobile browser.

## 3. Non-Goals (YAGNI)

- No live currency conversion or exchange-rate API — RMB is reference-only, MYR entered manually.
- No multi-user accounts or roles — single user only.
- No Excel export for income — expenses only (per requirement).
- No Shopee/Lazada API integration — withdrawals are entered manually, including
  Shopee's auto-withdraw (the system does not auto-generate them).
- No native mobile app — responsive web only.

## 4. Tech Stack & Hosting

All components use free tiers.

| Layer | Choice | Notes |
|---|---|---|
| Frontend + Backend | Next.js 15 (App Router, TypeScript) | UI + API in one project; Server Actions / Route Handlers for backend |
| Hosting | Vercel (Hobby) | Free, auto HTTPS |
| UI | Tailwind CSS + shadcn/ui | Mobile-first responsive |
| Database | Supabase Postgres | 500 MB free |
| DB access | Drizzle ORM | Typed, lightweight, serverless-friendly; use Supabase pooled connection string |
| Auth | Supabase Auth (email/password) | Single user |
| File storage | Supabase Storage (private `receipts` bucket) | 1 GB free; access via signed URLs |
| Excel export | `exceljs` | Generated server-side in a Route Handler |
| Testing | Vitest | Unit/integration for aggregation, export, validation logic |

### Free-tier caveats

- **Supabase free projects pause after ~7 days of inactivity.** Resuming takes ~1 minute
  on next login. Since the app is used regularly this is a non-issue. Optional mitigation:
  a lightweight scheduled ping (e.g., Vercel Cron or an external uptime pinger hitting a
  health endpoint) to keep the project warm. Documented as optional, not built by default.
- Store all secrets (Supabase URL, anon key, service-role key, DB connection string) in
  Vercel environment variables. The service-role key is used only in server-side code.

## 5. Data Model

All tables include `id` (uuid PK), `user_id` (uuid, FK to auth user), `created_at`,
`updated_at`. Every table is protected by Postgres **Row Level Security (RLS)** so a row
is only accessible to its owning `user_id` (= `auth.uid()`).

### 5.1 `expenses`

| Column | Type | Constraints |
|---|---|---|
| order_id | text | **NOT NULL** (mandatory) |
| order_date | date | NOT NULL |
| item_name | text | NOT NULL |
| quantity | integer | NOT NULL, > 0 |
| payment_account | enum(`personal`,`business`) | NOT NULL |
| cost_rmb | numeric(12,2) | nullable (reference only, no conversion) |
| cost_myr | numeric(12,2) | NOT NULL |

### 5.2 `expense_attachments`

An expense can have multiple attachments, each tagged. Files are uploadable during
creation or added later (receipts often arrive days after the transaction).

| Column | Type | Constraints |
|---|---|---|
| expense_id | uuid | FK → expenses (ON DELETE CASCADE) |
| file_path | text | NOT NULL — path in Supabase Storage |
| file_type | enum(`image`,`pdf`) | NOT NULL |
| original_filename | text | NOT NULL |
| tag | enum(`proof_of_payment`,`receipt`) | NOT NULL |

Storage path convention: `{user_id}/{expense_id}/{uuid}-{original_filename}` in the
private `receipts` bucket. Downloads/views use short-lived signed URLs.

### 5.3 `sales` (monthly gross per platform)

| Column | Type | Constraints |
|---|---|---|
| period_date | date | NOT NULL — selected via date picker (defaults to today) |
| year | integer | NOT NULL — derived from period_date |
| month | integer | NOT NULL (1–12) — derived from period_date |
| platform | enum(`shopee`,`lazada`,`others`) | NOT NULL |
| gross_amount_myr | numeric(12,2) | NOT NULL |
| note | text | nullable |

Unique constraint: `(user_id, year, month, platform)` — one gross-sales record per
platform per month. Editing an existing month/platform updates that record.

### 5.4 `withdrawals` (actual income payouts)

| Column | Type | Constraints |
|---|---|---|
| withdrawal_date | date | NOT NULL — date picker defaults to today |
| platform | enum(`shopee`,`lazada`,`others`) | NOT NULL |
| amount_myr | numeric(12,2) | NOT NULL |
| type | enum(`auto`,`manual`) | NOT NULL — Shopee auto-withdraw vs manual |
| order_id | text | nullable; **required when platform = `others`** |
| note | text | nullable |

## 6. Screens & Behavior (mobile-first)

1. **Login** — Supabase Auth email/password. Unauthenticated users are redirected here;
   all data routes require an authenticated session.

2. **Dashboard / Insights**
   - Period selector: **Month / Year / All time**.
   - Summary cards (all MYR): Gross Sales, Withdrawal Income, Total Expenses,
     **Net Profit = Withdrawal Income − Total Expenses**.
   - Per-platform breakdown table for sales and withdrawals.

3. **Expenses**
   - List of expenses, sorted by order date, with filter by month/year and text search.
   - Each row shows Order ID, date, item, quantity, account, Cost MYR, and **attachment
     tag badges**: "Proof", "Receipt", or "None" so the user sees at a glance what's uploaded.
   - Create / edit / delete an expense.
   - Attachment management: upload image/PDF files with a required tag selection
     (Proof of Payment / Receipt), during creation or later; view/download via signed URL;
     remove an attachment.

4. **Income** — two tabs:
   - **Sales**: add/edit/delete monthly gross sales per platform. Date picker defaults to
     today; month/year derived from it.
   - **Withdrawals**: add/edit/delete payouts. Date picker defaults to today. `order_id`
     field appears/required when platform is "Others".

5. **Export**
   - Select month/year → download `.xlsx` of expenses.
   - Columns, in order: **Order Number, Date of Purchase, Item, Account, Quantity,
     Price(RMB), Price(MYR)**.
   - Rows sorted by order date **ascending**.
   - Generated server-side via `exceljs` in a Route Handler; streamed as a file download.

## 7. Security

- Supabase Auth session required for all app routes and API handlers.
- Postgres RLS policies restrict every table's rows to `auth.uid()`.
- `receipts` storage bucket is private; files served only via short-lived signed URLs.
- Service-role key used only server-side; never exposed to the client.

## 8. Testing Strategy

- **Vitest** unit/integration tests for the pure logic that carries risk:
  - Insight aggregations (period filtering: month/year/all-time; net profit; per-platform totals).
  - Excel export (column order, ascending sort by order date, month/year filtering, RMB blank handling).
  - Validation rules (mandatory Order ID, MYR required, "others" requires order_id for withdrawals,
    unique sales per platform/month).
- Manual/E2E verification of file upload + signed-URL download flows.

## 9. Open Questions

None outstanding. All clarifications resolved during brainstorming:
single-user with login; track sales and withdrawals separately; manual MYR (no conversion);
Vercel + Supabase stack; sales per platform per month; multiple tagged attachments per expense;
Order ID mandatory on expenses; net profit shown; income records have a date picker defaulting to today.
