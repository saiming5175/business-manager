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
