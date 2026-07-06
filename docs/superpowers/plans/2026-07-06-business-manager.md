# Business Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-user, mobile-first e-commerce business manager that records expenses (with tagged receipt/proof uploads) and income (monthly gross sales + actual withdrawals), shows MYR business insights, and exports expenses to Excel.

**Architecture:** One Next.js 15 (App Router, TypeScript) project deployed on Vercel handles both UI and backend (Server Actions + Route Handlers). Supabase provides Postgres (accessed via Drizzle ORM), Auth (email/password), and private file Storage. Risky pure logic — validation, insight aggregation, Excel export — lives in framework-free modules under `src/lib/` and is covered by Vitest TDD. UI CRUD is built from shared form/list primitives to stay DRY across the three domains.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS + shadcn/ui, Supabase (Postgres/Auth/Storage), Drizzle ORM, Zod, ExcelJS, Vitest.

**Spec:** `docs/superpowers/specs/2026-07-06-business-manager-design.md`

---

## File Structure

```
business-manager/
├── drizzle.config.ts                 # Drizzle Kit config
├── vitest.config.ts                  # Vitest config
├── middleware.ts                     # Supabase session refresh + route guard
├── .env.local / .env.example         # Supabase + DB secrets
├── supabase/
│   └── policies.sql                  # RLS policies + storage bucket setup
├── src/
│   ├── db/
│   │   ├── schema.ts                 # Drizzle tables + enums
│   │   └── index.ts                  # Drizzle client (pooled connection)
│   ├── lib/
│   │   ├── types.ts                  # Shared domain types (Platform, Period, rows)
│   │   ├── money.ts                  # Cent-safe sum + MYR formatting
│   │   ├── period.ts                 # Period filtering helpers
│   │   ├── insights.ts               # summarizeInsights() (pure)
│   │   ├── export.ts                 # buildExpenseWorkbook() (pure-ish)
│   │   ├── validation.ts             # Zod schemas
│   │   └── supabase/
│   │       ├── server.ts             # server-side Supabase client
│   │       └── client.ts             # browser Supabase client
│   ├── data/                         # DB access (server-only)
│   │   ├── expenses.ts
│   │   ├── attachments.ts
│   │   ├── sales.ts
│   │   ├── withdrawals.ts
│   │   └── insights.ts               # fetch rows -> call lib/insights
│   ├── components/
│   │   ├── ui/                        # shadcn/ui generated primitives
│   │   ├── app-nav.tsx               # bottom nav (mobile) / sidebar (desktop)
│   │   ├── period-selector.tsx
│   │   ├── money-input.tsx
│   │   └── confirm-delete.tsx
│   └── app/
│       ├── layout.tsx                # root layout + nav shell
│       ├── globals.css
│       ├── login/page.tsx
│       ├── (app)/
│       │   ├── layout.tsx            # auth-guarded layout
│       │   ├── page.tsx              # dashboard/insights
│       │   ├── expenses/
│       │   │   ├── page.tsx          # list
│       │   │   ├── actions.ts        # server actions (create/update/delete)
│       │   │   ├── new/page.tsx
│       │   │   └── [id]/page.tsx     # edit + attachments
│       │   ├── income/
│       │   │   ├── page.tsx          # tabs: sales | withdrawals
│       │   │   ├── sales-actions.ts
│       │   │   └── withdrawals-actions.ts
│       │   └── export/page.tsx
│       └── api/
│           └── export/route.ts       # streams .xlsx
└── tests/
    ├── money.test.ts
    ├── period.test.ts
    ├── insights.test.ts
    ├── export.test.ts
    └── validation.test.ts
```

---

## Task 1: Scaffold Next.js project + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind` config, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `vitest.config.ts`

- [ ] **Step 1: Scaffold the app**

Run from the repo root (`/Users/lamsaiming/Projects`), targeting the existing folder:

```bash
cd personal/business-manager
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

If prompted about the non-empty directory (the `docs/` folder), choose to continue/keep existing files.

- [ ] **Step 2: Install runtime + dev dependencies**

```bash
npm install drizzle-orm postgres @supabase/supabase-js @supabase/ssr zod exceljs
npm install -D drizzle-kit vitest @types/node
```

- [ ] **Step 3: Add Vitest config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});
```

- [ ] **Step 4: Add test script**

In `package.json` `"scripts"`, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify the toolchain runs**

Run: `npm run test`
Expected: Vitest runs and reports "No test files found" (exit 0) — confirms Vitest is wired up.

Run: `npm run build`
Expected: Next.js build succeeds.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest"
```

---

## Task 2: Environment config + Supabase clients

**Files:**
- Create: `.env.example`, `.env.local`
- Create: `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`

- [ ] **Step 1: Document env vars**

Create `.env.example`:

```bash
# Supabase project settings -> API
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# Supabase project settings -> API -> service_role (server only, keep secret)
SUPABASE_SERVICE_ROLE_KEY=
# Supabase project settings -> Database -> Connection string -> "Transaction" pooler (port 6543)
DATABASE_URL=
```

Copy it to `.env.local` and fill in real values from the Supabase dashboard (created in Task 4). Ensure `.env.local` is git-ignored (Next.js scaffold already ignores it).

- [ ] **Step 2: Browser Supabase client**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

- [ ] **Step 3: Server Supabase client**

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // called from a Server Component; middleware refreshes the session
          }
        },
      },
    },
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add supabase clients and env config"
```

---

## Task 3: Drizzle schema + client

**Files:**
- Create: `src/db/schema.ts`, `src/db/index.ts`, `drizzle.config.ts`

- [ ] **Step 1: Define the schema**

Create `src/db/schema.ts`:

```ts
import {
  pgTable, pgEnum, uuid, text, date, integer, numeric, timestamp, unique,
} from 'drizzle-orm/pg-core';

export const paymentAccountEnum = pgEnum('payment_account', ['personal', 'business']);
export const attachmentTypeEnum = pgEnum('attachment_type', ['image', 'pdf']);
export const attachmentTagEnum = pgEnum('attachment_tag', ['proof_of_payment', 'receipt']);
export const platformEnum = pgEnum('platform', ['shopee', 'lazada', 'others']);
export const withdrawalTypeEnum = pgEnum('withdrawal_type', ['auto', 'manual']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
};

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  orderId: text('order_id').notNull(),
  orderDate: date('order_date').notNull(),
  itemName: text('item_name').notNull(),
  quantity: integer('quantity').notNull(),
  paymentAccount: paymentAccountEnum('payment_account').notNull(),
  costRmb: numeric('cost_rmb', { precision: 12, scale: 2 }),
  costMyr: numeric('cost_myr', { precision: 12, scale: 2 }).notNull(),
  ...timestamps,
});

export const expenseAttachments = pgTable('expense_attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  expenseId: uuid('expense_id').notNull().references(() => expenses.id, { onDelete: 'cascade' }),
  filePath: text('file_path').notNull(),
  fileType: attachmentTypeEnum('file_type').notNull(),
  originalFilename: text('original_filename').notNull(),
  tag: attachmentTagEnum('tag').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  periodDate: date('period_date').notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  platform: platformEnum('platform').notNull(),
  grossAmountMyr: numeric('gross_amount_myr', { precision: 12, scale: 2 }).notNull(),
  note: text('note'),
  ...timestamps,
}, (t) => ({
  uniqPeriodPlatform: unique('sales_user_year_month_platform').on(t.userId, t.year, t.month, t.platform),
}));

export const withdrawals = pgTable('withdrawals', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  withdrawalDate: date('withdrawal_date').notNull(),
  platform: platformEnum('platform').notNull(),
  amountMyr: numeric('amount_myr', { precision: 12, scale: 2 }).notNull(),
  type: withdrawalTypeEnum('type').notNull(),
  orderId: text('order_id'),
  note: text('note'),
  ...timestamps,
});
```

- [ ] **Step 2: Create the Drizzle client**

Create `src/db/index.ts`:

```ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
export const db = drizzle(client, { schema });
```

(`prepare: false` is required for Supabase's transaction pooler.)

- [ ] **Step 3: Create Drizzle Kit config**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

- [ ] **Step 4: Add migration scripts**

In `package.json` `"scripts"` add:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 5: Generate the migration SQL**

Run: `npm run db:generate`
Expected: a SQL file appears under `drizzle/` creating the enums and four tables. (Do not apply yet — applied in Task 4 after the Supabase project exists.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add drizzle schema and client"
```

---

## Task 4: Provision Supabase, apply migrations, RLS + storage

This task has manual dashboard steps. Follow them exactly.

**Files:**
- Create: `supabase/policies.sql`

- [ ] **Step 1: Create the Supabase project**

In the Supabase dashboard: create a new free project. Note the project URL and keys. Fill `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` = the **Transaction pooler** connection string, port 6543).

- [ ] **Step 2: Create your login user**

In Authentication → Users → Add user, create your email/password account (email confirm on). This is the only account.

- [ ] **Step 3: Apply the Drizzle migration**

Run: `npm run db:migrate`
Expected: the four tables and enums are created. Verify in the Supabase Table Editor.

- [ ] **Step 4: Write RLS + storage policies**

Create `supabase/policies.sql`:

```sql
-- Enable RLS on all app tables
alter table expenses enable row level security;
alter table expense_attachments enable row level security;
alter table sales enable row level security;
alter table withdrawals enable row level security;

-- Owner-only access (auth.uid() must equal user_id)
create policy "own_rows" on expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on expense_attachments
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on sales
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_rows" on withdrawals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Private storage bucket for receipts
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false)
on conflict (id) do nothing;

-- Storage access: only files under a folder named after the user's id
create policy "own_files_select" on storage.objects
  for select using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_insert" on storage.objects
  for insert with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own_files_delete" on storage.objects
  for delete using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
```

- [ ] **Step 5: Run the policy SQL**

Paste `supabase/policies.sql` into the Supabase SQL Editor and run it. Verify RLS is enabled on all four tables and the `receipts` bucket exists (private).

> Note: Server-side data access in `src/data/*` uses Drizzle over the pooled connection (service context), so it can read/write freely; RLS is the defense-in-depth layer, and file access from the browser goes through Supabase Storage where these policies apply. Every `src/data/*` function still filters by `userId` explicitly (Task 9+).

- [ ] **Step 6: Commit**

```bash
git add supabase/policies.sql
git commit -m "feat: add RLS policies and receipts storage bucket"
```

---

## Task 5: Shared domain types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Define shared types**

Create `src/lib/types.ts`:

```ts
export type Platform = 'shopee' | 'lazada' | 'others';
export type PaymentAccount = 'personal' | 'business';
export type AttachmentTag = 'proof_of_payment' | 'receipt';
export type WithdrawalType = 'auto' | 'manual';

export type Period =
  | { kind: 'all' }
  | { kind: 'year'; year: number }
  | { kind: 'month'; year: number; month: number };

export interface ExpenseInsightRow {
  orderDate: string; // 'YYYY-MM-DD'
  costMyr: number;
}
export interface SalesInsightRow {
  year: number;
  month: number;
  platform: Platform;
  grossAmountMyr: number;
}
export interface WithdrawalInsightRow {
  withdrawalDate: string; // 'YYYY-MM-DD'
  platform: Platform;
  amountMyr: number;
}

export interface InsightSummary {
  grossSales: number;
  withdrawalIncome: number;
  totalExpenses: number;
  netProfit: number;
  byPlatform: Record<Platform, { grossSales: number; withdrawalIncome: number }>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add shared domain types"
```

---

## Task 6: Money helpers (TDD)

**Files:**
- Create: `src/lib/money.ts`
- Test: `tests/money.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/money.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sumMoney, formatMYR } from '@/lib/money';

describe('sumMoney', () => {
  it('sums without floating point drift', () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([10.10, 20.20, 0.70])).toBe(31);
  });
  it('returns 0 for empty input', () => {
    expect(sumMoney([])).toBe(0);
  });
});

describe('formatMYR', () => {
  it('formats to RM with 2 decimals', () => {
    expect(formatMYR(1234.5)).toBe('RM 1,234.50');
    expect(formatMYR(0)).toBe('RM 0.00');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- money`
Expected: FAIL — cannot resolve `@/lib/money`.

- [ ] **Step 3: Implement**

Create `src/lib/money.ts`:

```ts
export function sumMoney(values: number[]): number {
  const cents = values.reduce((acc, v) => acc + Math.round(v * 100), 0);
  return cents / 100;
}

export function formatMYR(value: number): string {
  return `RM ${value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- money`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/money.ts tests/money.test.ts
git commit -m "feat: add cent-safe money helpers"
```

---

## Task 7: Period filtering helpers (TDD)

**Files:**
- Create: `src/lib/period.ts`
- Test: `tests/period.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/period.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { dateInPeriod, yearMonthInPeriod } from '@/lib/period';
import type { Period } from '@/lib/types';

const all: Period = { kind: 'all' };
const year2026: Period = { kind: 'year', year: 2026 };
const july2026: Period = { kind: 'month', year: 2026, month: 7 };

describe('dateInPeriod', () => {
  it('all matches everything', () => {
    expect(dateInPeriod('2020-01-01', all)).toBe(true);
  });
  it('year matches same year only', () => {
    expect(dateInPeriod('2026-03-15', year2026)).toBe(true);
    expect(dateInPeriod('2025-12-31', year2026)).toBe(false);
  });
  it('month matches same year and month only', () => {
    expect(dateInPeriod('2026-07-01', july2026)).toBe(true);
    expect(dateInPeriod('2026-08-01', july2026)).toBe(false);
    expect(dateInPeriod('2025-07-01', july2026)).toBe(false);
  });
});

describe('yearMonthInPeriod', () => {
  it('filters by year/month integers', () => {
    expect(yearMonthInPeriod(2026, 7, july2026)).toBe(true);
    expect(yearMonthInPeriod(2026, 7, year2026)).toBe(true);
    expect(yearMonthInPeriod(2026, 7, all)).toBe(true);
    expect(yearMonthInPeriod(2026, 8, july2026)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- period`
Expected: FAIL — cannot resolve `@/lib/period`.

- [ ] **Step 3: Implement**

Create `src/lib/period.ts`:

```ts
import type { Period } from '@/lib/types';

export function dateInPeriod(iso: string, period: Period): boolean {
  if (period.kind === 'all') return true;
  const [y, m] = iso.split('-').map(Number);
  if (period.kind === 'year') return y === period.year;
  return y === period.year && m === period.month;
}

export function yearMonthInPeriod(year: number, month: number, period: Period): boolean {
  if (period.kind === 'all') return true;
  if (period.kind === 'year') return year === period.year;
  return year === period.year && month === period.month;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- period`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/period.ts tests/period.test.ts
git commit -m "feat: add period filtering helpers"
```

---

## Task 8: Insight aggregation (TDD)

**Files:**
- Create: `src/lib/insights.ts`
- Test: `tests/insights.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/insights.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { summarizeInsights } from '@/lib/insights';
import type {
  ExpenseInsightRow, SalesInsightRow, WithdrawalInsightRow, Period,
} from '@/lib/types';

const expenses: ExpenseInsightRow[] = [
  { orderDate: '2026-07-05', costMyr: 100 },
  { orderDate: '2026-07-20', costMyr: 50.5 },
  { orderDate: '2026-08-01', costMyr: 25 },
];
const sales: SalesInsightRow[] = [
  { year: 2026, month: 7, platform: 'shopee', grossAmountMyr: 1000 },
  { year: 2026, month: 7, platform: 'lazada', grossAmountMyr: 400 },
  { year: 2026, month: 8, platform: 'shopee', grossAmountMyr: 600 },
];
const withdrawals: WithdrawalInsightRow[] = [
  { withdrawalDate: '2026-07-15', platform: 'shopee', amountMyr: 800 },
  { withdrawalDate: '2026-07-30', platform: 'lazada', amountMyr: 300 },
  { withdrawalDate: '2026-08-15', platform: 'shopee', amountMyr: 500 },
];

const july: Period = { kind: 'month', year: 2026, month: 7 };
const all: Period = { kind: 'all' };

describe('summarizeInsights', () => {
  it('aggregates a single month', () => {
    const s = summarizeInsights(expenses, sales, withdrawals, july);
    expect(s.grossSales).toBe(1400);
    expect(s.withdrawalIncome).toBe(1100);
    expect(s.totalExpenses).toBe(150.5);
    expect(s.netProfit).toBe(949.5); // 1100 - 150.5
    expect(s.byPlatform.shopee).toEqual({ grossSales: 1000, withdrawalIncome: 800 });
    expect(s.byPlatform.lazada).toEqual({ grossSales: 400, withdrawalIncome: 300 });
    expect(s.byPlatform.others).toEqual({ grossSales: 0, withdrawalIncome: 0 });
  });

  it('aggregates all-time', () => {
    const s = summarizeInsights(expenses, sales, withdrawals, all);
    expect(s.grossSales).toBe(2000);
    expect(s.withdrawalIncome).toBe(1600);
    expect(s.totalExpenses).toBe(175.5);
    expect(s.netProfit).toBe(1424.5);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- insights`
Expected: FAIL — cannot resolve `@/lib/insights`.

- [ ] **Step 3: Implement**

Create `src/lib/insights.ts`:

```ts
import type {
  ExpenseInsightRow, SalesInsightRow, WithdrawalInsightRow, Period,
  InsightSummary, Platform,
} from '@/lib/types';
import { sumMoney } from '@/lib/money';
import { dateInPeriod, yearMonthInPeriod } from '@/lib/period';

const PLATFORMS: Platform[] = ['shopee', 'lazada', 'others'];

export function summarizeInsights(
  expenses: ExpenseInsightRow[],
  sales: SalesInsightRow[],
  withdrawals: WithdrawalInsightRow[],
  period: Period,
): InsightSummary {
  const fx = expenses.filter((e) => dateInPeriod(e.orderDate, period));
  const fs = sales.filter((s) => yearMonthInPeriod(s.year, s.month, period));
  const fw = withdrawals.filter((w) => dateInPeriod(w.withdrawalDate, period));

  const totalExpenses = sumMoney(fx.map((e) => e.costMyr));
  const grossSales = sumMoney(fs.map((s) => s.grossAmountMyr));
  const withdrawalIncome = sumMoney(fw.map((w) => w.amountMyr));

  const byPlatform = Object.fromEntries(
    PLATFORMS.map((p) => [
      p,
      {
        grossSales: sumMoney(fs.filter((s) => s.platform === p).map((s) => s.grossAmountMyr)),
        withdrawalIncome: sumMoney(fw.filter((w) => w.platform === p).map((w) => w.amountMyr)),
      },
    ]),
  ) as InsightSummary['byPlatform'];

  return {
    grossSales,
    withdrawalIncome,
    totalExpenses,
    netProfit: sumMoney([withdrawalIncome, -totalExpenses]),
    byPlatform,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- insights`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/insights.ts tests/insights.test.ts
git commit -m "feat: add insight aggregation"
```

---

## Task 9: Excel export builder (TDD)

**Files:**
- Create: `src/lib/export.ts`
- Test: `tests/export.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/export.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { sortByOrderDateAsc, buildExpenseWorkbook, type ExportExpenseRow } from '@/lib/export';

const rows: ExportExpenseRow[] = [
  { orderId: 'B2', orderDate: '2026-07-20', itemName: 'Widget', paymentAccount: 'business', quantity: 2, costRmb: 30, costMyr: 18.5 },
  { orderId: 'A1', orderDate: '2026-07-05', itemName: 'Gadget', paymentAccount: 'personal', quantity: 1, costRmb: null, costMyr: 9.9 },
];

describe('sortByOrderDateAsc', () => {
  it('sorts ascending by order date', () => {
    const sorted = sortByOrderDateAsc(rows).map((r) => r.orderId);
    expect(sorted).toEqual(['A1', 'B2']);
  });
});

describe('buildExpenseWorkbook', () => {
  it('has the exact header order', async () => {
    const wb = await buildExpenseWorkbook(rows);
    const ws = wb.getWorksheet('Expenses')!;
    const header = ws.getRow(1).values as unknown[];
    expect(header.slice(1)).toEqual([
      'Order Number', 'Date of Purchase', 'Item', 'Account', 'Quantity', 'Price(RMB)', 'Price(MYR)',
    ]);
  });

  it('writes rows sorted ascending with mapped account label and blank RMB', async () => {
    const wb = await buildExpenseWorkbook(rows);
    const ws = wb.getWorksheet('Expenses')!;
    const first = ws.getRow(2).values as unknown[];
    expect(first.slice(1)).toEqual(['A1', '2026-07-05', 'Gadget', 'Personal', 1, '', 9.9]);
    const second = ws.getRow(3).values as unknown[];
    expect(second.slice(1)).toEqual(['B2', '2026-07-20', 'Widget', 'Business', 2, 30, 18.5]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- export`
Expected: FAIL — cannot resolve `@/lib/export`.

- [ ] **Step 3: Implement**

Create `src/lib/export.ts`:

```ts
import ExcelJS from 'exceljs';
import type { PaymentAccount } from '@/lib/types';

export interface ExportExpenseRow {
  orderId: string;
  orderDate: string; // 'YYYY-MM-DD'
  itemName: string;
  paymentAccount: PaymentAccount;
  quantity: number;
  costRmb: number | null;
  costMyr: number;
}

export function sortByOrderDateAsc(rows: ExportExpenseRow[]): ExportExpenseRow[] {
  return [...rows].sort((a, b) =>
    a.orderDate < b.orderDate ? -1 : a.orderDate > b.orderDate ? 1 : 0,
  );
}

export async function buildExpenseWorkbook(rows: ExportExpenseRow[]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Expenses');
  ws.columns = [
    { header: 'Order Number', key: 'orderId', width: 20 },
    { header: 'Date of Purchase', key: 'orderDate', width: 16 },
    { header: 'Item', key: 'itemName', width: 30 },
    { header: 'Account', key: 'account', width: 12 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Price(RMB)', key: 'costRmb', width: 12 },
    { header: 'Price(MYR)', key: 'costMyr', width: 12 },
  ];
  ws.getRow(1).font = { bold: true };

  for (const r of sortByOrderDateAsc(rows)) {
    ws.addRow({
      orderId: r.orderId,
      orderDate: r.orderDate,
      itemName: r.itemName,
      account: r.paymentAccount === 'business' ? 'Business' : 'Personal',
      quantity: r.quantity,
      costRmb: r.costRmb ?? '',
      costMyr: r.costMyr,
    });
  }
  return wb;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- export`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/export.ts tests/export.test.ts
git commit -m "feat: add excel export builder"
```

---

## Task 10: Validation schemas (TDD)

**Files:**
- Create: `src/lib/validation.ts`
- Test: `tests/validation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { expenseSchema, salesSchema, withdrawalSchema } from '@/lib/validation';

describe('expenseSchema', () => {
  const base = {
    orderId: 'A1', orderDate: '2026-07-05', itemName: 'Gadget',
    quantity: '1', paymentAccount: 'personal', costRmb: '', costMyr: '9.9',
  };
  it('accepts a valid expense and coerces numbers', () => {
    const p = expenseSchema.parse(base);
    expect(p.quantity).toBe(1);
    expect(p.costMyr).toBe(9.9);
    expect(p.costRmb).toBeNull();
  });
  it('rejects missing order id', () => {
    expect(() => expenseSchema.parse({ ...base, orderId: '' })).toThrow();
  });
  it('rejects missing MYR', () => {
    expect(() => expenseSchema.parse({ ...base, costMyr: '' })).toThrow();
  });
});

describe('withdrawalSchema', () => {
  const base = {
    withdrawalDate: '2026-07-15', platform: 'shopee', amountMyr: '800',
    type: 'auto', orderId: '', note: '',
  };
  it('accepts shopee without order id', () => {
    expect(() => withdrawalSchema.parse(base)).not.toThrow();
  });
  it('requires order id when platform is others', () => {
    expect(() => withdrawalSchema.parse({ ...base, platform: 'others', orderId: '' })).toThrow();
    expect(() => withdrawalSchema.parse({ ...base, platform: 'others', orderId: 'X9' })).not.toThrow();
  });
});

describe('salesSchema', () => {
  it('accepts a valid monthly sales entry', () => {
    const p = salesSchema.parse({
      periodDate: '2026-07-01', platform: 'lazada', grossAmountMyr: '400', note: '',
    });
    expect(p.grossAmountMyr).toBe(400);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- validation`
Expected: FAIL — cannot resolve `@/lib/validation`.

- [ ] **Step 3: Implement**

Create `src/lib/validation.ts`:

```ts
import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use a valid date');

// '' -> null, else coerced positive number
const optionalMoney = z
  .union([z.literal(''), z.coerce.number().positive()])
  .transform((v) => (v === '' ? null : v));

export const expenseSchema = z.object({
  orderId: z.string().trim().min(1, 'Order ID is required'),
  orderDate: isoDate,
  itemName: z.string().trim().min(1, 'Item name is required'),
  quantity: z.coerce.number().int().positive('Quantity must be > 0'),
  paymentAccount: z.enum(['personal', 'business']),
  costRmb: optionalMoney,
  costMyr: z.coerce.number().positive('Cost MYR is required'),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const salesSchema = z.object({
  periodDate: isoDate,
  platform: z.enum(['shopee', 'lazada', 'others']),
  grossAmountMyr: z.coerce.number().nonnegative(),
  note: z.string().trim().optional().nullable(),
});
export type SalesInput = z.infer<typeof salesSchema>;

export const withdrawalSchema = z
  .object({
    withdrawalDate: isoDate,
    platform: z.enum(['shopee', 'lazada', 'others']),
    amountMyr: z.coerce.number().positive(),
    type: z.enum(['auto', 'manual']),
    orderId: z.string().trim().optional().nullable(),
    note: z.string().trim().optional().nullable(),
  })
  .refine((d) => d.platform !== 'others' || !!d.orderId, {
    message: 'Order ID is required for the Others platform',
    path: ['orderId'],
  });
export type WithdrawalInput = z.infer<typeof withdrawalSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- validation`
Expected: PASS.

- [ ] **Step 5: Full suite green**

Run: `npm run test`
Expected: all 5 test files PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/validation.ts tests/validation.test.ts
git commit -m "feat: add zod validation schemas"
```

---

## Task 11: Auth middleware + login page

**Files:**
- Create: `middleware.ts`, `src/app/login/page.tsx`, `src/app/login/actions.ts`, `src/app/(app)/layout.tsx`
- Create: `src/app/auth/signout/route.ts`

- [ ] **Step 1: Session-refresh + guard middleware**

Create `middleware.ts`:

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isLogin = request.nextUrl.pathname.startsWith('/login');
  if (!user && !isLogin) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && isLogin) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|auth/).*)'],
};
```

- [ ] **Step 2: Login server action**

Create `src/app/login/actions.ts`:

```ts
'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function login(_prev: unknown, formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email')),
    password: String(formData.get('password')),
  });
  if (error) return { error: error.message };
  redirect('/');
}
```

- [ ] **Step 3: Login page**

Create `src/app/login/page.tsx`:

```tsx
'use client';

import { useActionState } from 'react';
import { login } from './actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Business Manager</h1>
      <form action={action} className="flex flex-col gap-3">
        <input name="email" type="email" required placeholder="Email"
          className="rounded border p-3" />
        <input name="password" type="password" required placeholder="Password"
          className="rounded border p-3" />
        <button disabled={pending} className="rounded bg-black p-3 text-white">
          {pending ? 'Signing in…' : 'Sign in'}
        </button>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      </form>
    </main>
  );
}
```

- [ ] **Step 4: Sign-out route**

Create `src/app/auth/signout/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/login', request.url), { status: 303 });
}
```

- [ ] **Step 5: Authenticated layout shell**

Create `src/app/(app)/layout.tsx`:

```tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppNav } from '@/components/app-nav';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return (
    <div className="mx-auto max-w-2xl pb-20">
      <main className="p-4">{children}</main>
      <AppNav />
    </div>
  );
}
```

(The current scaffold's `src/app/page.tsx` is moved into `(app)/` in Task 14. `AppNav` is created in Task 12.)

- [ ] **Step 6: Manual verification**

Run: `npm run dev`. Visit `http://localhost:3000` → should redirect to `/login`. Sign in with your Supabase user → should reach `/` (may 404 until Task 14; that's expected). Confirm redirect behavior works.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add auth middleware, login, and app layout"
```

---

## Task 12: App navigation + shared UI primitives

**Files:**
- Create: `src/components/app-nav.tsx`, `src/components/period-selector.tsx`, `src/components/confirm-delete.tsx`
- Modify: `src/app/layout.tsx` (ensure metadata + mobile viewport)

- [ ] **Step 1: Bottom navigation**

Create `src/components/app-nav.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/', label: 'Insights' },
  { href: '/expenses', label: 'Expenses' },
  { href: '/income', label: 'Income' },
  { href: '/export', label: 'Export' },
];

export function AppNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-2xl justify-around border-t bg-white">
      {items.map((it) => {
        const active = it.href === '/' ? path === '/' : path.startsWith(it.href);
        return (
          <Link key={it.href} href={it.href}
            className={`flex-1 py-3 text-center text-sm ${active ? 'font-semibold text-black' : 'text-gray-500'}`}>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 2: Period selector**

Create `src/components/period-selector.tsx`:

```tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function PeriodSelector() {
  const router = useRouter();
  const params = useSearchParams();
  const kind = params.get('kind') ?? 'month';
  const now = new Date();
  const year = Number(params.get('year') ?? now.getFullYear());
  const month = Number(params.get('month') ?? now.getMonth() + 1);

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => sp.set(k, v));
    router.push(`?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <select value={kind} onChange={(e) => update({ kind: e.target.value })}
        className="rounded border p-2">
        <option value="month">Month</option>
        <option value="year">Year</option>
        <option value="all">All time</option>
      </select>
      {kind !== 'all' && (
        <input type="number" value={year} onChange={(e) => update({ year: e.target.value })}
          className="w-24 rounded border p-2" />
      )}
      {kind === 'month' && (
        <select value={month} onChange={(e) => update({ month: e.target.value })}
          className="rounded border p-2">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Reusable delete-confirm button**

Create `src/components/confirm-delete.tsx`:

```tsx
'use client';

export function ConfirmDelete({ action, label = 'Delete' }: { action: () => void; label?: string }) {
  return (
    <form action={action} onSubmit={(e) => { if (!confirm('Delete this record?')) e.preventDefault(); }}>
      <button className="text-sm text-red-600">{label}</button>
    </form>
  );
}
```

- [ ] **Step 4: Root layout viewport**

Ensure `src/app/layout.tsx` exports mobile-friendly viewport. Add/confirm:

```tsx
export const viewport = { width: 'device-width', initialScale: 1 };
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds (unused-import warnings for not-yet-wired components are acceptable).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add navigation and shared UI primitives"
```

---

## Task 13: Expenses data layer + helper to derive current user

**Files:**
- Create: `src/data/auth.ts`, `src/data/expenses.ts`

- [ ] **Step 1: Current-user helper**

Create `src/data/auth.ts`:

```ts
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return user.id;
}
```

- [ ] **Step 2: Expenses data access**

Create `src/data/expenses.ts`:

```ts
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, expenseAttachments } from '@/db/schema';
import type { ExpenseInput } from '@/lib/validation';

export interface ExpenseListItem {
  id: string;
  orderId: string;
  orderDate: string;
  itemName: string;
  quantity: number;
  paymentAccount: 'personal' | 'business';
  costRmb: number | null;
  costMyr: number;
  tags: ('proof_of_payment' | 'receipt')[];
}

export async function listExpenses(userId: string): Promise<ExpenseListItem[]> {
  const rows = await db.query.expenses.findMany({
    where: eq(expenses.userId, userId),
    orderBy: [desc(expenses.orderDate)],
  });
  const atts = await db
    .select({ expenseId: expenseAttachments.expenseId, tag: expenseAttachments.tag })
    .from(expenseAttachments)
    .where(eq(expenseAttachments.userId, userId));

  const tagMap = new Map<string, Set<'proof_of_payment' | 'receipt'>>();
  for (const a of atts) {
    if (!tagMap.has(a.expenseId)) tagMap.set(a.expenseId, new Set());
    tagMap.get(a.expenseId)!.add(a.tag);
  }

  return rows.map((r) => ({
    id: r.id,
    orderId: r.orderId,
    orderDate: r.orderDate,
    itemName: r.itemName,
    quantity: r.quantity,
    paymentAccount: r.paymentAccount,
    costRmb: r.costRmb === null ? null : Number(r.costRmb),
    costMyr: Number(r.costMyr),
    tags: [...(tagMap.get(r.id) ?? [])],
  }));
}

export async function getExpense(userId: string, id: string) {
  return db.query.expenses.findFirst({
    where: and(eq(expenses.id, id), eq(expenses.userId, userId)),
  });
}

export async function createExpense(userId: string, input: ExpenseInput): Promise<string> {
  const [row] = await db.insert(expenses).values({
    userId,
    orderId: input.orderId,
    orderDate: input.orderDate,
    itemName: input.itemName,
    quantity: input.quantity,
    paymentAccount: input.paymentAccount,
    costRmb: input.costRmb === null ? null : String(input.costRmb),
    costMyr: String(input.costMyr),
  }).returning({ id: expenses.id });
  return row.id;
}

export async function updateExpense(userId: string, id: string, input: ExpenseInput) {
  await db.update(expenses).set({
    orderId: input.orderId,
    orderDate: input.orderDate,
    itemName: input.itemName,
    quantity: input.quantity,
    paymentAccount: input.paymentAccount,
    costRmb: input.costRmb === null ? null : String(input.costRmb),
    costMyr: String(input.costMyr),
    updatedAt: new Date(),
  }).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
}

export async function deleteExpense(userId: string, id: string) {
  await db.delete(expenses).where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
}
```

- [ ] **Step 3: Verify types compile**

Run: `npx tsc --noEmit`
Expected: no type errors in `src/data/expenses.ts`.

- [ ] **Step 4: Commit**

```bash
git add src/data/auth.ts src/data/expenses.ts
git commit -m "feat: add expenses data access layer"
```

---

## Task 14: Expenses UI — list, create, edit, delete

**Files:**
- Create: `src/app/(app)/expenses/actions.ts`, `src/app/(app)/expenses/page.tsx`, `src/app/(app)/expenses/new/page.tsx`, `src/app/(app)/expenses/[id]/page.tsx`, `src/components/expense-form.tsx`
- Move: existing `src/app/page.tsx` → `src/app/(app)/page.tsx` (placeholder until Task 17)

- [ ] **Step 1: Move the home page into the guarded group**

```bash
git mv src/app/page.tsx src/app/\(app\)/page.tsx
```

Replace its contents with a temporary placeholder:

```tsx
export default function DashboardPlaceholder() {
  return <h1 className="text-xl font-semibold">Insights (coming in Task 17)</h1>;
}
```

- [ ] **Step 2: Expense server actions**

Create `src/app/(app)/expenses/actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUserId } from '@/data/auth';
import { expenseSchema } from '@/lib/validation';
import { createExpense, updateExpense, deleteExpense } from '@/data/expenses';

function parse(formData: FormData) {
  return expenseSchema.parse({
    orderId: formData.get('orderId'),
    orderDate: formData.get('orderDate'),
    itemName: formData.get('itemName'),
    quantity: formData.get('quantity'),
    paymentAccount: formData.get('paymentAccount'),
    costRmb: formData.get('costRmb') ?? '',
    costMyr: formData.get('costMyr'),
  });
}

export async function createExpenseAction(formData: FormData) {
  const userId = await requireUserId();
  const id = await createExpense(userId, parse(formData));
  revalidatePath('/expenses');
  redirect(`/expenses/${id}`); // land on detail so files can be added
}

export async function updateExpenseAction(id: string, formData: FormData) {
  const userId = await requireUserId();
  await updateExpense(userId, id, parse(formData));
  revalidatePath('/expenses');
  redirect('/expenses');
}

export async function deleteExpenseAction(id: string) {
  const userId = await requireUserId();
  await deleteExpense(userId, id);
  revalidatePath('/expenses');
}
```

- [ ] **Step 3: Reusable expense form**

Create `src/components/expense-form.tsx`:

```tsx
import type { ExpenseListItem } from '@/data/expenses';

const today = () => new Date().toISOString().slice(0, 10);

export function ExpenseForm({
  action, defaults, submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: Partial<ExpenseListItem>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">Order ID *
        <input name="orderId" required defaultValue={defaults?.orderId ?? ''} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Order Date *
        <input name="orderDate" type="date" required defaultValue={defaults?.orderDate ?? today()} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Item Name *
        <input name="itemName" required defaultValue={defaults?.itemName ?? ''} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Quantity *
        <input name="quantity" type="number" min="1" required defaultValue={defaults?.quantity ?? 1} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Payment Account *
        <select name="paymentAccount" defaultValue={defaults?.paymentAccount ?? 'business'} className="rounded border p-2">
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">Cost RMB (optional)
        <input name="costRmb" type="number" step="0.01" min="0" defaultValue={defaults?.costRmb ?? ''} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Cost MYR *
        <input name="costMyr" type="number" step="0.01" min="0" required defaultValue={defaults?.costMyr ?? ''} className="rounded border p-2" />
      </label>
      <button className="rounded bg-black p-3 text-white">{submitLabel}</button>
    </form>
  );
}
```

- [ ] **Step 4: Expenses list page**

Create `src/app/(app)/expenses/page.tsx`:

```tsx
import Link from 'next/link';
import { requireUserId } from '@/data/auth';
import { listExpenses } from '@/data/expenses';
import { formatMYR } from '@/lib/money';

const tagLabel = { proof_of_payment: 'Proof', receipt: 'Receipt' } as const;

export default async function ExpensesPage() {
  const userId = await requireUserId();
  const items = await listExpenses(userId);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <Link href="/expenses/new" className="rounded bg-black px-3 py-2 text-sm text-white">+ Add</Link>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((e) => (
          <li key={e.id}>
            <Link href={`/expenses/${e.id}`} className="block rounded border p-3">
              <div className="flex justify-between">
                <span className="font-medium">{e.itemName}</span>
                <span>{formatMYR(e.costMyr)}</span>
              </div>
              <div className="text-sm text-gray-500">{e.orderDate} · {e.orderId} · x{e.quantity} · {e.paymentAccount}</div>
              <div className="mt-1 flex gap-1">
                {e.tags.length === 0 && <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">No files</span>}
                {e.tags.map((t) => (
                  <span key={t} className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{tagLabel[t]}</span>
                ))}
              </div>
            </Link>
          </li>
        ))}
        {items.length === 0 && <li className="text-sm text-gray-500">No expenses yet.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: New expense page**

Create `src/app/(app)/expenses/new/page.tsx`:

```tsx
import { ExpenseForm } from '@/components/expense-form';
import { createExpenseAction } from '../actions';

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">New Expense</h1>
      <ExpenseForm action={createExpenseAction} submitLabel="Create & add files" />
    </div>
  );
}
```

- [ ] **Step 6: Edit page (attachments added in Task 15)**

Create `src/app/(app)/expenses/[id]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { requireUserId } from '@/data/auth';
import { getExpense, deleteExpenseAction } from '@/data/expenses';
import { updateExpenseAction, deleteExpenseAction as delAction } from '../actions';
import { ExpenseForm } from '@/components/expense-form';
import { ConfirmDelete } from '@/components/confirm-delete';
import { redirect } from 'next/navigation';

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const row = await getExpense(userId, id);
  if (!row) notFound();

  const update = updateExpenseAction.bind(null, id);
  async function remove() {
    'use server';
    await delAction(id);
    redirect('/expenses');
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Edit Expense</h1>
      <ExpenseForm
        action={update}
        submitLabel="Save"
        defaults={{
          orderId: row.orderId,
          orderDate: row.orderDate,
          itemName: row.itemName,
          quantity: row.quantity,
          paymentAccount: row.paymentAccount,
          costRmb: row.costRmb === null ? null : Number(row.costRmb),
          costMyr: Number(row.costMyr),
        }}
      />
      {/* Attachments section injected in Task 15 */}
      <ConfirmDelete action={remove} label="Delete expense" />
    </div>
  );
}
```

> Note: fix the stray import — remove `deleteExpenseAction` from the `@/data/expenses` import line; only `getExpense` is needed from data, and `delAction` comes from `../actions`. Final import: `import { getExpense } from '@/data/expenses';`

- [ ] **Step 7: Manual verification**

Run: `npm run dev`. Create an expense → redirected to its detail page. Edit it → returns to list with updated values. Delete → row disappears. Confirm the list shows "No files" badge.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add expenses CRUD UI"
```

---

## Task 15: Receipt attachments (upload / list / download / delete)

**Files:**
- Create: `src/data/attachments.ts`, `src/app/(app)/expenses/attachment-actions.ts`, `src/components/attachments-panel.tsx`
- Modify: `src/app/(app)/expenses/[id]/page.tsx` (mount the panel)

- [ ] **Step 1: Attachment data + storage access**

Create `src/data/attachments.ts`:

```ts
import { and, eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenseAttachments } from '@/db/schema';
import { createClient } from '@/lib/supabase/server';

export interface AttachmentView {
  id: string;
  tag: 'proof_of_payment' | 'receipt';
  fileType: 'image' | 'pdf';
  originalFilename: string;
  signedUrl: string;
}

export async function listAttachments(userId: string, expenseId: string): Promise<AttachmentView[]> {
  const rows = await db.query.expenseAttachments.findMany({
    where: and(eq(expenseAttachments.userId, userId), eq(expenseAttachments.expenseId, expenseId)),
  });
  const supabase = await createClient();
  const views: AttachmentView[] = [];
  for (const r of rows) {
    const { data } = await supabase.storage.from('receipts').createSignedUrl(r.filePath, 600);
    views.push({
      id: r.id,
      tag: r.tag,
      fileType: r.fileType,
      originalFilename: r.originalFilename,
      signedUrl: data?.signedUrl ?? '#',
    });
  }
  return views;
}

export async function addAttachment(params: {
  userId: string; expenseId: string; file: File; tag: 'proof_of_payment' | 'receipt';
}): Promise<void> {
  const { userId, expenseId, file, tag } = params;
  const fileType: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image';
  const path = `${userId}/${expenseId}/${crypto.randomUUID()}-${file.name}`;

  const supabase = await createClient();
  const { error } = await supabase.storage.from('receipts').upload(path, file, {
    contentType: file.type, upsert: false,
  });
  if (error) throw error;

  await db.insert(expenseAttachments).values({
    userId, expenseId, filePath: path, fileType, originalFilename: file.name, tag,
  });
}

export async function deleteAttachment(userId: string, id: string): Promise<void> {
  const row = await db.query.expenseAttachments.findFirst({
    where: and(eq(expenseAttachments.id, id), eq(expenseAttachments.userId, userId)),
  });
  if (!row) return;
  const supabase = await createClient();
  await supabase.storage.from('receipts').remove([row.filePath]);
  await db.delete(expenseAttachments).where(eq(expenseAttachments.id, id));
}
```

- [ ] **Step 2: Attachment server actions**

Create `src/app/(app)/expenses/attachment-actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/data/auth';
import { addAttachment, deleteAttachment } from '@/data/attachments';

export async function uploadAttachmentAction(expenseId: string, formData: FormData) {
  const userId = await requireUserId();
  const file = formData.get('file') as File;
  const tag = String(formData.get('tag')) as 'proof_of_payment' | 'receipt';
  if (!file || file.size === 0) return;
  await addAttachment({ userId, expenseId, file, tag });
  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath('/expenses');
}

export async function deleteAttachmentAction(expenseId: string, id: string) {
  const userId = await requireUserId();
  await deleteAttachment(userId, id);
  revalidatePath(`/expenses/${expenseId}`);
  revalidatePath('/expenses');
}
```

- [ ] **Step 3: Attachments panel**

Create `src/components/attachments-panel.tsx`:

```tsx
import { listAttachments } from '@/data/attachments';
import { uploadAttachmentAction, deleteAttachmentAction } from '@/app/(app)/expenses/attachment-actions';

const tagLabel = { proof_of_payment: 'Proof of Payment', receipt: 'Receipt' } as const;

export async function AttachmentsPanel({ userId, expenseId }: { userId: string; expenseId: string }) {
  const files = await listAttachments(userId, expenseId);
  const upload = uploadAttachmentAction.bind(null, expenseId);

  return (
    <section className="flex flex-col gap-3 rounded border p-3">
      <h2 className="font-medium">Receipts & Proofs</h2>
      <ul className="flex flex-col gap-2">
        {files.map((f) => {
          const remove = deleteAttachmentAction.bind(null, expenseId, f.id);
          return (
            <li key={f.id} className="flex items-center justify-between gap-2">
              <a href={f.signedUrl} target="_blank" rel="noreferrer" className="truncate text-blue-600 underline">
                {f.originalFilename}
              </a>
              <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">{tagLabel[f.tag]}</span>
              <form action={remove}><button className="text-xs text-red-600">Remove</button></form>
            </li>
          );
        })}
        {files.length === 0 && <li className="text-sm text-gray-500">No files uploaded.</li>}
      </ul>
      <form action={upload} className="flex flex-col gap-2 border-t pt-3">
        <input name="file" type="file" accept="image/*,application/pdf" required className="text-sm" />
        <select name="tag" className="rounded border p-2">
          <option value="receipt">Receipt</option>
          <option value="proof_of_payment">Proof of Payment</option>
        </select>
        <button className="rounded bg-black p-2 text-sm text-white">Upload</button>
      </form>
    </section>
  );
}
```

- [ ] **Step 4: Mount panel on the edit page**

In `src/app/(app)/expenses/[id]/page.tsx`, add the import and render the panel between the form and the delete button:

```tsx
import { AttachmentsPanel } from '@/components/attachments-panel';
// ...
      {/* replaces the "Attachments section injected in Task 15" comment */}
      <AttachmentsPanel userId={userId} expenseId={id} />
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`. On an expense detail page: upload a JPG tagged Receipt and a PDF tagged Proof of Payment. Confirm both appear with correct tag labels and open via signed URL. Return to the expenses list → the row shows both "Proof" and "Receipt" badges. Delete one file → it disappears and the list badge updates.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add tagged receipt/proof attachments"
```

---

## Task 16: Income — sales & withdrawals

**Files:**
- Create: `src/data/sales.ts`, `src/data/withdrawals.ts`
- Create: `src/app/(app)/income/sales-actions.ts`, `src/app/(app)/income/withdrawals-actions.ts`, `src/app/(app)/income/page.tsx`
- Create: `src/components/sales-form.tsx`, `src/components/withdrawal-form.tsx`

- [ ] **Step 1: Sales data access (upsert per month/platform)**

Create `src/data/sales.ts`:

```ts
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { sales } from '@/db/schema';
import type { SalesInput } from '@/lib/validation';

export interface SalesItem {
  id: string; year: number; month: number;
  platform: 'shopee' | 'lazada' | 'others'; grossAmountMyr: number; note: string | null;
}

export async function listSales(userId: string): Promise<SalesItem[]> {
  const rows = await db.query.sales.findMany({
    where: eq(sales.userId, userId),
    orderBy: [desc(sales.year), desc(sales.month)],
  });
  return rows.map((r) => ({
    id: r.id, year: r.year, month: r.month, platform: r.platform,
    grossAmountMyr: Number(r.grossAmountMyr), note: r.note,
  }));
}

export async function upsertSales(userId: string, input: SalesInput): Promise<void> {
  const [y, m] = input.periodDate.split('-').map(Number);
  await db.insert(sales).values({
    userId, periodDate: input.periodDate, year: y, month: m,
    platform: input.platform, grossAmountMyr: String(input.grossAmountMyr), note: input.note ?? null,
  }).onConflictDoUpdate({
    target: [sales.userId, sales.year, sales.month, sales.platform],
    set: { grossAmountMyr: String(input.grossAmountMyr), note: input.note ?? null, updatedAt: new Date() },
  });
}

export async function deleteSales(userId: string, id: string): Promise<void> {
  await db.delete(sales).where(and(eq(sales.id, id), eq(sales.userId, userId)));
}
```

- [ ] **Step 2: Withdrawals data access**

Create `src/data/withdrawals.ts`:

```ts
import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { withdrawals } from '@/db/schema';
import type { WithdrawalInput } from '@/lib/validation';

export interface WithdrawalItem {
  id: string; withdrawalDate: string;
  platform: 'shopee' | 'lazada' | 'others'; amountMyr: number;
  type: 'auto' | 'manual'; orderId: string | null; note: string | null;
}

export async function listWithdrawals(userId: string): Promise<WithdrawalItem[]> {
  const rows = await db.query.withdrawals.findMany({
    where: eq(withdrawals.userId, userId),
    orderBy: [desc(withdrawals.withdrawalDate)],
  });
  return rows.map((r) => ({
    id: r.id, withdrawalDate: r.withdrawalDate, platform: r.platform,
    amountMyr: Number(r.amountMyr), type: r.type, orderId: r.orderId, note: r.note,
  }));
}

export async function createWithdrawal(userId: string, input: WithdrawalInput): Promise<void> {
  await db.insert(withdrawals).values({
    userId, withdrawalDate: input.withdrawalDate, platform: input.platform,
    amountMyr: String(input.amountMyr), type: input.type,
    orderId: input.orderId ?? null, note: input.note ?? null,
  });
}

export async function deleteWithdrawal(userId: string, id: string): Promise<void> {
  await db.delete(withdrawals).where(and(eq(withdrawals.id, id), eq(withdrawals.userId, userId)));
}
```

- [ ] **Step 3: Sales + withdrawal server actions**

Create `src/app/(app)/income/sales-actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/data/auth';
import { salesSchema } from '@/lib/validation';
import { upsertSales, deleteSales } from '@/data/sales';

export async function saveSalesAction(formData: FormData) {
  const userId = await requireUserId();
  const input = salesSchema.parse({
    periodDate: formData.get('periodDate'),
    platform: formData.get('platform'),
    grossAmountMyr: formData.get('grossAmountMyr'),
    note: formData.get('note') ?? '',
  });
  await upsertSales(userId, input);
  revalidatePath('/income');
}

export async function deleteSalesAction(id: string) {
  const userId = await requireUserId();
  await deleteSales(userId, id);
  revalidatePath('/income');
}
```

Create `src/app/(app)/income/withdrawals-actions.ts`:

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { requireUserId } from '@/data/auth';
import { withdrawalSchema } from '@/lib/validation';
import { createWithdrawal, deleteWithdrawal } from '@/data/withdrawals';

export async function saveWithdrawalAction(formData: FormData) {
  const userId = await requireUserId();
  const input = withdrawalSchema.parse({
    withdrawalDate: formData.get('withdrawalDate'),
    platform: formData.get('platform'),
    amountMyr: formData.get('amountMyr'),
    type: formData.get('type'),
    orderId: formData.get('orderId') ?? '',
    note: formData.get('note') ?? '',
  });
  await createWithdrawal(userId, input);
  revalidatePath('/income');
}

export async function deleteWithdrawalAction(id: string) {
  const userId = await requireUserId();
  await deleteWithdrawal(userId, id);
  revalidatePath('/income');
}
```

- [ ] **Step 4: Sales form**

Create `src/components/sales-form.tsx`:

```tsx
const today = () => new Date().toISOString().slice(0, 10);

export function SalesForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="flex flex-col gap-2 rounded border p-3">
      <input name="periodDate" type="date" required defaultValue={today()} className="rounded border p-2" />
      <select name="platform" className="rounded border p-2">
        <option value="shopee">Shopee</option>
        <option value="lazada">Lazada</option>
        <option value="others">Others</option>
      </select>
      <input name="grossAmountMyr" type="number" step="0.01" min="0" required placeholder="Gross sales (MYR)" className="rounded border p-2" />
      <input name="note" placeholder="Note (optional)" className="rounded border p-2" />
      <button className="rounded bg-black p-2 text-sm text-white">Save monthly sales</button>
    </form>
  );
}
```

- [ ] **Step 5: Withdrawal form**

Create `src/components/withdrawal-form.tsx`:

```tsx
const today = () => new Date().toISOString().slice(0, 10);

export function WithdrawalForm({ action }: { action: (formData: FormData) => void }) {
  return (
    <form action={action} className="flex flex-col gap-2 rounded border p-3">
      <input name="withdrawalDate" type="date" required defaultValue={today()} className="rounded border p-2" />
      <select name="platform" className="rounded border p-2">
        <option value="shopee">Shopee</option>
        <option value="lazada">Lazada</option>
        <option value="others">Others</option>
      </select>
      <input name="amountMyr" type="number" step="0.01" min="0" required placeholder="Amount (MYR)" className="rounded border p-2" />
      <select name="type" className="rounded border p-2">
        <option value="auto">Auto withdrawal</option>
        <option value="manual">Manual withdrawal</option>
      </select>
      <input name="orderId" placeholder="Order ID (required for Others)" className="rounded border p-2" />
      <input name="note" placeholder="Note (optional)" className="rounded border p-2" />
      <button className="rounded bg-black p-2 text-sm text-white">Add withdrawal</button>
    </form>
  );
}
```

- [ ] **Step 6: Income page with tabs (URL param `?tab=`)**

Create `src/app/(app)/income/page.tsx`:

```tsx
import Link from 'next/link';
import { requireUserId } from '@/data/auth';
import { listSales, deleteSalesAction } from '@/data/sales';
import { listWithdrawals } from '@/data/withdrawals';
import { saveSalesAction, deleteSalesAction as delSales } from './sales-actions';
import { saveWithdrawalAction, deleteWithdrawalAction as delWithdrawal } from './withdrawals-actions';
import { SalesForm } from '@/components/sales-form';
import { WithdrawalForm } from '@/components/withdrawal-form';
import { formatMYR } from '@/lib/money';

const platformLabel = { shopee: 'Shopee', lazada: 'Lazada', others: 'Others' } as const;

export default async function IncomePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const active = tab === 'withdrawals' ? 'withdrawals' : 'sales';
  const userId = await requireUserId();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Income</h1>
      <div className="flex gap-2 border-b">
        <Link href="/income?tab=sales" className={active === 'sales' ? 'border-b-2 border-black py-2 font-medium' : 'py-2 text-gray-500'}>Sales</Link>
        <Link href="/income?tab=withdrawals" className={active === 'withdrawals' ? 'border-b-2 border-black py-2 font-medium' : 'py-2 text-gray-500'}>Withdrawals</Link>
      </div>
      {active === 'sales' ? <SalesTab userId={userId} /> : <WithdrawalsTab userId={userId} />}
    </div>
  );
}

async function SalesTab({ userId }: { userId: string }) {
  const items = await listSales(userId);
  return (
    <div className="flex flex-col gap-3">
      <SalesForm action={saveSalesAction} />
      <ul className="flex flex-col gap-2">
        {items.map((s) => {
          const remove = delSales.bind(null, s.id);
          return (
            <li key={s.id} className="flex items-center justify-between rounded border p-3">
              <span>{s.year}-{String(s.month).padStart(2, '0')} · {platformLabel[s.platform]}</span>
              <span className="flex items-center gap-3">
                {formatMYR(s.grossAmountMyr)}
                <form action={remove}><button className="text-xs text-red-600">Delete</button></form>
              </span>
            </li>
          );
        })}
        {items.length === 0 && <li className="text-sm text-gray-500">No sales recorded.</li>}
      </ul>
    </div>
  );
}

async function WithdrawalsTab({ userId }: { userId: string }) {
  const items = await listWithdrawals(userId);
  return (
    <div className="flex flex-col gap-3">
      <WithdrawalForm action={saveWithdrawalAction} />
      <ul className="flex flex-col gap-2">
        {items.map((w) => {
          const remove = delWithdrawal.bind(null, w.id);
          return (
            <li key={w.id} className="flex items-center justify-between rounded border p-3">
              <span>{w.withdrawalDate} · {platformLabel[w.platform]} · {w.type}{w.orderId ? ` · ${w.orderId}` : ''}</span>
              <span className="flex items-center gap-3">
                {formatMYR(w.amountMyr)}
                <form action={remove}><button className="text-xs text-red-600">Delete</button></form>
              </span>
            </li>
          );
        })}
        {items.length === 0 && <li className="text-sm text-gray-500">No withdrawals recorded.</li>}
      </ul>
    </div>
  );
}
```

> Note: remove the unused `deleteSalesAction` import from `@/data/sales` — only `listSales` is needed from the data module on this page (delete actions come from `./sales-actions`). Final data import: `import { listSales } from '@/data/sales';`

- [ ] **Step 7: Manual verification**

Run: `npm run dev`. Under Income → Sales: save Shopee July gross; re-save same month/platform with a new number → confirms upsert (single row, updated value). Under Withdrawals: add a Shopee auto withdrawal; try an "Others" withdrawal with a blank Order ID → confirm it errors; add one with an Order ID → succeeds. Delete records.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add income sales and withdrawals"
```

---

## Task 17: Dashboard / Insights

**Files:**
- Create: `src/data/insights.ts`
- Replace: `src/app/(app)/page.tsx` (the Task 14 placeholder)

- [ ] **Step 1: Insights data fetch → pure aggregation**

Create `src/data/insights.ts`:

```ts
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, sales, withdrawals } from '@/db/schema';
import { summarizeInsights } from '@/lib/insights';
import type { Period, InsightSummary } from '@/lib/types';

export async function getInsights(userId: string, period: Period): Promise<InsightSummary> {
  const [ex, sl, wd] = await Promise.all([
    db.select({ orderDate: expenses.orderDate, costMyr: expenses.costMyr })
      .from(expenses).where(eq(expenses.userId, userId)),
    db.select({ year: sales.year, month: sales.month, platform: sales.platform, grossAmountMyr: sales.grossAmountMyr })
      .from(sales).where(eq(sales.userId, userId)),
    db.select({ withdrawalDate: withdrawals.withdrawalDate, platform: withdrawals.platform, amountMyr: withdrawals.amountMyr })
      .from(withdrawals).where(eq(withdrawals.userId, userId)),
  ]);

  return summarizeInsights(
    ex.map((e) => ({ orderDate: e.orderDate, costMyr: Number(e.costMyr) })),
    sl.map((s) => ({ year: s.year, month: s.month, platform: s.platform, grossAmountMyr: Number(s.grossAmountMyr) })),
    wd.map((w) => ({ withdrawalDate: w.withdrawalDate, platform: w.platform, amountMyr: Number(w.amountMyr) })),
    period,
  );
}
```

- [ ] **Step 2: Parse period from search params helper**

Add to `src/lib/period.ts`:

```ts
export function periodFromParams(params: { kind?: string; year?: string; month?: string }): Period {
  const now = new Date();
  const year = Number(params.year ?? now.getFullYear());
  const month = Number(params.month ?? now.getMonth() + 1);
  if (params.kind === 'all') return { kind: 'all' };
  if (params.kind === 'year') return { kind: 'year', year };
  return { kind: 'month', year, month };
}
```

(Add `import type { Period } from '@/lib/types';` is already present at the top of the file.)

- [ ] **Step 3: Dashboard page**

Replace `src/app/(app)/page.tsx`:

```tsx
import { requireUserId } from '@/data/auth';
import { getInsights } from '@/data/insights';
import { periodFromParams } from '@/lib/period';
import { formatMYR } from '@/lib/money';
import { PeriodSelector } from '@/components/period-selector';

const platformLabel = { shopee: 'Shopee', lazada: 'Lazada', others: 'Others' } as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string; year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const userId = await requireUserId();
  const period = periodFromParams(params);
  const s = await getInsights(userId, period);

  const cards = [
    { label: 'Gross Sales', value: s.grossSales },
    { label: 'Withdrawal Income', value: s.withdrawalIncome },
    { label: 'Total Expenses', value: s.totalExpenses },
    { label: 'Net Profit', value: s.netProfit },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Insights</h1>
      <PeriodSelector />
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded border p-3">
            <div className="text-sm text-gray-500">{c.label}</div>
            <div className={`text-lg font-semibold ${c.label === 'Net Profit' && c.value < 0 ? 'text-red-600' : ''}`}>
              {formatMYR(c.value)}
            </div>
          </div>
        ))}
      </div>
      <div>
        <h2 className="mb-2 font-medium">By platform</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-1">Platform</th><th>Gross Sales</th><th>Withdrawn</th>
            </tr>
          </thead>
          <tbody>
            {(['shopee', 'lazada', 'others'] as const).map((p) => (
              <tr key={p} className="border-t">
                <td className="py-1">{platformLabel[p]}</td>
                <td>{formatMYR(s.byPlatform[p].grossSales)}</td>
                <td>{formatMYR(s.byPlatform[p].withdrawalIncome)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`. With the sample data you entered, switch period between Month/Year/All time and confirm totals and Net Profit match the numbers you'd expect (Withdrawal Income − Total Expenses). Confirm per-platform rows.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add insights dashboard"
```

---

## Task 18: Excel export route + page

**Files:**
- Create: `src/app/api/export/route.ts`, `src/app/(app)/export/page.tsx`
- Create: `src/data/export.ts`

- [ ] **Step 1: Export data fetch (filtered by month/year)**

Create `src/data/export.ts`:

```ts
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses } from '@/db/schema';
import { dateInPeriod } from '@/lib/period';
import type { Period } from '@/lib/types';
import type { ExportExpenseRow } from '@/lib/export';

export async function getExpensesForExport(userId: string, period: Period): Promise<ExportExpenseRow[]> {
  const rows = await db.select().from(expenses).where(eq(expenses.userId, userId));
  return rows
    .filter((r) => dateInPeriod(r.orderDate, period))
    .map((r) => ({
      orderId: r.orderId,
      orderDate: r.orderDate,
      itemName: r.itemName,
      paymentAccount: r.paymentAccount,
      quantity: r.quantity,
      costRmb: r.costRmb === null ? null : Number(r.costRmb),
      costMyr: Number(r.costMyr),
    }));
}
```

- [ ] **Step 2: Export route handler**

Create `src/app/api/export/route.ts`:

```ts
import { NextResponse } from 'next/server';
import { requireUserId } from '@/data/auth';
import { periodFromParams } from '@/lib/period';
import { getExpensesForExport } from '@/data/export';
import { buildExpenseWorkbook } from '@/lib/export';

export async function GET(request: Request) {
  const userId = await requireUserId();
  const { searchParams } = new URL(request.url);
  const period = periodFromParams({
    kind: searchParams.get('kind') ?? undefined,
    year: searchParams.get('year') ?? undefined,
    month: searchParams.get('month') ?? undefined,
  });

  const rows = await getExpensesForExport(userId, period);
  const wb = await buildExpenseWorkbook(rows);
  const buffer = await wb.xlsx.writeBuffer();

  const stamp =
    period.kind === 'all' ? 'all'
      : period.kind === 'year' ? `${period.year}`
        : `${period.year}-${String(period.month).padStart(2, '0')}`;

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="expenses-${stamp}.xlsx"`,
    },
  });
}
```

> Note: the `/api/export` path is excluded from redirect handling by the middleware matcher only if under `auth/`; it is NOT, so the session cookie is checked and `requireUserId()` also guards it. Keep both — defense in depth.

- [ ] **Step 3: Export page**

Create `src/app/(app)/export/page.tsx`:

```tsx
'use client';

import { useState } from 'react';

export default function ExportPage() {
  const now = new Date();
  const [kind, setKind] = useState('month');
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));

  const params = new URLSearchParams({ kind });
  if (kind !== 'all') params.set('year', year);
  if (kind === 'month') params.set('month', month);
  const href = `/api/export?${params.toString()}`;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Export Expenses</h1>
      <div className="flex flex-wrap gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded border p-2">
          <option value="month">Month</option>
          <option value="year">Year</option>
          <option value="all">All time</option>
        </select>
        {kind !== 'all' && (
          <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-24 rounded border p-2" />
        )}
        {kind === 'month' && (
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="rounded border p-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        )}
      </div>
      <a href={href} className="w-fit rounded bg-black px-4 py-3 text-white">Download .xlsx</a>
      <p className="text-sm text-gray-500">
        Columns: Order Number, Date of Purchase, Item, Account, Quantity, Price(RMB), Price(MYR). Sorted by order date ascending.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Manual verification**

Run: `npm run dev`. Go to Export, pick a month you have expenses in, click Download. Open the `.xlsx`: confirm the 7 columns in the exact required order, rows sorted by order date ascending, Account shows Business/Personal, and a blank RMB where none was entered.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add excel expense export"
```

---

## Task 19: Sign-out control + final polish

**Files:**
- Modify: `src/app/(app)/layout.tsx` (add sign-out button)

- [ ] **Step 1: Add sign-out to the header**

In `src/app/(app)/layout.tsx`, add a header above `{children}`:

```tsx
      <header className="flex items-center justify-between p-4">
        <span className="font-semibold">Business Manager</span>
        <form action="/auth/signout" method="post">
          <button className="text-sm text-gray-500">Sign out</button>
        </form>
      </header>
```

- [ ] **Step 2: Full verification pass**

Run: `npm run test` → all pass.
Run: `npm run build` → succeeds with no type errors.
Run: `npm run dev` → smoke test the full flow: login → add expense + files → add sales + withdrawals → view insights across periods → export xlsx → sign out.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add sign-out and final polish"
```

---

## Task 20: Deploy to Vercel

- [ ] **Step 1: Push the repo**

Ensure the project is pushed to a GitHub repo (create one if needed).

- [ ] **Step 2: Import into Vercel**

In Vercel: New Project → import the repo → framework auto-detected as Next.js.

- [ ] **Step 3: Set environment variables**

In Vercel project settings → Environment Variables, add all keys from `.env.example`
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`).
Use the Supabase **Transaction pooler** connection string for `DATABASE_URL`.

- [ ] **Step 4: Deploy and verify**

Trigger a deploy. Visit the production URL on both a phone and a desktop browser. Sign in and confirm: create an expense with a file, view insights, export xlsx.

- [ ] **Step 5: (Optional) Keep-alive**

If you go >1 week without using it and dislike the ~1-minute resume, add a Vercel Cron hitting a trivial health route, or an external uptime pinger. Not required for correctness — document the decision and stop here.

---

## Notes on Deferred / Optional Items

- **Keep-alive ping** (Task 20 Step 5) is optional and intentionally not built by default.
- **shadcn/ui**: the plan uses plain Tailwind for form controls to stay self-contained. If richer components are wanted later, run `npx shadcn@latest init` and swap primitives incrementally — not required for feature completeness.
