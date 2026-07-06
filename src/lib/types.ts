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
