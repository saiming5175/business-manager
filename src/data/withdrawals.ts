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
