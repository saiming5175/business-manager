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
