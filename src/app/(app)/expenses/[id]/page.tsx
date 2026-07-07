import { notFound, redirect } from 'next/navigation';
import { requireUserId } from '@/data/auth';
import { getExpense } from '@/data/expenses';
import { updateExpenseAction, deleteExpenseAction as delAction } from '../actions';
import { ExpenseForm } from '@/components/expense-form';
import { ConfirmDelete } from '@/components/confirm-delete';
import { AttachmentsPanel } from '@/components/attachments-panel';

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await requireUserId();
  const row = await getExpense(userId, id);
  if (!row) notFound();

  const update = updateExpenseAction.bind(null, id);
  async function remove() {
    'use server';
    await delAction(id);
    redirect('/expenses');
  }

  return (
    <div className="space-y-5 max-w-lg">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-foreground">Edit expense</h1>
        <ConfirmDelete action={remove} label="Delete expense" />
      </div>
      <ExpenseForm
        action={update}
        submitLabel="Save"
        defaults={{
          orderId: row.orderId,
          orderDate: row.orderDate,
          itemName: row.itemName,
          quantity: row.quantity,
          paymentAccount: row.paymentAccount,
          costRmb: row.costRmb === null ? null : Number(row.costRmb),
          costMyr: Number(row.costMyr),
        }}
      />
      <AttachmentsPanel userId={userId} expenseId={id} />
    </div>
  );
}
