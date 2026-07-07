import { ChevronDown } from 'lucide-react';
import type { ExpenseListItem } from '@/data/expenses';

const today = () => new Date().toLocaleDateString('en-CA');

export function ExpenseForm({
  action, defaults, submitLabel,
}: {
  action: (formData: FormData) => void;
  defaults?: Partial<ExpenseListItem>;
  submitLabel: string;
}) {
  return (
    <form action={action} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Order ID *</span>
          <input name="orderId" required defaultValue={defaults?.orderId ?? ''} />
        </label>
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Order date *</span>
          <input name="orderDate" type="date" required defaultValue={defaults?.orderDate ?? today()} />
        </label>
      </div>

      <label className="flex flex-col">
        <span className="block text-xs font-medium text-muted-foreground mb-1.5">Item name *</span>
        <input name="itemName" required defaultValue={defaults?.itemName ?? ''} />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Quantity *</span>
          <input name="quantity" type="number" min="1" required defaultValue={defaults?.quantity ?? 1} />
        </label>
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Payment account *</span>
          <div className="relative">
            <select
              name="paymentAccount"
              defaultValue={defaults?.paymentAccount ?? 'business'}
              className="w-full appearance-none pr-8 cursor-pointer"
            >
              <option value="business">Business</option>
              <option value="personal">Personal</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">Cost RMB (optional)</span>
          <input name="costRmb" type="number" step="0.01" min="0" defaultValue={defaults?.costRmb ?? ''} />
        </label>
        <label className="flex flex-col">
          <span className="block text-xs font-medium text-muted-foreground mb-1.5">
            Cost MYR <span className="text-red-400">*</span>
          </span>
          <input name="costMyr" type="number" step="0.01" min="0" required defaultValue={defaults?.costMyr ?? ''} />
        </label>
      </div>

      <button className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
        {submitLabel}
      </button>
    </form>
  );
}
