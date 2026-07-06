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
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">Order ID *
        <input name="orderId" required defaultValue={defaults?.orderId ?? ''} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Order Date *
        <input name="orderDate" type="date" required defaultValue={defaults?.orderDate ?? today()} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Item Name *
        <input name="itemName" required defaultValue={defaults?.itemName ?? ''} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Quantity *
        <input name="quantity" type="number" min="1" required defaultValue={defaults?.quantity ?? 1} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Payment Account *
        <select name="paymentAccount" defaultValue={defaults?.paymentAccount ?? 'business'} className="rounded border p-2">
          <option value="business">Business</option>
          <option value="personal">Personal</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">Cost RMB (optional)
        <input name="costRmb" type="number" step="0.01" min="0" defaultValue={defaults?.costRmb ?? ''} className="rounded border p-2" />
      </label>
      <label className="flex flex-col gap-1 text-sm">Cost MYR *
        <input name="costMyr" type="number" step="0.01" min="0" required defaultValue={defaults?.costMyr ?? ''} className="rounded border p-2" />
      </label>
      <button className="rounded bg-black p-3 text-white">{submitLabel}</button>
    </form>
  );
}
