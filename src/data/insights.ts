import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { expenses, sales, withdrawals } from '@/db/schema';
import { summarizeInsights } from '@/lib/insights';
import { sumMoney } from '@/lib/money';
import type { Period, InsightSummary } from '@/lib/types';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

export interface MonthlyTrendPoint {
  month: string;
  grossSales: number;
  withdrawn: number;
  expenses: number;
  netProfit: number;
}

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

/** Jan..Dec aggregation for a given year, userId-scoped. */
export async function getMonthlyTrend(userId: string, year: number): Promise<MonthlyTrendPoint[]> {
  const [ex, sl, wd] = await Promise.all([
    db.select({ orderDate: expenses.orderDate, costMyr: expenses.costMyr })
      .from(expenses).where(eq(expenses.userId, userId)),
    db.select({ year: sales.year, month: sales.month, grossAmountMyr: sales.grossAmountMyr })
      .from(sales).where(eq(sales.userId, userId)),
    db.select({ withdrawalDate: withdrawals.withdrawalDate, amountMyr: withdrawals.amountMyr })
      .from(withdrawals).where(eq(withdrawals.userId, userId)),
  ]);

  return MONTH_LABELS.map((label, i) => {
    const month = i + 1;

    const monthExpenses = ex.filter((e) => {
      const [y, m] = e.orderDate.split('-').map(Number);
      return y === year && m === month;
    });
    const monthSales = sl.filter((s) => s.year === year && s.month === month);
    const monthWithdrawals = wd.filter((w) => {
      const [y, m] = w.withdrawalDate.split('-').map(Number);
      return y === year && m === month;
    });

    const grossSales = sumMoney(monthSales.map((s) => Number(s.grossAmountMyr)));
    const withdrawn = sumMoney(monthWithdrawals.map((w) => Number(w.amountMyr)));
    const monthlyExpenses = sumMoney(monthExpenses.map((e) => Number(e.costMyr)));

    return {
      month: label,
      grossSales,
      withdrawn,
      expenses: monthlyExpenses,
      netProfit: sumMoney([withdrawn, -monthlyExpenses]),
    };
  });
}
