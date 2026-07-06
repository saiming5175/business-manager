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
