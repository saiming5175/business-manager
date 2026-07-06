'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUserId } from '@/data/auth';
import { expenseSchema } from '@/lib/validation';
import { createExpense, updateExpense, deleteExpense } from '@/data/expenses';

// Deliberate choice for a single-user tool: HTML form constraints (required /
// type=number / min) cover normal input; this server-side validation is a
// safety net that surfaces a readable error rather than field-level UI.
function parse(formData: FormData) {
  const result = expenseSchema.safeParse({
    orderId: formData.get('orderId'),
    orderDate: formData.get('orderDate'),
    itemName: formData.get('itemName'),
    quantity: formData.get('quantity'),
    paymentAccount: formData.get('paymentAccount'),
    costRmb: formData.get('costRmb') ?? '',
    costMyr: formData.get('costMyr'),
  });
  if (!result.success) {
    const first = result.error.issues[0];
    throw new Error(first?.message ?? 'Invalid expense input');
  }
  return result.data;
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
