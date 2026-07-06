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
