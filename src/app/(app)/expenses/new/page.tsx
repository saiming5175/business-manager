import { ExpenseForm } from '@/components/expense-form';
import { createExpenseAction } from '../actions';

export default function NewExpensePage() {
  return (
    <div className="space-y-5 max-w-lg">
      <h1 className="text-xl font-semibold text-foreground">New expense</h1>
      <ExpenseForm action={createExpenseAction} submitLabel="Create & add files" />
    </div>
  );
}
