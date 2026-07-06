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
