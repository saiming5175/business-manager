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
