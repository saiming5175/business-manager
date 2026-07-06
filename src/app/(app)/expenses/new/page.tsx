import { ExpenseForm } from '@/components/expense-form';
import { createExpenseAction } from '../actions';

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">New Expense</h1>
      <ExpenseForm action={createExpenseAction} submitLabel="Create & add files" />
    </div>
  );
}
