import { ExpenseForm } from '@/components/expense-form';
import { createExpenseAction } from '../actions';

export default function NewExpensePage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-semibold tracking-[-0.025em]">New expense</h1>
      <ExpenseForm action={createExpenseAction} submitLabel="Create & add files" />
    </div>
  );
}
